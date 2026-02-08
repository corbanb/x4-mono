# PRD-006: Authentication & Authorization — Better Auth

**PRD ID**: PRD-006
**Title**: Authentication & Authorization — Better Auth
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-003 (Database & ORM), PRD-005 (API Server)
**Blocks**: PRD-010 (Web App), PRD-011 (Mobile App), PRD-012 (Desktop App)

---

## 1. Problem Statement

Authentication in a multi-platform monorepo is a solved problem — until you try to make it work identically across web, mobile, and desktop. NextAuth is tightly coupled to Next.js and its cookie-based session model. Mobile apps can't use httpOnly cookies the same way. Desktop apps need secure token storage via OS-level APIs. Most auth libraries force you into platform-specific patterns, which means maintaining three auth implementations that drift apart over time.

Better Auth solves this by being framework-agnostic. Through its bearer plugin, every client — web, mobile, desktop — authenticates the same way: sign in → receive bearer token → attach `Authorization: Bearer <token>` to every request → API validates token via session lookup. The auth server runs as part of the Hono API (PRD-005), and clients use platform-appropriate secure storage for the token (httpOnly cookies on web, SecureStore on mobile, safeStorage on Electron).

This PRD sets up the complete auth flow: server configuration, Hono route mounting, tRPC context integration, and typed clients for all three platforms. After this PRD, any tRPC procedure can distinguish between anonymous, authenticated, and admin users — and every platform gets that same distinction through the same mechanism.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| Email/password signup | POST to `/api/auth/sign-up/email` creates user + session | 200 response with session token |
| Email/password login | POST to `/api/auth/sign-in/email` returns bearer token | Token in response headers |
| Bearer auth | `Authorization: Bearer <token>` validates in tRPC context | `ctx.session.user` populated on valid token |
| Social auth | GitHub and Google OAuth flows work | Redirect → callback → session created |
| Protected routes | `protectedProcedure` rejects missing/invalid tokens | 401 UNAUTHORIZED |
| Admin routes | `adminProcedure` rejects non-admin users | 403 FORBIDDEN |
| Web client | `useSession()` returns typed session in React | Session hook works in Next.js |
| Mobile client | Token stored in SecureStore, attached to requests | Auth persists across app restarts |
| Desktop client | Token encrypted via safeStorage | Auth persists across app launches |
| Session expiry | Sessions expire after 7 days | Expired token returns 401 |
| Auth tables | Better Auth tables created in Neon | `user`, `session`, `account`, `verification` tables exist |

---

## 3. Scope

### In Scope

- `packages/auth/` package:
  - `server.ts` — Better Auth server instance with Drizzle adapter, bearer plugin, JWT plugin, social providers, session config
  - `client.ts` — Better Auth React client (`createAuthClient`) for web
  - `client.native.ts` — Better Auth React Native client with SecureStore token storage
  - `package.json` — better-auth dependency, workspace config
- Hono integration in `apps/api/src/index.ts`:
  - Mount Better Auth handler on `/api/auth/**`
- tRPC context update in `apps/api/src/trpc.ts`:
  - Replace placeholder auth with `auth.api.getSession()` from Better Auth
  - `protectedProcedure` uses real session validation
  - `adminProcedure` checks `user.role`
- Desktop auth pattern:
  - `apps/desktop/src/main/auth.ts` — Electron `safeStorage` for token encryption
  - IPC pattern for renderer to request token from main process
- Authorization pattern:
  - Resource ownership check example in projects router
- Better Auth CLI:
  - `npx @better-auth/cli migrate` to generate auth tables
  - OR `npx @better-auth/cli generate` to create Drizzle schema for auth tables

### Out of Scope

- RBAC beyond user/admin (per-project when needed)
- OAuth provider setup instructions (operational — just needs client ID/secret)
- Email verification flow UI (Better Auth handles the backend, UI is per-project)
- Password reset flow UI (same — backend handled, UI is per-project)
- Multi-factor authentication (add per-project via Better Auth plugin)
- Rate limiting on auth endpoints (PRD-008)

