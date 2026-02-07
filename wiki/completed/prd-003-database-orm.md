# PRD-003: Database & ORM Layer

**PRD ID**: PRD-003
**Title**: Database & ORM Layer
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-001 (Monorepo Foundation), PRD-002 (Shared Types)
**Blocks**: PRD-005 (API Server), PRD-006 (Auth), PRD-008 (Caching), PRD-014 (CI/CD — Neon branching)

---

## 1. Problem Statement

Every project needs a database, and every project makes the same set of early decisions: which database, which ORM, how to handle migrations, how to seed dev data, and how the database client integrates with the serverless deployment model. Get these wrong and you're either fighting connection pooling issues in production, dealing with Prisma's binary engine bloat on edge runtimes, or manually writing SQL because your ORM doesn't generate what you need.

For a serverless-first stack deployed to Vercel and Cloudflare Workers, the database must handle HTTP-based connections (no persistent TCP sockets), scale to zero when idle, and support branching for isolated PR environments. The ORM must work across Bun, Node.js, and edge runtimes without a heavy runtime engine.

This PRD sets up Neon (serverless PostgreSQL) with Drizzle ORM — a combination that gives us type-safe SQL generation with zero runtime overhead, HTTP-based connections that work everywhere, and database branching that integrates directly into CI. The schema, client, migrations, and seed script all live in `packages/database/` so every workspace imports from one place.

---

## 2. Success Criteria

| Criteria | Measurement | Target |
|----------|-------------|--------|
| Type-safe queries | Drizzle queries are fully typed — no `any` in query results | `bun turbo type-check` passes with zero `any` in db layer |
| Migration workflow | `drizzle-kit generate` produces SQL from schema changes | Generated SQL matches schema diff |
| Schema push (dev) | `drizzle-kit push` applies schema to Neon dev DB | Schema matches expected tables/columns |
| Seed data | `bun db:seed` populates dev database with test data | Admin + user accounts, 2+ projects exist after seed |
| Cross-runtime | Database client works in Bun, Node.js, and edge | Import and query from `apps/api` (Bun) and `apps/web` (Node/Edge) |
| Re-exports | `import { db, users, projects } from "@packages/database"` works | Single import path for all consumers |
| Drizzle Studio | `bun db:studio` opens visual DB explorer | Studio connects and shows tables |

---

## 3. Scope

### In Scope

- `packages/database/` package structure
- Neon serverless client setup (`@neondatabase/serverless` + `drizzle-orm/neon-http`)
- Drizzle schema: `users`, `projects`, `aiUsageLog` tables
- Enums: `userRoleEnum` (`user`, `admin`)
- Indexes: owner, status, created_at where needed
- Relations: `usersRelations`, `projectsRelations`, `aiUsageLogRelations`
- pgvector readiness: commented-out `embeddings` table template
- `drizzle.config.ts` for drizzle-kit
- `client.ts` — Neon HTTP driver + Drizzle instance
- `index.ts` — re-exports `db`, all schema exports
- `seed.ts` — creates admin user, regular user, sample projects
- `migrate.ts` — migration runner script
- Turbo tasks: `db:generate`, `db:push`, `db:migrate`, `db:studio`, `db:seed`
- `$onUpdate()` for automatic `updatedAt` timestamps

### Out of Scope

- Better Auth tables (PRD-006 — Better Auth CLI generates its own tables)
- Neon branching in CI (PRD-014)
- Caching layer (PRD-008)
- Read replica setup (documented as future path, not implemented)
- Vector search implementation (pgvector template provided, not activated)
- Connection pooling config (Neon handles this server-side)

### Assumptions

- Neon project has been created at console.neon.tech
- `DATABASE_URL` environment variable is set in `.env.local`
- PostgreSQL 15+ features are available (Neon default)
- PRD-001 workspace structure is in place
- PRD-002 domain types exist (for reference, not direct import in schema)

---

## 4. System Context

