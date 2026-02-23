import { mock } from 'bun:test';

/**
 * In-memory Redis mock with TTL support.
 * Provides a `store` Map for direct manipulation in tests.
 *
 * Usage:
 * ```ts
 * const redis = createMockRedis();
 * _setRedisForTest(redis as never);
 * ```
 */
export function createMockRedis() {
  const store = new Map<string, { value: unknown; expiry?: number }>();

  return {
    store,
    get: mock(async (key: string) => {
      const entry = store.get(key);
      if (!entry) return null;
      if (entry.expiry && Date.now() > entry.expiry) {
        store.delete(key);
        return null;
      }
      return entry.value;
    }),
    set: mock(async (key: string, value: unknown, opts?: { ex?: number }) => {
      const expiry = opts?.ex ? Date.now() + opts.ex * 1000 : undefined;
      store.set(key, { value, expiry });
      return 'OK';
    }),
    del: mock(async (key: string) => {
      store.delete(key);
      return 1;
    }),
  };
}
