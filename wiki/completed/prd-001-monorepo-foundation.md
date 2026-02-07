# PRD-001: Monorepo Foundation & Tooling

**PRD ID**: PRD-001
**Title**: Monorepo Foundation & Tooling
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: None — this is the root
**Blocks**: PRD-002, PRD-003, PRD-004, PRD-005, PRD-006, PRD-007, PRD-008, PRD-009, PRD-010, PRD-011, PRD-012, PRD-013, PRD-014, PRD-015, PRD-016

---

## 1. Problem Statement

Every new TypeScript project starts with the same painful yak-shave: setting up a monorepo, configuring the package manager, wiring up build tooling, establishing TypeScript configs, adding linting, formatting, and getting `dev` to start everything simultaneously. This takes 1-2 days every time, and the decisions made in this phase echo through the entire project lifecycle — bad foundations create cascading pain in CI, deployment, and cross-package imports.

The monorepo foundation is the container that every other piece of the boilerplate lives inside. If the workspace structure, path aliases, or Turbo pipeline is wrong, every subsequent PRD inherits that debt. This PRD exists to make that foundation rock-solid so that PRDs 002-016 can focus on their domain without fighting the toolchain.

The specific pain points this solves: inconsistent TypeScript configs across workspaces, broken cross-package imports, slow dev startup because `dev` doesn't orchestrate multiple services, and dependency boundary violations that create circular imports nobody catches until production.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| Workspace resolution | `bun install` resolves all workspace dependencies | Zero resolution errors |
| TypeScript compilation | `bun turbo type-check` passes across all workspaces | Zero type errors in empty boilerplate |
| Dev orchestration | `bun turbo dev` starts all workspaces simultaneously | All workspaces running within 5s |
| Selective builds | `bun turbo build --filter=[HEAD^]` only rebuilds changed packages | Turbo cache hit rate visible in output |
| Dependency boundaries | ESLint catches invalid cross-package imports | `bun turbo lint` fails on boundary violations |
| Path aliases | `@packages/*` and `@/*` resolve correctly in every workspace | Import autocomplete works in VS Code |
| Clean state | `bun clean` removes all build artifacts and node_modules | Single command resets to fresh state |

---

## 3. Scope

### In Scope

- Root `package.json` with Bun workspaces (`packages/*`, `apps/*`)
- `bunfig.toml` configuration
- `turbo.json` with all pipeline tasks: `build`, `dev`, `lint`, `type-check`, `test`, `db:*`
- `tsconfig.base.json` with path aliases (`@packages/*`, `@/*`)
- Per-workspace `tsconfig.json` templates that extend base
- `.eslintrc.json` with `eslint-plugin-boundaries` dependency rules
- `.prettierrc` shared config
- `.gitignore` (node_modules, dist, .next, .env.local, coverage, etc.)
- Root `.env.example` with placeholder structure
- Empty workspace scaffolds for: `packages/shared/`, `packages/database/`, `packages/auth/`, `packages/ai-integrations/`, `apps/api/`, `apps/web/`, `apps/mobile/`, `apps/desktop/`, `apps/marketing/`
- Each scaffold has: `package.json`, `tsconfig.json`, empty `src/` directory
- `README.md` and `CONTRIBUTING.md` templates
- `.github/CODEOWNERS` template

### Out of Scope

- Application code in any workspace (PRDs 002-013)
- Database setup, schemas, migrations (PRD-003)
- Authentication logic (PRD-006)
- CI/CD workflows (PRD-014) — only the `.github/workflows/` directory scaffold
- Testing infrastructure beyond Bun test runner config (PRD-015)
- Any actual tRPC, Hono, Next.js, Expo, or Electron code

### Assumptions

