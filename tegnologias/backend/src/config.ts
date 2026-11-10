import "dotenv/config";
import { z } from "zod";

const booleanFromString = z
  .enum(["true", "false"])
  .default("false")
  .transform((value) => value === "true");

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_ACCESS_SECRET: z.string().min(32),
  APP_ORIGIN: z.string().url(),
  COOKIE_SECURE: booleanFromString,
  DATABASE_SSL: booleanFromString,
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  throw new Error(`Invalid environment configuration: ${parsedEnv.error.message}`);
}

if (parsedEnv.data.NODE_ENV === "production" && !parsedEnv.data.COOKIE_SECURE) {
  throw new Error("COOKIE_SECURE must be true in production");
}

export const config = {
  nodeEnv: parsedEnv.data.NODE_ENV,
  port: parsedEnv.data.PORT,
  databaseUrl: parsedEnv.data.DATABASE_URL,
  databaseSsl: parsedEnv.data.DATABASE_SSL,
  jwtAccessSecret: parsedEnv.data.JWT_ACCESS_SECRET,
  appOrigin: new URL(parsedEnv.data.APP_ORIGIN).origin,
  cookieSecure: parsedEnv.data.COOKIE_SECURE,
};
