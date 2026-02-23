# PRD-002: Shared Types, Validators & Utilities

**PRD ID**: PRD-002
**Title**: Shared Types, Validators & Utilities
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-001 (Monorepo Foundation)
**Blocks**: PRD-005 (API Server), PRD-006 (Auth), PRD-007 (Error Handling), PRD-009 (AI Integration)

---

## 1. Problem Statement

In a multi-platform monorepo (web, mobile, desktop, API), the most common source of bugs is type drift — the API returns a shape the frontend doesn't expect, or validation rules differ between client and server. When types are defined in one place and copied to another, they inevitably diverge. When validation schemas exist separately from type definitions, one changes and the other doesn't.

This PRD establishes a single source of truth for all data shapes, validation rules, and shared utilities across every workspace. The core insight is that Zod schemas define both the validation rules AND the TypeScript types — you never write a type and a schema separately. Change the schema, the type updates automatically, and every consumer gets compile-time feedback.

Without this foundation, every subsequent PRD (database schema, API routers, client components) would define their own types and validators, creating a fragmented type system that only works until someone forgets to update one of the copies.

---

## 2. Success Criteria

| Criteria                | Measurement                                                                   | Target                                                                  |
| ----------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Single source of truth  | All domain types are inferred from Zod schemas                                | Zero hand-written type duplicates of Zod schemas                        |
| Cross-workspace imports | Types import cleanly in API, web, mobile, desktop                             | `import { User } from "@packages/shared/types"` works in all workspaces |
| Validation consistency  | Same Zod schema validates on both client and server                           | `CreateProjectSchema.parse()` identical behavior everywhere             |
| Type inference          | `z.infer<typeof Schema>` produces correct TypeScript types                    | `bun turbo type-check` passes                                           |
| Error type coverage     | All API error codes have corresponding types                                  | Every error code in `ErrorCodes` maps to an HTTP status concept         |
| Utility completeness    | Common formatters and helpers are available without per-workspace duplication | Date, currency, string helpers exported from single location            |

---

## 3. Scope

### In Scope

- `packages/shared/types/` — domain types, API types, error types
  - `domain.ts` — `User`, `Project`, and their Zod schemas
  - `api.ts` — request/response wrapper types
  - `errors.ts` — `ErrorCodes` constant, `APIErrorResponse` type, `ErrorCode` union type
  - `index.ts` — re-exports
- `packages/shared/utils/` — validation, formatting, helpers
  - `validators.ts` — Zod schemas as source of truth (types inferred via `z.infer`)
  - `formatting.ts` — date formatters, currency formatters, string helpers
  - `helpers.ts` — common utility functions (slugify, truncate, etc.)
  - `constants.ts` — shared constants (pagination defaults, limits, etc.)
  - `index.ts` — re-exports
- `packages/shared/package.json` — Zod dependency, workspace config

### Out of Scope

- UI components (PRD-004)
- React hooks (PRD-004)
- tRPC API client (PRD-004)
- AI-specific types (PRD-009)
- Database schema (PRD-003 — Drizzle schema references these types but is defined separately)
- `AppError` class implementation (PRD-007 — uses the error types defined here)

### Assumptions

- PRD-001 is complete (workspace structure exists, `bun install` works)
- Zod ^3.x is the validation library (no competing validators)
- Domain model starts simple: `User` and `Project` as the two core entities. Projects extend this per-app.

---

## 4. System Context

```
packages/shared/types   ← This PRD (leaf node — imports nothing)
packages/shared/utils   ← This PRD (imports types only)
       ↓
  Consumed by EVERY other workspace:
  ├── packages/database    (PRD-003: schema references domain types)
  ├── packages/auth        (PRD-006: user types)
  ├── apps/api             (PRD-005: input validation, error responses)
  ├── apps/web             (PRD-010: form validation, display types)
  ├── apps/mobile          (PRD-011: same)
  └── apps/desktop         (PRD-012: same)
```

