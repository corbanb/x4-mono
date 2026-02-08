# PRD-007: Error Handling & Logging

**PRD ID**: PRD-007
**Title**: Error Handling & Logging
**Author**: AI-Native TPM
**Status**: Draft
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-002 (Shared Types — error types), PRD-005 (API Server — Hono app + tRPC)
**Blocks**: PRD-009 (AI Integration — AI call logging), PRD-014 (CI/CD — observability)

---

## 1. Problem Statement

Without structured error handling, every tRPC router invents its own error patterns — some throw `TRPCError` with inconsistent codes, others let raw exceptions bubble up as 500s, and the client gets a mix of Zod validation errors, auth failures, and generic "something went wrong" messages with no consistent shape to parse. Debugging production issues becomes a guessing game because errors aren't logged with enough context to trace them back to specific requests.

The logging problem is equally painful. `console.log` in production means unstructured text that can't be searched, filtered, or aggregated. When an AI call takes 3 seconds and costs $0.02, you need to know — but without structured logging, that data is invisible. When a rate-limited user hits the API 100 times in a minute, you need to trace those requests to understand the pattern — but without request IDs, you can't correlate logs across middleware.

This PRD establishes two interlocking systems: (1) `AppError` — a single error class that maps cleanly to tRPC codes, HTTP status codes, and client-consumable JSON, with convenience constructors for common cases; and (2) Pino-based structured logging — JSON logs with request IDs, child loggers for specific concerns (AI, database, auth), and request-level middleware that captures method, path, status, duration, and user ID on every request.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| Consistent error shape | All API errors return `{ code, message, details?, requestId? }` | Zero unstructured error responses |
| Error mapping | Every `AppError` code maps to correct tRPC code | Mapping table is complete and tested |
| Convenience constructors | `Errors.notFound("Project")` produces correct AppError | All common error cases have constructors |
| Global error handler | Uncaught exceptions return 500 with requestId (not stack traces) | No raw stack traces in production responses |
| Zod error surfacing | Invalid tRPC input returns flattened Zod errors | Client can display per-field validation errors |
| Structured logs | All logs are JSON with timestamp, level, message | `pino-pretty` in dev, raw JSON in prod |
| Request tracing | Every request has a unique `requestId` in logs and error responses | requestId appears in both log output and HTTP response |
| Request logging | Every request logs: method, path, status, duration, userId | Middleware captures all fields |
| Child loggers | `aiLogger`, `dbLogger`, `authLogger` available for domain-specific logging | Logs include `module` field |
| Client error boundary | React ErrorBoundary catches rendering errors | Fallback UI renders on error |

---

## 3. Scope

### In Scope

**Error Handling**:
- `apps/api/src/lib/errors.ts` — `AppError` class with:
  - Constructor: `code: ErrorCode`, `message: string`, `details?: Record<string, unknown>`
  - `.toTRPCError()` method mapping to tRPC error codes
  - Static `Errors` convenience object: `notFound()`, `unauthorized()`, `forbidden()`, `validation()`, `rateLimited()`
- `apps/api/src/index.ts` — Hono `app.onError()` global handler
  - Catches `AppError` → structured JSON with correct HTTP status
  - Catches unexpected errors → 500 with requestId, no stack trace in response
- `apps/api/src/trpc.ts` — tRPC error formatter update
  - Surfaces `AppError` details in error shape
  - Flattens Zod validation errors for client consumption
- `apps/web/src/lib/error-boundary.tsx` — React ErrorBoundary component pattern

**Logging**:
- `apps/api/src/lib/logger.ts` — Pino setup
  - JSON output in production, `pino-pretty` in development
  - Child loggers: `aiLogger`, `dbLogger`, `authLogger`
- `apps/api/src/middleware/logger.ts` — Hono request logging middleware
  - Generates `requestId` per request (stored in Hono context)
  - Logs: requestId, method, path, status, duration (ms), userId
  - Log level by status: 5xx → error, 4xx → warn, 2xx/3xx → info

### Out of Scope

- Log aggregation service setup (Axiom, Betterstack, Sentry — per-project operational concern)
- Sentry error reporting integration (per-project)
- Client-side error logging/reporting (per-project)
- Performance monitoring / APM (per-project)
- Alert rules and dashboards (per-project)

