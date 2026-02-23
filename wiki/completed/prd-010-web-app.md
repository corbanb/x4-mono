# PRD-010: Web Application — Next.js

**PRD ID**: PRD-010
**Title**: Web Application — Next.js
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-004 (Shared UI & Hooks), PRD-005 (API Server), PRD-006 (Auth)
**Blocks**: PRD-013 (Marketing Site — follows same Next.js patterns)

---

## 1. Problem Statement

The API is built, auth is configured, shared hooks exist — but without a web application wiring them together, there's no way to verify the end-to-end experience. The web app is the primary interface for most products and the first place where architectural decisions get pressure-tested: Does tRPC type safety actually flow to the React component? Does the auth redirect work correctly? Does the TRPCProvider set up React Query correctly? Does form validation using shared Zod schemas feel right in the browser?

This PRD builds the Next.js web app as a **pure frontend** — no API routes, no server-side data fetching beyond auth session checks. All data flows through the tRPC client to the standalone API (PRD-005). This architectural decision was made in the spec to ensure mobile and desktop never depend on the web deployment, and the API scales independently.

The web app demonstrates the core patterns that every project will extend: TRPCProvider setup, server component auth gates, client component data fetching, form handling with react-hook-form + Zod, cache invalidation on mutations, and Vercel deployment configuration. It's deliberately minimal — a login page, a dashboard, and a project CRUD flow — enough to prove the stack works end-to-end without adding project-specific features.

---

## 2. Success Criteria

| Criteria           | Measurement                                                           | Target                                   |
| ------------------ | --------------------------------------------------------------------- | ---------------------------------------- |
| tRPC integration   | `trpc.projects.list.useQuery()` returns typed data in React component | Zero `any` types, autocomplete works     |
| Auth flow          | Login → redirect to dashboard → session persists on refresh           | Full auth lifecycle works                |
| Auth gate          | Unauthenticated users hitting `/dashboard` redirect to `/login`       | Server-side redirect, no flash           |
| Form validation    | Client-side Zod validation matches server-side                        | Same `CreateProjectSchema` used in both  |
| Cache invalidation | Creating a project refreshes the project list                         | `utils.projects.list.invalidate()` works |
| Server components  | Auth checks run in server components (no client-side session flash)   | `await auth()` in RSC                    |
| Build              | `next build` produces zero errors                                     | Clean production build                   |
| Deploy             | Vercel deployment works with `vercel.json`                            | Accessible at `app.example.com`          |
| Dev                | `bun turbo dev --filter=web` starts Next.js on port 3000              | Hot reload works                         |

---

## 3. Scope

### In Scope

- `apps/web/` workspace structure
- Next.js 15+ with App Router, React 19
- `src/lib/trpc-provider.tsx` — TRPCProvider with QueryClient + tRPC client
- `src/app/layout.tsx` — root layout with TRPCProvider, Navigation, session
- Pages:
  - `src/app/page.tsx` — landing/home page (public)
  - `src/app/login/page.tsx` — login form using Better Auth client
  - `src/app/signup/page.tsx` — signup form
  - `src/app/dashboard/page.tsx` — auth-gated dashboard with project list
  - `src/app/dashboard/new/page.tsx` — create project form
- Components:
  - `src/components/Navigation.tsx` — nav bar with auth state
  - `src/components/ProjectList.tsx` — client component using tRPC query
  - `src/components/CreateProjectForm.tsx` — react-hook-form + Zod + tRPC mutation
- `src/middleware.ts` — Next.js middleware for auth redirects
- `next.config.ts` — Next.js configuration
- `tailwind.config.ts` — Tailwind CSS setup
- `.env.example` — `NEXT_PUBLIC_API_URL`
- `vercel.json` — deployment config
- `package.json` with scripts: `dev`, `build`, `start`, `lint`, `type-check`

### Out of Scope

- Project-specific pages and features (per-project)
- Admin panel / user management UI (per-project)
- Complex state management (React Query via tRPC is sufficient)
- CSS component library selection (Tailwind primitives only in boilerplate)
- SEO optimization beyond basic meta tags (per-project)
- Analytics integration (per-project)
- Internationalization (per-project)
- Error monitoring UI (Sentry — per-project)

### Assumptions