- Bun >= 1.1 is installed on developer machines
- Git is initialized
- Developer is on macOS or Linux (Bun's primary targets)
- Node.js 20+ is available for Expo/Electron compatibility

---

## 4. System Context

This PRD is the root of the entire dependency tree. It creates the container that every other PRD fills.

```
PRD-001 (This PRD)
    │
    ├── packages/shared/        ← PRD-002 (types, utils), PRD-004 (ui, hooks, api-client)
    ├── packages/database/      ← PRD-003
    ├── packages/auth/          ← PRD-006
    ├── packages/ai-integrations/ ← PRD-009
    ├── apps/api/               ← PRD-005
    ├── apps/web/               ← PRD-010
    ├── apps/mobile/            ← PRD-011
    ├── apps/desktop/           ← PRD-012
    ├── apps/marketing/         ← PRD-013
    ├── .github/workflows/      ← PRD-014
    └── root config files       ← turbo.json, tsconfig, eslint, prettier
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| Nothing | This is the root PRD |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| Every PRD (002-016) | Workspace structure, TypeScript config, Turbo pipeline, lint rules |
| CI pipeline (PRD-014) | `turbo.json` tasks define what CI runs |
| Developers | `bun turbo dev` is the daily driver command |

---

## 5. Technical Design

### 5.1 Data Model / Types

No domain types in this PRD. The only "types" are the TypeScript compiler configuration.

```typescript
// tsconfig.base.json — the base every workspace extends
{
  "compilerOptions": {
    "strict": true,
    "target": "ESNext",
    "lib": ["ESNext", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "noEmit": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "baseUrl": ".",
    "paths": {
      "@packages/*": ["packages/*/src"],
      "@/*": ["./src/*"]
    },
    "types": ["bun-types"]
  }
}
```

### 5.2 Architecture Decisions

**Decision**: Bun as primary runtime and package manager
**Context**: Need a fast, TypeScript-native runtime for the API server and dev tooling.
**Options Considered**: Node.js + pnpm, Bun, Deno
**Rationale**: Bun offers native TypeScript execution (no transpile step), fastest package installs, built-in test runner, and excellent monorepo workspace support. Node.js compatibility is maintained where needed (Expo, Electron).
**Tradeoffs**: Bun's ecosystem is younger — some edge cases with npm packages. Expo and Electron still run on Node.js, so we maintain dual-runtime compatibility.

**Decision**: Turborepo for build orchestration
**Context**: Need to run tasks across workspaces with dependency awareness and caching.
**Options Considered**: Turborepo, Nx, custom scripts
**Rationale**: Turbo is lightweight (single `turbo.json`), has excellent Vercel integration, supports remote caching, and handles `--filter` for selective CI. Nx is more powerful but heavier and opinionated.
**Tradeoffs**: No built-in code generation (Nx has generators). Less granular task graph visualization.

**Decision**: `eslint-plugin-boundaries` for dependency enforcement
**Context**: Need to prevent circular imports and maintain clean package boundaries at lint time, not just at review time.
**Options Considered**: Code review convention, custom ESLint rule, `eslint-plugin-boundaries`, `depcheck`
**Rationale**: `eslint-plugin-boundaries` fails the build on invalid imports. It's declarative (configured in `.eslintrc.json`) and catches violations before code review.
**Tradeoffs**: Adds ESLint complexity. New developers need to understand the boundary rules.

**Decision**: Path alias strategy — `@packages/*` and `@/*`
**Context**: Cross-package imports need to be clean and autocomplete-friendly.
**Options Considered**: Relative paths, `@project-name/*` scoped packages, `@packages/*` alias
**Rationale**: `@packages/*` is clear and doesn't collide with npm scoped packages. `@/*` is the standard Next.js convention for intra-workspace imports. Both resolve via `tsconfig.json` paths.
**Tradeoffs**: Requires `paths` config in every workspace's `tsconfig.json`. Some tools (jest, vitest) need additional path mapping config.

### 5.3 API Contracts / Interfaces

This PRD doesn't expose APIs. It exposes **conventions**:

**Workspace naming convention**:
- Packages: `@[project-name]/shared`, `@[project-name]/database`, `@[project-name]/auth`, `@[project-name]/ai-integrations`
- Apps: `@[project-name]/api`, `@[project-name]/web`, `@[project-name]/mobile`, `@[project-name]/desktop`, `@[project-name]/marketing`

**Turbo task contract** — every workspace must support these scripts (if applicable):
- `dev` — start development server
- `build` — production build
- `lint` — ESLint check
- `type-check` — `tsc --noEmit`
- `test` — run tests

**Dependency boundary rules** (enforced via ESLint):
```
packages/shared/types    → imports NOTHING (leaf node)
packages/shared/utils    → can import: shared/types
packages/shared/ai       → can import: shared/types
packages/database        → can import: shared/types
packages/auth            → can import: database, shared/types
packages/ai-integrations → can import: shared/types, shared/ai
apps/*                   → can import: any package
```

### 5.4 File Structure

```
[project-name]/
├── .github/
│   ├── workflows/           # Empty — PRD-014 fills this
│   └── CODEOWNERS           # Template with placeholder teams
│
├── packages/
│   ├── shared/
│   │   ├── package.json     # Workspace package with name, dependencies placeholder
│   │   ├── tsconfig.json    # Extends ../../tsconfig.base.json
│   │   └── src/
│   │       └── index.ts     # Empty re-export file
│   ├── database/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   ├── auth/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   └── ai-integrations/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── index.ts
│
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── index.ts
│   ├── web/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── .gitkeep
│   ├── mobile/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── .gitkeep
│   ├── desktop/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── src/
│   │       └── .gitkeep
│   └── marketing/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           └── .gitkeep
│
├── turbo.json
├── package.json              # Root workspace config
├── bunfig.toml
├── tsconfig.base.json
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── .env.example
├── README.md
└── CONTRIBUTING.md
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Create root config files (`package.json`, `bunfig.toml`, `turbo.json`, `tsconfig.base.json`) | 30m | None | ✅ Yes | Pure boilerplate, well-defined spec |
| 2 | Create linting & formatting config (`.eslintrc.json` with boundaries, `.prettierrc`) | 30m | Task 1 | ✅ Yes | Declarative config files |
| 3 | Scaffold all workspace directories with `package.json` and `tsconfig.json` | 45m | Task 1 | ✅ Yes | 9 workspaces, repetitive structure |
| 4 | Create `.gitignore`, `.env.example`, `CODEOWNERS` | 15m | Task 1 | ✅ Yes | Standard files |
| 5 | Create `README.md` and `CONTRIBUTING.md` templates | 30m | Task 4 | ✅ Yes | Documentation scaffolding |
| 6 | Install dependencies and verify `bun install` resolves | 15m | Tasks 1-3 | ❌ No | Manual verification |
| 7 | Verify `bun turbo dev` starts all workspaces | 15m | Task 6 | ❌ No | Manual verification |
| 8 | Verify `bun turbo type-check` passes across all workspaces | 15m | Task 6 | ❌ No | Manual verification |
| 9 | Test dependency boundary violations are caught by lint | 15m | Task 6 | 🟡 Partial | Create intentional violation, verify lint catches it |

### Claude Code Task Annotations

**Tasks 1-5 (Scaffolding)**:
- **Context needed**: The full file structure from section 5.4, the exact config contents from the tech spec (turbo.json, tsconfig.base.json, package.json), and the workspace naming convention `@[project-name]/*`
- **Constraints**: Do NOT add any application dependencies (no hono, no next, no trpc). Only tooling deps: turbo, typescript, eslint, prettier, eslint-plugin-boundaries, bun-types. Do NOT create any business logic files.
- **Done state**: All files exist with correct content. `bun install` runs without errors.
- **Verification command**: `bun install && bun turbo type-check`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | N/A — no business logic | — | 0 |
| Integration | Workspace resolution, Turbo pipeline | Manual + script | 3-5 checks |
| E2E | N/A | — | 0 |

### Key Test Scenarios

1. **Happy path**: `bun install` → `bun turbo type-check` → `bun turbo lint` all pass on fresh clone
2. **Boundary violation**: Add an import from `packages/shared/types` → `packages/database` (forbidden direction). `bun turbo lint` should fail.
3. **Selective build**: Change a file in `packages/shared/`, run `bun turbo build --filter=[HEAD^]`. Only affected workspaces rebuild.
4. **Dev orchestration**: `bun turbo dev` starts all workspace dev servers. Ctrl+C stops them all cleanly.

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Install speed | `bun install` < 10s on warm cache | Timed locally |
| Type-check speed | `bun turbo type-check` < 15s across all workspaces | Timed locally |
| Dev startup | All workspaces running within 5s of `bun turbo dev` | Manual observation |
| Disk footprint | `node_modules` < 200MB for empty boilerplate | `du -sh node_modules` |

---

## 9. Rollout & Migration

This is the first PRD — there's nothing to migrate from. Rollout is:

1. Create new Git repository
2. Run scaffolding tasks (or use template repo)
3. `bun install`
4. Verify with success criteria checks
5. Commit as initial commit

**Rollback plan**: This is the initial state. If something is wrong, fix it in place.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should we use `@project-name/*` scoped packages or generic `@packages/*` aliases? | Affects every import statement in the project | Architect | Resolved — using `@[project-name]/*` for package.json names, `@packages/*` for TS path aliases |
| 2 | Do we need a shared Tailwind config at root or per-app? | Affects PRD-004 and PRD-010 | Frontend lead | Resolved — shared `tailwind.config.ts` at root, apps extend it |
| 3 | Should `packages/shared/` be one package or split into `packages/types/`, `packages/utils/`, etc.? | Affects granularity of dependency boundaries | Architect | Resolved — single `packages/shared/` package with subdirectories for types, utils, ui, hooks, api-client, ai |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
