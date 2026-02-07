# PRD-014: CI/CD, Deployment & DevOps

**PRD ID**: PRD-014
**Title**: CI/CD, Deployment & DevOps
**Author**: AI-Native TPM
**Status**: Draft
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: All previous PRDs (needs the full system to deploy)
**Blocks**: None

---

## 1. Problem Statement

A monorepo without CI/CD is just a folder full of code. Without automated pipelines, every PR is a gamble — did this change break the database schema? Did it introduce a type error in a downstream package? Did the new tRPC router break the mobile client's type expectations? In a monorepo with 9 workspaces and 5 shared packages, the blast radius of any change is potentially the entire system, and manual verification doesn't scale.

The monorepo also has deployment complexity: the API deploys to Vercel (or Cloudflare Workers), the web app deploys to Vercel, mobile deploys via EAS, and desktop builds via electron-builder. Each has different triggers (API changes shouldn't redeploy the marketing site), different secrets, and different rollback procedures. Without path-filtered deployments and selective CI, every push triggers every pipeline and the feedback loop becomes painfully slow.

This PRD sets up the full CI/CD system: a main CI pipeline with Turbo-filtered selective testing, Neon database branching per PR (isolated database for every PR's tests and preview), migration safety checks, Claude-powered code review, and per-workspace deployment workflows. The goal is that pushing to `main` gets code to production in under 10 minutes with full confidence.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| CI on PR | Lint, type-check, test, build run on every PR | Pipeline completes < 5 minutes |
| Selective CI | Only affected packages are tested/built | Turbo `--filter=[HEAD^]` skips unchanged packages |
| Neon branching | PR gets its own database branch | Branch created on PR open, deleted on PR close |
| Migration safety | Schema/migration drift caught in CI | `drizzle-kit generate --check` fails if out of sync |
| Auto-deploy API | Push to main → API deployed to Vercel | Deploy completes < 3 minutes |
| Auto-deploy web | Push to main → web app deployed to Vercel | Deploy completes < 3 minutes |
| AI code review | PR gets Claude-powered review comment | Review posted within 2 minutes of PR |
| Dependency audit | Known vulnerabilities flagged | `bun pm audit` runs in CI |
| Branch cleanup | Neon branch deleted when PR closes | No orphaned branches |

---

## 3. Scope

### In Scope

**GitHub Actions Workflows**:
- `ci.yml` — main CI pipeline:
  - Bun setup, `bun install --frozen-lockfile`
  - Turbo-filtered: `lint`, `type-check`, `test`, `build` (only affected packages)
  - Dependency audit (`bun pm audit`)
- `ai-code-review.yml` — Claude-powered PR review:
  - Get PR diff, send to Claude Code Review action
- `deploy-api.yml` — deploy API to Vercel on push to main (path-filtered)
- `deploy-web.yml` — deploy web app to Vercel on push to main (path-filtered)
- `deploy-mobile.yml` — trigger EAS build on push to main (path-filtered)
- `deploy-desktop.yml` — trigger electron-builder (path-filtered)
- `neon-cleanup.yml` — delete Neon branch on PR close

**Neon Branching**:
- `neon-branch` job in CI: create branch `pr-{number}` from main
- `migration-check` job: verify `drizzle-kit generate --check` passes, run migrations on branch
- Branch cleanup on PR close/merge

**Deployment Configuration**:
- API: Vercel serverless (primary), Cloudflare Workers entry (alternative), long-running Bun entry (alternative)
- Web: Vercel with `vercel.json`
- Domain setup: `example.com`, `app.example.com`, `api.example.com`

**Other**:
- `.github/CODEOWNERS` with ownership rules
- API versioning strategy documentation (no prefix by default)

### Out of Scope

- Monitoring / alerting (Sentry, Datadog — per-project)
- Infrastructure-as-code (Terraform — overkill for this tier)
- Staging environment setup (per-project)
- Feature flag system (per-project)
- Performance benchmarking in CI (per-project)
- Remote Turbo caching (Vercel remote cache — per-project optimization)

### Assumptions

- GitHub is the repository host
- Vercel is the primary deployment platform (web + API)
- Neon project exists with API key for branching
- EAS account exists for mobile builds
- Secrets are configured in GitHub repository settings

---

## 4. System Context

```
Developer pushes code
       ↓
  GitHub Actions
  ├── ci.yml          → lint, type-check, test, build (all workspaces)
  ├── neon-branch     → create isolated DB per PR
  ├── migration-check → verify schema + migrations in sync
  ├── ai-code-review  → Claude reviews the diff
  └── deploy-*.yml    → per-workspace deployment
       ↓
  Vercel / EAS / electron-builder
  ├── api.example.com   ← apps/api
  ├── app.example.com   ← apps/web
  ├── example.com       ← apps/marketing
  ├── App Store / Play Store ← apps/mobile (via EAS)
  └── GitHub Releases   ← apps/desktop (via electron-builder)
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| All PRDs (001-013, 015) | Complete system to test, build, and deploy |
| Neon (PRD-003) | Database branching API |
| Vercel | Deployment platform |
| EAS | Mobile build service |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| Every developer | CI validates their PRs |
| Every merge to main | Triggers automated deployment |
| PRD-016 (Getting Started) | Documents the CI/CD setup |

---

## 5. Technical Design

### 5.2 Architecture Decisions

**Decision**: Turbo `--filter=[HEAD^]` for selective CI
**Context**: Running all tests across all workspaces on every PR is slow and wasteful.
**Options Considered**: (1) Run everything always, (2) Turbo selective filter, (3) Manual path filters in GitHub Actions
**Rationale**: Turbo understands the workspace dependency graph. `--filter=[HEAD^]` only runs tasks for packages changed since the last commit (plus their dependents). A change to `packages/database` triggers tests in `packages/database`, `apps/api`, and anything that imports from database. A change to `apps/marketing` only triggers marketing tests.
**Tradeoffs**: First push to a new branch may have longer CI (no cache). Remote Turbo caching (Vercel) would solve this but is per-project configuration.

**Decision**: Neon database branching per PR
**Context**: Integration tests need a database. Shared test databases cause flaky tests from concurrent writes.
**Options Considered**: (1) Shared test database, (2) Docker Postgres in CI, (3) Neon branching, (4) SQLite for tests
**Rationale**: Neon branching creates an instant copy of the main database per PR. Tests run against an isolated branch. No container startup overhead. No data conflicts between concurrent PRs. Branch is deleted on PR close.
**Tradeoffs**: Requires Neon project with branching enabled. API key management in CI secrets. Free tier has branch limits (10 branches) — sufficient for most teams.

**Decision**: Path-filtered deployments
**Context**: A change to `apps/marketing` shouldn't redeploy the API.
**Options Considered**: (1) Deploy everything on every push, (2) Path-filtered GitHub Actions triggers, (3) Vercel's built-in monorepo detection
**Rationale**: Path filters in GitHub Actions `on.push.paths` ensure each deployment workflow only runs when relevant files change. Combined with Turbo's dependency awareness, this minimizes unnecessary deployments.
**Tradeoffs**: Changes to shared packages (`packages/*`) need to trigger rebuilds of consuming apps. Path filters must include both the app directory AND shared package directories.

### 5.3 API Contracts / Interfaces

**Workflow file contracts**:

```yaml
# ci.yml triggers
on:
  push: { branches: [main, develop] }
  pull_request: { branches: [main, develop] }

# deploy-api.yml triggers
on:
  push:
    branches: [main]
    paths: ['apps/api/**', 'packages/**']

# deploy-web.yml triggers
on:
  push:
    branches: [main]
    paths: ['apps/web/**', 'packages/**']
```

**Required GitHub Secrets**:
```
ANTHROPIC_API_KEY       — for AI code review
NEON_PROJECT_ID         — for database branching
NEON_API_KEY            — for database branching
VERCEL_TOKEN            — for Vercel deployments
VERCEL_ORG_ID           — for Vercel deployments
VERCEL_PROJECT_ID_API   — API project ID
VERCEL_PROJECT_ID_WEB   — web project ID
EXPO_TOKEN              — for EAS builds (optional)
```

### 5.4 File Structure

```
.github/
├── workflows/
│   ├── ci.yml                # Main CI: lint, type-check, test, build
│   ├── ai-code-review.yml    # Claude-powered PR review
│   ├── deploy-api.yml        # Deploy API to Vercel
│   ├── deploy-web.yml        # Deploy web to Vercel
│   ├── deploy-mobile.yml     # Trigger EAS build
│   ├── deploy-desktop.yml    # Trigger electron-builder
│   └── neon-cleanup.yml      # Delete Neon branch on PR close
└── CODEOWNERS                # Code ownership rules
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Create `ci.yml` — main CI pipeline with Bun + Turbo | 30m | PRD-001 (turbo.json) | ✅ Yes | Well-specified in tech spec |
| 2 | Add Neon branching jobs to `ci.yml` | 20m | PRD-003 (Neon project) | ✅ Yes | Use `neondatabase/create-branch-action` |
| 3 | Add migration safety check job | 15m | Task 2 | ✅ Yes | `drizzle-kit generate --check` + `drizzle-kit migrate` |
| 4 | Create `ai-code-review.yml` | 10m | None | ✅ Yes | Short workflow using Claude action |
| 5 | Create `deploy-api.yml` with path filter | 15m | PRD-005 | ✅ Yes | Vercel action with correct project ID |
| 6 | Create `deploy-web.yml` with path filter | 10m | PRD-010 | ✅ Yes | Same pattern as API deploy |
| 7 | Create `deploy-mobile.yml` (EAS trigger) | 15m | PRD-011 | 🟡 Partial | EAS CLI in CI needs human review |
| 8 | Create `deploy-desktop.yml` (electron-builder) | 15m | PRD-012 | 🟡 Partial | Cross-platform build matrix |
| 9 | Create `neon-cleanup.yml` — branch deletion on PR close | 10m | Task 2 | ✅ Yes | Short workflow |
| 10 | Create `.github/CODEOWNERS` | 10m | None | ✅ Yes | Template with placeholder teams |
| 11 | Create Vercel adapter entries for API (`vercel.ts`, `vercel.json`) | 15m | PRD-005 | ✅ Yes | Hono Vercel adapter |
| 12 | Document domain setup (example.com, app.example.com, api.example.com) | 10m | None | ✅ Yes | README section |
| 13 | Test full CI pipeline on a PR | 20m | All above | ❌ No | Manual — create test PR |
| 14 | Test deployment to Vercel | 15m | Tasks 5-6, 11 | ❌ No | Manual — push to main |

### Claude Code Task Annotations

**Task 1 (ci.yml)**:
- **Context needed**: Full CI workflow from spec. Bun setup action (`oven-sh/setup-bun@v2`). Turbo filter syntax. `actions/checkout@v4` with `fetch-depth: 0` for Turbo filtering.
- **Constraints**: Use `--frozen-lockfile` for `bun install`. Use Turbo `--filter=[HEAD^]` for selective CI. Include lint, type-check, test, build as separate steps. Add dependency audit step.
- **Done state**: Workflow file valid YAML. All steps reference correct actions and commands.
- **Verification command**: `act -j test` (local GitHub Actions runner) or push to test branch

**Task 2 (Neon Branching)**:
- **Context needed**: `neondatabase/create-branch-action@v5` usage. Branch naming: `pr-{number}`. Output: `db_url` for downstream jobs.
- **Constraints**: Only run on `pull_request` events. Branch name must be deterministic (same PR always gets same branch). Output `db-url` for migration-check job.
- **Done state**: Neon branch created on PR open, URL available to downstream jobs.
- **Verification command**: Check Neon dashboard for created branch

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | N/A (infrastructure, not code) | — | 0 |
| Integration | CI pipeline runs successfully on test PR | GitHub Actions | 1 |
| E2E | Full deploy pipeline: push to main → live deployment | GitHub Actions + Vercel | 1 |

### Key Test Scenarios

1. **CI passes on clean PR**: Open PR with valid code → all steps green
2. **CI catches type error**: Introduce type error → `type-check` step fails
3. **CI catches lint error**: Introduce lint violation → `lint` step fails
4. **Selective CI**: Change only `apps/marketing` → only marketing tests run
5. **Neon branch created**: PR opened → Neon dashboard shows `pr-{number}` branch
6. **Neon branch deleted**: PR closed → branch no longer exists
7. **Migration check**: Modify schema without generating migration → `drizzle-kit generate --check` fails
8. **Deploy API**: Push API change to main → Vercel deploys new version
9. **AI code review**: PR opened → Claude review comment appears

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| CI duration | < 5 minutes for typical PR | GitHub Actions timing |
| Deploy duration | < 3 minutes per workspace | Vercel deploy logs |
| Neon branch creation | < 10 seconds | GitHub Actions step timing |
| Cache hit rate | > 80% on incremental builds | Turbo cache output |
| Secret security | No secrets exposed in logs | GitHub Actions masking |

---

## 9. Rollout & Migration

1. Create all workflow files in `.github/workflows/`
2. Add required secrets to GitHub repository settings
3. Create test PR to verify CI pipeline
4. Push to main to verify deployment workflows
5. Verify Neon branching on PR open and cleanup on close
6. Verify domain routing after Vercel deployments

**Rollback plan**: Disable individual workflows by renaming files (`.yml` → `.yml.disabled`) or adding `if: false` to jobs. Deployments can be rolled back via Vercel dashboard.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should we enable Vercel Remote Caching for Turbo? | Speeds up CI significantly but requires Vercel team plan | Infra | Open — evaluate cost vs. benefit per-project |
| 2 | Should deploy workflows require manual approval for production? | Adds safety but slows deployment | Architect | Resolved — no approval gate for boilerplate. Add per-project if needed. |
| 3 | Should we use GitHub Environments for staging vs. production? | Enables environment-specific secrets and protection rules | Infra | Open — useful for teams with staging environments. Boilerplate deploys direct to prod. |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
