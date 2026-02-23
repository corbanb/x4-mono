import { describe, test, expect } from 'bun:test';
import { app } from '../index';

describe('CORS middleware', () => {
  test('OPTIONS /trpc/* returns CORS headers for allowed origin', async () => {
    const res = await app.request('/trpc/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type,Authorization',
      },
    });

    expect(res.status).toBe(204);
    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    expect(res.headers.get('access-control-allow-methods')).toContain('POST');
    expect(res.headers.get('access-control-allow-headers')).toContain('Authorization');
  });

  test('OPTIONS /trpc/* rejects disallowed origin', async () => {
    const res = await app.request('/trpc/health', {
      method: 'OPTIONS',
      headers: {
        Origin: 'http://evil.com',
        'Access-Control-Request-Method': 'POST',
      },
    });

    const allowOrigin = res.headers.get('access-control-allow-origin');
    expect(allowOrigin).not.toBe('http://evil.com');
  });

  test('response includes CORS headers for allowed origin', async () => {
    const res = await app.request('/trpc/health', {
      method: 'GET',
      headers: {
        Origin: 'http://localhost:3000',
      },
    });

    expect(res.headers.get('access-control-allow-origin')).toBe('http://localhost:3000');
    expect(res.headers.get('access-control-allow-credentials')).toBe('true');
  });
});