- PRD-004 tRPC client and hooks are available in `@packages/shared/api-client`
- PRD-005 API is running on port 3002
- PRD-006 Better Auth client is available in `@packages/auth/client`
- Node.js 20+ is available (Next.js requirement)
- Tailwind CSS v4 is the styling approach

---

## 4. System Context

```
packages/shared/api-client   (PRD-004) ← trpc, createTRPCClient, hooks
packages/auth/client         (PRD-006) ← useSession, signIn, signOut
       ↓
apps/web                     ← This PRD
       ↓ calls via tRPC
apps/api                     (PRD-005) ← /trpc/* endpoints
       ↓
packages/database            (PRD-003)
```

### Dependency Map

| Depends On                  | What It Provides                                                         |
| --------------------------- | ------------------------------------------------------------------------ |
| PRD-004 (Shared UI & Hooks) | `trpc`, `createTRPCClient`, `useProjects`, `useCreateProject`, `useAuth` |
| PRD-005 (API Server)        | tRPC endpoints to consume (`/trpc/projects.*`, `/trpc/users.*`)          |
| PRD-006 (Auth)              | `signIn`, `signUp`, `signOut`, `useSession` from Better Auth client      |

### Consumed By

| Consumer                 | How It's Used                                             |
| ------------------------ | --------------------------------------------------------- |
| PRD-013 (Marketing Site) | Follows same Next.js patterns, links to `app.example.com` |
| PRD-014 (CI/CD)          | `deploy-web.yml` deploys this workspace to Vercel         |
| PRD-015 (Testing)        | Playwright E2E tests run against this app                 |

---

## 5. Technical Design

### 5.1 Data Model / Types

No new types. Consumes types from PRD-002 via tRPC.

### 5.2 Architecture Decisions

**Decision**: Pure frontend — no Next.js API routes
**Context**: Spec mandates the web app has no server-side API logic.
**Options Considered**: (1) Next.js API routes with tRPC, (2) Pure frontend consuming standalone API
**Rationale**: Pure frontend means mobile and desktop don't depend on the web deployment. API scales independently. The web app is a React application that happens to use Next.js for SSR/SSG and routing.
**Tradeoffs**: Two deployments instead of one. Can't use Next.js server actions for mutations (all mutations go through tRPC). Slight latency increase for the extra hop (browser → API server vs. browser → same-origin API route).

**Decision**: Server components for auth checks, client components for data fetching
**Context**: Need to decide which components are server vs. client in the App Router model.
**Options Considered**: (1) All server components with server-side tRPC, (2) Auth in server, data in client, (3) All client components
**Rationale**: Server components check auth sessions (no client-side flash of unauthenticated state). Client components use tRPC hooks for data fetching (React Query handles caching, loading, error states). This splits concerns cleanly: auth is server-side, data is client-side.
**Tradeoffs**: Can't use server-side tRPC calls (since our API is standalone). If we wanted server-side data fetching, we'd need a server-to-server tRPC call. Not needed for the boilerplate.

**Decision**: react-hook-form + Zod for form handling
**Context**: Need client-side form validation that uses the same schemas as the API.
**Options Considered**: react-hook-form, Formik, native forms
**Rationale**: react-hook-form has the best performance (uncontrolled inputs), `@hookform/resolvers/zod` lets us reuse Zod schemas from `@packages/shared/utils` directly. Same schema validates on client and server.
**Tradeoffs**: Another dependency. But the DX of shared Zod schemas across client and server justifies it.

### 5.3 API Contracts / Interfaces

No new APIs. This workspace **consumes** the tRPC API via shared hooks.

**Key integration points**:

```typescript
// TRPCProvider wraps the app — provides trpc client + React Query
<TRPCProvider>
  <App />
</TRPCProvider>

// Data fetching in client components:
const { data, isLoading } = trpc.projects.list.useQuery();

// Mutations with cache invalidation:
const utils = trpc.useUtils();
const createProject = trpc.projects.create.useMutation({
  onSuccess: () => utils.projects.list.invalidate(),
});

// Auth in server components:
const session = await auth(); // Better Auth server-side
if (!session) redirect("/login");
```

### 5.4 File Structure

