# Project Status — PRD Tracking

This document tracks the implementation status of all PRDs, their dependencies, and the overall progress of the x4-mono build.

---

## PRD Lifecycle

PRDs move through four stages:

| Stage | Directory | Meaning |
|-------|-----------|---------|
| **Inbox** | `wiki/inbox/` | New or unstarted PRDs. All drafts land here. |
| **Active** | `wiki/active/` | PRD is currently being implemented. Move the file here when work begins. |
| **Completed** | `wiki/completed/` | PRD has been implemented and verified against its success criteria. |
| **Archived** | `wiki/archived/` | PRD was superseded or abandoned. Add a note at the top explaining why. |

**To move a PRD**: Move the file to the appropriate directory and update the `Status` field in the PRD header metadata.

---

## PRD Inventory

| PRD ID | Title | Status | Dependencies | Location |
|--------|-------|--------|--------------|----------|
| PRD-001 | [Monorepo Foundation & Tooling](completed/prd-001-monorepo-foundation.md) | Completed | None (root) | completed |
| PRD-002 | [Shared Types, Validators & Utilities](completed/prd-002-shared-types.md) | Completed | PRD-001 | completed |
| PRD-003 | [Database & ORM Layer](completed/prd-003-database-orm.md) | Completed | PRD-001, PRD-002 | completed |
| PRD-004 | [Shared UI Components & Hooks](completed/prd-004-shared-ui-hooks.md) | Completed | PRD-001, PRD-002 | completed |
| PRD-005 | [API Server — Hono + tRPC on Bun](completed/prd-005-api-server.md) | Completed | PRD-001, PRD-002, PRD-003 | completed |
| PRD-006 | [Authentication & Authorization — Better Auth](completed/prd-006-auth.md) | Completed | PRD-003, PRD-005 | completed |
| PRD-007 | [Error Handling & Logging](completed/prd-007-error-handling-logging.md) | Completed | PRD-002, PRD-005 | completed |
| PRD-008 | [Rate Limiting & Caching](completed/prd-008-rate-limiting-caching.md) | Completed | PRD-005 | completed |
| PRD-009 | [AI Integration Layer](completed/prd-009-ai-integration.md) | Completed | PRD-002, PRD-003, PRD-005, PRD-007, PRD-008 | completed |
| PRD-010 | [Web Application — Next.js](inbox/prd-010-web-app.md) | Draft | PRD-004, PRD-005, PRD-006 | inbox |
| PRD-011 | [Mobile Application — Expo + React Native](inbox/prd-011-mobile-app.md) | Draft | PRD-004, PRD-005, PRD-006 | inbox |
| PRD-012 | [Desktop Application — Electron](inbox/prd-012-desktop-app.md) | Draft | PRD-004, PRD-005, PRD-006 | inbox |
| PRD-013 | [Marketing Site — Next.js Static](inbox/prd-013-marketing-site.md) | Draft | PRD-001, PRD-010 | inbox |
| PRD-014 | [CI/CD, Deployment & DevOps](inbox/prd-014-cicd-devops.md) | Draft | All previous PRDs | inbox |
| PRD-015 | [Testing Strategy & Infrastructure](inbox/prd-015-testing-strategy.md) | Draft | PRD-001, PRD-003 | inbox |
| PRD-016 | [Getting Started Guide & Developer Experience](inbox/prd-016-getting-started-dx.md) | Draft | All previous PRDs | inbox |

---

## Dependency Graph

```
PRD-001 (Monorepo Foundation) ← ROOT — everything depends on this
  │
  ├── PRD-002 (Shared Types)
  │     ├── PRD-004 (Shared UI & Hooks)
  │     │     ├── PRD-010 (Web App)
  │     │     ├── PRD-011 (Mobile App)
  │     │     └── PRD-012 (Desktop App)
  │     │
  │     ├── PRD-007 (Error Handling & Logging)
  │     │     └── PRD-009 (AI Integration)
  │     │
  │     └── PRD-009 (AI Integration)
  │
  ├── PRD-003 (Database & ORM)
  │     ├── PRD-005 (API Server)
  │     │     ├── PRD-006 (Auth)
  │     │     │     ├── PRD-010 (Web App)
  │     │     │     ├── PRD-011 (Mobile App)
  │     │     │     └── PRD-012 (Desktop App)
  │     │     │
  │     │     ├── PRD-007 (Error Handling & Logging)
  │     │     ├── PRD-008 (Rate Limiting & Caching)
  │     │     │     └── PRD-009 (AI Integration)
  │     │     │
  │     │     └── PRD-009 (AI Integration)
  │     │
  │     ├── PRD-006 (Auth)
  │     ├── PRD-009 (AI Integration)
  │     └── PRD-015 (Testing Strategy)
  │
  ├── PRD-010 (Web App)
  │     └── PRD-013 (Marketing Site)
  │
  ├── PRD-014 (CI/CD & DevOps) ← depends on all previous
  └── PRD-016 (Getting Started) ← depends on all previous
```

**Recommended implementation order**: PRD-001 → PRD-002 → PRD-003 → PRD-004 + PRD-005 (parallel) → PRD-006 → PRD-007 → PRD-008 → PRD-009 → PRD-010 → PRD-011 + PRD-012 (parallel) → PRD-013 → PRD-014 → PRD-015 → PRD-016

---

## Progress Log

Track milestones and completed work here as PRDs are implemented.

| Date | What | PR |
|------|------|----|
| 2026-02-07 | Dev infrastructure scaffolded (wiki, .github, CLAUDE.md, .claude/) | — |
| 2026-02-07 | PRD-001: Monorepo foundation implemented — root configs, 9 workspaces, lint boundaries, TypeScript | — |
| 2026-02-07 | PRD-001: Moved to completed. PRD-002: Started — shared types, validators & utilities | — |
| 2026-02-07 | PRD-002: Completed — domain types, error types, Zod validators, formatting utils, helpers, 125 tests | — |
| 2026-02-07 | PRD-003: Completed — Drizzle schema (users, projects, ai_usage_log), Neon client, migrations, seed, 25 tests | — |
| 2026-02-07 | PRD-005: Started — API server (Hono + tRPC on Bun) | — |
| 2026-02-07 | PRD-005: Completed — Hono app, tRPC v11 init, projects CRUD router, users stub, env validation, placeholder auth, 15 tests | — |
| 2026-02-07 | PRD-004: Completed — tRPC React client, convenience hooks, auth hooks (placeholder), Button/Input UI scaffolding, 20 new tests (145 total in shared) | — |
| 2026-02-07 | PRD-006: Completed — Better Auth server config, Hono route mounting, tRPC context integration, web/native/desktop clients, auth middleware tests, 40 API tests | — |
| 2026-02-07 | PRD-007: Completed — AppError class, Errors.* constructors, tRPC code mapping, Pino logger + child loggers, request logging middleware, global error handler, tRPC error formatter, React ErrorBoundary, router refactor, 47 new tests (87 total API) | — |
| 2026-02-07 | PRD-008: Completed — Upstash Redis rate limiting (3 tiers: general/ai/auth), cache interface (get/set/del/getOrGenerate), Hono middleware wiring, fail-open behavior, 28 new tests (115 total API) | — |
| 2026-02-07 | PRD-009: Completed — Vercel AI SDK providers (Claude + OpenAI), generateAIResponse/streamAIResponse, provider factory, cost tracking, system prompts, tRPC ai.generate router with DB usage logging, 41 new tests (351 total) | — |
