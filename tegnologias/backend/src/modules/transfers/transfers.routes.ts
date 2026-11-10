import { Router } from "express";
import { authenticate } from "../../shared/authenticate.js";
import { HttpError } from "../../shared/http-error.js";
import { parseBody } from "../../shared/validation.js";
import {
  idempotencyKeySchema,
  normalizeTransferInput,
  transferBodySchema,
} from "./transfers.schemas.js";
import { createTransfer } from "./transfers.service.js";

export const transfersRouter = Router();

transfersRouter.post("/", authenticate, async (request, response) => {
  const parsed = parseBody(transferBodySchema, request.body);
  const key = idempotencyKeySchema.safeParse(request.header("idempotency-key"));

  if (!key.success) {
    throw new HttpError(400, "INVALID_IDEMPOTENCY_KEY", "Se requiere un Idempotency-Key válido");
  }

  const input = normalizeTransferInput(parsed);

  if (input.destinationId === request.userId) {
    throw new HttpError(400, "SELF_TRANSFER_NOT_ALLOWED", "No se permiten auto-transferencias");
  }

  const result = await createTransfer(request.userId!, key.data, input);

  if (result.replayed) {
    response.setHeader("Idempotent-Replay", "true");
  }

  response.status(result.status).json(result.body);
});
