CREATE TABLE assets (
  code TEXT PRIMARY KEY CHECK (code ~ '^[A-Z0-9]{2,12}$'),
  name TEXT NOT NULL,
  decimals SMALLINT NOT NULL CHECK (decimals BETWEEN 0 AND 18),
  enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO assets (code, name, decimals)
VALUES ('TST', 'Activo de prueba simulado', 0);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE accounts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  asset_code TEXT NOT NULL REFERENCES assets(code),
  balance_units NUMERIC(38, 0) NOT NULL DEFAULT 0 CHECK (balance_units >= 0),
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'DISABLED')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, asset_code),
  UNIQUE (id, asset_code)
);

CREATE TABLE refresh_tokens (
  id UUID PRIMARY KEY,
  family_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX refresh_tokens_family_idx ON refresh_tokens (family_id);
CREATE INDEX refresh_tokens_user_idx ON refresh_tokens (user_id);

CREATE TABLE transfers (
  id UUID PRIMARY KEY,
  source_account_id UUID NOT NULL,
  destination_account_id UUID NOT NULL,
  asset_code TEXT NOT NULL REFERENCES assets(code),
  amount_units NUMERIC(38, 0) NOT NULL CHECK (amount_units > 0),
  status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status = 'COMPLETED'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (source_account_id <> destination_account_id),
  FOREIGN KEY (source_account_id, asset_code) REFERENCES accounts(id, asset_code),
  FOREIGN KEY (destination_account_id, asset_code) REFERENCES accounts(id, asset_code)
);

CREATE INDEX transfers_source_created_idx ON transfers (source_account_id, created_at DESC);
CREATE INDEX transfers_destination_created_idx ON transfers (destination_account_id, created_at DESC);

CREATE TABLE ledger_entries (
  id UUID PRIMARY KEY,
  transfer_id UUID NOT NULL REFERENCES transfers(id),
  account_id UUID NOT NULL REFERENCES accounts(id),
  entry_type TEXT NOT NULL CHECK (entry_type IN ('DEBIT', 'CREDIT')),
  amount_units NUMERIC(38, 0) NOT NULL CHECK (amount_units > 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX ledger_entries_transfer_idx ON ledger_entries (transfer_id);
CREATE INDEX ledger_entries_account_created_idx ON ledger_entries (account_id, created_at DESC);

CREATE FUNCTION prevent_ledger_entry_mutation() RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Ledger entries are immutable';
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ledger_entries_are_immutable
  BEFORE UPDATE OR DELETE ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION prevent_ledger_entry_mutation();

CREATE FUNCTION prevent_extra_transfer_ledger_entries() RETURNS TRIGGER AS $$
DECLARE
  existing_count BIGINT;
BEGIN
  PERFORM 1 FROM transfers WHERE id = NEW.transfer_id FOR UPDATE;

  SELECT COUNT(*) INTO existing_count
  FROM ledger_entries
  WHERE transfer_id = NEW.transfer_id;

  IF existing_count >= 2 THEN
    RAISE EXCEPTION 'Transfer % already has two ledger entries', NEW.transfer_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transfer_ledger_entry_limit
  BEFORE INSERT ON ledger_entries
  FOR EACH ROW EXECUTE FUNCTION prevent_extra_transfer_ledger_entries();

CREATE FUNCTION assert_transfer_has_balanced_ledger() RETURNS TRIGGER AS $$
DECLARE
  transfer_row transfers%ROWTYPE;
  debit_count BIGINT;
  credit_count BIGINT;
  debit_total NUMERIC(38, 0);
  credit_total NUMERIC(38, 0);
  debit_account UUID;
  credit_account UUID;
BEGIN
  SELECT * INTO transfer_row FROM transfers WHERE id = NEW.id;

  SELECT
    COUNT(*) FILTER (WHERE entry_type = 'DEBIT'),
    COUNT(*) FILTER (WHERE entry_type = 'CREDIT'),
    COALESCE(SUM(amount_units) FILTER (WHERE entry_type = 'DEBIT'), 0),
    COALESCE(SUM(amount_units) FILTER (WHERE entry_type = 'CREDIT'), 0)
  INTO debit_count, credit_count, debit_total, credit_total
  FROM ledger_entries
  WHERE transfer_id = transfer_row.id;

  SELECT account_id INTO debit_account
  FROM ledger_entries
  WHERE transfer_id = transfer_row.id AND entry_type = 'DEBIT'
  LIMIT 1;

  SELECT account_id INTO credit_account
  FROM ledger_entries
  WHERE transfer_id = transfer_row.id AND entry_type = 'CREDIT'
  LIMIT 1;

  IF debit_count <> 1
     OR credit_count <> 1
     OR debit_total <> transfer_row.amount_units
     OR credit_total <> transfer_row.amount_units
     OR debit_account <> transfer_row.source_account_id
     OR credit_account <> transfer_row.destination_account_id THEN
    RAISE EXCEPTION 'Transfer % must have one matching debit and credit', transfer_row.id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER transfers_require_balanced_ledger
  AFTER INSERT ON transfers
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_transfer_has_balanced_ledger();

CREATE TABLE idempotency_records (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  operation TEXT NOT NULL,
  idempotency_key VARCHAR(128) NOT NULL,
  request_hash CHAR(64) NOT NULL,
  response_status SMALLINT,
  response_body JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, operation, idempotency_key),
  CHECK (response_status IS NULL OR response_status BETWEEN 100 AND 599),
  CHECK (
    (response_status IS NULL AND response_body IS NULL)
    OR (response_status IS NOT NULL AND response_body IS NOT NULL)
  )
);

CREATE FUNCTION assert_idempotency_response_persisted() RETURNS TRIGGER AS $$
DECLARE
  stored_status SMALLINT;
BEGIN
  SELECT response_status INTO stored_status
  FROM idempotency_records
  WHERE id = NEW.id;

  IF stored_status IS NULL THEN
    RAISE EXCEPTION 'Idempotency record % must store its response before commit', NEW.id;
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE CONSTRAINT TRIGGER idempotency_records_require_response
  AFTER INSERT ON idempotency_records
  DEFERRABLE INITIALLY DEFERRED
  FOR EACH ROW EXECUTE FUNCTION assert_idempotency_response_persisted();

CREATE TABLE outbox_events (
  id UUID PRIMARY KEY,
  event_type TEXT NOT NULL,
  aggregate_id UUID NOT NULL,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  attempts INTEGER NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);

CREATE INDEX outbox_events_pending_idx ON outbox_events (created_at)
  WHERE processed_at IS NULL;