```
packages/shared/types   (PRD-002)
       ↓ (referenced for domain shape — NOT imported at runtime)
packages/database       ← This PRD
       ↓
  ├── apps/api          (PRD-005: db in tRPC context)
  ├── packages/auth     (PRD-006: Better Auth Drizzle adapter)
  └── PRD-014           (CI: Neon branching, migration checks)
```

### Dependency Map

| Depends On | What It Provides |
|------------|-----------------|
| PRD-001 (Monorepo Foundation) | Workspace structure, Turbo db:* tasks |
| PRD-002 (Shared Types) | Domain type shapes informing schema design (reference only) |

### Consumed By

| Consumer | How It's Used |
|----------|--------------|
| apps/api (PRD-005) | `db` instance in tRPC context, schema imports for queries |
| packages/auth (PRD-006) | `db` instance for Better Auth's Drizzle adapter |
| CI pipeline (PRD-014) | `drizzle-kit generate --check` and `drizzle-kit migrate` on Neon branches |
| Developers | `bun db:studio` for visual DB exploration, `bun db:seed` for dev data |

---

## 5. Technical Design

### 5.1 Data Model / Types

**Drizzle Schema** — the complete database structure:

```typescript
// packages/database/schema.ts
import {
  pgTable, uuid, varchar, text, timestamp,
  boolean, pgEnum, index, vector,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { relations } from "drizzle-orm";

// --- Enums ---
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// --- Tables ---
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).unique().notNull(),
  name: varchar({ length: 255 }).notNull(),
  passwordHash: varchar({ length: 255 }),
  role: userRoleEnum().default("user"),
  emailVerified: boolean().default(false),
  createdAt: timestamp().default(sql`now()`).notNull(),
  updatedAt: timestamp().default(sql`now()`).notNull().$onUpdate(() => new Date()),
});

export const projects = pgTable(
  "projects",
  {
    id: uuid().primaryKey().defaultRandom(),
    ownerId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    status: varchar({ length: 50 }).default("active"),
    createdAt: timestamp().default(sql`now()`).notNull(),
    updatedAt: timestamp().default(sql`now()`).notNull().$onUpdate(() => new Date()),
  },
  (table) => ({
    ownerIdx: index("idx_projects_owner_id").on(table.ownerId),
    statusIdx: index("idx_projects_status").on(table.status),
  })
);

export const aiUsageLog = pgTable(
  "ai_usage_log",
  {
    id: uuid().primaryKey().defaultRandom(),
    userId: uuid().notNull().references(() => users.id, { onDelete: "cascade" }),
    model: varchar({ length: 100 }).notNull(),
    tokensUsed: varchar({ length: 50 }).notNull(),
    estimatedCost: varchar({ length: 50 }),
    endpoint: varchar({ length: 255 }),
    createdAt: timestamp().default(sql`now()`).notNull(),
  },
  (table) => ({
    userIdx: index("idx_ai_usage_user_id").on(table.userId),
    createdIdx: index("idx_ai_usage_created").on(table.createdAt),
  })
);

// --- Relations ---
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  aiUsage: many(aiUsageLog),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  owner: one(users, { fields: [projects.ownerId], references: [users.id] }),
}));

export const aiUsageLogRelations = relations(aiUsageLog, ({ one }) => ({
  user: one(users, { fields: [aiUsageLog.userId], references: [users.id] }),
}));
```

### 5.2 Architecture Decisions

**Decision**: Neon serverless PostgreSQL (direct, not via Vercel Postgres wrapper)
**Context**: Need a database that works with serverless/edge deployments without persistent connections.
**Options Considered**: Neon (direct), Vercel Postgres (Neon wrapper), Supabase, PlanetScale, AWS RDS
**Rationale**: Neon is serverless-native (HTTP-based connections), has database branching (isolated DB per PR), pgvector support for AI embeddings, and is platform-independent (not locked to Vercel). Scales to zero on free tier.
**Tradeoffs**: Less mature than RDS. Neon's connection pooler handles most scaling, but very high-throughput writes may need RDS. Graduation path documented.

