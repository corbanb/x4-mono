import { Redis } from "@upstash/redis";
import { logger } from "./logger";

/**
 * Cache key patterns:
 *
 *   ai:{sha256(prompt+model)}   → cached AI response (1 hour TTL)
 *   user:{userId}               → cached user profile (5 min TTL)
 *   public:{endpoint}           → cached public data (10 min TTL)
 *   flags:{key}                 → cached feature flags (30 sec TTL)
 */

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Don't create real Redis in test env — use _setRedisForTest for mocked tests
  if (!url || !token || process.env.NODE_ENV === "test") return null;

  redis = new Redis({ url, token });
  return redis;
}

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const client = getRedis();
    if (!client) return null;

    try {
      const value = await client.get<T>(key);
      return value ?? null;
    } catch (err) {
      logger.warn({ err, key }, "Cache get error — returning null");
      return null;
    }
  },

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
      await client.set(key, value, { ex: ttlSeconds });
    } catch (err) {
      logger.warn({ err, key }, "Cache set error");
    }
  },

  async del(key: string): Promise<void> {
    const client = getRedis();
    if (!client) return;

    try {
      await client.del(key);
    } catch (err) {
      logger.warn({ err, key }, "Cache del error");
    }
  },

  async getOrGenerate<T>(
    key: string,
    generator: () => Promise<T>,
    ttlSeconds: number,
  ): Promise<T> {
    // Try cache first
    const cached = await cache.get<T>(key);
    if (cached !== null) return cached;

    // Cache miss — generate value
    const value = await generator();

    // Store in cache (fire-and-forget)
    await cache.set(key, value, ttlSeconds);

    return value;
  },
};

// Export for testing — allows injecting a mock Redis client
export function _setRedisForTest(mockRedis: Redis | null): void {
  redis = mockRedis;
}
