# PRD-004: Shared UI Components & Hooks

**PRD ID**: PRD-004
**Title**: Shared UI Components & Hooks
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-001 (Monorepo Foundation), PRD-002 (Shared Types & Validators)
**Blocks**: PRD-010 (Web App), PRD-011 (Mobile App), PRD-012 (Desktop App)

---

## 1. Problem Statement

When building across web, mobile, and desktop, teams inevitably duplicate three things: tRPC client setup, authentication hooks, and basic UI primitives. Each app workspace reinvents the same `createTRPCClient` call, writes its own `useAuth` wrapper, and builds its own Button component — all slightly different, all drifting apart over time.

The tRPC API client is the most critical piece. Without a shared client package, every app workspace needs to independently import the `AppRouter` type, configure `httpBatchLink`, handle auth headers, and set up React Query. That's not hard to do once, but when it's done three times with three slightly different patterns, you get inconsistent error handling, missed cache invalidations, and auth flows that work on web but break on mobile.

This PRD creates the shared layer between the API (PRD-005) and the app workspaces (PRDs 010-012): a typed tRPC client, shared React hooks, and a minimal set of cross-platform UI components. The goal isn't a comprehensive design system — it's providing the patterns and scaffolding so app workspaces start consistent and diverge only when they need to.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| tRPC client setup | `createTRPCClient(baseUrl)` works in web, mobile, and desktop | Single function, three platforms |
| Type safety | `trpc.projects.list.useQuery()` is fully typed from `AppRouter` | Zero `any` types in client hooks |
| Shared hooks | `useUser()`, `useCreateProject()` available in all React workspaces | Import from `@packages/shared/api-client` |
| Auth hooks | `useAuth` integrates with Better Auth client | Session state accessible via hook |
| UI scaffolding | Button, Input components demonstrate the sharing pattern | Components render in web and mobile |
| Native divergence | `.native.ts` pattern works for platform-specific code | Expo/RN resolves `.native.ts` files |

---

## 3. Scope

### In Scope

- `packages/shared/api-client/` — tRPC client for all platforms
  - `client.ts` — `createTRPCReact<AppRouter>`, `createTRPCClient(baseUrl)` factory
  - `hooks.ts` — typed convenience hooks: `useUser()`, `useCreateProject()`, etc.
  - `utils.ts` — client utilities (token getter, error extraction)
  - `index.ts` — re-exports
- `packages/shared/hooks/` — shared React hooks
  - `useAuth.ts` — wrapper around Better Auth's `useSession`, `signIn`, `signOut`
  - `useUser.ts` — current user data from session
  - `index.ts` — re-exports
- `packages/shared/ui/` — minimal cross-platform component scaffolding
  - `Button.tsx` — basic button with loading state
  - `Input.tsx` — basic text input with error display
  - `index.ts` — re-exports
- Pattern documentation for `.native.ts` file convention (React Native resolution)

### Out of Scope

- Comprehensive design system / component library (per-project)
- Tailwind CSS configuration (per-app, PRD-010 for web)
- App-level components (live in `apps/*/components/`)
- Native-only components (live in `apps/mobile/src/components/`)
- Form library integration (react-hook-form is app-level, PRD-010)
- tRPC subscription support (real-time is deferred, see spec Real-Time Strategy)

### Assumptions

- PRD-001 workspace structure exists with `packages/shared/` scaffold
- PRD-002 types and validators are available
- PRD-005 `AppRouter` type is exported from `apps/api`
- React 19 for web, React Native for mobile (Expo)
- `@tanstack/react-query` is the data fetching layer (tRPC wraps it)

---

## 4. System Context

