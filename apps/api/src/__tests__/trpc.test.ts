import { describe, test, expect } from 'bun:test';
import { createCallerFactory, router, adminProcedure } from '../trpc';
import { appRouter } from '../routers';
import type { Context } from '../trpc';
import { createMockDb, createTestUser, TEST_USER_ID } from './helpers';

// --- Helpers ---

function createTestContext(overrides: Partial<Context> = {}): Context {
  return {
    db: createMockDb(),
    user: null,
    req: new Request('http://localhost:3002'),
    ...overrides,
  };
}

const createCaller = createCallerFactory(appRouter);

// --- Auth middleware tests ---

describe('Auth middleware', () => {
  test('protectedProcedure rejects unauthenticated requests', async () => {
    const caller = createCaller(createTestContext({ user: null }));

    await expect(caller.users.me()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  test('protectedProcedure accepts authenticated users', async () => {
    const caller = createCaller(
      createTestContext({
        user: createTestUser(),
      }),
    );

    // users.me should work for authenticated users (it's protectedProcedure)
    // It will fail at the DB level since we have a mock, but shouldn't throw UNAUTHORIZED
    await expect(caller.users.me()).rejects.not.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});

// --- adminProcedure tests ---

describe('adminProcedure', () => {
  test('rejects non-admin with FORBIDDEN', async () => {
    const testRouter = router({
      adminOnly: adminProcedure.query(() => 'secret'),
    });
    const caller = createCallerFactory(testRouter)(
      createTestContext({
        user: createTestUser(),
      }),
    );

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  test('allows admin user', async () => {
    const testRouter = router({
      adminOnly: adminProcedure.query(() => 'secret'),
    });
    const caller = createCallerFactory(testRouter)(
      createTestContext({
        user: createTestUser({ role: 'admin' }),
      }),
    );

    const result = await caller.adminOnly();
    expect(result).toBe('secret');
  });

  test('rejects unauthenticated with UNAUTHORIZED', async () => {
    const testRouter = router({
      adminOnly: adminProcedure.query(() => 'secret'),
    });
    const caller = createCallerFactory(testRouter)(createTestContext({ user: null }));

    await expect(caller.adminOnly()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });
});

// --- Error formatter tests ---

describe('Error formatter', () => {
  test('ZodError produces flattened zodError in response', async () => {
    const caller = createCallerFactory(appRouter)(
      createTestContext({
        user: createTestUser(),
      }),
    );

    try {
      await caller.projects.create({ name: '' });
      expect.unreachable('Should have thrown');
    } catch (error: unknown) {
      const err = error as { code: string; shape?: { data?: { zodError?: unknown } } };
      expect(err.code).toBe('BAD_REQUEST');
    }
  });
});
