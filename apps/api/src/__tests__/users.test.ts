import { describe, test, expect } from "bun:test";
import { createCallerFactory } from "../trpc";
import { appRouter } from "../routers";
import type { Context } from "../trpc";
import {
  createMockDb,
  createTestUser,
  TEST_USER_ID,
  testUser,
} from "./helpers";

// --- Helpers ---

function createTestContext(overrides: Partial<Context> = {}): Context {
  return {
    db: createMockDb(),
    user: null,
    req: new Request("http://localhost:3002"),
    ...overrides,
  };
}

const createCaller = createCallerFactory(appRouter);

// --- users.me ---

describe("users.me", () => {
  test("returns current user profile", async () => {
    const db = createMockDb({ select: [[testUser]] });
    const caller = createCaller(
      createTestContext({
        db,
        user: createTestUser(),
      }),
    );

    const result = await caller.users.me();

    expect(result).toEqual(testUser);
    expect(result.id).toBe(TEST_USER_ID);
    expect(result.email).toBe("user@test.com");
  });

  test("throws NOT_FOUND when user missing", async () => {
    const db = createMockDb({ select: [[]] });
    const caller = createCaller(
      createTestContext({
        db,
        user: createTestUser(),
      }),
    );

    await expect(caller.users.me()).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });

  test("rejects unauthenticated request", async () => {
    const caller = createCaller(createTestContext({ user: null }));

    await expect(caller.users.me()).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
  });
});