**Decision**: Drizzle ORM over Prisma
**Context**: Need type-safe database queries that work across Bun, Node.js, and edge runtimes.
**Options Considered**: Drizzle, Prisma, Kysely, raw SQL
**Rationale**: Drizzle has zero runtime overhead (no query engine binary like Prisma), works on every runtime, generates readable SQL, and has excellent migration tooling. `$onUpdate()` handles timestamps automatically.
**Tradeoffs**: Less "magical" than Prisma — you write more SQL-like code. No Prisma Studio equivalent (Drizzle Studio is newer). Smaller ecosystem of plugins.

**Decision**: `$onUpdate()` for `updatedAt` timestamps instead of database triggers
**Context**: Need automatic timestamp updates on every row modification.
**Options Considered**: Database trigger, Drizzle `$onUpdate()`, manual `new Date()` in every update
**Rationale**: `$onUpdate()` is runtime-only in Drizzle — it hooks into every `.update()` call automatically. No trigger maintenance, works the same on every Postgres provider.
**Tradeoffs**: Only works when updates go through Drizzle. Direct SQL updates bypass it. Acceptable for our use case since all writes go through the API.

### 5.3 API Contracts / Interfaces

```typescript
// packages/database/index.ts — public surface
export { db } from "./client";
export * from "./schema";

// Usage in consumers:
import { db, users, projects, aiUsageLog } from "@packages/database";
import { eq, desc, and, like } from "drizzle-orm";

// Relation queries via db.query.*
const userWithProjects = await db.query.users.findFirst({
  where: eq(users.email, "user@example.com"),
  with: { projects: true },
});
```

### 5.4 File Structure

```
packages/database/
├── schema.ts             # All table definitions, enums, relations
├── client.ts             # Neon serverless driver + Drizzle instance
├── index.ts              # Re-exports: db, schema, types
├── migrations/           # drizzle-kit generated SQL files
│   └── .gitkeep
├── migrate.ts            # Migration runner script
├── seed.ts               # Dev data seeding
├── drizzle.config.ts     # drizzle-kit configuration
├── package.json          # deps: @neondatabase/serverless, drizzle-orm, drizzle-kit
└── tsconfig.json
```

---

## 6. Implementation Plan

### Task Breakdown

| # | Task | Estimate | Dependencies | Claude Code Candidate? | Notes |
|---|------|----------|-------------|----------------------|-------|
| 1 | Create `packages/database/package.json` and `tsconfig.json` | 15m | PRD-001 | ✅ Yes | Config files |
| 2 | Implement `client.ts` — Neon driver + Drizzle setup | 20m | Task 1 | ✅ Yes | Well-specified in tech spec |
| 3 | Implement `schema.ts` — all tables, enums, indexes, relations | 45m | Task 2 | 🟡 Partial | AI generates from spec, human reviews column choices |
| 4 | Implement `drizzle.config.ts` | 10m | Task 2 | ✅ Yes | Small config file |
| 5 | Implement `index.ts` re-exports | 5m | Tasks 2-3 | ✅ Yes | Simple re-exports |
| 6 | Implement `seed.ts` | 30m | Task 3 | ✅ Yes | Mechanical — insert test data |
| 7 | Implement `migrate.ts` runner | 15m | Task 4 | ✅ Yes | Standard Drizzle migration runner |
| 8 | Add Turbo tasks to root `package.json` | 10m | Task 4 | ✅ Yes | Add db:* scripts |
| 9 | Generate initial migration and push to Neon | 15m | Task 3 | ❌ No | Requires live DB connection |
| 10 | Run seed script and verify with Drizzle Studio | 15m | Tasks 6, 9 | ❌ No | Manual verification |
| 11 | Write unit tests for schema exports and query patterns | 30m | Task 5 | ✅ Yes | Test type exports, basic query construction |

