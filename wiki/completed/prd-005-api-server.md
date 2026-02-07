# PRD-005: API Server — Hono + tRPC on Bun

**PRD ID**: PRD-005
**Title**: API Server — Hono + tRPC on Bun
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-001 (Monorepo Foundation), PRD-002 (Shared Types & Validators), PRD-003 (Database & ORM)
**Blocks**: PRD-006 (Auth), PRD-007 (Error Handling), PRD-008 (Rate Limiting), PRD-009 (AI Integration), PRD-010 (Web App), PRD-011 (Mobile), PRD-012 (Desktop)

---

## 1. Problem Statement

In a multi-platform product (web, mobile, desktop), embedding API logic inside Next.js API routes creates a painful coupling: mobile and desktop clients depend on the web app's deployment lifecycle, the API can't scale independently, and you end up with business logic scattered across serverless functions that are hard to test in isolation.

The alternative — a standalone API server — decouples the backend from any single frontend framework. Every client (web, mobile, desktop) consumes the same API through the same contract. The API deploys on its own schedule, scales independently, and can move between deployment targets (Vercel serverless, Cloudflare Workers, long-running Bun server) without touching client code.

This PRD builds that standalone API using Hono (lightweight, edge-compatible) and tRPC (end-to-end type safety). Hono handles HTTP concerns (CORS, middleware, routing) while tRPC handles the typed RPC layer. The combination gives us a 14kb framework that runs everywhere Bun and Node.js run, with compile-time type checking from frontend to database.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| Server starts | `bun dev` in apps/api starts Hono server | Running on port 3002 within 1s |
| Health check | `GET /health` returns JSON status | 200 with `{ status: "ok", timestamp, version }` |
| tRPC endpoint | `POST /trpc/*` handles tRPC requests | Correct routing to procedure handlers |
| Type export | `AppRouter` type is importable by client packages | `import type { AppRouter } from "@[project-name]/api"` compiles |
| CORS | Web and mobile origins are allowed | Preflight OPTIONS returns correct headers |
| Auth middleware | `protectedProcedure` rejects unauthenticated requests | 401 UNAUTHORIZED for missing/invalid tokens |
| Zod validation | Invalid tRPC inputs return structured Zod errors | Flattened Zod error in response body |
| Environment validation | Missing required env vars fail at startup | Zod parse throws before server starts |
| CRUD operations | Projects router: list, get, create, update, delete | All 5 operations work with correct auth checks |
| Hot reload | File changes restart server automatically | `bun --watch` detects changes |

---

## 3. Scope

### In Scope

- `apps/api/` workspace structure and `package.json`
- Hono app setup (`src/index.ts`) with:
  - Global CORS middleware (configurable origins)
  - Health check endpoint (`/health`)
  - tRPC adapter (`@hono/trpc-server`)
  - Server entry with Bun's `export default { port, fetch }`
- tRPC v11 initialization (`src/trpc.ts`):
  - Context creation (db client, user from auth header)
  - `publicProcedure`, `protectedProcedure`, `adminProcedure`
  - Error formatter (Zod error flattening)
  - Auth middleware (`isAuthed`, `isAdmin`)
- Router structure (`src/routers/`):
  - Root `appRouter` with namespace pattern
  - `projects` router — full CRUD with authorization
  - `users` router — placeholder/stub
  - `AppRouter` type export
- Environment validation (`src/lib/env.ts`) with Zod
- Dev script: `bun --watch src/index.ts`
- Build script: `bun build src/index.ts --outdir dist --target bun`

### Out of Scope

- Better Auth integration details (PRD-006 — this PRD uses a placeholder token verifier)
- `AppError` class and structured error handling (PRD-007 — this PRD uses basic `TRPCError`)
- Rate limiting middleware (PRD-008)
- AI router (PRD-009)
- Pino logging middleware (PRD-007)
- Deployment configuration — Vercel adapter, CF Workers adapter (PRD-014)
- Service layer abstraction (`services/` directory is scaffolded but logic stays in routers for now)

