import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const enabled = process.env.RUN_DATABASE_TESTS === "true";
const suite = describe.skipIf(!enabled)("PostgreSQL transfer integration", () => {
  let pool: typeof import("../src/db/pool.js").pool;
  let createTransfer: typeof import("../src/modules/transfers/transfers.service.js").createTransfer;
  const [firstUserId, secondUserId] = [randomUUID(), randomUUID()] as const;
  const [sourceAccountId, destinationAccountId] = [randomUUID(), randomUUID()] as const;
  const userIds = [firstUserId, secondUserId];
  const accountIds = [sourceAccountId, destinationAccountId];

  beforeAll(async () => {
    const { config } = await import("../src/config.js");
    const databaseName = new URL(config.databaseUrl).pathname.replace(/^\//, "");

    if (!databaseName.endsWith("_test")) {
      throw new Error("Database integration tests require a database name ending in _test");
    }

    ({ pool } = await import("../src/db/pool.js"));
    ({ createTransfer } = await import("../src/modules/transfers/transfers.service.js"));
    const migration = await pool.query(
      "SELECT 1 FROM schema_migrations WHERE name = '001_initial_schema.sql'",
    );

    if (!migration.rowCount) {
      throw new Error("Run npm run migrate before the database integration tests");
    }

    await pool.query(
      `INSERT INTO users (id, email, password_hash) VALUES
         ($1, $3, 'integration-test-hash'),
         ($2, $4, 'integration-test-hash')`,
      [firstUserId, secondUserId, `${firstUserId}@test.invalid`, `${secondUserId}@test.invalid`],
    );
    await pool.query(
      `INSERT INTO accounts (id, user_id, asset_code, balance_units) VALUES
         ($1, $3, 'TST', 100),
         ($2, $4, 'TST', 0)`,
      [sourceAccountId, destinationAccountId, firstUserId, secondUserId],
    );
  });

  afterAll(async () => {
    if (!pool) {
      return;
    }

    const transfers = await pool.query<{ id: string }>(
      `SELECT id FROM transfers
       WHERE source_account_id = ANY($1::uuid[]) OR destination_account_id = ANY($1::uuid[])`,
      [accountIds],
    );
    const transferIds = transfers.rows.map((row) => row.id);
    await pool.query("DELETE FROM outbox_events WHERE aggregate_id = ANY($1::uuid[])", [transferIds]);
    await pool.query("DELETE FROM ledger_entries WHERE transfer_id = ANY($1::uuid[])", [transferIds]);
    await pool.query("DELETE FROM transfers WHERE id = ANY($1::uuid[])", [transferIds]);
    await pool.query("DELETE FROM idempotency_records WHERE user_id = ANY($1::uuid[])", [userIds]);
    await pool.query("DELETE FROM accounts WHERE id = ANY($1::uuid[])", [accountIds]);
    await pool.query("DELETE FROM refresh_tokens WHERE user_id = ANY($1::uuid[])", [userIds]);
    await pool.query("DELETE FROM users WHERE id = ANY($1::uuid[])", [userIds]);
    await pool.end();
  });

  it("replays the original success without creating duplicate ledger entries", async () => {
    const key = `integration-${randomUUID()}`;
    const input = {
      destinationId: secondUserId,
      asset: "TST",
      amountUnits: "25",
    };

    const first = await createTransfer(firstUserId, key, input);
    const replay = await createTransfer(firstUserId, key, input);
    const counts = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count FROM ledger_entries
       WHERE transfer_id = $1::uuid`,
      [first.body.transferenciaId],
    );

    expect(first.status).toBe(201);
    expect(replay.status).toBe(201);
    expect(replay.replayed).toBe(true);
    expect(counts.rows[0]?.count).toBe("2");

    const conflictingReuse = await createTransfer(firstUserId, key, {
      ...input,
      amountUnits: "24",
    });

    expect(conflictingReuse.status).toBe(409);
    expect(conflictingReuse.body.error).toEqual({
      code: "IDEMPOTENCY_KEY_REUSED",
      message: "La clave ya se usó con otra solicitud",
    });
  });

  it("persists insufficient-funds rejection for identical retries", async () => {
    const key = `integration-${randomUUID()}`;
    const input = {
      destinationId: secondUserId,
      asset: "TST",
      amountUnits: "100000",
    };

    const first = await createTransfer(firstUserId, key, input);
    const replay = await createTransfer(firstUserId, key, input);

    expect(first.status).toBe(409);
    expect(replay.status).toBe(409);
    expect(replay.replayed).toBe(true);
    expect(replay.body).toEqual(first.body);
  });

  it("allows only one of two concurrent debits that exceed the available total", async () => {
    const results = await Promise.all([
      createTransfer(firstUserId, `integration-${randomUUID()}`, {
        destinationId: secondUserId,
        asset: "TST",
        amountUnits: "60",
      }),
      createTransfer(firstUserId, `integration-${randomUUID()}`, {
        destinationId: secondUserId,
        asset: "TST",
        amountUnits: "60",
      }),
    ]);
    const source = await pool.query<{ balance: string }>(
      "SELECT balance_units::text AS balance FROM accounts WHERE id = $1",
      [sourceAccountId],
    );

    expect(results.map((result) => result.status).sort()).toEqual([201, 409]);
    expect(source.rows[0]?.balance).toBe("15");
  });
});

void suite;