### Assumptions

- PRD-003 database is set up and `db` instance is available
- PRD-005 Hono app is running and accepts middleware
- `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` are set in `.env.local`
- `BETTER_AUTH_SECRET` (min 32 chars) is set in `.env.local`

---

## 4. System Context

```
packages/database    (PRD-003) ← Drizzle adapter reads/writes auth tables
       ↓
packages/auth        ← This PRD (server.ts, client.ts, client.native.ts)
       ↓
  ├── apps/api       (PRD-005: mounts auth routes, session in tRPC context)
  ├── apps/web       (PRD-010: useSession, signIn, signOut hooks)
  ├── apps/mobile    (PRD-011: SecureStore token, auth hooks)
  └── apps/desktop   (PRD-012: safeStorage token, IPC auth)
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-003 (Database) | `db` instance for Drizzle adapter, auth tables stored in Neon |
| PRD-005 (API Server) | Hono app to mount auth routes, tRPC context to inject session |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| apps/api (PRD-005) | `auth.handler()` on `/api/auth/**`, `auth.api.getSession()` in tRPC context |
| apps/web (PRD-010) | `useSession()`, `signIn`, `signUp`, `signOut` React hooks |
| apps/mobile (PRD-011) | `signInAndStore()`, `signOutAndClear()` with SecureStore |
| apps/desktop (PRD-012) | `safeStorage` encryption + IPC token retrieval |

---

## 5. Technical Design

### 5.1 Data Model / Types

Better Auth manages its own tables. Running `npx @better-auth/cli migrate` creates:

- `user` — id, name, email, emailVerified, image, createdAt, updatedAt
- `session` — id, expiresAt, token, ipAddress, userAgent, userId
- `account` — id, accountId, providerId, userId, accessToken, refreshToken, etc.
- `verification` — id, identifier, value, expiresAt, createdAt, updatedAt

**Note**: Better Auth's `user` table is separate from our `users` table in the Drizzle schema. Better Auth manages its own user records. We can extend the Better Auth user with additional fields or maintain a separate profile table linked by user ID.

**Session type** exposed to tRPC context:
```typescript
type Session = {
  user: {
    id: string;
    name: string;
    email: string;
    role: string; // custom field
    image?: string;
    emailVerified: boolean;
  };
  session: {
    id: string;
    token: string;
    expiresAt: Date;
  };
};
```

### 5.2 Architecture Decisions

**Decision**: Better Auth over NextAuth/Auth.js
**Context**: Need auth that works identically across web, mobile, and desktop.
**Options Considered**: NextAuth/Auth.js, Better Auth, Lucia, Clerk, Supabase Auth
**Rationale**: Better Auth is framework-agnostic with a bearer plugin that unifies the flow across all platforms. NextAuth is coupled to Next.js cookies. Lucia is lower-level (more work). Clerk/Supabase are managed services (vendor lock-in, cost at scale).
**Tradeoffs**: Better Auth is newer with a smaller community. Documentation is improving but less comprehensive than NextAuth. The bearer plugin API may evolve.

**Decision**: Bearer tokens as the universal auth mechanism
**Context**: Need one auth flow that works for web (can use cookies), mobile (can't use httpOnly cookies), and desktop (can't use cookies).
**Options Considered**: (1) Cookies for web, tokens for mobile/desktop, (2) Bearer tokens everywhere, (3) JWT-only (stateless)
**Rationale**: Bearer tokens are universal. Web stores the token in an httpOnly cookie (set by Better Auth automatically on web clients), mobile uses SecureStore, desktop uses safeStorage. The API always validates via `Authorization: Bearer <token>` → session lookup.
**Tradeoffs**: Bearer tokens require secure storage on each platform. Session lookup on every request adds ~5ms latency (acceptable for our scale).

**Decision**: Separate `users` schema table from Better Auth's `user` table
**Context**: Better Auth manages its own user table. Our Drizzle schema in PRD-003 also defines a `users` table.
**Options Considered**: (1) Use only Better Auth's user table, (2) Keep both and sync, (3) Extend Better Auth's schema
**Rationale**: Better Auth's Drizzle adapter can be configured to use our existing `users` table if the column names match, or we let Better Auth manage its own and link via user ID. For the boilerplate, we use Better Auth's tables directly and extend the user schema through Better Auth's configuration.
**Tradeoffs**: May need to reconcile two user representations in some projects. For the boilerplate, Better Auth is the source of truth for user identity.

### 5.3 API Contracts / Interfaces

**Auth Routes** (handled by Better Auth, not tRPC):
```
POST /api/auth/sign-up/email     → Create account with email/password
POST /api/auth/sign-in/email     → Login with email/password
POST /api/auth/sign-out          → Destroy session
GET  /api/auth/session           → Get current session
GET  /api/auth/sign-in/social    → Initiate OAuth flow
GET  /api/auth/callback/:provider → OAuth callback
```

**tRPC Procedures** (updated from PRD-005):
```typescript
// Updated context type
type Context = {
  db: typeof db;
  session: Session | null;
  userId: string | null;
};

// protectedProcedure adds:
// ctx.userId: string (guaranteed non-null)
// ctx.user: Session["user"] (guaranteed non-null)

// adminProcedure adds:
// Same as protected, but verified ctx.user.role === "admin"
```

**Client Exports**:
```typescript
// packages/auth/client.ts
export const { signIn, signUp, signOut, useSession } = authClient;

// packages/auth/client.native.ts
export { authClient, signInAndStore, signOutAndClear };
```

### 5.4 File Structure

```
packages/auth/
├── server.ts              # Better Auth server config (Drizzle adapter, plugins, providers)
├── client.ts              # React web client (createAuthClient)
├── client.native.ts       # React Native client (SecureStore token management)
├── package.json           # deps: better-auth, @packages/database
└── tsconfig.json

apps/api/src/
├── index.ts               # MODIFIED: mount Better Auth handler on /api/auth/**
└── trpc.ts                # MODIFIED: replace placeholder with auth.api.getSession()

apps/desktop/src/main/
└── auth.ts                # Electron safeStorage token encryption + IPC
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Create `packages/auth/package.json` and `tsconfig.json` | 10m | PRD-001 | ✅ Yes | Config files |
| 2 | Implement `packages/auth/server.ts` — Better Auth server config | 45m | PRD-003 (db) | 🟡 Partial | AI generates from spec, human reviews plugin config and session settings |
| 3 | Run `npx @better-auth/cli migrate` to create auth tables | 10m | Task 2 | ❌ No | Requires live DB connection |
| 4 | Mount Better Auth handler in `apps/api/src/index.ts` | 15m | Task 2, PRD-005 | ✅ Yes | Add route handler |
| 5 | Update `apps/api/src/trpc.ts` — replace placeholder auth with Better Auth session | 30m | Tasks 2, 4 | 🟡 Partial | Core auth flow — human reviews |
| 6 | Implement `packages/auth/client.ts` — React web client | 20m | Task 2 | ✅ Yes | Straightforward client setup |
| 7 | Implement `packages/auth/client.native.ts` — React Native client with SecureStore | 30m | Task 2 | 🟡 Partial | SecureStore token flow needs care |
| 8 | Implement `apps/desktop/src/main/auth.ts` — Electron safeStorage pattern | 20m | Task 2 | 🟡 Partial | Electron IPC pattern |
| 9 | Test auth flow: signup → login → protected tRPC call | 30m | Tasks 3-5 | ❌ No | Manual end-to-end verification |
| 10 | Write integration tests for auth middleware | 30m | Task 5 | ✅ Yes | Test authenticated/unauthenticated/admin tRPC calls |
| 11 | Update projects router auth checks to use real session | 15m | Task 5 | ✅ Yes | Swap ctx.user references |

### Claude Code Task Annotations

**Task 2 (Server Config)**:
- **Context needed**: Better Auth docs for Drizzle adapter, bearer plugin, JWT plugin. Social provider config pattern. Session expiry settings from spec (7 days, 1 day refresh).
- **Constraints**: Do NOT hard-code client IDs/secrets — read from `process.env`. Include both `bearer()` and `jwt()` plugins. Configure GitHub and Google social providers.
- **Done state**: `server.ts` exports `auth` instance. Type-checks clean.
- **Verification command**: `cd packages/auth && bun type-check`

**Task 5 (tRPC Context Update)**:
- **Context needed**: Current `trpc.ts` from PRD-005. Better Auth's `auth.api.getSession()` API. How to extract session from request headers.
- **Constraints**: `protectedProcedure` MUST throw `TRPCError({ code: "UNAUTHORIZED" })` if no session. `adminProcedure` MUST check `user.role === "admin"`. Context must expose both `session` and convenience `userId`.
- **Done state**: `protectedProcedure` rejects unauthenticated requests. `adminProcedure` rejects non-admins. Authenticated requests get full session in context.
- **Verification command**: `cd apps/api && bun test`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | Auth middleware logic, token extraction | Bun test | 8-10 |
| Integration | Full auth flow (signup → login → session → protected call) | Bun test + Hono `app.request()` | 6-8 |
| E2E | Signup → login → dashboard (covered by PRD-010) | Playwright | 1 |

### Key Test Scenarios

1. **Signup**: POST to `/api/auth/sign-up/email` with valid email/password → 200, session created
2. **Login**: POST to `/api/auth/sign-in/email` → bearer token in response
3. **Session validation**: GET to `/api/auth/session` with valid bearer token → user data
4. **Protected procedure**: Call `protectedProcedure` with valid token → success. Without token → 401.
5. **Admin procedure**: Call `adminProcedure` with user role → 403. With admin role → success.
6. **Resource ownership**: User A can't update User B's project → 403 FORBIDDEN
7. **Session expiry**: Token older than 7 days → 401
8. **Invalid token**: Random string as bearer token → 401 (not 500)

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Session lookup latency | `auth.api.getSession()` < 10ms | Measured in integration tests |
| Token security | Tokens are cryptographically random, >= 32 bytes | Inspect token format |
| Password hashing | bcrypt or argon2 (Better Auth default) | Verify in Better Auth config |
| CORS on auth routes | Same origin restrictions as tRPC routes | Test preflight on `/api/auth/*` |
| Secure storage (mobile) | Token in Expo SecureStore (hardware-backed on iOS) | Code review |
| Secure storage (desktop) | Token encrypted via Electron safeStorage | Code review |

---

## 9. Rollout & Migration

1. Set environment variables: `BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET`
2. Run `npx @better-auth/cli migrate` to create auth tables in Neon
3. Restart API server
4. Test signup via curl: `curl -X POST http://localhost:3002/api/auth/sign-up/email -d '{"email":"test@example.com","password":"SecurePass123!","name":"Test"}'`
5. Test login and use returned token for protected tRPC calls

**Rollback plan**: Auth tables are separate from application tables. If Better Auth breaks, remove the auth handler from Hono and revert tRPC context to placeholder. No data migration needed.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should we use Better Auth's user table or map to our own `users` table? | Affects whether we have one or two user representations | Architect | Resolved — use Better Auth's tables. Extend via Better Auth config for custom fields. |
| 2 | Do we need email verification before allowing login? | Affects signup flow UX | Product | Open — defer to per-project. Better Auth supports it via plugin. |
| 3 | How do we handle the `role` field in Better Auth's user? | Better Auth doesn't have a built-in role field | Architect | Open — likely need to extend the user schema via Better Auth's `user.additionalFields` config |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
