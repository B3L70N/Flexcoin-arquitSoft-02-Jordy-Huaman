import { z } from "zod";

export const transferBodySchema = z
  .object({
    destinoId: z.string().uuid(),
    activo: z.string().regex(/^[A-Z0-9]{2,12}$/),
    montoUnidades: z.string().regex(/^[0-9]{1,38}$/),
  })
  .strict()
  .refine(
    (value) => /^[0-9]{1,38}$/.test(value.montoUnidades) && BigInt(value.montoUnidades) > 0n,
    {
    path: ["montoUnidades"],
    message: "El monto debe ser positivo",
    },
  );

export const idempotencyKeySchema = z.string().min(8).max(128).regex(/^[A-Za-z0-9._:-]+$/);

export function normalizeTransferInput(input: z.infer<typeof transferBodySchema>) {
  return {
    destinationId: input.destinoId.toLowerCase(),
    asset: input.activo,
    amountUnits: BigInt(input.montoUnidades).toString(),
  };
}
