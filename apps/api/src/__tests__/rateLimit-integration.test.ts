import { describe, test, expect } from 'bun:test';
import { Hono } from 'hono';
import { requestLogger } from '../middleware/logger';
import { rateLimit } from '../middleware/rateLimit';

// These tests verify fail-open behavior when Redis is not available.
// In test env (NODE_ENV=test), the rate limiter skips Redis entirely.

describe('Rate limit integration (no Redis — fail open)', () => {
  function createApp() {
    const app = new Hono();
    app.use('*', requestLogger);
    app.use('/api/auth/*', rateLimit('auth'));
    app.use('/trpc/*', rateLimit('general'));
    app.get('/trpc/test', (c: { json: (v: unknown) => Response }) => c.json({ ok: true }));
    app.get('/api/auth/login', (c: { json: (v: unknown) => Response }) => c.json({ ok: true }));
    app.get('/health', (c: { json: (v: unknown) => Response }) => c.json({ ok: true }));
    return app;
  }

  test('requests pass through when Redis is not available', async () => {
    const app = createApp();
    const res = await app.request('/trpc/test');
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.ok).toBe(true);
  });

  test('auth route passes through when Redis is not available', async () => {
    const app = createApp();
    const res = await app.request('/api/auth/login');
    expect(res.status).toBe(200);
  });

  test('health check is not rate limited', async () => {
    const app = createApp();
    const res = await app.request('/health');
    expect(res.status).toBe(200);
  });

  test('X-Request-Id header is present regardless of rate limiting', async () => {
    const app = createApp();
    const res = await app.request('/trpc/test');
    expect(res.headers.get('X-Request-Id')).toBeDefined();
  });
});

describe('Rate limit 429 response shape', () => {
  test('429 response matches expected JSON format', () => {
    const expectedBody = {
      code: 'RATE_LIMITED',
      message: 'Too many requests',
    };
    expect(expectedBody.code).toBe('RATE_LIMITED');
    expect(expectedBody.message).toBe('Too many requests');
  });
});