```
apps/web/
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout: TRPCProvider, Navigation
│   │   ├── page.tsx            # Landing page (public)
│   │   ├── login/
│   │   │   └── page.tsx        # Login form
│   │   ├── signup/
│   │   │   └── page.tsx        # Signup form
│   │   └── dashboard/
│   │       ├── page.tsx        # Project list (auth-gated)
│   │       └── new/
│   │           └── page.tsx    # Create project form
│   ├── components/
│   │   ├── Navigation.tsx      # Nav bar with auth state
│   │   ├── ProjectList.tsx     # Client component: trpc.projects.list
│   │   └── CreateProjectForm.tsx # react-hook-form + Zod + tRPC mutation
│   ├── lib/
│   │   ├── trpc-provider.tsx   # TRPCProvider component
│   │   └── error-boundary.tsx  # From PRD-007 pattern
│   ├── styles/
│   │   └── globals.css         # Tailwind imports
│   └── middleware.ts           # Auth redirects
├── public/                     # Static assets
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── tsconfig.json
├── vercel.json
├── package.json
└── README.md
```

---

## 6. Implementation Plan

### Task Breakdown

| #   | Task                                                                 | Estimate | Dependencies                  | Claude Code Candidate? | Notes                                       |
| --- | -------------------------------------------------------------------- | -------- | ----------------------------- | ---------------------- | ------------------------------------------- |
| 1   | Create `apps/web/package.json`, `tsconfig.json`, config files        | 15m      | PRD-001                       | ✅ Yes                 | Next.js + Tailwind config                   |
| 2   | Implement `src/lib/trpc-provider.tsx` — TRPCProvider component       | 20m      | PRD-004 (trpc client)         | ✅ Yes                 | Well-specified in spec                      |
| 3   | Implement `src/app/layout.tsx` — root layout with providers          | 15m      | Task 2                        | ✅ Yes                 | Standard layout                             |
| 4   | Implement `src/app/page.tsx` — public landing page                   | 10m      | Task 3                        | ✅ Yes                 | Simple page                                 |
| 5   | Implement `src/app/login/page.tsx` and `signup/page.tsx`             | 30m      | PRD-006 (auth client)         | 🟡 Partial             | Auth form UX needs human review             |
| 6   | Implement `src/middleware.ts` — auth redirect middleware             | 15m      | PRD-006                       | 🟡 Partial             | Review redirect logic                       |
| 7   | Implement `src/app/dashboard/page.tsx` — auth-gated with ProjectList | 20m      | Tasks 2, 6                    | ✅ Yes                 | Server component + client child             |
| 8   | Implement `src/components/ProjectList.tsx` — tRPC query component    | 15m      | Task 2, PRD-004               | ✅ Yes                 | Standard tRPC query pattern                 |
| 9   | Implement `src/components/CreateProjectForm.tsx` — form + mutation   | 30m      | Task 2, PRD-002 (Zod schemas) | 🟡 Partial             | Form handling needs human review for UX     |
| 10  | Implement `src/components/Navigation.tsx`                            | 15m      | Task 5                        | ✅ Yes                 | Auth-aware nav                              |
| 11  | Configure `tailwind.config.ts`, `postcss.config.js`, `globals.css`   | 10m      | Task 1                        | ✅ Yes                 | Standard Tailwind setup                     |
| 12  | Create `vercel.json` and `.env.example`                              | 5m       | Task 1                        | ✅ Yes                 | Deployment config                           |
| 13  | Verify end-to-end: login → dashboard → create project                | 20m      | All above                     | ❌ No                  | Manual — requires API running               |
| 14  | Write Playwright E2E spec for auth + project CRUD                    | 30m      | Task 13                       | 🟡 Partial             | AI generates spec, human verifies selectors |

### Claude Code Task Annotations

**Task 2 (TRPCProvider)**:

- **Context needed**: `trpc` and `createTRPCClient` from `@packages/shared/api-client`. React Query `QueryClient`. `NEXT_PUBLIC_API_URL` env var. The "use client" directive is required.
- **Constraints**: Use `useState` for both `queryClient` and `trpcClient` (prevents re-creation on re-render). Read API URL from `process.env.NEXT_PUBLIC_API_URL`.
- **Done state**: Wrapping a component in `<TRPCProvider>` gives child components access to tRPC hooks.
- **Verification command**: `cd apps/web && bun type-check`

**Task 9 (CreateProjectForm)**:

