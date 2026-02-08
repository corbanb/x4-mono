import { describe, test, expect } from "bun:test";
import { Hono } from "hono";
import { AppError } from "../lib/errors";
import { requestLogger } from "../middleware/logger";

function createTestApp() {
  const app = new Hono();

  app.use("*", requestLogger);

  app.onError((err, c) => {
    const requestId = c.get("requestId") ?? crypto.randomUUID();

    if (err instanceof AppError) {
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

    return c.json(
      {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred",
        requestId,
      },
      500,
    );
  });

  return app;
}

describe("Global error handler", () => {
  test("AppError returns structured JSON with correct status", async () => {
    const app = createTestApp();
    app.get("/test", () => {
      throw new AppError("NOT_FOUND", "Project not found");
    });

    const res = await app.request("/test");
    expect(res.status).toBe(404);

    const body = await res.json();
    expect(body.code).toBe("NOT_FOUND");
    expect(body.message).toBe("Project not found");
    expect(body.requestId).toBeDefined();
    expect(typeof body.requestId).toBe("string");
  });

  test("AppError with details includes details in response", async () => {
    const app = createTestApp();
    app.get("/test", () => {
      throw new AppError("VALIDATION_ERROR", "Validation failed", {
        email: "invalid",
      });
    });

    const res = await app.request("/test");
    expect(res.status).toBe(400);

    const body = await res.json();
    expect(body.code).toBe("VALIDATION_ERROR");
    expect(body.details).toEqual({ email: "invalid" });
  });

  test("unexpected error returns 500 without stack trace", async () => {
    const app = createTestApp();
    app.get("/test", () => {
      throw new Error("something broke internally");
    });

    const res = await app.request("/test");
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.code).toBe("INTERNAL_ERROR");
    expect(body.message).toBe("An unexpected error occurred");
    expect(body.requestId).toBeDefined();
    // No stack trace in response
    expect(body.stack).toBeUndefined();
  });

  test("all error codes return correct HTTP status", async () => {
    const cases: Array<[string, number]> = [
      ["UNAUTHORIZED", 401],
      ["FORBIDDEN", 403],
      ["NOT_FOUND", 404],
      ["CONFLICT", 409],
      ["BAD_REQUEST", 400],
      ["RATE_LIMITED", 429],
      ["INTERNAL_ERROR", 500],
      ["SERVICE_UNAVAILABLE", 503],
    ];

    for (const [code, expectedStatus] of cases) {
      const app = createTestApp();
      app.get("/test", () => {
        throw new AppError(code as never, "test");
      });

      const res = await app.request("/test");
      expect(res.status).toBe(expectedStatus);
    }
  });
});

describe("Request logging middleware", () => {
  test("sets X-Request-Id header on response", async () => {
    const app = createTestApp();
    app.get("/test", (c) => c.json({ ok: true }));

    const res = await app.request("/test");
    expect(res.headers.get("X-Request-Id")).toBeDefined();
    expect(res.headers.get("X-Request-Id")).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  test("uses x-request-id from incoming header if present", async () => {
    const app = createTestApp();
    app.get("/test", (c) => c.json({ ok: true }));

    const customId = "custom-request-id-123";
    const res = await app.request("/test", {
      headers: { "x-request-id": customId },
    });

    expect(res.headers.get("X-Request-Id")).toBe(customId);
  });

  test("requestId is available in error responses", async () => {
    const app = createTestApp();
    app.get("/test", () => {
      throw new AppError("NOT_FOUND", "not found");
    });

    const res = await app.request("/test");
    const body = await res.json();
    const headerId = res.headers.get("X-Request-Id");

    expect(body.requestId).toBe(headerId);
  });
});
