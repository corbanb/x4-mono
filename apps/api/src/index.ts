import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { auth } from "@x4/auth";
import { appRouter } from "./routers";
import { createContext } from "./trpc";
import { env } from "./lib/env";
import { AppError } from "./lib/errors";
import { logger } from "./lib/logger";
import { requestLogger } from "./middleware/logger";

const app = new Hono();

// --- Request Logger (first middleware — generates requestId) ---

app.use("*", requestLogger);

// --- Global Middleware ---

const allowedOrigins = [env.WEB_URL, env.MARKETING_URL];

app.use(
  "/trpc/*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

app.use(
  "/api/auth/*",
  cors({
    origin: allowedOrigins,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// --- Global Error Handler ---

app.onError((err, c) => {
  const requestId = c.get("requestId") ?? crypto.randomUUID();

  if (err instanceof AppError) {
    logger.warn({ err: { code: err.code, message: err.message }, requestId }, `AppError: ${err.code}`);
    return c.json(
      {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
      err.httpStatus as never,
    );
  }

  logger.error({ err, requestId }, "Unhandled error");
  return c.json(
    {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      requestId,
    },
    500,
  );
});

// --- Better Auth Handler ---

app.on(["POST", "GET"], "/api/auth/**", (c) => {
  return auth.handler(c.req.raw);
});

// --- Health Check ---

app.get("/health", (c) => {
  return c.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    version: env.APP_VERSION ?? "0.0.0",
  });
});

// --- tRPC Adapter ---

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error }) {
      logger.error({ code: error.code, message: error.message }, "tRPC error");
    },
  }),
);

// --- Server Entry ---

export default {
  port: env.PORT,
  fetch: app.fetch,
};

export { app };
export type { AppRouter } from "./routers";