- **Context needed**: `CreateProjectSchema` from `@packages/shared/utils`. `trpc.projects.create.useMutation()`. `trpc.useUtils()` for cache invalidation. react-hook-form with `@hookform/resolvers/zod`.
- **Constraints**: "use client" directive. Form MUST use `zodResolver(CreateProjectSchema)` — same schema the API validates against. On success, invalidate `projects.list` query. Show loading state during submission. Show Zod validation errors per-field.
- **Done state**: Form submits, project appears in list without page refresh.
- **Verification command**: `cd apps/web && bun type-check && bun build`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level       | What's Tested                               | Tool                       | Count (approx) |
| ----------- | ------------------------------------------- | -------------------------- | -------------- |
| Unit        | Component rendering, form validation        | Bun test + Testing Library | 10-15          |
| Integration | TRPCProvider setup, auth redirect           | Bun test                   | 3-5            |
| E2E         | Signup → login → dashboard → create project | Playwright                 | 2-3            |

### Key Test Scenarios

1. **Auth redirect**: Navigate to `/dashboard` unauthenticated → redirect to `/login`
2. **Login flow**: Fill login form → submit → redirect to `/dashboard`
3. **Project list**: Dashboard loads → ProjectList shows projects from API
4. **Create project**: Fill form → submit → new project appears in list
5. **Form validation**: Submit empty form → Zod errors shown per field
6. **Navigation**: Auth state reflected in nav (Login button vs. user name + Logout)
7. **Loading states**: ProjectList shows loading indicator while fetching
8. **Error state**: API returns error → user sees error message (not crash)
9. **TRPCProvider initializes**: TRPCProvider renders without error and provides context to children
10. **Middleware auth gate**: Unauthenticated request to `/dashboard/*` → redirect to `/login`
11. **Accessibility**: Key components pass axe accessibility checks (no critical violations)
12. **Cache invalidation**: Mutation success (e.g. create project) → list query refetched automatically

### Mock Patterns

```typescript
// Next.js middleware test pattern
import { NextRequest } from "next/server";
import { middleware } from "../src/middleware";

test("redirects unauthenticated users from /dashboard", async () => {
  const req = new NextRequest(new URL("http://localhost:3000/dashboard"));
  const res = await middleware(req);
  expect(res?.status).toBe(307);
  expect(res?.headers.get("location")).toContain("/login");
});

// renderWithProviders helper for component tests
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  );
}
```

---

## 8. Non-Functional Requirements

| Requirement       | Target                              | How Verified                       |
| ----------------- | ----------------------------------- | ---------------------------------- |
| Build time        | `next build` < 30s                  | CI timing                          |
| First paint       | LCP < 2s on production              | Lighthouse                         |
| Bundle size       | Main JS bundle < 200KB gzipped      | `next build` output                |
| Type safety       | Zero `any` types in components      | `bun type-check`                   |
| Accessibility     | Lighthouse accessibility score > 90 | Lighthouse audit                   |
| Mobile responsive | All pages usable on 375px width     | Manual or Playwright viewport test |

---

## 9. Rollout & Migration

1. Implement all files
2. Set `NEXT_PUBLIC_API_URL=http://localhost:3002` in `apps/web/.env.local`
3. Start API: `bun turbo dev --filter=api`
4. Start web: `bun turbo dev --filter=web`
5. Test manually: visit `http://localhost:3000`, sign up, log in, create project
6. Run `next build` to verify production build
7. Deploy to Vercel: connect repo, set env vars, deploy
8. Configure domain: `app.example.com` → Vercel

**Rollback plan**: This is the web frontend — rollback by reverting the Vercel deployment. No database changes, no API changes.

---

## 10. Open Questions

| #   | Question                                                                            | Impact                                                  | Owner    | Status                                                                                 |
| --- | ----------------------------------------------------------------------------------- | ------------------------------------------------------- | -------- | -------------------------------------------------------------------------------------- |
| 1   | Should we use Next.js middleware or Better Auth's built-in redirect for auth gates? | Affects auth check location                             | Frontend | Resolved — Next.js middleware for route-level redirects, Better Auth for session state |
| 2   | Do we need SSR for the dashboard or is CSR sufficient?                              | Affects SEO (irrelevant for dashboard) and initial load | Frontend | Resolved — CSR via tRPC hooks. Dashboard isn't SEO-critical.                           |
| 3   | Tailwind v4 or v3?                                                                  | v4 is newer but less ecosystem support                  | Frontend | Open — default to whatever Next.js 15 ships with.                                      |

---

## 11. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-02-07 | AI-Native TPM | Initial draft |
