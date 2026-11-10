import { describe, expect, it } from "vitest";
import {
  idempotencyKeySchema,
  normalizeTransferInput,
  transferBodySchema,
} from "../src/modules/transfers/transfers.schemas.js";

describe("transfer request contract", () => {
  it("normalizes the amount without floating-point arithmetic", () => {
    const parsed = transferBodySchema.parse({
      destinoId: "5b2b7c98-5ef7-4e31-b03c-8e7afc19c2f0",
      activo: "TST",
      montoUnidades: "00042",
    });

    expect(normalizeTransferInput(parsed)).toEqual({
      destinationId: "5b2b7c98-5ef7-4e31-b03c-8e7afc19c2f0",
      asset: "TST",
      amountUnits: "42",
    });
  });

  it("rejects zero, decimals, oversized values, and unknown fields", () => {
    const base = {
      destinoId: "5b2b7c98-5ef7-4e31-b03c-8e7afc19c2f0",
      activo: "TST",
      montoUnidades: "1",
    };

    expect(transferBodySchema.safeParse({ ...base, montoUnidades: "0" }).success).toBe(false);
    expect(transferBodySchema.safeParse({ ...base, montoUnidades: "1.5" }).success).toBe(false);
    expect(transferBodySchema.safeParse({ ...base, montoUnidades: "1".repeat(39) }).success).toBe(false);
    expect(transferBodySchema.safeParse({ ...base, origenId: "spoofed" }).success).toBe(false);
  });

  it("accepts only bounded, header-safe idempotency keys", () => {
    expect(idempotencyKeySchema.safeParse("transfer-0001").success).toBe(true);
    expect(idempotencyKeySchema.safeParse("short").success).toBe(false);
    expect(idempotencyKeySchema.safeParse("bad key value").success).toBe(false);
  });
});
