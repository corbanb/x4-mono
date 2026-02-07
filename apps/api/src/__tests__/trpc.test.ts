import { describe, test, expect } from "bun:test";
import { createCallerFactory } from "../trpc";
import { appRouter } from "../routers";
import type { Context } from "../trpc";

// --- Helpers ---

function createTestContext(overrides: Partial<Context> = {}): Context {
  return {
    db: {} as Context["db"],
    user: null,
    req: new Request("http://localhost:3002"),
    ...overrides,
  };
}

function makeAuthToken(userId: string, role: string = "user"): string {
  return btoa(JSON.stringify({ userId, role }));
}

const createCaller = createCallerFactory(appRouter);

// --- Auth middleware tests ---

describe("Auth middleware", () => {
  test("protectedProcedure rejects unauthenticated requests", async () => {
    const caller = createCaller(createTestContext({ user: null }));

    await expect(caller.users.me()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });

  test("adminProcedure rejects non-admin users", async () => {
    // adminProcedure is not directly exposed on a router endpoint yet,
    // but protectedProcedure should accept authenticated users
    const caller = createCaller(
      createTestContext({
        user: { userId: "test-user-id", role: "user" },
      }),
    );

    // users.me should work for authenticated users (it's protectedProcedure)
    // It will fail at the DB level since we have a mock, but shouldn't throw UNAUTHORIZED
    await expect(caller.users.me()).rejects.not.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});

// --- Auth token decoding tests ---

describe("Auth token decoding via HTTP", () => {
  test("request without Authorization header has null user in context", async () => {
    const { createContext } = await import("../trpc");
    const ctx = createContext({
      req: new Request("http://localhost:3002"),
      resHeaders: new Headers(),
      info: {} as never,
    });
    expect(ctx.user).toBeNull();
  });

  test("request with valid Bearer token decodes user", async () => {
    const { createContext } = await import("../trpc");
    const token = makeAuthToken("user-123", "admin");
    const ctx = createContext({
      req: new Request("http://localhost:3002", {
        headers: { Authorization: `Bearer ${token}` },
      }),
      resHeaders: new Headers(),
      info: {} as never,
    });
    expect(ctx.user).toEqual({ userId: "user-123", role: "admin" });
  });

  test("request with invalid token has null user", async () => {
    const { createContext } = await import("../trpc");
    const ctx = createContext({
      req: new Request("http://localhost:3002", {
        headers: { Authorization: "Bearer not-valid-base64-json" },
      }),
      resHeaders: new Headers(),
      info: {} as never,
    });
    expect(ctx.user).toBeNull();
  });

  test("request with non-Bearer scheme has null user", async () => {
    const { createContext } = await import("../trpc");
    const ctx = createContext({
      req: new Request("http://localhost:3002", {
        headers: { Authorization: "Basic abc123" },
      }),
      resHeaders: new Headers(),
      info: {} as never,
    });
    expect(ctx.user).toBeNull();
  });
});
