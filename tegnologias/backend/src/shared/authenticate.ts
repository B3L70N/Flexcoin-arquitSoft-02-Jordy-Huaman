import type { NextFunction, Request, Response } from "express";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { pool } from "../db/pool.js";
import { config } from "../config.js";
import { HttpError } from "./http-error.js";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export async function authenticate(
  request: Request,
  _response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const header = request.header("authorization");
    const match = header?.match(/^Bearer ([^\s]+)$/);

    if (!match) {
      throw new HttpError(401, "UNAUTHENTICATED", "Autenticación requerida");
    }

    const accessToken = match[1];

    if (!accessToken) {
      throw new HttpError(401, "UNAUTHENTICATED", "Autenticación requerida");
    }

    let payload: string | JwtPayload;

    try {
      payload = jwt.verify(accessToken, config.jwtAccessSecret, {
        algorithms: ["HS256"],
        issuer: "quillacoin-api",
        audience: "quillacoin-client",
      });
    } catch {
      throw new HttpError(401, "UNAUTHENTICATED", "Token de acceso inválido o expirado");
    }

    if (typeof payload === "string" || typeof payload.sub !== "string") {
      throw new HttpError(401, "UNAUTHENTICATED", "Token de acceso inválido");
    }

    const user = await pool.query<{ id: string }>(
      "SELECT id FROM users WHERE id = $1 AND status = 'ACTIVE'",
      [payload.sub],
    );

    if (!user.rowCount) {
      throw new HttpError(401, "UNAUTHENTICATED", "Sesión no disponible");
    }

    const authenticatedUser = user.rows[0];

    if (!authenticatedUser) {
      throw new HttpError(401, "UNAUTHENTICATED", "Sesión no disponible");
    }

    request.userId = authenticatedUser.id;
    next();
  } catch (error) {
    next(error);
  }
}
