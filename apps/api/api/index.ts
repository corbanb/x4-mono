import { Hono } from "hono";
import { handle } from "hono/vercel";

const diag = new Hono();

diag.all("*", (c) => {
  return c.json({
    diagnostic: true,
    message: "Vercel function is working",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? "SET" : "MISSING",
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "MISSING",
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET ? "SET" : "MISSING",
      BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "NOT SET",
      ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY ? "SET" : "MISSING",
      WEB_URL: process.env.WEB_URL ?? "NOT SET",
      VERCEL_URL: process.env.VERCEL_URL ?? "NOT SET",
    },
  });
});

export default handle(diag);
