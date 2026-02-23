import type { MiddlewareHandler } from 'hono';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import { logger } from '../lib/logger';

export type RateLimitTier = 'general' | 'ai' | 'auth';

type TierConfig = {
  limit: number;
  window: `${number} s` | `${number} m`;
  prefix: string;
};

const tierConfigs: Record<RateLimitTier, TierConfig> = {
  general: { limit: 100, window: '60 s', prefix: 'rl:general' },
  ai: { limit: 10, window: '60 s', prefix: 'rl:ai' },
  auth: { limit: 5, window: '60 s', prefix: 'rl:auth' },
};

let redis: Redis | null = null;
let redisChecked = false;

function getRedis(): Redis | null {
  if (redisChecked) return redis;
  redisChecked = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token || process.env.NODE_ENV === 'test') return null;

  redis = new Redis({ url, token });
  return redis;
}

const limiters = new Map<RateLimitTier, Ratelimit>();

function getLimiter(tier: RateLimitTier): Ratelimit | null {
  const existing = limiters.get(tier);
  if (existing) return existing;

  const redisClient = getRedis();
  if (!redisClient) return null;

  const config = tierConfigs[tier];
  const limiter = new Ratelimit({
    redis: redisClient,
    limiter: Ratelimit.slidingWindow(config.limit, config.window),
    analytics: true,
    prefix: config.prefix,
  });

  limiters.set(tier, limiter);
  return limiter;
}

function getIdentifier(tier: RateLimitTier, req: Request, userId?: string): string {
  // Auth tier always uses IP (brute force is pre-authentication)
  if (tier === 'auth') {
    return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
  }
  // Other tiers: prefer userId, fallback to IP, fallback to "anonymous"
  return userId ?? req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'anonymous';
}

export function rateLimit(tier: RateLimitTier): MiddlewareHandler {
  const config = tierConfigs[tier];

  return async (c, next) => {
    const limiter = getLimiter(tier);

    // Fail open if Redis is not configured
    if (!limiter) {
      await next();
      return;
    }

    // Get userId from auth context if available (set by auth middleware)
    const userId = c.get('requestId') ? undefined : undefined; // userId not in context yet at middleware level
    const identifier = getIdentifier(tier, c.req.raw, userId);

    try {
      const result = await limiter.limit(identifier);

      // Always set rate limit headers
      c.header('X-RateLimit-Limit', String(config.limit));
      c.header('X-RateLimit-Remaining', String(result.remaining));
      c.header('X-RateLimit-Reset', String(Math.floor(result.reset / 1000)));

      if (!result.success) {
        logger.warn({ tier, identifier, limit: config.limit }, 'Rate limit exceeded');
        return c.json({ code: 'RATE_LIMITED', message: 'Too many requests' }, 429);
      }
    } catch (err) {
      // Fail open on Redis errors
      logger.warn({ err, tier }, 'Rate limiter error — failing open');
    }

    await next();
  };
}

// Export for testing
export { tierConfigs, getIdentifier };