### Assumptions

- PRD-002 error types (`ErrorCodes`, `ErrorCode`, `APIErrorResponse`) exist
- PRD-005 Hono app and tRPC setup are in place
- Pino and pino-pretty are available as dependencies
- Bun handles Pino's worker thread transport (with `bun-plugin-pino` or `external` in bundler config)

---

## 4. System Context

```
packages/shared/types/errors.ts   (PRD-002) ← ErrorCodes, ErrorCode type
       ↓
apps/api/src/lib/errors.ts         ← This PRD (AppError class)
apps/api/src/lib/logger.ts         ← This PRD (Pino setup)
apps/api/src/middleware/logger.ts   ← This PRD (request logging)
       ↓
  ├── apps/api/src/index.ts    (Hono onError handler)
  ├── apps/api/src/trpc.ts     (tRPC error formatter)
  ├── apps/api/src/routers/*   (throw AppError in procedures)
  └── PRD-009                  (aiLogger for AI call tracking)
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-002 (Shared Types) | `ErrorCodes`, `ErrorCode`, `APIErrorResponse` types |
| PRD-005 (API Server) | Hono app to attach `onError` handler and middleware; tRPC to update error formatter |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| All tRPC routers | `throw Errors.notFound("Project")` instead of raw `TRPCError` |
| PRD-009 (AI Integration) | `aiLogger.info({ model, tokens, cost })` for AI call tracking |
| PRD-014 (CI/CD) | Log format determines what's queryable in log aggregation |
| PRD-010 (Web App) | `ErrorBoundary` component pattern for React error handling |

---

## 5. Technical Design

### 5.1 Data Model / Types

Uses types from PRD-002:
```typescript
// Already defined in packages/shared/types/errors.ts
export const ErrorCodes = { ... } as const;
export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
export type APIErrorResponse = { code: ErrorCode; message: string; details?; requestId? };
```

### 5.2 Architecture Decisions

**Decision**: Single `AppError` class vs. error subclasses per type
**Context**: Need a structured error that maps to tRPC codes and HTTP statuses.
**Options Considered**: (1) Single `AppError` with `code` field, (2) Subclass per error type (`NotFoundError`, `UnauthorizedError`), (3) Plain objects
**Rationale**: Single class with code field is simpler — one `catch`, one mapping table, one serialization path. Subclasses add indirection without adding capability for our use case.
**Tradeoffs**: Can't use `instanceof NotFoundError` — must check `err.code === "NOT_FOUND"`. Acceptable since error handling is centralized in middleware, not scattered across catch blocks.

**Decision**: Pino over Winston, Bunyan, or console
**Context**: Need structured JSON logging that works with Bun and is fast enough for hot paths.
**Options Considered**: Pino, Winston, Bunyan, built-in console
**Rationale**: Pino is the fastest Node.js/Bun logger. Structured JSON output by default. `pino-pretty` for dev readability. Child logger pattern keeps domain concerns separated. Wide ecosystem of transports for production log aggregation.
**Tradeoffs**: Pino uses worker threads for transport, which has Bun bundling quirks (mark as external or use `bun-plugin-pino`). Slightly more setup than `console.log`.

**Decision**: RequestId generated in middleware, not at framework level
**Context**: Need unique identifier to correlate all logs and error responses for a single request.
**Options Considered**: (1) Hono middleware generates UUID, (2) Use `x-request-id` header from load balancer, (3) Both (prefer header, fallback to generated)
**Rationale**: Generate in middleware with `crypto.randomUUID()`. Store in Hono context (`c.set("requestId", id)`). Include in all log entries and error responses. If a load balancer provides `x-request-id`, prefer that.
**Tradeoffs**: Slight overhead per request (UUID generation is ~1μs). Worth it for debuggability.

### 5.3 API Contracts / Interfaces

**AppError class**:
```typescript
// apps/api/src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    message: string,
    public details?: Record<string, unknown>
  ) { ... }

  toTRPCError(): TRPCError { ... }
}