```
apps/api/src/routers/index.ts   (PRD-005)
       ↓ exports AppRouter type
packages/shared/api-client       ← This PRD (tRPC client + hooks)
packages/shared/hooks            ← This PRD (auth hooks, user hooks)
packages/shared/ui               ← This PRD (Button, Input scaffolding)
       ↓ consumed by
  ├── apps/web       (PRD-010)
  ├── apps/mobile    (PRD-011)
  └── apps/desktop   (PRD-012)
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-001 (Monorepo Foundation) | Workspace structure, TypeScript config |
| PRD-002 (Shared Types) | Domain types used in hook return types |
| PRD-005 (API Server) | `AppRouter` type for tRPC client (type-only import) |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| apps/web (PRD-010) | `TRPCProvider`, `trpc.*.useQuery()`, `useAuth()`, UI components |
| apps/mobile (PRD-011) | Same tRPC hooks, `useAuth()`, UI components (or `.native.ts` variants) |
| apps/desktop (PRD-012) | Same tRPC hooks in Electron renderer |

---

## 5. Technical Design

### 5.1 Data Model / Types

No new domain types. This PRD creates **client infrastructure** that consumes types from PRD-002 and PRD-005.

Key type dependency:
```typescript
// This import is what makes end-to-end type safety work
import type { AppRouter } from "../../apps/api/src/routers";
```

### 5.2 Architecture Decisions

**Decision**: tRPC client as a shared package, not per-app
**Context**: Web, mobile, and desktop all consume the same API. The client setup is identical except for `baseUrl`.
**Options Considered**: (1) Duplicate tRPC setup in each app, (2) Shared package with factory function, (3) Generated client SDK
**Rationale**: Shared package with `createTRPCClient(baseUrl)` eliminates duplication. Each app calls the factory with its own URL. Hooks like `useUser()` wrap tRPC queries so apps don't repeat the same `trpc.users.get.useQuery()` boilerplate.
**Tradeoffs**: Cross-workspace type import from `apps/api` to `packages/shared` is slightly unusual (package depending on an app's type). Acceptable because it's a type-only import — no runtime dependency.

**Decision**: Minimal UI scaffolding, not a full component library
**Context**: Cross-platform UI components (web + React Native) are complex. Building a comprehensive shared library is a project in itself.
**Options Considered**: (1) Full shared component library, (2) No shared UI, (3) Minimal scaffolding with pattern examples
**Rationale**: Provide Button and Input as examples of the sharing pattern. Projects extend or replace them. The real value is the tRPC client and hooks, not the UI components.
**Tradeoffs**: Each project will build its own component library on top. That's intentional — UI is the most project-specific layer.

**Decision**: `.native.ts` convention for platform divergence
**Context**: Some hooks or components need different implementations for web vs. React Native (e.g., auth token storage, navigation).
**Options Considered**: (1) Platform check at runtime, (2) `.native.ts` file resolution, (3) Separate packages per platform
**Rationale**: `.native.ts` is the standard React Native convention. Expo/Metro resolves `useAuth.native.ts` for mobile and `useAuth.ts` for web automatically. No runtime checks needed.
**Tradeoffs**: Must remember to create both files when divergence is needed. Easy to forget the `.native.ts` variant.

### 5.3 API Contracts / Interfaces

**tRPC Client**:
```typescript
// packages/shared/api-client/client.ts
import { createTRPCReact } from "@trpc/react-query";
import { httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../../apps/api/src/routers";

export const trpc = createTRPCReact<AppRouter>();

export const createTRPCClient = (baseUrl: string, getToken?: () => Promise<string>) =>
  trpc.createClient({
    links: [
      httpBatchLink({
        url: `${baseUrl}/trpc`,
        async headers() {
          const token = getToken ? await getToken() : null;
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
```

**Convenience Hooks**:
```typescript
// packages/shared/api-client/hooks.ts
export function useUser(userId: string) {
  return trpc.users.get.useQuery({ userId });
}

export function useProjects(input?: { limit?: number; offset?: number }) {
  return trpc.projects.list.useQuery(input);
}

export function useCreateProject() {
  return trpc.projects.create.useMutation();
}

export function useUpdateProject() {
  return trpc.projects.update.useMutation();
}

export function useDeleteProject() {
  return trpc.projects.delete.useMutation();
}
```

**Auth Hooks**:
```typescript
// packages/shared/hooks/useAuth.ts
import { useSession, signIn, signOut } from "@packages/auth/client";

export function useAuth() {
  const session = useSession();
  return {
    user: session.data?.user ?? null,
    isAuthenticated: !!session.data?.user,
    isLoading: session.isPending,
    signIn,
    signOut,
  };
}
```

### 5.4 File Structure

```
packages/shared/
├── api-client/
│   ├── client.ts         # createTRPCReact, createTRPCClient factory
│   ├── hooks.ts          # useUser, useProjects, useCreateProject, etc.
│   ├── utils.ts          # Token getter helpers, error extraction
│   └── index.ts          # Re-exports
├── hooks/
│   ├── useAuth.ts        # Auth hook (web)
│   ├── useAuth.native.ts # Auth hook (React Native — SecureStore variant)
│   ├── useUser.ts        # Current user convenience hook
│   └── index.ts          # Re-exports
├── ui/
│   ├── Button.tsx        # Basic button with loading state
│   ├── Input.tsx         # Basic input with error message
│   └── index.ts          # Re-exports
└── package.json          # Updated: add @trpc/react-query, @trpc/client, @tanstack/react-query
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Update `packages/shared/package.json` with tRPC + React Query deps | 10m | PRD-001 | ✅ Yes | Add dependencies |
| 2 | Implement `api-client/client.ts` — tRPC React client + factory | 30m | Task 1, PRD-005 (AppRouter type) | 🟡 Partial | AI generates from spec, human reviews auth header pattern |
| 3 | Implement `api-client/hooks.ts` — convenience query/mutation hooks | 20m | Task 2 | ✅ Yes | Mechanical — wrap tRPC procedures in hooks |
| 4 | Implement `api-client/utils.ts` — token getter, error extraction | 15m | Task 2 | ✅ Yes | Utility functions |
| 5 | Implement `hooks/useAuth.ts` and `hooks/useAuth.native.ts` | 25m | PRD-006 (auth client) | 🟡 Partial | Human reviews platform divergence pattern |
| 6 | Implement `hooks/useUser.ts` | 10m | Task 5 | ✅ Yes | Simple wrapper |
| 7 | Implement `ui/Button.tsx` and `ui/Input.tsx` scaffolding | 20m | Task 1 | ✅ Yes | Minimal components |
| 8 | Create index files and re-exports | 10m | Tasks 2-7 | ✅ Yes | Re-exports |
| 9 | Write unit tests for hooks and utilities | 30m | Tasks 3-6 | ✅ Yes | Test hook return types, error extraction |
| 10 | Verify cross-workspace import in apps/web | 15m | Task 8 | ❌ No | Manual — import in web, type-check |

### Claude Code Task Annotations

**Task 2 (tRPC Client)**:
- **Context needed**: tRPC v11 React client API. `AppRouter` type location. `httpBatchLink` config. Auth header pattern from spec.
- **Constraints**: The `getToken` parameter must be optional (not all calls require auth). Do NOT hard-code the base URL — it's passed as a parameter. Export both `trpc` (for direct use) and `createTRPCClient` (factory).
- **Done state**: Type-checks clean. `trpc.projects.list.useQuery()` infers correct return type.
- **Verification command**: `cd packages/shared && bun type-check`

**Task 7 (UI Components)**:
- **Context needed**: These are scaffolding, not a design system. Keep minimal — demonstrate the pattern, not production styling.
- **Constraints**: Use plain React (no Tailwind, no styled-components). Components should accept standard HTML props via `ComponentPropsWithoutRef`. Include `isLoading` prop on Button. Include `error` prop on Input.
- **Done state**: Components render without errors. Type-checks clean.
- **Verification command**: `cd packages/shared && bun type-check`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | Hook return types, error extraction utils, component rendering | Bun test | 10-15 |
| Integration | tRPC client connects to running API | Manual | 1-2 |
| E2E | N/A (covered by PRD-010 E2E) | — | 0 |

### Key Test Scenarios

1. **tRPC client creation**: `createTRPCClient("http://localhost:3002")` returns valid client instance
2. **Auth header injection**: Client with `getToken` adds `Authorization` header; without `getToken` sends no auth header
3. **Hook types**: `useProjects()` return type matches `Project[]` (compile-time verification)
4. **Error extraction**: Utility correctly extracts tRPC error code and message from error response
5. **useAuth hook**: Returns `{ user, isAuthenticated, isLoading, signIn, signOut }` with correct types
6. **UI components**: Button renders with `isLoading` spinner. Input renders with `error` message.

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Bundle size | api-client package < 10KB (excluding React Query) | Build output size |
| Type inference speed | tRPC autocompletion in VS Code < 2s | Manual DX check |
| Tree-shaking | Unused hooks don't end up in app bundles | Build analysis |
| Platform compat | Hooks work in React 19 (web) and React Native (Expo) | Type-check in both contexts |

---

## 9. Rollout & Migration

1. Implement all files
2. `bun install` (adds @trpc/react-query, @trpc/client, @tanstack/react-query)
3. `bun turbo type-check` passes
4. Verify import in `apps/web` — create a test component using `trpc.projects.list.useQuery()`
5. Commit

**Integration note**: Apps need a `TRPCProvider` component to wrap their React tree. That provider is app-level (PRD-010 creates it for web). This PRD provides the `trpc` and `createTRPCClient` that the provider uses.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should `getToken` be part of `createTRPCClient` or set via a React context? | Affects how mobile/desktop inject their token getters | Frontend lead | Resolved — parameter on factory. Each platform passes its own getter. |
| 2 | Do we need React Query `defaultOptions` in the shared package or per-app? | Affects retry behavior, stale time defaults | Frontend lead | Open — start with defaults, let apps override. |
| 3 | Should UI components use Tailwind or be unstyled? | Affects cross-platform compat (RN doesn't use Tailwind natively) | Design/Frontend | Resolved — unstyled scaffolding. Apps style them per-platform. |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
