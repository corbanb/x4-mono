import { describe, test, expect } from 'bun:test';
import { app } from '../index';
import { createCallerFactory, router, adminProcedure, protectedProcedure } from '../trpc';
import type { Context } from '../trpc';
import { createMockDb, createTestUser, TEST_USER_ID, TEST_ADMIN_ID } from './helpers';

// --- Helpers ---

function createTestContext(overrides: Partial<Context> = {}): Context {
  return {
    db: createMockDb(),
    user: null,
    req: new Request('http://localhost:3002'),
    ...overrides,
  };
}

// Note: Auth route endpoint tests (sign-in, sign-up, session) require
// a live DB with Better Auth tables. Those are covered by manual
// integration testing (PRD-006 Task 9) after running the migration.

// --- Auth CORS ---

describe('Auth CORS', () => {
  test('OPTIONS /api/auth/* returns CORS headers for allowed origin', async () => {
    const res = await app.request('/api/auth/session', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });

    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
  });

  test('OPTIONS /api/auth/* rejects disallowed origin', async () => {
    const res = await app.request('/api/auth/session', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://evil.com',
        'Access-Control-Request-Method': 'POST',
      },
    });

    const allowOrigin = res.headers.get('access-control-allow-origin');
    expect(allowOrigin).not.toBe('http://evil.com');
  });
});

// --- Middleware behavior via tRPC caller ---

describe('Auth middleware via tRPC caller', () => {
  test('protectedProcedure passes with authenticated user', async () => {
    const testRouter = router({
      check: protectedProcedure.query(({ ctx }) => ({
        userId: ctx.user.userId,
        role: ctx.user.role,
      })),
    });

    const caller = createCallerFactory(testRouter)(
      createTestContext({
        user: createTestUser(),
      }),
    );

    const result = await caller.check();
    expect(result.userId).toBe(TEST_USER_ID);
    expect(result.role).toBe('user');
  });

  test('protectedProcedure rejects null user', async () => {
    const testRouter = router({
      check: protectedProcedure.query(() => 'ok'),
    });

    const caller = createCallerFactory(testRouter)(createTestContext({ user: null }));

    await expect(caller.check()).rejects.toMatchObject({
      code: 'UNAUTHORIZED',
    });
  });

  test('adminProcedure passes with admin role', async () => {
    const testRouter = router({
      admin: adminProcedure.query(({ ctx }) => ctx.user.role),
    });

    const caller = createCallerFactory(testRouter)(
      createTestContext({
        user: createTestUser({ userId: TEST_ADMIN_ID, role: 'admin' }),
      }),
    );

    const result = await caller.admin();
    expect(result).toBe('admin');
  });

  test('adminProcedure rejects user role', async () => {
    const testRouter = router({
      admin: adminProcedure.query(() => 'secret'),
    });

    const caller = createCallerFactory(testRouter)(
      createTestContext({
        user: createTestUser({ role: 'user' }),
      }),
    );

    await expect(caller.admin()).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
  });

  test('context user has all expected fields', async () => {
    const testRouter = router({
      check: protectedProcedure.query(({ ctx }) => ctx.user),
    });

    const user = createTestUser({
      name: 'Full User',
      email: 'full@test.com',
      emailVerified: true,
    });

    const caller = createCallerFactory(testRouter)(createTestContext({ user }));

    const result = await caller.check();
    expect(result.userId).toBe(TEST_USER_ID);
    expect(result.name).toBe('Full User');
    expect(result.email).toBe('full@test.com');
    expect(result.role).toBe('user');
    expect(result.emailVerified).toBe(true);
  });
});
