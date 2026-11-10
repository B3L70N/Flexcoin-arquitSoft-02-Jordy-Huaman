import { z } from "zod";
import { HttpError } from "./http-error.js";

export function parseBody<T extends z.ZodType>(
  schema: T,
  body: unknown,
): z.infer<T> {
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    throw new HttpError(400, "INVALID_REQUEST", "La solicitud no es válida");
  }

  return parsed.data;
}