### Dependency Map

| Depends On                    | What It Provides                                     |
| ----------------------------- | ---------------------------------------------------- |
| PRD-001 (Monorepo Foundation) | Workspace structure, TypeScript config, path aliases |

### Consumed By

| Consumer                 | How It's Used                                                            |
| ------------------------ | ------------------------------------------------------------------------ |
| PRD-003 (Database)       | Domain types inform Drizzle schema column definitions                    |
| PRD-005 (API Server)     | Zod schemas used as tRPC `.input()` validators; error types in responses |
| PRD-007 (Error Handling) | `ErrorCodes` and `APIErrorResponse` are the foundation of `AppError`     |
| PRD-009 (AI Integration) | AI-specific types extend base types                                      |
| PRD-010/011/012 (Apps)   | Form validation, display logic, error handling in UI                     |

---

## 5. Technical Design

### 5.1 Data Model / Types

**Domain Types** — the core business entities:

```typescript
// packages/shared/types/domain.ts
export type User = {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
};

export type Project = {
  id: string;
  ownerId: string;
  name: string;
  description?: string;
  status: 'active' | 'archived';
  createdAt: Date;
  updatedAt: Date;
};
```

**API Types** — request/response wrappers:

```typescript
// packages/shared/types/api.ts
import type { User, Project } from './domain';

export type GetUserRequest = { userId: string };
export type GetUserResponse = User;

export type CreateProjectRequest = {
  name: string;
  description?: string;
};
export type CreateProjectResponse = Project;

// Pagination wrapper
export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};
```

**Error Types** — consistent error contract:

```typescript
// packages/shared/types/errors.ts
export const ErrorCodes = {
  // Auth
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',

  // Resources
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',

  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',

  // Rate limiting
  RATE_LIMITED: 'RATE_LIMITED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];

export type APIErrorResponse = {
  code: ErrorCode;
  message: string;
  details?: Record<string, unknown>;
  requestId?: string;
};
```

**Zod Validators** — source of truth for validation AND types:

```typescript
// packages/shared/utils/validators.ts
import { z } from 'zod';

// --- User Schemas ---
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(255),
  role: z.enum(['user', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// --- Project Schemas ---
export const CreateProjectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
});

export const UpdateProjectSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional(),
  status: z.enum(['active', 'archived']).optional(),
});

// --- Pagination ---
export const PaginationSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// --- Inferred Types ---
export type UserInput = z.infer<typeof UserSchema>;
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
```

**Utilities**:

```typescript
// packages/shared/utils/formatting.ts
export function formatDate(date: Date, locale = 'en-US'): string {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}
```

```typescript
// packages/shared/utils/constants.ts
export const PAGINATION_DEFAULTS = {
  limit: 20,
  maxLimit: 100,
} as const;

export const MAX_PROJECT_NAME_LENGTH = 255;
export const MAX_DESCRIPTION_LENGTH = 1000;
export const MAX_AI_PROMPT_LENGTH = 10000;
export const MAX_AI_TOKENS = 4000;
```

```typescript
// packages/shared/utils/helpers.ts
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

export function groupBy<T>(items: T[], key: keyof T): Record<string, T[]> {
  return items.reduce(
    (acc, item) => {
      const group = String(item[key]);
      (acc[group] ??= []).push(item);
      return acc;
    },
    {} as Record<string, T[]>,
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
```

### 5.2 Architecture Decisions

**Decision**: Zod schemas as the single source of truth for validation and types
**Context**: Need to keep validation rules and TypeScript types in sync across client and server.
**Options Considered**: (1) Hand-written types + separate Zod schemas, (2) Zod schemas with `z.infer` for types, (3) io-ts, (4) TypeBox
**Rationale**: Zod has the best DX, widest adoption, and `z.infer` eliminates type duplication. The schema IS the type definition.
**Tradeoffs**: Domain types in `types/domain.ts` are technically duplicates of what Zod could infer. We keep them for readability — they're the "human-readable spec" while Zod schemas are the "machine-enforced spec." The risk of drift is low because both are in the same package.