### Assumptions

- PRD-001 workspace structure exists
- PRD-002 Zod schemas (`CreateProjectSchema`, etc.) are available
- PRD-003 database client (`db`) and schema exports are available
- `DATABASE_URL` is configured in `.env.local`
- Bun >= 1.1 is installed

---

## 4. System Context

```
packages/shared/types    (PRD-002) ← error types, domain types
packages/shared/utils    (PRD-002) ← Zod schemas for input validation
packages/database        (PRD-003) ← db client, schema for queries
       ↓
  apps/api               ← This PRD
       ↓
  ├── packages/auth      (PRD-006: mounts auth routes on Hono)
  ├── apps/web           (PRD-010: consumes via tRPC client)
  ├── apps/mobile        (PRD-011: consumes via tRPC client)
  └── apps/desktop       (PRD-012: consumes via tRPC client)
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-001 (Monorepo Foundation) | Workspace structure, Turbo dev task, TypeScript config |
| PRD-002 (Shared Types) | Zod schemas for `.input()` validation, error types |
| PRD-003 (Database) | `db` instance, schema tables, Drizzle query builders |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| PRD-006 (Auth) | Mounts Better Auth handler on Hono app, provides session to tRPC context |
| PRD-007 (Error Handling) | Adds `AppError` handling + Pino logging to this server |
| PRD-008 (Rate Limiting) | Adds Upstash rate limiting middleware to this server |
| PRD-009 (AI Integration) | Adds `ai` router to the `appRouter` |
| PRD-010/011/012 (Apps) | Import `AppRouter` type for tRPC client |

---

## 5. Technical Design

### 5.1 Data Model / Types

No new types — this PRD consumes types from PRD-002 and PRD-003.

**Key type export**:
```typescript
// apps/api/src/routers/index.ts
export type AppRouter = typeof appRouter;
// This type is consumed by tRPC clients in web, mobile, desktop
```

**Context type**:
```typescript
// apps/api/src/trpc.ts
export type Context = {
  db: typeof db;
  user: { userId: string; role: string } | null;
  req: Request;
};
```

### 5.2 Architecture Decisions

**Decision**: Standalone API server, not embedded in Next.js API routes
**Context**: Need one API that serves web, mobile, and desktop without coupling to Next.js.
**Options Considered**: (1) Next.js API routes with tRPC, (2) Standalone Hono + tRPC, (3) Express + tRPC, (4) Fastify + tRPC
**Rationale**: Standalone server means the web app is a pure frontend. Mobile and desktop don't depend on Next.js. The API deploys and scales independently. Hono is 14kb, runs on every edge runtime, and has a first-class tRPC adapter.
**Tradeoffs**: Two deployments instead of one (web + API). Need CORS configuration. Slightly more complex local dev (two processes — solved by Turbo `persistent: true`).

**Decision**: Hono over Express/Fastify
**Context**: Need a minimal HTTP framework that works on Bun, Node.js, Cloudflare Workers, and Vercel Edge.
**Options Considered**: Hono, Express, Fastify, Elysia
**Rationale**: Hono is 14kb, has built-in CORS/logger/cookie middleware, native tRPC adapter, and runs on every target without adaptation layers. Express is legacy (callback-based). Fastify is heavier and Node-only. Elysia is Bun-only.
**Tradeoffs**: Smaller middleware ecosystem than Express. Less battle-tested at very high scale (though adequate for our use case).

**Decision**: Placeholder auth in tRPC context (replaced by PRD-006)
**Context**: This PRD needs `protectedProcedure` to work, but the full Better Auth integration is PRD-006's scope.
**Options Considered**: (1) Skip auth entirely, (2) Placeholder JWT verifier, (3) Build full auth
**Rationale**: Placeholder that reads `Authorization: Bearer <token>` and decodes it lets us build and test the full router pattern. PRD-006 swaps the placeholder for real Better Auth session validation.
**Tradeoffs**: Tests written against placeholder auth may need minor updates when PRD-006 lands.

### 5.3 API Contracts / Interfaces

**tRPC Router Contract**:

```typescript
// apps/api/src/routers/index.ts
export const appRouter = router({
  users: usersRouter,      // Stub: users.me query
  projects: projectsRouter, // Full CRUD: list, get, create, update, delete
  // ai: aiRouter,          // Added by PRD-009
});

