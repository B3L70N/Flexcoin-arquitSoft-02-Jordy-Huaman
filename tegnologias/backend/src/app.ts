import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { pool } from "./db/pool.js";
import { authRouter } from "./modules/auth/auth.routes.js";
import { balancesRouter } from "./modules/balances/balances.routes.js";
import { transfersRouter } from "./modules/transfers/transfers.routes.js";
import { HttpError } from "./shared/http-error.js";

export const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: config.appOrigin, credentials: true }));
app.use(express.json({ limit: "16kb", strict: true }));
app.use(cookieParser());

app.get("/health", (_request, response) => {
  response.status(200).json({ status: "ok" });
});

app.get("/ready", async (_request, response) => {
  await pool.query("SELECT 1");
  response.status(200).json({ status: "ready" });
});

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/saldos", balancesRouter);
app.use("/api/v1/transferencias", transfersRouter);

app.use((_request, _response, next) => {
  next(new HttpError(404, "NOT_FOUND", "Ruta no encontrada"));
});

const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  if (error instanceof HttpError) {
    response.status(error.status).json({
      error: { code: error.code, message: error.message },
    });
    return;
  }

  if (error instanceof SyntaxError && "body" in error) {
    response.status(400).json({
      error: { code: "INVALID_JSON", message: "El cuerpo JSON no es válido" },
    });
    return;
  }

  console.error("Unhandled API error", error);
  response.status(500).json({
    error: { code: "INTERNAL_ERROR", message: "Error interno del servidor" },
  });
};

app.use(errorHandler);