**Decision**: Separate `types/` and `utils/` directories within `packages/shared/`
**Context**: Types are pure TypeScript (no runtime). Utils include runtime code (Zod, formatting functions). Keeping them separate makes the dependency boundary clearer.
**Options Considered**: (1) Single `shared/` directory, (2) Split into `packages/types/` and `packages/utils/`, (3) Subdirectories within one package
**Rationale**: Subdirectories within one package keeps the workspace count manageable while maintaining logical separation. `types/` is a leaf node (imports nothing), `utils/` can import from `types/`.
**Tradeoffs**: Slightly less granular dependency tracking than separate packages.

### 5.3 API Contracts / Interfaces

This PRD exports **types and functions**, not API endpoints:

```typescript
// packages/shared/types/index.ts — public surface
export * from './domain';
export * from './api';
export * from './errors';

// packages/shared/utils/index.ts — public surface
export * from './validators';
export * from './formatting';
export * from './helpers';
export * from './constants';
```

**Contract**: Any workspace can import from `@packages/shared/types` or `@packages/shared/utils`. The types package must remain a leaf node (no runtime dependencies). The utils package may depend on Zod.

### 5.4 File Structure

```
packages/shared/
├── types/
│   ├── index.ts          # Re-exports all types
│   ├── domain.ts         # User, Project business types
│   ├── api.ts            # Request/response wrappers, PaginatedResponse
│   └── errors.ts         # ErrorCodes, ErrorCode, APIErrorResponse
├── utils/
│   ├── index.ts          # Re-exports all utils
│   ├── validators.ts     # Zod schemas + inferred types
│   ├── formatting.ts     # Date, currency, string formatters
│   ├── helpers.ts        # Generic utility functions
│   └── constants.ts      # Shared constants
├── package.json          # name: @[project-name]/shared, deps: zod
├── tsconfig.json         # Extends ../../tsconfig.base.json
└── src/
    └── index.ts          # Top-level re-export (optional)
```

---

## 6. Implementation Plan

### Task Breakdown

| #   | Task                                                                    | Estimate | Dependencies | Claude Code Candidate? | Notes                                                            |
| --- | ----------------------------------------------------------------------- | -------- | ------------ | ---------------------- | ---------------------------------------------------------------- |
| 1   | Create `packages/shared/package.json` and `tsconfig.json`               | 15m      | PRD-001      | ✅ Yes                 | Config files only                                                |
| 2   | Define domain types (`types/domain.ts`, `types/api.ts`)                 | 30m      | Task 1       | 🟡 Partial             | Human reviews entity design, AI generates boilerplate            |
| 3   | Define error types (`types/errors.ts`)                                  | 20m      | Task 1       | ✅ Yes                 | Well-specified in tech spec                                      |
| 4   | Create Zod validators (`utils/validators.ts`)                           | 30m      | Task 2       | ✅ Yes                 | Mechanical translation of types to Zod schemas                   |
| 5   | Create formatting utilities (`utils/formatting.ts`)                     | 20m      | Task 1       | ✅ Yes                 | Standard formatting functions                                    |
| 6   | Create helpers and constants (`utils/helpers.ts`, `utils/constants.ts`) | 20m      | Task 1       | ✅ Yes                 | Utility functions                                                |
| 7   | Create index files and re-exports                                       | 10m      | Tasks 2-6    | ✅ Yes                 | Simple re-exports                                                |
| 8   | Write unit tests for validators and formatting                          | 45m      | Tasks 4-5    | ✅ Yes                 | Strong AI candidate — test Zod schema validation, format outputs |
| 9   | Verify cross-workspace import                                           | 15m      | Task 7       | ❌ No                  | Manual — create test import in apps/api, run type-check          |

### Claude Code Task Annotations

**Task 4 (Zod Validators)**:

- **Context needed**: Domain types from `types/domain.ts`, the spec's validator examples, Zod v3 API
- **Constraints**: Every Zod schema MUST have a corresponding `z.infer` type export. Do NOT duplicate types manually — always infer from schemas.
- **Done state**: `bun turbo type-check --filter=@[project-name]/shared` passes. All schemas parse valid data and reject invalid data.
- **Verification command**: `cd packages/shared && bun test`

**Task 8 (Unit Tests)**:

- **Context needed**: All validators, formatters, and helpers from tasks 4-6
- **Constraints**: Test both valid and invalid inputs for every Zod schema. Test edge cases (empty strings, max length, invalid UUIDs). Use Bun test runner (`import { describe, test, expect } from "bun:test"`).
- **Done state**: All tests pass. Coverage covers happy path + validation failures for every schema.
- **Verification command**: `cd packages/shared && bun test`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level       | What's Tested                                                | Tool              | Count (approx) |
| ----------- | ------------------------------------------------------------ | ----------------- | -------------- |
| Unit        | Zod schema validation (valid + invalid), formatters, helpers | Bun test          | 25-35          |
| Integration | Cross-workspace import resolution                            | Manual type-check | 1-2            |
| E2E         | N/A                                                          | —                 | 0              |

### Key Test Scenarios

1. **Happy path**: `UserSchema.parse(validUser)` returns parsed user. `CreateProjectSchema.parse(validInput)` returns parsed input.
2. **Validation failure**: `UserSchema.parse({ email: "not-an-email" })` throws ZodError with correct path and message.
3. **Edge cases**: Empty string for required fields, string at exactly max length, UUID format validation.
4. **Type inference**: `z.infer<typeof CreateProjectSchema>` produces correct type (verified by TypeScript compiler, not runtime test).
5. **Formatting**: `formatDate(new Date("2026-01-15"))` returns expected string. `formatCurrency(1234.5)` returns `$1,234.50`.
6. **Error types**: `ErrorCodes.NOT_FOUND` is `"NOT_FOUND"` (literal type, not just string).

---

## 8. Non-Functional Requirements

| Requirement                  | Target                                                | How Verified            |
| ---------------------------- | ----------------------------------------------------- | ----------------------- |
| Bundle size                  | Zod + shared utils < 50KB gzipped                     | `bun build` output size |
| Type-check speed             | `tsc --noEmit` for shared package < 2s                | Timed locally           |
| Zero runtime deps (types)    | `types/` directory has no imports from `node_modules` | Code review             |
| Zod only runtime dep (utils) | `utils/` directory imports only from Zod and `types/` | ESLint boundary check   |

---

## 9. Rollout & Migration

Since this is a boilerplate PRD (not a migration), rollout is simply:

1. Implement all files
2. `bun install` (adds Zod)
3. `bun turbo type-check` and `bun test` pass
4. Commit

**For projects customizing from boilerplate**: The domain types (`User`, `Project`) are starting points. Every project will extend or replace them. The pattern (Zod schema → inferred type) is the real deliverable, not the specific entity shapes.

---

## 10. Open Questions

| #   | Question                                                                           | Impact                                                                        | Owner     | Status                                                                            |
| --- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | --------- | --------------------------------------------------------------------------------- |
| 1   | Should we also export Zod schemas from `types/` or keep them strictly in `utils/`? | If schemas are in `types/`, the types package gets a runtime dependency (Zod) | Architect | Resolved — schemas live in `utils/`, types in `types/`. Types package stays pure. |
| 2   | Do we need branded types (e.g., `UserId` as a branded string)?                     | Affects type safety at callsites                                              | Architect | Open — defer to first project. If needed, add as a utility in `utils/`.           |
| 3   | Should `PaginatedResponse` be generic or per-entity?                               | Affects API response consistency                                              | API lead  | Resolved — generic `PaginatedResponse<T>` in `types/api.ts`.                      |

---

## 11. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-02-07 | AI-Native TPM | Initial draft |
