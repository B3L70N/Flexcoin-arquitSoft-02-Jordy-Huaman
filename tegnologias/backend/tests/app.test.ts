import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import request from "supertest";
import type { Express } from "express";
import type { Server } from "node:http";

describe("API HTTP behavior", () => {
  let app: Express;
  let server: Server;
  let closePool: () => Promise<void>;

  beforeAll(async () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("DATABASE_URL", "postgresql://test:test@localhost:5432/quillacoin_test");
    vi.stubEnv("JWT_ACCESS_SECRET", "test-secret-that-is-long-enough-for-hs256");
    vi.stubEnv("APP_ORIGIN", "http://localhost:5173");
    vi.stubEnv("COOKIE_SECURE", "false");
    vi.stubEnv("DATABASE_SSL", "false");

    ({ app } = await import("../src/app.js"));
    const { pool } = await import("../src/db/pool.js");
    closePool = () => pool.end();
    server = app.listen(0);
  });

  afterAll(async () => {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => (error ? reject(error) : resolve()));
    });
    await closePool();
    vi.unstubAllEnvs();
  });

  it("reports liveness without requiring PostgreSQL", async () => {
    await request(server).get("/health").expect(200, { status: "ok" });
  });

  it("rejects protected API requests without a bearer token", async () => {
    await request(server)
      .get("/api/v1/saldos")
      .expect(401)
      .expect(({ body }) => {
        expect(body.error.code).toBe("UNAUTHENTICATED");
      });
  });

  it("rejects cookie-authenticated requests from an untrusted origin", async () => {
    await request(server)
      .post("/api/v1/auth/refresh")
      .set("Origin", "https://attacker.invalid")
      .expect(403);
  });
});