export type AppRouter = typeof appRouter;
```

**Projects Router — full contract**:

```typescript
projects.list    // publicProcedure, input: { limit?, offset? }, returns: Project[]
projects.get     // protectedProcedure, input: { projectId: uuid }, returns: Project + owner
projects.create  // protectedProcedure, input: CreateProjectSchema, returns: Project
projects.update  // protectedProcedure, input: UpdateProjectSchema, returns: Project
projects.delete  // protectedProcedure, input: { id: uuid }, returns: { success: true }
```

**Health Check**:
```
GET /health → { status: "ok", timestamp: string, version: string }
```

**Environment Contract**:
```typescript
// apps/api/src/lib/env.ts
{
  PORT: number (default 3002),
  DATABASE_URL: string (required, URL format),
  JWT_SECRET: string (required, min 32 chars),
  ANTHROPIC_API_KEY: string (required, starts with "sk-"),
  WEB_URL: string (default "http://localhost:3000"),
  MARKETING_URL: string (default "http://localhost:3001"),
  APP_VERSION: string (optional),
  NODE_ENV: "development" | "production" | "test" (default "development"),
}
```

### 5.4 File Structure

```
apps/api/
├── src/
│   ├── index.ts              # Hono app, global middleware, tRPC adapter, server entry
│   ├── trpc.ts               # tRPC init, context, procedures (public, protected, admin)
│   ├── routers/
│   │   ├── index.ts          # Root appRouter + AppRouter type export
│   │   ├── users.ts          # Users router (stub)
│   │   └── projects.ts       # Projects router (full CRUD)
│   ├── middleware/            # Scaffolded — filled by PRD-007, PRD-008
│   │   └── .gitkeep
│   ├── services/             # Scaffolded — optional service layer
│   │   └── .gitkeep
│   └── lib/
│       ├── env.ts            # Zod environment validation
│       └── errors.ts         # Placeholder — replaced by PRD-007
├── .env.example
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Create `apps/api/package.json`, `tsconfig.json`, `.env.example` | 15m | PRD-001 | ✅ Yes | Config boilerplate |
| 2 | Implement `src/lib/env.ts` — Zod environment validation | 20m | Task 1 | ✅ Yes | Well-specified schema |
| 3 | Implement `src/trpc.ts` — tRPC init, context, procedures | 45m | Task 2 | 🟡 Partial | Core architecture — AI generates, human reviews middleware chain |
| 4 | Implement `src/routers/index.ts` — root appRouter | 10m | Task 3 | ✅ Yes | Simple composition |
| 5 | Implement `src/routers/projects.ts` — full CRUD | 60m | Tasks 3-4 | 🟡 Partial | AI generates from spec, human reviews auth checks and query patterns |
| 6 | Implement `src/routers/users.ts` — stub router | 10m | Task 3 | ✅ Yes | Minimal stub |
| 7 | Implement `src/index.ts` — Hono app, middleware, server entry | 30m | Tasks 3-6 | 🟡 Partial | AI generates, human reviews CORS config and middleware order |
| 8 | Verify server starts and health check works | 10m | Task 7 | ❌ No | Manual: `bun dev` → `curl localhost:3002/health` |
| 9 | Test tRPC endpoints with curl/Hoppscotch | 20m | Task 8 | ❌ No | Manual: POST to `/trpc/projects.list`, verify JSON response |
| 10 | Write integration tests (health check, auth rejection, CRUD) | 45m | Task 7 | ✅ Yes | Hono's `app.request()` test pattern |
| 11 | Verify `AppRouter` type exports correctly for client consumption | 10m | Task 4 | ❌ No | Manual: create test import in packages/shared/api-client |

