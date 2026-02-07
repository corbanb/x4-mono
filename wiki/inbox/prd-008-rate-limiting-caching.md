# PRD-008: Rate Limiting & Caching

**PRD ID**: PRD-008
**Title**: Rate Limiting & Caching
**Author**: AI-Native TPM
**Status**: Draft
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-005 (API Server — Hono middleware system)
**Blocks**: PRD-009 (AI Integration — AI rate limiting tier)

---

## 1. Problem Statement

An API without rate limiting is an invitation for abuse. A single user hammering an AI endpoint can rack up hundreds of dollars in API costs in minutes. A bot scraping your public endpoints can DOS your serverless functions and spike your hosting bill. Auth endpoints without rate limiting are vulnerable to brute-force attacks. These aren't theoretical risks — they're the first things that happen when a product gets any real traffic.

Caching is the second half of the same problem. When your API makes the same database query for the same user profile on every request, or regenerates the same AI response for the same templated prompt, you're burning compute and latency for zero additional value. In a serverless context, this also means burning cold starts — every function invocation costs time and money.

This PRD adds Upstash Redis for both rate limiting and caching. Upstash is HTTP-based (no persistent TCP connections), which makes it work perfectly in serverless environments — Vercel functions, Cloudflare Workers, and Bun servers alike. The rate limiting uses three tiers (general, AI, auth) with sliding window algorithms, and the caching provides a generic `getOrGenerate` pattern that works for any expensive operation.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| General rate limit | 100 requests per minute per user/IP | Requests 101+ return 429 |
| AI rate limit | 10 requests per minute per user | AI request 11+ returns 429 |
| Auth rate limit | 5 requests per minute per IP | Login attempt 6+ returns 429 |
| Rate limit headers | `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset` | Present on every response |
| 429 response shape | Matches `APIErrorResponse` with code `RATE_LIMITED` | Consistent with PRD-007 error format |
| Cache hit | Cached value returns without hitting origin | Response time < 5ms for cached data |
| Cache miss + set | First request generates + caches, second request returns cached | TTL-based expiry works |
| Cache invalidation | `cache.del(key)` removes cached value | Subsequent get returns null |
| Serverless compat | Upstash works on Vercel serverless and Bun | No TCP connection errors |

---

## 3. Scope

### In Scope

**Rate Limiting**:
- Upstash Redis client setup (`Redis.fromEnv()` — HTTP-based)
- Three rate limiter tiers with `@upstash/ratelimit`:
  - `general`: 100 requests / 60s sliding window
  - `ai`: 10 requests / 60s sliding window
  - `auth`: 5 requests / 60s sliding window
- Hono middleware factory: `rateLimit(type)` returns middleware
- Rate limit headers on every response
- 429 JSON response with `RATE_LIMITED` error code
- Route-level application:
  - `/api/auth/*` → `auth` tier
  - `/trpc/ai.*` → `ai` tier
  - `/trpc/*` → `general` tier
- Identifier strategy: authenticated userId, fallback to `x-forwarded-for`, fallback to `"anonymous"`

**Caching**:
- Generic cache interface using Upstash Redis:
  - `cache.get<T>(key)` → `T | null`
  - `cache.set<T>(key, value, ttlSeconds)` → void
  - `cache.del(key)` → void
  - `cache.getOrGenerate<T>(key, generator, ttlSeconds)` → T
- Cache key patterns and TTL strategy (documented)
- AI response caching by prompt hash

### Out of Scope

- CDN caching / edge caching (Vercel handles this for static assets)
- Client-side caching (React Query handles this via tRPC)
- Cache warming / preloading strategies (per-project)
- Redis pub/sub or streams (real-time is deferred)
- Custom rate limit plans per user tier (per-project business logic)

### Assumptions

- Upstash Redis is provisioned (free tier or via Vercel marketplace)
- `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set in `.env.local`
- PRD-005 Hono app is in place and accepts middleware

---

## 4. System Context

```
apps/api/src/index.ts      (PRD-005) ← Hono app
       ↓ middleware chain