### Claude Code Task Annotations

**Task 3 (Schema)**:
- **Context needed**: Full schema from tech spec section "Schema Design". Domain types from PRD-002 for reference. Drizzle ORM pg-core API.
- **Constraints**: Include ALL indexes specified in spec. Use `$onUpdate()` for `updatedAt`. Keep pgvector embeddings table commented out. Do NOT import from `@packages/shared` — schema is self-contained.
- **Done state**: `bun turbo type-check --filter=@[project-name]/database` passes. Schema exports all tables, enums, and relations.
- **Verification command**: `cd packages/database && bun type-check`

**Task 6 (Seed)**:
- **Context needed**: Schema tables and their column types. Need to create: 1 admin user, 1 regular user, 2 projects (one per user).
- **Constraints**: Use `.returning()` to get IDs for foreign keys. Handle `process.exit()` for clean script termination. Use `console.log` for progress output.
- **Done state**: `bun db:seed` creates all test data without errors.
- **Verification command**: `DATABASE_URL=... bun run packages/database/seed.ts`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level | What's Tested | Tool | Count (approx) |
|-------|--------------|------|----------------|
| Unit | Schema exports, type inference, query builder shapes | Bun test | 10-15 |
| Integration | CRUD operations against Neon branch | Bun test + Neon branch | 8-12 |
| E2E | N/A | — | 0 |

### Key Test Scenarios

1. **Happy path**: Insert user → insert project (with ownerId) → query project with relation → get user included
2. **Cascade delete**: Delete user → verify projects are cascade-deleted
3. **Unique constraint**: Insert duplicate email → expect error
4. **$onUpdate**: Update project name → verify `updatedAt` is automatically refreshed
5. **Schema completeness**: All tables have expected columns (verified by TypeScript, not runtime)
6. **Seed idempotency**: Running seed twice doesn't crash (handles existing data gracefully)

---

## 8. Non-Functional Requirements

| Requirement | Target | How Verified |
|-------------|--------|-------------|
| Query latency | Simple SELECT < 50ms from serverless function | Measured in integration tests |
| Cold start | Neon connection establishment < 200ms | Measured in integration tests |
| Migration safety | `drizzle-kit generate --check` catches schema/migration drift | CI job (PRD-014) |
| Zero runtime overhead | No Prisma-like binary engine in `node_modules` | `ls node_modules/.prisma` should not exist |
| pgvector ready | Embeddings table template compiles when uncommented | Type-check after uncommenting |

---

## 9. Rollout & Migration

1. Create Neon project and obtain `DATABASE_URL`
2. Set `DATABASE_URL` in `.env.local`
3. Run `bun db:push` to apply schema to dev database
4. Run `bun db:seed` to populate test data
5. Verify with `bun db:studio`
6. Generate initial migration: `bun db:generate`
7. Commit migration file to version control

**Rollback plan**: `drizzle-kit` generates forward-only migrations. For rollback, create a new migration that reverses changes. Neon branching provides safety — always test migrations on a branch first.

---

## 10. Open Questions

| # | Question | Impact | Owner | Status |
|---|----------|--------|-------|--------|
| 1 | Should `aiUsageLog.tokensUsed` be `integer` instead of `varchar`? | Affects aggregation queries (SUM on integers is cleaner) | DB architect | Open — spec uses varchar, but integer makes more sense |
| 2 | Do we need a `createdBy`/`updatedBy` audit trail on projects? | Affects schema complexity | Product | Resolved — defer to per-project. Keep schema minimal. |
| 3 | Should we use Drizzle's `serial` instead of `uuid` for primary keys? | UUIDs are better for distributed systems, serials are faster for joins | Architect | Resolved — UUIDs. We're serverless-first and may need cross-service references. |

---

## 11. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-02-07 | AI-Native TPM | Initial draft |
