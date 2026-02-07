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
| PRD-001 | [Monorepo Foundation & Tooling](inbox/prd-001-monorepo-foundation.md) | Draft | None (root) | inbox |
| PRD-002 | [Shared Types, Validators & Utilities](inbox/prd-002-shared-types.md) | Draft | PRD-001 | inbox |
| PRD-003 | [Database & ORM Layer](inbox/prd-003-database-orm.md) | Draft | PRD-001, PRD-002 | inbox |
| PRD-004 | [Shared UI Components & Hooks](inbox/prd-004-shared-ui-hooks.md) | Draft | PRD-001, PRD-002 | inbox |
| PRD-005 | [API Server — Hono + tRPC on Bun](inbox/prd-005-api-server.md) | Draft | PRD-001, PRD-002, PRD-003 | inbox |
| PRD-006 | [Authentication & Authorization — Better Auth](inbox/prd-006-auth.md) | Draft | PRD-003, PRD-005 | inbox |
| PRD-007 | [Error Handling & Logging](inbox/prd-007-error-handling-logging.md) | Draft | PRD-002, PRD-005 | inbox |
| PRD-008 | [Rate Limiting & Caching](inbox/prd-008-rate-limiting-caching.md) | Draft | PRD-005 | inbox |
| PRD-009 | [AI Integration Layer](inbox/prd-009-ai-integration.md) | Draft | PRD-002, PRD-003, PRD-005, PRD-007, PRD-008 | inbox |
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
