import { describe, test, expect, beforeEach, mock } from "bun:test";
import { cache, _setRedisForTest } from "../lib/cache";

// Create a mock Redis client
function createMockRedis() {
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
      return "OK";
    }),
    del: mock(async (key: string) => {
      store.delete(key);
      return 1;
    }),
  };
}

describe("cache", () => {
  let mockRedis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    mockRedis = createMockRedis();
    _setRedisForTest(mockRedis as never);
  });

  describe("get", () => {
    test("returns null for missing key", async () => {
      const result = await cache.get("nonexistent");
      expect(result).toBeNull();
    });

    test("returns cached value", async () => {
      mockRedis.store.set("test-key", { value: { name: "Alice" } });

      const result = await cache.get<{ name: string }>("test-key");
      expect(result).toEqual({ name: "Alice" });
    });

    test("returns null on Redis error", async () => {
      mockRedis.get.mockImplementationOnce(async () => {
        throw new Error("Connection refused");
      });

      const result = await cache.get("key");
      expect(result).toBeNull();
    });
  });

  describe("set", () => {
    test("stores value in Redis with TTL", async () => {
      await cache.set("my-key", { data: 42 }, 300);

      expect(mockRedis.set).toHaveBeenCalledWith(
        "my-key",
        { data: 42 },
        { ex: 300 },
      );
    });

    test("does not throw on Redis error", async () => {
      mockRedis.set.mockImplementationOnce(async () => {
        throw new Error("Connection refused");
      });

      // Should not throw
      await cache.set("key", "value", 60);
    });
  });

  describe("del", () => {
    test("deletes key from Redis", async () => {
      mockRedis.store.set("to-delete", { value: "x" });
      await cache.del("to-delete");

      expect(mockRedis.del).toHaveBeenCalledWith("to-delete");
    });

    test("does not throw on Redis error", async () => {
      mockRedis.del.mockImplementationOnce(async () => {
        throw new Error("Connection refused");
      });

      await cache.del("key");
    });
  });

  describe("getOrGenerate", () => {
    test("returns cached value without calling generator", async () => {
      mockRedis.store.set("cached", { value: "from-cache" });

      const generator = mock(async () => "from-generator");
      const result = await cache.getOrGenerate("cached", generator, 60);

      expect(result).toBe("from-cache");
      expect(generator).not.toHaveBeenCalled();
    });

    test("calls generator on cache miss and stores result", async () => {
      const generator = mock(async () => ({ computed: true }));
      const result = await cache.getOrGenerate("new-key", generator, 120);

      expect(result).toEqual({ computed: true });
      expect(generator).toHaveBeenCalledTimes(1);
      expect(mockRedis.set).toHaveBeenCalledWith(
        "new-key",
        { computed: true },
        { ex: 120 },
      );
    });

    test("calls generator when Redis returns null", async () => {
      const generator = mock(async () => "generated");
      const result = await cache.getOrGenerate("miss", generator, 60);

      expect(result).toBe("generated");
      expect(generator).toHaveBeenCalledTimes(1);
    });
  });
});

describe("cache (no Redis)", () => {
  beforeEach(() => {
    _setRedisForTest(null);

    // Also clear env to ensure no auto-creation
    const savedUrl = process.env.UPSTASH_REDIS_REST_URL;
    const savedToken = process.env.UPSTASH_REDIS_REST_TOKEN;
    delete process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_TOKEN;

    // Restore after - we'll handle this differently
    process.env.UPSTASH_REDIS_REST_URL = savedUrl;
    process.env.UPSTASH_REDIS_REST_TOKEN = savedToken;
  });

  test("get returns null when Redis is not configured", async () => {
    _setRedisForTest(null);
    const saved = process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    try {
      const result = await cache.get("key");
      expect(result).toBeNull();
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = saved;
    }
  });

  test("getOrGenerate calls generator directly when no Redis", async () => {
    _setRedisForTest(null);
    const saved = process.env.UPSTASH_REDIS_REST_URL;
    delete process.env.UPSTASH_REDIS_REST_URL;
    try {
      const generator = mock(async () => "direct");
      const result = await cache.getOrGenerate("key", generator, 60);
      expect(result).toBe("direct");
      expect(generator).toHaveBeenCalledTimes(1);
    } finally {
      process.env.UPSTASH_REDIS_REST_URL = saved;
    }
  });
});
