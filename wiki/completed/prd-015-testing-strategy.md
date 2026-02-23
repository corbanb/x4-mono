# PRD-015: Testing Strategy & Infrastructure

**PRD ID**: PRD-015
**Title**: Testing Strategy & Infrastructure
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-001 (Monorepo Foundation — test runner config), PRD-003 (Database — Neon branching for test DBs)
**Blocks**: None (but every other PRD references this for its testing section)

---

## 1. Problem Statement

"We'll add tests later" is the most expensive sentence in software engineering. Without testing infrastructure set up from the start — test runner configured, patterns established, fixtures available, CI hooked up — testing becomes an afterthought that teams bolt on weeks later when bugs start shipping. By then, the codebase has grown without testable boundaries, and writing tests retroactively is 3x harder than writing them alongside the code.

The monorepo adds a specific testing challenge: different workspaces need different test approaches. tRPC routers need integration tests with a real database. React components need unit tests with Testing Library. The full stack needs E2E tests with Playwright. Each needs its own patterns, but they should all run with the same command (`bun turbo test`) and integrate into the same CI pipeline.

This PRD establishes the testing infrastructure, patterns, and conventions that every other PRD references in its "Testing Strategy" section. It configures Bun's built-in test runner, sets up Playwright for E2E, creates test helpers and factories, and documents the patterns for tRPC router testing, Hono integration testing, and component testing. The goal is that when an engineer picks up any PRD, they know exactly how to write tests for it.

---

## 2. Success Criteria

| Criteria              | Measurement                                          | Target                              |
| --------------------- | ---------------------------------------------------- | ----------------------------------- |
| Test runner works     | `bun test` runs across all workspaces via Turbo      | Zero configuration issues           |
| Test pyramid enforced | Unit 60-70%, Integration 20-30%, E2E 5-10%           | Proportions documented and reviewed |
| tRPC test pattern     | `createCaller` + `createTestContext` pattern works   | Example test passes                 |
| Hono test pattern     | `app.request()` integration tests work               | Example test passes                 |
| Playwright setup      | E2E tests run against local dev server               | Auth flow test passes               |
| Test isolation        | Tests don't share state or interfere with each other | Parallel test execution works       |
| Coverage              | Coverage reports generated and accessible            | `bun test --coverage` works         |
| Neon branch tests     | Integration tests run against Neon branch DB         | CI uses branch URL                  |
| Mock patterns         | AI providers, external services have mock examples   | Mock factory exists                 |
| CI integration        | `bun turbo test` passes in CI pipeline               | Green CI on clean code              |

---

## 3. Scope

### In Scope

- Bun test runner configuration across monorepo
  - `bunfig.toml` test settings (coverage, coverage directory)
  - Per-workspace test scripts: `test`, `test:watch`, `test:coverage`
  - Turbo `test` task configuration (outputs: `coverage/**`)
- Test patterns and helpers:
  - `createTestContext` — creates mock tRPC context with configurable auth
  - `createCaller` — creates tRPC caller for router testing without HTTP
  - `createTestDB` — helper for tests that need a real database (Neon branch)
  - Mock factories for AI providers, external HTTP services
  - Test fixtures for common data (users, projects)
- tRPC router testing pattern: unit test via `createCaller`, integration test via `app.request()`
- Hono integration testing pattern: `app.request("/health")` without starting server
- Playwright E2E setup:
  - `playwright.config.ts` in `apps/web/`
  - Example spec: signup → login → dashboard → create project
  - Playwright in CI configuration
- Neon branch isolation pattern for integration tests
- Documentation: testing conventions, when to use each test level, mock guidelines

### Out of Scope

