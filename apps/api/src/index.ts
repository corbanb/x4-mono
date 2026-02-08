import { Hono } from "hono";
import { cors } from "hono/cors";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers";
import { createContext } from "./trpc";
import { env } from "./lib/env";

const app = new Hono();

// --- Global Middleware ---

app.use(
  "/trpc/*",
  cors({
    origin: [env.WEB_URL, env.MARKETING_URL],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

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