### Claude Code Task Annotations

**Task 5 (Projects Router)**:
- **Context needed**: Full projects router code from tech spec. `CreateProjectSchema` and `UpdateProjectSchema` from PRD-002. Schema imports from PRD-003. tRPC procedure types from Task 3.
- **Constraints**: Every mutation must check resource ownership (ownerId === ctx.userId OR admin). Use `.returning()` on all inserts/updates. Use `TRPCError` for error responses. Keep business logic in the router for now (no service layer extraction yet).
- **Done state**: All 5 CRUD operations compile. Auth checks on get/update/delete.
- **Verification command**: `cd apps/api && bun type-check`

**Task 10 (Integration Tests)**:
- **Context needed**: Hono's `app.request()` testing pattern. tRPC's `createCaller` pattern. Test contexts with mock auth.
- **Constraints**: Use `bun:test`. Test: health check returns 200, unauthenticated tRPC call returns 401, authenticated project CRUD works end-to-end. Do NOT require a live database for unit-level tests (mock db for those).
- **Done state**: `bun test` passes in `apps/api/`.
- **Verification command**: `cd apps/api && bun test`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | Environment validation, auth middleware, procedure logic | Bun test | 15-20 |
| Integration | Health check, tRPC routing, CRUD against test DB | Bun test + Hono `app.request()` | 8-12 |
| E2E | N/A (covered by PRD-010 E2E) | — | 0 |

### Key Test Scenarios

1. **Health check**: `GET /health` → 200 with expected JSON shape
2. **Auth rejection**: Call `protectedProcedure` without token → 401 UNAUTHORIZED
3. **Admin rejection**: Call `adminProcedure` with user token → 403 FORBIDDEN
4. **Project CRUD**: Create → Read → Update → Delete cycle with valid auth
5. **Ownership check**: User A tries to update User B's project → 403 FORBIDDEN
6. **Zod validation**: Invalid input to `projects.create` → structured error with field paths
7. **CORS**: Preflight from allowed origin → correct headers. Preflight from disallowed origin → rejected.
8. **Environment validation**: Missing `DATABASE_URL` → Zod error at startup (not a runtime crash)

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Cold start | Server starts in < 500ms | `time bun src/index.ts` |
| Request latency | Simple query < 50ms (excluding DB) | Measured in tests |
| Bundle size | Production build < 1MB | `ls -la dist/index.js` |
| Type safety | Zero `any` in router code | `grep -r "any" src/routers/` returns 0 |
| Hot reload | File change detected in < 1s | Manual observation with `bun --watch` |

---

## 9. Rollout & Migration

1. Implement all files
2. Set environment variables in `apps/api/.env.local`
3. `bun dev` in `apps/api/` — server starts on port 3002
4. Test with `curl http://localhost:3002/health`
5. Test tRPC with `curl -X POST http://localhost:3002/trpc/projects.list`
6. Run `bun test`
7. Commit

**Integration with `bun turbo dev`**: After this PRD, running `bun turbo dev` from root starts both the API (port 3002) and any other workspace dev servers simultaneously.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should `projects.list` be `publicProcedure` or `protectedProcedure`? | Affects whether anonymous users can browse projects | Product | Resolved — public for list (matches spec), protected for everything else |
| 2 | Do we need request body size limits on tRPC? | Security concern for large payloads | Security | Open — Hono has a `bodyLimit()` middleware, consider adding |
| 3 | Should we add `onError` logging to tRPC adapter now or wait for PRD-007? | Affects initial observability | Architect | Resolved — add basic `console.error` now, PRD-007 replaces with Pino |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