- Specific test cases for individual features (those belong in each PRD's testing section)
- Visual regression testing (per-project)
- Load testing / performance benchmarks (per-project)
- Contract testing between services (only relevant with multiple APIs)
- Test data management beyond seed script (per-project)

### Assumptions

- Bun >= 1.1 with built-in test runner is available
- PRD-001 Turbo pipeline includes `test` task
- PRD-003 Neon project supports branching
- Playwright is available as a dev dependency

---

## 4. System Context

```
PRD-015 (This PRD)
  ├── Configures: bunfig.toml, test scripts
  ├── Provides: test helpers, mock factories, fixture data
  ├── Sets up: Playwright in apps/web/
  └── Documents: patterns referenced by ALL other PRDs

Every other PRD's "Testing Strategy" section references the patterns established here:
  ├── PRD-002: Unit tests for validators/formatters
  ├── PRD-003: Integration tests against Neon branch
  ├── PRD-005: tRPC router tests via createCaller
  ├── PRD-006: Auth flow integration tests
  ├── PRD-007: Error handler tests
  ├── PRD-008: Rate limiter tests (mocked Redis)
  ├── PRD-009: AI tests (mocked provider)
  └── PRD-010: Playwright E2E tests
```

### Dependency Map

| Depends On                    | What It Provides                           |
| ----------------------------- | ------------------------------------------ |
| PRD-001 (Monorepo Foundation) | Turbo test task, bunfig.toml               |
| PRD-003 (Database)            | Neon branching for test database isolation |

### Consumed By

| Consumer            | How It's Used                                          |
| ------------------- | ------------------------------------------------------ |
| Every PRD (002-013) | Test patterns, helpers, mock factories                 |
| PRD-014 (CI/CD)     | `bun turbo test` in CI pipeline, Playwright in E2E job |
| Developers          | Day-to-day test writing following established patterns |

---

## 5. Technical Design

### 5.2 Architecture Decisions

**Decision**: Bun test over Vitest/Jest
**Context**: Need a fast test runner that works across the monorepo.
**Options Considered**: Bun test, Vitest, Jest
**Rationale**: Bun's built-in test runner is Jest-compatible (`describe`, `test`, `expect`), runs natively on Bun (no transpilation), and is the fastest option. Zero configuration for TypeScript. Built-in coverage support.
**Tradeoffs**: Smaller ecosystem than Jest/Vitest. No built-in UI reporter (use `bun test --reporter`). Some Jest plugins may not work directly. Acceptable for our use case — we don't need complex mocking libraries beyond what Bun provides.

**Decision**: Real database via Neon branches over in-memory fakes
**Context**: Integration tests need a database. Options are mock/fake DB or real DB.
**Options Considered**: (1) Mock Drizzle queries, (2) SQLite in-memory, (3) Docker Postgres, (4) Neon branch
**Rationale**: Real database via Neon branch catches real SQL issues (constraints, indexes, Postgres-specific behavior) that mocks and SQLite miss. Neon branches are instant (< 1s creation) and free on the dev plan. Docker Postgres adds CI complexity and startup time.
**Tradeoffs**: Integration tests require network access to Neon. In offline environments, mock-based unit tests still work. Integration tests are slower (~50ms per query vs. ~1ms for mocks). Worth it for correctness.

**Decision**: Playwright over Cypress for E2E
**Context**: Need browser automation for end-to-end testing.
**Options Considered**: Playwright, Cypress, Puppeteer
**Rationale**: Playwright is faster (parallel execution), supports multiple browsers natively, has better TypeScript support, and handles modern web app patterns (Server Components, streaming) better than Cypress. Lighter CI footprint.
**Tradeoffs**: Cypress has a better interactive debugging UI. Playwright's trace viewer is good but different. Team familiarity may vary.

### 5.3 API Contracts / Interfaces

**Test Helpers**:

```typescript
// apps/api/test/helpers.ts

// Create a mock tRPC context for router testing
export async function createTestContext(overrides?: {
  userId?: string | null;
  role?: "user" | "admin";
}): Promise<Context> {
  return {
    db,  // real DB or mock depending on test level
    session: overrides?.userId ? {
      user: { id: overrides.userId, role: overrides.role || "user", ... },
      session: { ... },
    } : null,
    userId: overrides?.userId || null,
  };
}

// Create a tRPC caller for direct router testing (no HTTP)
export function createTestCaller(ctx: Context) {
  return appRouter.createCaller(ctx);
}
```

**Mock Factories**:

```typescript
// apps/api/test/mocks/ai.ts
export function mockAIProvider() {
  return {
    generateText: async () => ({
      text: 'Mock AI response',
      usage: { promptTokens: 10, completionTokens: 20, totalTokens: 30 },
    }),
  };
}

// apps/api/test/mocks/redis.ts
export function mockRedis() {
  const store = new Map<string, unknown>();
  return {
    get: async (key: string) => store.get(key) || null,
    set: async (key: string, value: unknown) => store.set(key, value),
    del: async (key: string) => store.delete(key),
  };
}
```

**Test Fixtures**:

```typescript
// apps/api/test/fixtures.ts
export const testUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const,
};

export const testAdmin = {
  id: 'test-admin-1',
  email: 'admin@example.com',
  name: 'Test Admin',
  role: 'admin' as const,
};

export const testProject = {
  id: 'test-project-1',
  name: 'Test Project',
  description: 'A test project',
  ownerId: 'test-user-1',
  status: 'active',
};
```

**React Testing Library Pattern**:

```typescript
// apps/web/test/helpers.tsx — renderWithProviders helper
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

**Playwright Auth Bypass**:

```typescript
// apps/web/e2e/fixtures/auth.ts — fixture that injects auth token, skips login UI
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ page }, use) => {
    // Set auth cookie/token before navigating — bypasses login UI for non-auth tests
    await page.context().addCookies([
      {
        name: 'session_token',
        value: 'test-session-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    await use(page);
  },
});
```

**Mobile/Desktop Mock Cross-References**:

- **Mobile (Expo) mocks**: See PRD-011 Section 7 "Mock Patterns" for `expo-secure-store` in-memory mock
- **Desktop (Electron) mocks**: See PRD-012 Section 7 "Mock Patterns" for `safeStorage` and `ipcMain` mocks

**Playwright Config**:

```typescript
// apps/web/playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  webServer: [
    {
      command: 'bun turbo dev --filter=api',
      port: 3002,
      reuseExistingServer: true,
    },
    {
      command: 'bun turbo dev --filter=web',
      port: 3000,
      reuseExistingServer: true,
    },
  ],
});
```

### 5.4 File Structure

```
# Test infrastructure (new files)
apps/api/
├── test/
│   ├── helpers.ts            # createTestContext, createTestCaller
│   ├── fixtures.ts           # testUser, testAdmin, testProject
│   ├── mocks/
│   │   ├── ai.ts             # Mock AI provider
│   │   └── redis.ts          # Mock Redis for cache/rate limit tests
│   └── setup.ts              # Global test setup (env vars, DB connection)

