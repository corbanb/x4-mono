# CLAUDE.md — x4-mono

## Project Overview

x4-mono is a full-stack TypeScript monorepo boilerplate for building multi-platform applications (web, mobile, desktop) with a shared backend. It provides a production-ready foundation with type-safe APIs, authentication, database ORM, AI integration, and CI/CD — all wired together with consistent conventions.

## Architecture

- **Runtime**: Bun (primary), Node.js (Expo/Electron compatibility)
- **Monorepo**: Bun workspaces + Turborepo for orchestration
- **API**: Hono + tRPC v11 on Bun (`apps/api`, port 3002)
- **Web**: Next.js 15 App Router (`apps/web`, port 3000)
- **Mobile**: Expo + React Native (`apps/mobile`)
- **Desktop**: Electron (`apps/desktop`)
- **Marketing**: Next.js static (`apps/marketing`, port 3001)
- **Database**: Neon (Postgres) + Drizzle ORM (`packages/database`)
- **Auth**: Better Auth with bearer tokens (`packages/auth`)
- **AI**: Vercel AI SDK + Claude (`packages/ai-integrations`)
- **Validation**: Zod (source of truth for all types)
- **Logging**: Pino with structured child loggers
- **Linting**: ESLint + eslint-plugin-boundaries
- **Formatting**: Prettier

## Workspace Structure

```
packages/
  shared/               # Types, validators, utils, UI components, hooks, API client
  database/             # Drizzle schema, migrations, seed, db client
  auth/                 # Better Auth config, session management
  ai-integrations/      # Vercel AI SDK provider configs, streaming helpers

apps/
  api/                  # Hono + tRPC server (standalone backend)
  web/                  # Next.js 15 App Router (primary web client)
  mobile/               # Expo + React Native
  desktop/              # Electron wrapper
  marketing/            # Next.js static marketing site
```

## Dependency Boundaries

Enforced by `eslint-plugin-boundaries`. Violations fail the lint step.

```
packages/shared/types    → imports NOTHING (leaf node)
packages/shared/utils    → can import: shared/types
packages/database        → can import: shared/types
packages/auth            → can import: database, shared/types
packages/ai-integrations → can import: shared/types
apps/*                   → can import: any package
```

**NEVER import from `apps/*` in `packages/*`.** This is the most important boundary.

## Key Conventions

### Types
- Zod schemas are the **source of truth** for all types
- Define schemas in `packages/shared/` → infer types with `z.infer<typeof Schema>`
- Never duplicate types manually — always derive from Zod

### Errors
- Use `Errors.*` constructors (defined in `apps/api/src/lib/errors.ts`)
- Map to `TRPCError` codes: `NOT_FOUND`, `UNAUTHORIZED`, `FORBIDDEN`, `BAD_REQUEST`
- Include `cause` for error chaining

### Auth
- `publicProcedure` — no auth required
- `protectedProcedure` — requires valid session (has `ctx.user`)
- `adminProcedure` — requires admin role
- Check resource ownership in mutations: `ownerId === ctx.user.userId || isAdmin`

### Logging
- Use Pino child loggers: `apiLogger`, `dbLogger`, `authLogger`, `aiLogger`
- **Never use `console.log` in production code**
- Structured JSON logging with request IDs

### Imports
- `@packages/*` — cross-package imports (resolves via tsconfig paths)
- `@/*` — intra-workspace imports (e.g., `@/components/Button`)
- Always use path aliases, never relative paths across package boundaries

