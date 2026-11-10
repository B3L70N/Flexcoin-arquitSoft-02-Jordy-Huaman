import { Router } from "express";
import { rateLimit } from "express-rate-limit";
import { config } from "../../config.js";
import { authenticate } from "../../shared/authenticate.js";
import { HttpError } from "../../shared/http-error.js";
import { parseBody } from "../../shared/validation.js";
import { credentialsSchema } from "./auth.schemas.js";
import {
  getRefreshCookieOptions,
  getUser,
  login,
  logout,
  register,
  rotateRefreshToken,
} from "./auth.service.js";

export const authRouter = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
});

function requireAllowedOrigin(request: import("express").Request): void {
  if (request.header("origin") !== config.appOrigin) {
    throw new HttpError(403, "ORIGIN_NOT_ALLOWED", "Origen de solicitud no permitido");
  }
}

authRouter.post("/register", registerLimiter, async (request, response) => {
  const input = parseBody(credentialsSchema, request.body);
  await register(input.email, input.password);
  response.status(202).json({
    message: "Si el correo está disponible, la cuenta quedó registrada; inicia sesión para continuar.",
  });
});

authRouter.post("/login", loginLimiter, async (request, response) => {
  const input = parseBody(credentialsSchema, request.body);
  const session = await login(input.email, input.password);
  response.cookie("refresh_token", session.refreshToken, getRefreshCookieOptions());
  response.status(200).json({
    accessToken: session.accessToken,
    tokenType: "Bearer",
    expiresIn: 900,
    user: { id: session.userId, email: session.email },
  });
});

authRouter.post("/refresh", (request, _response, next) => {
  try {
    requireAllowedOrigin(request);
    next();
  } catch (error) {
    next(error);
  }
}, async (request, response) => {
  const presentedToken = request.cookies?.refresh_token;

  if (typeof presentedToken !== "string") {
    throw new HttpError(401, "INVALID_REFRESH_TOKEN", "Sesión inválida o expirada");
  }

  const session = await rotateRefreshToken(presentedToken);
  response.cookie("refresh_token", session.refreshToken, getRefreshCookieOptions());
  response.status(200).json({
    accessToken: session.accessToken,
    tokenType: "Bearer",
    expiresIn: 900,
  });
});

authRouter.post("/logout", (request, _response, next) => {
  try {
    requireAllowedOrigin(request);
    next();
  } catch (error) {
    next(error);
  }
}, async (request, response) => {
  const presentedToken = request.cookies?.refresh_token;
  await logout(typeof presentedToken === "string" ? presentedToken : undefined);
  response.clearCookie("refresh_token", getRefreshCookieOptions());
  response.status(204).end();
});

authRouter.get("/me", authenticate, async (request, response) => {
  const user = await getUser(request.userId!);
  response.status(200).json({ user });
});