apps/web/
├── e2e/
│   ├── auth.spec.ts          # Signup → login → dashboard E2E
│   └── projects.spec.ts      # Project CRUD E2E
├── playwright.config.ts

# Configuration updates
bunfig.toml                   # Test coverage settings
turbo.json                    # Test task outputs: coverage/**
```

---

## 6. Implementation Plan

### Task Breakdown

| #   | Task                                                                    | Estimate | Dependencies                 | Claude Code Candidate? | Notes                                                |
| --- | ----------------------------------------------------------------------- | -------- | ---------------------------- | ---------------------- | ---------------------------------------------------- |
| 1   | Configure `bunfig.toml` test settings (coverage dir, options)           | 10m      | PRD-001                      | ✅ Yes                 | Config                                               |
| 2   | Verify Turbo `test` task runs across all workspaces                     | 10m      | Task 1                       | ❌ No                  | Manual verification                                  |
| 3   | Create `apps/api/test/helpers.ts` — createTestContext, createTestCaller | 25m      | PRD-005 (trpc, context type) | 🟡 Partial             | Core pattern — human reviews context mock            |
| 4   | Create `apps/api/test/fixtures.ts` — test data                          | 15m      | PRD-002 (types)              | ✅ Yes                 | Static data objects                                  |
| 5   | Create `apps/api/test/mocks/ai.ts` — mock AI provider                   | 15m      | PRD-009 (AI types)           | ✅ Yes                 | Simple mock                                          |
| 6   | Create `apps/api/test/mocks/redis.ts` — mock Redis                      | 15m      | PRD-008 (cache interface)    | ✅ Yes                 | In-memory Map-based mock                             |
| 7   | Create `apps/api/test/setup.ts` — global test setup                     | 10m      | Tasks 3-6                    | ✅ Yes                 | Env vars, DB setup                                   |
| 8   | Write example tRPC router test using createCaller pattern               | 20m      | Task 3                       | ✅ Yes                 | Demonstrates the pattern                             |
| 9   | Write example Hono integration test using `app.request()`               | 15m      | PRD-005                      | ✅ Yes                 | Demonstrates the pattern                             |
| 10  | Install Playwright and create `playwright.config.ts`                    | 15m      | PRD-010                      | ✅ Yes                 | Config + install                                     |
| 11  | Write Playwright E2E spec: auth flow                                    | 25m      | Task 10, PRD-010             | 🟡 Partial             | AI generates, human verifies selectors and flow      |
| 12  | Write Playwright E2E spec: project CRUD                                 | 20m      | Task 11                      | 🟡 Partial             | Same                                                 |
| 13  | Document test conventions in CONTRIBUTING.md or dedicated doc           | 20m      | All above                    | ✅ Yes                 | Patterns, when to use each level, naming conventions |
| 14  | Verify `bun turbo test` runs all tests green                            | 15m      | All above                    | ❌ No                  | Manual verification                                  |

### Claude Code Task Annotations

**Task 3 (Test Helpers)**:

- **Context needed**: tRPC context type from PRD-005. `appRouter` for `createCaller`. Better Auth session shape. Database client.
- **Constraints**: `createTestContext` must support: no auth (anonymous), user auth, admin auth. Must use the real `Context` type from tRPC. `createTestCaller` wraps `appRouter.createCaller` — don't reinvent it.
- **Done state**: Can write `const caller = createTestCaller(await createTestContext({ userId: "1", role: "admin" }))` and call any router procedure.
- **Verification command**: `cd apps/api && bun test`

**Task 8 (Example Router Test)**:

- **Context needed**: `createTestCaller`, `createTestContext` from Task 3. Projects router from PRD-005. Bun test syntax (`import { describe, test, expect } from "bun:test"`).
- **Constraints**: Test at minimum: create project (valid input), create project (unauthorized), get project (not found). Use `beforeAll`/`afterAll` for setup/teardown. Do NOT depend on seed data — create what you need in setup.
- **Done state**: Example test demonstrates the full pattern. Other PRDs can copy this pattern.
- **Verification command**: `cd apps/api && bun test`

---

## 7. Testing Strategy

This PRD IS the testing strategy — it's self-referential. The deliverable is the testing infrastructure itself.

### Test Conventions Documented by This PRD

**File naming**: `*.test.ts` for unit/integration, `*.spec.ts` for E2E (Playwright)

**Test location**: Co-located with source code for unit tests (`__tests__/` directory or adjacent `.test.ts` files). E2E tests in `e2e/` directory.

**When to use each level**:

- **Unit test**: Pure functions, validators, formatters, business logic with no I/O
- **Integration test**: Database queries, tRPC procedures with real/branched DB, auth flows
- **E2E test**: Critical user journeys only (signup, login, core feature). Max 5-10 per app.

**Naming convention**: `describe("feature")` → `test("should do X when Y")`

**Mock guidelines**: Mock external services (AI providers, Redis, email). Don't mock your own code (database, auth). Use real Neon branch for DB integration tests.

---

## 8. Non-Functional Requirements

| Requirement            | Target                                            | How Verified                     |
| ---------------------- | ------------------------------------------------- | -------------------------------- |
| Unit test speed        | < 5s for all unit tests in a workspace            | `time bun test`                  |
| Integration test speed | < 30s with Neon branch                            | CI timing                        |
| E2E test speed         | < 60s for full auth + CRUD flow                   | Playwright timing                |
| Coverage threshold     | > 80% line coverage for packages/\*               | `bun test --coverage`            |
| Test isolation         | Tests pass in any order, parallel execution works | `bun test` (parallel by default) |

---

## 9. Rollout & Migration

1. Update `bunfig.toml` with test settings
2. Create test helper files in `apps/api/test/`
3. Create mock factories
4. Write example tests (router, integration, E2E)
5. Install Playwright: `bun add -D @playwright/test --filter=@[project-name]/web`
6. Run `bun turbo test` — all green
7. Document conventions
8. Commit

**Note**: This PRD can be built in parallel with Tier 1-2 PRDs. The test helpers reference patterns from PRD-005 (tRPC), but the infrastructure setup is independent.

---

## 10. Open Questions

| #   | Question                                                                           | Impact                                     | Owner     | Status                                                                       |
| --- | ---------------------------------------------------------------------------------- | ------------------------------------------ | --------- | ---------------------------------------------------------------------------- |
| 1   | Should we enforce minimum coverage thresholds in CI?                               | Fails CI if coverage drops                 | QA/Arch   | Open — consider 80% for `packages/*`, no threshold for `apps/*` initially    |
| 2   | Do we need snapshot testing for any components?                                    | Maintenance overhead vs. regression safety | Frontend  | Resolved — no snapshots in boilerplate. Fragile with UI changes.             |
| 3   | Should integration tests use a shared Neon branch or create per-test-run branches? | Isolation vs. branch limit                 | Architect | Resolved — shared branch per PR (from PRD-014 CI). Per-test-run is overkill. |

---

## 11. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-02-07 | AI-Native TPM | Initial draft |