apps/api/src/middleware/rateLimit.ts   ← This PRD
apps/api/src/lib/cache.ts             ← This PRD
       ↓
  ├── /api/auth/*    → auth tier (5/min)
  ├── /trpc/ai.*     → ai tier (10/min)
  └── /trpc/*        → general tier (100/min)

  Cache used by:
  ├── PRD-009 (AI): cache AI responses by prompt hash
  └── Any router: cache expensive queries
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-005 (API Server) | Hono app to attach rate limiting middleware |
| PRD-007 (Error Handling) | `RATE_LIMITED` error code and response format (soft dependency — works without it) |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| PRD-009 (AI Integration) | AI-specific rate limit tier; `cache.getOrGenerate()` for AI responses |
| Any tRPC router | `cache.get/set` for expensive queries |
| Auth routes | Rate limiting on login/signup to prevent brute force |

---

## 5. Technical Design

### 5.1 Data Model / Types

No database tables. Redis is the data store.

**Rate limit key patterns**:
```
rl:general:{userId|ip}   → sliding window counter
rl:ai:{userId|ip}        → sliding window counter
rl:auth:{ip}             → sliding window counter (always IP, not userId)
```

**Cache key patterns**:
```
ai:{sha256(prompt+model)}   → cached AI response (1 hour TTL)
user:{userId}               → cached user profile (5 min TTL)
public:{endpoint}           → cached public data (10 min TTL)
flags:{key}                 → cached feature flags (30 sec TTL)
```

### 5.2 Architecture Decisions

**Decision**: Upstash Redis over self-hosted Redis or Vercel KV
**Context**: Need a cache/rate-limit store that works in serverless without persistent connections.
**Options Considered**: Upstash Redis, self-hosted Redis, Vercel KV, in-memory cache
**Rationale**: Upstash is HTTP-based (REST API, not TCP), designed for serverless. No connection management. Auto-provisions from Vercel marketplace. Vercel KV is Upstash under the hood but with vendor lock-in. Self-hosted Redis requires persistent connections that don't work in serverless.
**Tradeoffs**: ~1-3ms latency per Redis call (HTTP overhead). Acceptable for rate limiting and caching. Not suitable for sub-millisecond real-time use cases.

**Decision**: Sliding window over fixed window or token bucket
**Context**: Need a rate limiting algorithm that's fair and doesn't create burst problems at window boundaries.
**Options Considered**: Fixed window, sliding window, token bucket, leaky bucket
**Rationale**: Sliding window prevents the "double burst" problem where a user sends max requests at the end of one window and the start of the next. Upstash `@upstash/ratelimit` has built-in sliding window support.
**Tradeoffs**: Slightly more complex than fixed window. Uses 2 Redis keys per limiter per identifier (current and previous window). Negligible overhead.

**Decision**: Three fixed tiers, not per-user configurable limits
**Context**: Need different rate limits for different endpoint categories.
**Options Considered**: (1) Single global limit, (2) Three tiers (general/ai/auth), (3) Per-user/per-plan limits
**Rationale**: Three tiers cover the boilerplate use cases. AI endpoints are expensive (10/min). Auth endpoints are security-sensitive (5/min). Everything else is general (100/min). Per-user limits are business logic that belongs in per-project configuration.
**Tradeoffs**: No ability to give premium users higher limits without customization. That's explicitly per-project scope.

### 5.3 API Contracts / Interfaces

**Rate Limit Middleware**:
```typescript
// apps/api/src/middleware/rateLimit.ts
export function rateLimit(type: "general" | "ai" | "auth"): MiddlewareHandler;

// Usage in Hono app:
app.use("/api/auth/*", rateLimit("auth"));
app.use("/trpc/ai.*", rateLimit("ai"));
app.use("/trpc/*", rateLimit("general"));
```

**Response headers** (always present):
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1707321600
```

**429 Response**:
```json
{
  "code": "RATE_LIMITED",
  "message": "Too many requests"
}
```

**Cache Interface**:
```typescript
// apps/api/src/lib/cache.ts
export const cache = {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttlSeconds: number): Promise<void>;
  del(key: string): Promise<void>;
  getOrGenerate<T>(key: string, generator: () => Promise<T>, ttlSeconds: number): Promise<T>;
};
```

### 5.4 File Structure

```
apps/api/src/
├── middleware/
│   └── rateLimit.ts        # Upstash rate limiter Hono middleware factory
├── lib/
│   └── cache.ts            # Generic cache interface with Upstash Redis
└── index.ts                # MODIFIED: wire rate limit middleware per route
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Install `@upstash/redis` and `@upstash/ratelimit` | 5m | PRD-005 | ✅ Yes | `bun add` |
| 2 | Implement `apps/api/src/middleware/rateLimit.ts` — three tiers + middleware factory | 30m | Task 1 | ✅ Yes | Well-specified in tech spec |
| 3 | Implement `apps/api/src/lib/cache.ts` — generic cache interface | 25m | Task 1 | ✅ Yes | Straightforward Redis wrapper |
| 4 | Wire rate limit middleware into Hono app routes | 15m | Task 2 | ✅ Yes | Three `app.use()` calls |
| 5 | Add `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` to env validation | 5m | Task 1 | ✅ Yes | Update Zod env schema |
| 6 | Write unit tests for rate limiter (mock Redis) | 25m | Task 2 | ✅ Yes | Test limit enforcement, header values |
| 7 | Write unit tests for cache interface (mock Redis) | 20m | Task 3 | ✅ Yes | Test get/set/del/getOrGenerate |
| 8 | Integration test: hit general limit → 429 | 15m | Task 4 | 🟡 Partial | Requires Upstash connection or mock |
| 9 | Document cache key patterns and TTL strategy | 10m | Task 3 | ✅ Yes | Table in README or code comments |

### Claude Code Task Annotations

**Task 2 (Rate Limit Middleware)**:
- **Context needed**: Upstash `@upstash/ratelimit` API. Hono `createMiddleware` pattern. Three tiers from spec (general: 100/60s, ai: 10/60s, auth: 5/60s). Identifier strategy (userId → x-forwarded-for → "anonymous").
- **Constraints**: Use `Ratelimit.slidingWindow()`. Set `analytics: true` and unique `prefix` per tier. Always set rate limit headers even on successful requests. Return 429 with JSON body on limit exceeded.
- **Done state**: All three tiers configured. Middleware factory returns Hono middleware. Rate limit headers present.
- **Verification command**: `cd apps/api && bun type-check`

**Task 3 (Cache Interface)**:
- **Context needed**: Upstash `@upstash/redis` API (`get`, `set` with `ex`, `del`). The `getOrGenerate` pattern from spec.
- **Constraints**: `getOrGenerate` must check cache first, call generator only on miss, set cache after generation. Generic types on all methods. Handle Redis errors gracefully (log and fall through to origin).
- **Done state**: All four methods work. Cache miss calls generator. Cache hit skips generator.
- **Verification command**: `cd apps/api && bun test`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | Rate limit tier config, cache get/set/del/getOrGenerate logic | Bun test (mocked Redis) | 12-15 |
| Integration | Rate limit enforcement against real Upstash | Bun test (requires env) | 3-5 |
| E2E | N/A | — | 0 |

### Key Test Scenarios

1. **Under limit**: Send 5 requests → all succeed, `X-RateLimit-Remaining` decreases
2. **At limit**: Send request 101 to general tier → 429 `RATE_LIMITED`
3. **AI tier**: Send request 11 to `/trpc/ai.*` → 429
4. **Auth tier**: Send login attempt 6 → 429
5. **Identifier fallback**: Request without userId or x-forwarded-for → uses "anonymous"
6. **Cache hit**: `set("key", value, 60)` → `get("key")` returns value
7. **Cache miss**: `get("nonexistent")` returns null
8. **Cache expiry**: Set with TTL 1s → wait 2s → get returns null
9. **getOrGenerate — miss**: Generator called, result cached
10. **getOrGenerate — hit**: Generator NOT called, cached value returned
11. **Redis failure**: Redis connection fails → rate limiter allows request through (fail open), cache returns null (fall through to origin)

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Rate limit check latency | < 5ms per request | Upstash regional deployment |
| Cache read latency | < 5ms for cached values | Benchmark |
| Fail-open behavior | If Redis is down, rate limiter ALLOWS requests through | Integration test with mock failure |
| No persistent connections | All Redis calls via HTTP REST API | Code review — no `ioredis` or `redis` TCP clients |

---

## 9. Rollout & Migration

1. Provision Upstash Redis (Vercel marketplace or console.upstash.com)
2. Set `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` in `.env.local`
3. Install packages: `bun add @upstash/redis @upstash/ratelimit --filter=@[project-name]/api`
4. Implement files
5. Verify: rapid-fire `curl` to `/trpc/projects.list` → see `X-RateLimit-Remaining` decrease → eventually 429
6. Commit

**Rollback plan**: Remove the three `app.use()` calls in `index.ts` to disable rate limiting. Cache is opt-in per route — no global impact.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should rate limiting be optional (env var toggle) for local dev? | Dev experience — hitting rate limits locally is annoying | DX | Open — consider `RATE_LIMIT_ENABLED=false` in dev |
| 2 | Should the auth tier use IP only, or also userId if available? | Affects whether authenticated brute-force is limited per-user | Security | Resolved — IP only for auth tier (brute force is pre-authentication) |
| 3 | Should cache errors be logged at warn or error level? | Affects log noise | Ops | Resolved — warn level. Cache failures are degraded but not broken. |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