export const Errors = {
  notFound: (resource: string) => new AppError("NOT_FOUND", `${resource} not found`),
  unauthorized: (message?: string) => new AppError("UNAUTHORIZED", message || "Authentication required"),
  forbidden: (message?: string) => new AppError("FORBIDDEN", message || "Insufficient permissions"),
  validation: (details: Record<string, unknown>) => new AppError("VALIDATION_ERROR", "Validation failed", details),
  rateLimited: () => new AppError("RATE_LIMITED", "Too many requests, please try again later"),
  conflict: (resource: string) => new AppError("CONFLICT", `${resource} already exists`),
  badRequest: (message: string) => new AppError("BAD_REQUEST", message),
  internal: (message?: string) => new AppError("INTERNAL_ERROR", message || "An unexpected error occurred"),
};
```

**Error code to tRPC code mapping**:
```typescript
const trpcCodeMap: Record<ErrorCode, TRPCError["code"]> = {
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  VALIDATION_ERROR: "BAD_REQUEST",
  BAD_REQUEST: "BAD_REQUEST",
  INTERNAL_ERROR: "INTERNAL_SERVER_ERROR",
  SERVICE_UNAVAILABLE: "INTERNAL_SERVER_ERROR",
  RATE_LIMITED: "TOO_MANY_REQUESTS",
};
```

**Hono global error handler**:
```typescript
app.onError((err, c) => {
  const requestId = c.get("requestId") || crypto.randomUUID();
  if (err instanceof AppError) {
    logger.warn({ err, requestId }, `AppError: ${err.code}`);
    return c.json({ code: err.code, message: err.message, details: err.details, requestId }, httpStatus);
  }
  logger.error({ err, requestId }, "Unhandled error");
  return c.json({ code: "INTERNAL_ERROR", message: "An unexpected error occurred", requestId }, 500);
});
```

**Logger exports**:
```typescript
// apps/api/src/lib/logger.ts
export const logger: pino.Logger;      // Root logger
export const aiLogger: pino.Logger;    // logger.child({ module: "ai" })
export const dbLogger: pino.Logger;    // logger.child({ module: "database" })
export const authLogger: pino.Logger;  // logger.child({ module: "auth" })
```

**Request log shape** (JSON in production):
```json
{
  "level": "info",
  "time": "2026-02-07T15:30:00.000Z",
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "method": "POST",
  "path": "/trpc/projects.create",
  "status": 200,
  "duration": "45ms",
  "userId": "user-123",
  "msg": "Request completed"
}
```

### 5.4 File Structure

```
apps/api/src/
├── lib/
│   ├── errors.ts            # AppError class, Errors convenience object, tRPC code mapping
│   └── logger.ts            # Pino setup, child loggers
├── middleware/
│   └── logger.ts            # Hono request logging middleware (requestId, duration, etc.)
├── index.ts                 # MODIFIED: add app.onError(), requestLogger middleware
└── trpc.ts                  # MODIFIED: update errorFormatter for AppError + Zod

apps/web/src/lib/
└── error-boundary.tsx       # React ErrorBoundary component
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Implement `apps/api/src/lib/errors.ts` — AppError class + Errors constructors | 30m | PRD-002 (error types) | ✅ Yes | Well-specified, mechanical implementation |
| 2 | Implement tRPC code mapping table and `toTRPCError()` method | 15m | Task 1 | ✅ Yes | Mapping is fully specified |
| 3 | Implement `apps/api/src/lib/logger.ts` — Pino setup + child loggers | 20m | PRD-005 | ✅ Yes | Standard Pino config |
| 4 | Implement `apps/api/src/middleware/logger.ts` — request logging middleware | 30m | Task 3 | 🟡 Partial | AI generates, human reviews what gets logged and at what level |
| 5 | Add `app.onError()` to `apps/api/src/index.ts` | 15m | Tasks 1, 3 | ✅ Yes | Plug into existing Hono app |
| 6 | Update `apps/api/src/trpc.ts` error formatter | 15m | Task 1 | ✅ Yes | Add AppError + Zod flattening to existing formatter |
| 7 | Wire requestLogger middleware into Hono app | 10m | Task 4 | ✅ Yes | Add `app.use("*", requestLogger)` |
| 8 | Implement `apps/web/src/lib/error-boundary.tsx` | 15m | None | ✅ Yes | Standard React ErrorBoundary |
| 9 | Refactor existing routers to use `Errors.*` instead of raw `TRPCError` | 20m | Task 1 | ✅ Yes | Find-and-replace pattern |
| 10 | Write unit tests for AppError, error mapping, Errors constructors | 30m | Tasks 1-2 | ✅ Yes | Strong AI candidate — test every code mapping |
| 11 | Write integration test for global error handler | 20m | Tasks 5, 7 | ✅ Yes | Throw AppError in handler, verify JSON response |
| 12 | Verify Pino works with Bun bundler (external or bun-plugin-pino) | 15m | Task 3 | ❌ No | Manual — build and verify log output |

