---
name: add-env
description: Add an environment variable with 3-way sync (env.ts, .env.example, CLAUDE.md)
---

# Add Environment Variable Skill

Add a new environment variable to x4-mono with 3-way sync across validation, example, and documentation.

## Arguments

The user provides:

- Variable name (SCREAMING_SNAKE_CASE, e.g., `STRIPE_SECRET_KEY`)
- Description of what it's for
- Whether it's required or optional
- Default value (if any)
- Validation constraints (URL, min length, starts with prefix, etc.)

## Three Files to Update

### 1. `apps/api/src/lib/env.ts` — Zod Validation

Add the variable to the `envSchema` object:

```typescript
const envSchema = z.object({
  // ... existing vars

  // Required string
  MY_VAR: z.string().min(1),

  // Required with constraint
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),

  // Required URL
  WEBHOOK_URL: z.string().url(),

  // Optional
  ANALYTICS_ID: z.string().optional(),

  // With default
  MY_URL: z.string().url().default('http://localhost:3000'),

  // Coerce to number
  MAX_CONNECTIONS: z.coerce.number().default(10),
});
```

### 2. `.env.example` — Template for Developers

Add the variable with a descriptive placeholder:

```bash
# Description of what this variable does
MY_VAR=your-value-here

# Stripe secret key (starts with sk_)
STRIPE_SECRET_KEY=sk_test_...

# Optional: Analytics tracking ID
# ANALYTICS_ID=
```

### 3. `CLAUDE.md` — Environment Variables Table

Add a row to the Environment Variables table:

```markdown
| `MY_VAR` | Description | Yes/No |
```

## Important Notes

- `env.ts` validates eagerly at import time — the app crashes immediately if a required variable is missing
- Tests must set `process.env.VAR ??= 'dummy'` BEFORE importing any module that imports `env.ts`
- The `bunfig.toml` `[test] preload` file handles this for existing vars — new required vars must be added there too

## Workflow

1. Read `apps/api/src/lib/env.ts` to see existing patterns
2. Add the Zod schema entry to `envSchema`
3. Read `.env.example` and add the variable with description
4. Read `CLAUDE.md` and add a row to the Environment Variables table
5. If variable is required, update `apps/api/src/__tests__/helpers.ts` or test preload to set a dummy value
6. Run `bun turbo type-check` to verify
