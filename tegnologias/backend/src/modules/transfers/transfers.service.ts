import { createHash, randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { pool } from "../../db/pool.js";

type StoredResponse = { status: number; body: Record<string, unknown> };
type TransferInput = { destinationId: string; asset: string; amountUnits: string };

function hashRequest(input: TransferInput): string {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

async function storeTerminalResponse(
  client: PoolClient,
  recordId: string,
  result: StoredResponse,
): Promise<void> {
  await client.query(
    "UPDATE idempotency_records SET response_status = $2, response_body = $3 WHERE id = $1",
    [recordId, result.status, result.body],
  );
}

async function finish(
  client: PoolClient,
  result: StoredResponse,
  replayed: boolean,
): Promise<StoredResponse & { replayed: boolean }> {
  await client.query("COMMIT");
  return { ...result, replayed };
}

export async function createTransfer(
  userId: string,
  idempotencyKey: string,
  input: TransferInput,
): Promise<StoredResponse & { replayed: boolean }> {
  const client = await pool.connect();
  const requestHash = hashRequest(input);

  try {
    await client.query("BEGIN");
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO idempotency_records
         (id, user_id, operation, idempotency_key, request_hash)
       VALUES ($1, $2, 'TRANSFER', $3, $4)
       ON CONFLICT (user_id, operation, idempotency_key) DO NOTHING
       RETURNING id`,
      [randomUUID(), userId, idempotencyKey, requestHash],
    );

    if (!inserted.rowCount) {
      const previous = await client.query<{
        request_hash: string;
        response_status: number | null;
        response_body: Record<string, unknown> | null;
      }>(
        `SELECT request_hash, response_status, response_body
         FROM idempotency_records
         WHERE user_id = $1 AND operation = 'TRANSFER' AND idempotency_key = $2
         FOR UPDATE`,
        [userId, idempotencyKey],
      );
      const record = previous.rows[0];

      if (!record || record.request_hash !== requestHash) {
        await client.query("ROLLBACK");
        return {
          status: 409,
          body: { error: { code: "IDEMPOTENCY_KEY_REUSED", message: "La clave ya se usó con otra solicitud" } },
          replayed: false,
        };
      }

      if (record.response_status === null || record.response_body === null) {
        throw new Error("Committed idempotency record has no stored response");
      }

      return finish(
        client,
        { status: record.response_status, body: record.response_body },
        true,
      );
    }

    const recordId = inserted.rows[0]?.id;

    if (!recordId) {
      throw new Error("Idempotency record insert returned no row");
    }
    const accounts = await client.query<{
      id: string;
      user_id: string;
      balance_units: string;
      account_status: "ACTIVE" | "DISABLED";
    }>(
      `SELECT c.id, c.user_id, c.balance_units::text, c.status AS account_status
       FROM accounts c
       JOIN users u ON u.id = c.user_id AND u.status = 'ACTIVE'
       WHERE c.user_id = ANY($1::uuid[]) AND c.asset_code = $2
       ORDER BY c.user_id
       FOR UPDATE`,
      [[userId, input.destinationId], input.asset],
    );
    const source = accounts.rows.find((account) => account.user_id === userId);
    const destination = accounts.rows.find((account) => account.user_id === input.destinationId);

    if (
      !source ||
      !destination ||
      source.account_status !== "ACTIVE" ||
      destination.account_status !== "ACTIVE"
    ) {
      const result = {
        status: 404,
        body: { error: { code: "ACCOUNT_NOT_AVAILABLE", message: "Cuenta destinataria no disponible" } },
      };
      await storeTerminalResponse(client, recordId, result);
      return finish(client, result, false);
    }

    if (BigInt(source.balance_units) < BigInt(input.amountUnits)) {
      const result = {
        status: 409,
        body: { error: { code: "INSUFFICIENT_FUNDS", message: "Saldo insuficiente" } },
      };
      await storeTerminalResponse(client, recordId, result);
      return finish(client, result, false);
    }

    await client.query(
      "UPDATE accounts SET balance_units = balance_units - $2::numeric WHERE id = $1",
      [source.id, input.amountUnits],
    );
    await client.query(
      "UPDATE accounts SET balance_units = balance_units + $2::numeric WHERE id = $1",
      [destination.id, input.amountUnits],
    );

    const transferId = randomUUID();
    await client.query(
      `INSERT INTO transfers (id, source_account_id, destination_account_id, asset_code, amount_units)
       VALUES ($1, $2, $3, $4, $5)`,
      [transferId, source.id, destination.id, input.asset, input.amountUnits],
    );
    await client.query(
      `INSERT INTO ledger_entries (id, transfer_id, account_id, entry_type, amount_units)
       VALUES ($1, $2, $3, 'DEBIT', $4), ($5, $2, $6, 'CREDIT', $4)`,
      [randomUUID(), transferId, source.id, input.amountUnits, randomUUID(), destination.id],
    );
    await client.query(
      `INSERT INTO outbox_events (id, event_type, aggregate_id, payload)
       VALUES ($1, 'TRANSFER_COMPLETED', $2, $3)`,
      [
        randomUUID(),
        transferId,
        {
          transferId,
          senderUserId: userId,
          recipientUserId: input.destinationId,
          asset: input.asset,
          amountUnits: input.amountUnits,
        },
      ],
    );

    const result = {
      status: 201,
      body: {
        transferenciaId: transferId,
        estado: "COMPLETADA",
        activo: input.asset,
        montoUnidades: input.amountUnits,
      },
    };
    await storeTerminalResponse(client, recordId, result);
    return finish(client, result, false);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