### Naming
- **Files**: kebab-case (`user-profile.ts`, `create-project.tsx`)
- **Components**: PascalCase (`UserProfile`, `CreateProjectForm`)
- **Functions/variables**: camelCase (`getUserById`, `isAuthenticated`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRY_COUNT`, `API_BASE_URL`)
- **Database tables**: snake_case (`user_profiles`, `ai_usage_logs`)
- **tRPC routers**: camelCase namespace (`projects.create`, `users.me`)

## Available Commands & Agents

All commands are invoked as slash commands (e.g., `/backend`, `/add-schema`).

### Specialist Agents

| Command | Description |
|---------|-------------|
| `/backend` | Backend architecture expert — Hono, tRPC v11, API design review |
| `/frontend` | Frontend architecture expert — Next.js 15, React 19, component design |
| `/database` | Database & schema expert — Drizzle ORM, Neon Postgres, data modeling |
| `/testing` | Testing strategy expert — Bun test runner, test pyramid, test patterns |
| `/security` | Security & auth expert — Better Auth, OWASP top 10, token management |
| `/devops` | CI/CD & infrastructure expert — GitHub Actions, Turborepo, deployment |

### Scaffolding

| Command | Description |
|---------|-------------|
| `/add-schema` | Zod schemas + inferred types for an entity |
| `/add-router` | tRPC router with CRUD procedures and tests |
| `/add-table` | Drizzle database table with migration and seed data |
| `/add-middleware` | Hono middleware with test file |
| `/add-page` | Next.js App Router page with Server/Client split |
| `/add-form` | react-hook-form wired to tRPC mutation |
| `/add-hook` | Shared React hook in packages/shared/hooks/ |
| `/add-env` | Environment variable 3-way sync (env.ts, .env.example, CLAUDE.md) |
| `/add-test` | Generate tests for an existing source file |
| `/add-workflow` | GitHub Actions workflow scaffold |

### PRD Lifecycle

| Command | Description |
|---------|-------------|
| `/new-prd` | Create a new PRD from template |
| `/review-prd` | Review PRD for completeness and quality |
| `/implement-task` | Implement a specific PRD task |
| `/move-prd` | Move PRD between lifecycle stages (inbox → active → completed → archived) |
| `/check-prd` | Verify PRD completion against success criteria |
| `/next-prd` | Auto-detect and implement the next PRD in dependency order |

### Quality & Shipping

| Command | Description |
|---------|-------------|
| `/check-boundaries` | Audit for convention violations and dependency boundary issues |
| `/ship` | Branch, commit, and open a pull request (with boundary check) |

## Middleware Order

Hono middleware is applied in this order. New middleware must be inserted at the correct position:

```
requestLogger → CORS → rate limiting → auth → route-specific
```

## Test Patterns

| Source Location | Test Pattern | Key Import |
|---|---|---|
| `apps/api/src/routers/*.ts` | tRPC caller | `createCaller`, `createTestContext` from `bun:test` |
| `apps/api/src/middleware/*.ts` | Hono request | `app.request()` from `bun:test` |
| `apps/api/src/lib/*.ts` | Unit test | Direct function calls from `bun:test` |
| `packages/shared/utils/*.ts` | Unit test | Direct function calls from `bun:test` |
| `packages/shared/types/*.ts` | Schema validation | Zod `.parse()` / `.safeParse()` from `bun:test` |
| `apps/web/src/components/*.tsx` | Component test | `@testing-library/react` from `bun:test` |

## PRD System

All work is tracked through PRDs in `wiki/`. See [wiki/status.md](wiki/status.md) for the full PRD inventory, dependency graph, and progress log.

### Lifecycle
- `wiki/inbox/` — Unstarted PRDs
- `wiki/active/` — Currently being implemented
- `wiki/completed/` — Verified against success criteria
- `wiki/archived/` — Superseded or abandoned

### Implementation Order
PRD-001 → PRD-002 → PRD-003 → PRD-004/005 → PRD-006 → PRD-007 → PRD-008 → PRD-009 → PRD-010 → PRD-011/012 → PRD-013 → PRD-014 → PRD-015 → PRD-016

### Task Annotations
Each PRD Section 6 contains a task table with columns: Task #, Description, Estimate, Dependencies, Claude Code Candidate, Notes. Tasks marked "Yes" or "Partial" include annotation blocks with: Context needed, Constraints, Done state, Verification command.

## Common Tasks

### Add a tRPC router
1. Create `apps/api/src/routers/{name}.ts`
2. Define procedures using `publicProcedure` / `protectedProcedure`
3. Add Zod input schemas (import from `packages/shared/`)
4. Register in `appRouter` at `apps/api/src/routers/index.ts`
5. Run `bun turbo type-check` to verify `AppRouter` type updates
6. Create test file `apps/api/src/routers/{name}.test.ts`

### Add a database table
1. Add table definition to `packages/database/schema.ts` using `pgTable()`
2. Add relations if needed in the same file
3. Include standard columns: `id` (uuid), `createdAt`, `updatedAt`
4. Run `bun db:generate` to create migration
5. Run `bun db:push` (dev) or `bun db:migrate` (prod)
6. Add seed data to `packages/database/seed.ts`

### Add a shared type
1. Define Zod schema in `packages/shared/types/` or `packages/shared/utils/validators.ts`
2. Export inferred type: `export type MyType = z.infer<typeof MyTypeSchema>`
3. Import in consumers: `import { MyTypeSchema, type MyType } from "@packages/shared"`

### Add a UI component
- **Cross-platform**: `packages/shared/ui/{ComponentName}.tsx`
- **Web-only**: `apps/web/src/components/{ComponentName}.tsx`
- **Mobile-only**: `apps/mobile/src/components/{ComponentName}.tsx`

### Implement a PRD task
1. Read the PRD in `wiki/` (check inbox, active, or completed)
2. Find the task in Section 6 (Implementation Plan)
3. Read the Claude Code Task Annotations block
4. Implement following the constraints
5. Run the verification command
6. Update the PRD status if all tasks are complete

### Create a new PRD
1. Copy `wiki/_templates/prd-template.md` to `wiki/inbox/prd-NNN-short-slug.md`
2. Fill all 11 sections
3. Update `wiki/status.md` inventory table and dependency graph

## Key Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install all workspace dependencies |
| `bun turbo dev` | Start all workspaces in dev mode |
| `bun turbo build` | Build all workspaces |
| `bun turbo type-check` | TypeScript type checking across all workspaces |
| `bun turbo lint` | ESLint across all workspaces |
| `bun turbo test` | Run tests across all workspaces |
| `bun db:generate` | Generate Drizzle migration from schema changes |
| `bun db:push` | Push schema to dev database (no migration file) |
| `bun db:migrate` | Run migrations against production database |
| `bun db:studio` | Open Drizzle Studio (database GUI) |
| `bun db:seed` | Seed database with test data |
| `bun clean` | Remove all build artifacts and node_modules |

## Do NOT

- **Do NOT use `console.log`** — use Pino structured logger
- **Do NOT use `any` type** — use `unknown` and narrow, or define proper types
- **Do NOT create types manually** when a Zod schema exists — use `z.infer<>`
- **Do NOT import from `apps/*` in `packages/*`** — dependency boundary violation
- **Do NOT add API routes to `apps/web`** — API is standalone in `apps/api`
- **Do NOT hard-code environment variables** — use the env validation module
- **Do NOT use Express** — use Hono
- **Do NOT use Prisma** — use Drizzle ORM
- **Do NOT use NextAuth/Auth.js** — use Better Auth
- **Do NOT use `jest`** — use Bun's built-in test runner
- **Do NOT skip input validation** — every tRPC procedure needs a Zod `.input()` schema
- **Do NOT use `--force` with git push** — coordinate with the team
- **Do NOT commit `.env.local`** — only `.env.example` is tracked

## Tech Stack Versions

| Package | Version |
|---------|---------|
| Bun | >= 1.1 |
| TypeScript | ~5.6 |
| Turborepo | latest |
| Hono | ~4.x |
| tRPC | ~11.x |
| Next.js | ~15.x |
| React | ~19.x |
| Expo | ~52.x |
| Electron | ~33.x |
| Drizzle ORM | latest |
| Better Auth | latest |
| Vercel AI SDK | ~4.x |
| Zod | ~3.x |
| Pino | ~9.x |
| Tailwind CSS | ~4.x |

## Environment Variables

Key environment variables (defined in `apps/api/src/lib/env.ts`):

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Neon Postgres connection string | Yes |
| `JWT_SECRET` | Secret for token signing (min 32 chars) | Yes |
| `ANTHROPIC_API_KEY` | Claude API key (starts with `sk-`) | Yes |
| `PORT` | API server port (default: 3002) | No |
| `WEB_URL` | Web app URL for CORS (default: `http://localhost:3000`) | No |
| `MARKETING_URL` | Marketing site URL for CORS (default: `http://localhost:3001`) | No |
| `NODE_ENV` | `development` / `production` / `test` | No |
| `APP_VERSION` | App version string | No |
