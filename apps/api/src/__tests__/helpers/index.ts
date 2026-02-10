export { createMockDb } from "./mock-db";
export {
  TEST_USER_ID,
  TEST_ADMIN_ID,
  TEST_PROJECT_ID,
  OTHER_USER_ID,
  createTestUser,
  testUser,
  testAdmin,
  testProject,
  testProjectWithOwner,
} from "./fixtures";

import type { Context } from "../../trpc";
import { createCallerFactory } from "../../trpc";
import { appRouter } from "../../routers";
import { createMockDb } from "./mock-db";

/**
 * Create a mock tRPC context for router testing.
 * Supports anonymous (default), authenticated user, or admin.
 *
 * Usage:
 *   createTestContext()                            // anonymous
 *   createTestContext({ user: createTestUser() })  // authenticated user
 *   createTestContext({ user: createTestUser({ role: "admin" }) })  // admin
 */
export function createTestContext(overrides: Partial<Context> = {}): Context {
  return {
    db: createMockDb(),
    user: null,
    req: new Request("http://localhost:3002"),
    ...overrides,
  };
}

/**
 * Create a tRPC caller for direct router testing without HTTP.
 * Wraps `appRouter.createCaller` via `createCallerFactory`.
 *
 * Usage:
 *   const caller = createCaller(createTestContext({ user: createTestUser() }));
 *   const result = await caller.projects.list({});
 */
export const createCaller = createCallerFactory(appRouter);
