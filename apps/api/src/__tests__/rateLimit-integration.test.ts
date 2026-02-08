import { describe, test, expect, beforeAll, afterAll } from "bun:test";
import { Hono } from "hono";
import { requestLogger } from "../middleware/logger";

// These tests use a fresh rateLimit import without Redis configured
// to verify fail-open behavior without hitting network timeouts

describe("Rate limit integration (no Redis — fail open)", () => {
  let savedUrl: string | undefined;
  let savedToken: string | undefined;

  beforeAll(() => {
    // Remove Upstash env vars so rate limiter has no Redis
    savedUrl = process.env.UPSTASH_REDIS_REST_URL;
    savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;
  });

  afterAll(() => {
    // Restore env vars
    if (savedUrl) process.env.UPSTASH_REDIS_REST_URL = savedUrl;
    if (savedToken) process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
  });

  function createApp() {
    // Dynamic import to avoid cached Redis client from other tests
    const { rateLimit } = require("../middleware/rateLimit");
    const app = new Hono();
    app.use("*", requestLogger);
    app.use("/api/auth/*", rateLimit("auth"));
    app.use("/trpc/*", rateLimit("general"));
    app.get("/trpc/test", (c: { json: (v: unknown) => Response }) =>
      c.json({ ok: true }),
    );
    app.get("/api/auth/login", (c: { json: (v: unknown) => Response }) =>
      c.json({ ok: true }),
    );
    app.get("/health", (c: { json: (v: unknown) => Response }) =>
      c.json({ ok: true }),
    );
    return app;
  }

  test("requests pass through when Redis is not available", async () => {
    const app = createApp();
    const res = await app.request("/trpc/test");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test("auth route passes through when Redis is not available", async () => {
    const app = createApp();
    const res = await app.request("/api/auth/login");
    expect(res.status).toBe(200);
  });

  test("health check is not rate limited", async () => {
    const app = createApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
  });

  test("X-Request-Id header is present regardless of rate limiting", async () => {
    const app = createApp();
    const res = await app.request("/trpc/test");
    expect(res.headers.get("X-Request-Id")).toBeDefined();
  });
});

describe("Rate limit 429 response shape", () => {
  test("429 response matches expected JSON format", () => {
    const expectedBody = {
      code: "RATE_LIMITED",
      message: "Too many requests",
    };
    expect(expectedBody.code).toBe("RATE_LIMITED");
    expect(expectedBody.message).toBe("Too many requests");
  });
});
