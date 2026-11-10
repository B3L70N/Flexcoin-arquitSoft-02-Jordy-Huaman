import { randomBytes, createHash, randomUUID } from "node:crypto";
import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { PoolClient } from "pg";
import { pool } from "../../db/pool.js";
import { config } from "../../config.js";
import { HttpError } from "../../shared/http-error.js";

const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const dummyPasswordHash = argon2.hash(randomBytes(32).toString("hex"), {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
});

type User = {
  id: string;
  email: string;
  password_hash: string;
  status: "ACTIVE" | "DISABLED";
};

function hashRefreshToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function createAccessToken(userId: string): string {
  return jwt.sign({}, config.jwtAccessSecret, {
    algorithm: "HS256",
    subject: userId,
    issuer: "quillacoin-api",
    audience: "quillacoin-client",
    expiresIn: "15m",
  });
}

function createRefreshToken(): string {
  return randomBytes(32).toString("base64url");
}

async function insertRefreshToken(
  client: PoolClient,
  userId: string,
  familyId: string,
  token: string,
): Promise<void> {
  await client.query(
    `INSERT INTO refresh_tokens (id, family_id, user_id, token_hash, expires_at)
     VALUES ($1, $2, $3, $4, NOW() + INTERVAL '30 days')`,
    [randomUUID(), familyId, userId, hashRefreshToken(token)],
  );
}

export async function register(email: string, password: string): Promise<void> {
  const normalizedEmail = email.toLowerCase();
  const passwordHash = await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 19_456,
    timeCost: 2,
    parallelism: 1,
  });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const userId = randomUUID();
    const inserted = await client.query<{ id: string }>(
      `INSERT INTO users (id, email, password_hash)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING
       RETURNING id`,
      [userId, normalizedEmail, passwordHash],
    );

    if (inserted.rowCount) {
      await client.query(
        `INSERT INTO accounts (id, user_id, asset_code)
         SELECT gen_random_uuid(), $1, code FROM assets WHERE enabled = TRUE`,
        [userId],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function login(
  email: string,
  password: string,
): Promise<{ userId: string; email: string; accessToken: string; refreshToken: string }> {
  const result = await pool.query<User>(
    "SELECT id, email, password_hash, status FROM users WHERE email = $1",
    [email.toLowerCase()],
  );
  const user = result.rows[0];
  const passwordMatches = await argon2.verify(
    user?.password_hash ?? (await dummyPasswordHash),
    password,
  );

  if (!user || user.status !== "ACTIVE" || !passwordMatches) {
    throw new HttpError(401, "INVALID_CREDENTIALS", "Correo o contraseña incorrectos");
  }

  const refreshToken = createRefreshToken();
  const familyId = randomUUID();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await insertRefreshToken(client, user.id, familyId, refreshToken);
    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  return {
    userId: user.id,
    email: user.email,
    accessToken: createAccessToken(user.id),
    refreshToken,
  };
}

export async function rotateRefreshToken(
  presentedToken: string,
): Promise<{ userId: string; accessToken: string; refreshToken: string }> {
  const client = await pool.connect();
  const newRefreshToken = createRefreshToken();

  try {
    await client.query("BEGIN");
    const currentResult = await client.query<{
      id: string;
      user_id: string;
      family_id: string;
      expires_at: Date;
      used_at: Date | null;
      revoked_at: Date | null;
    }>(
      `SELECT id, user_id, family_id, expires_at, used_at, revoked_at
       FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE`,
      [hashRefreshToken(presentedToken)],
    );
    const current = currentResult.rows[0];

    if (!current) {
      await client.query("ROLLBACK");
      throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Sesión inválida o expirada");
    }

    if (current.used_at || current.revoked_at) {
      await client.query(
        "UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, NOW()) WHERE family_id = $1",
        [current.family_id],
      );
      await client.query("COMMIT");
      throw new HttpError(401, "REFRESH_TOKEN_REUSED", "La sesión debe volver a autenticarse");
    }

    if (current.expires_at <= new Date()) {
      await client.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1 AND revoked_at IS NULL",
        [current.family_id],
      );
      await client.query("COMMIT");
      throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Sesión inválida o expirada");
    }

    const activeUser = await client.query(
      "SELECT id FROM users WHERE id = $1 AND status = 'ACTIVE'",
      [current.user_id],
    );

    if (!activeUser.rowCount) {
      await client.query(
        "UPDATE refresh_tokens SET revoked_at = NOW() WHERE family_id = $1 AND revoked_at IS NULL",
        [current.family_id],
      );
      await client.query("COMMIT");
      throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Sesión inválida o expirada");
    }

    await client.query("UPDATE refresh_tokens SET used_at = NOW() WHERE id = $1", [current.id]);
    await insertRefreshToken(client, current.user_id, current.family_id, newRefreshToken);
    await client.query("COMMIT");

    return {
      userId: current.user_id,
      accessToken: createAccessToken(current.user_id),
      refreshToken: newRefreshToken,
    };
  } catch (error) {
    if (!(error instanceof HttpError)) {
      await client.query("ROLLBACK");
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function logout(presentedToken: string | undefined): Promise<void> {
  if (!presentedToken) {
    return;
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const token = await client.query<{ family_id: string }>(
      "SELECT family_id FROM refresh_tokens WHERE token_hash = $1 FOR UPDATE",
      [hashRefreshToken(presentedToken)],
    );

    if (token.rows[0]) {
      await client.query(
        "UPDATE refresh_tokens SET revoked_at = COALESCE(revoked_at, NOW()) WHERE family_id = $1",
        [token.rows[0].family_id],
      );
    }

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function getRefreshCookieOptions() {
  return {
    httpOnly: true,
    secure: config.cookieSecure,
    sameSite: "lax" as const,
    path: "/api/v1/auth",
    maxAge: REFRESH_TOKEN_TTL_MS,
  };
}

export async function getUser(userId: string): Promise<{ id: string; email: string }> {
  const result = await pool.query<{ id: string; email: string }>(
    "SELECT id, email FROM users WHERE id = $1 AND status = 'ACTIVE'",
    [userId],
  );

  if (!result.rows[0]) {
    throw new HttpError(404, "USER_NOT_FOUND", "Usuario no encontrado");
  }

  return result.rows[0];
}