### Claude Code Task Annotations

**Task 1 (AppError)**:
- **Context needed**: `ErrorCode` type from PRD-002. tRPC error codes. The full Errors convenience object from the spec.
- **Constraints**: `AppError` must extend `Error`. `toTRPCError()` must be an instance method. `Errors` object must be a plain object with factory functions (not a class). Do NOT catch errors silently — always re-throw or log.
- **Done state**: `AppError` constructible with all error codes. `toTRPCError()` returns correct tRPC code for every mapping. All `Errors.*` constructors produce valid AppErrors.
- **Verification command**: `cd apps/api && bun test`

**Task 10 (Tests)**:
- **Context needed**: All error codes from PRD-002. The mapping table. Every `Errors.*` constructor.
- **Constraints**: Test EVERY entry in the tRPC code mapping table. Test that `Errors.notFound("Project")` produces `{ code: "NOT_FOUND", message: "Project not found" }`. Test that `toTRPCError()` maps correctly. Test that unknown error codes fall back to `INTERNAL_SERVER_ERROR`.
- **Done state**: 100% coverage of AppError class and Errors object.
- **Verification command**: `cd apps/api && bun test`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | AppError construction, code mapping, Errors constructors, Pino child loggers | Bun test | 20-25 |
| Integration | Global error handler response shape, request logging output | Bun test + Hono `app.request()` | 5-8 |
| E2E | N/A | — | 0 |

### Key Test Scenarios

1. **AppError construction**: `new AppError("NOT_FOUND", "Project not found")` has correct code, message, name
2. **tRPC mapping**: Every ErrorCode maps to the expected tRPC code (test all 9 mappings)
3. **Errors.notFound**: `Errors.notFound("Project")` → `{ code: "NOT_FOUND", message: "Project not found" }`
4. **Errors.validation**: `Errors.validation({ email: "invalid" })` → details included
5. **Global handler — AppError**: Throw AppError in route → response has `{ code, message, details, requestId }`
6. **Global handler — unexpected**: Throw generic Error → response has `{ code: "INTERNAL_ERROR", requestId }`, no stack trace
7. **Request logging**: Request to `/health` → log entry with method, path, status, duration, requestId
8. **Error boundary**: Component that throws → ErrorBoundary renders fallback UI

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Logging latency | Pino logging adds < 1ms per request | Benchmark with and without middleware |
| No stack traces in prod | 500 responses never include stack traces | Integration test checks response body |
| RequestId in all errors | Every error response includes `requestId` | Integration tests verify field exists |
| Log format | JSON in production, pretty-printed in development | Check `NODE_ENV` toggle |
| Pino bundle compat | Pino works in Bun production build | Manual build verification |

---

## 9. Rollout & Migration

1. Install Pino and pino-pretty: `bun add pino pino-pretty --filter=@[project-name]/api`
2. Implement all error and logging files
3. Wire middleware into Hono app
4. Update existing routers to use `Errors.*` constructors
5. Verify: throw an AppError in a router, check the response shape
6. Verify: check log output in dev (pretty) and with `NODE_ENV=production` (JSON)
7. Commit

**Rollback plan**: If Pino has bundling issues with Bun, fall back to structured `console.log` with JSON.stringify. The AppError system is independent of the logger.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should we use `x-request-id` from load balancer or always generate our own? | Affects request tracing in distributed systems | Infra | Resolved — generate our own, prefer header if present |
| 2 | Should error `details` be stripped in production for security? | Some details might expose internal state | Security | Open — default to including details, strip sensitive fields in onError handler |
| 3 | Do we need log sampling for high-traffic endpoints? | Cost of log aggregation at scale | Infra | Open — defer to per-project. Pino supports sampling via custom levels. |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
