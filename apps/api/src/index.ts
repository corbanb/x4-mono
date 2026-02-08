import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { auth } from "@x4/auth";
import { appRouter } from "./routers";
import { createContext } from "./trpc";
import { env } from "./lib/env";

const app = new Hono();

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
      console.error("tRPC error:", error.message);
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
