# AI Usage Analytics Design

**Date:** 2026-04-05  
**Status:** Approved

---

## Goal

Add a per-user AI usage analytics dashboard to the web app. Each authenticated user can view their own token consumption, cost, and request history — filterable by date range. No admin-only gate for v1.

---

## Architecture

### Data layer — new `ai.usage` tRPC router

The existing `ai_usage_log` table has all columns needed for v1 (`userId`, `model`, `tokensUsed`, `estimatedCost`, `endpoint`, `createdAt`). No schema migration required.

The existing `apps/api/src/routers/ai.ts` is split into a directory:

```
apps/api/src/routers/ai/
  generate.ts       — existing generate logic (moved verbatim)
  usage.ts          — new analytics queries
  index.ts          — merges both routers, re-exports aiRouter
  __tests__/
    usage.test.ts   — tRPC caller tests for usage procedures
```

`apps/api/src/routers/index.ts` import path changes from `./ai` to `./ai/index` (external API unchanged — `ai.*` still works).

### tRPC procedures

Both are `protectedProcedure`, scoped to `ctx.user.userId`.

**`ai.usage.summary`**

Input (all optional):

```ts
{ from?: Date, to?: Date }
```

Output:

```ts
{
  totalRequests: number;
  totalTokens: number;
  totalCost: number; // sum of estimatedCost as float
  avgCostPerRequest: number;
  byModel: Array<{
    model: string;
    count: number;
    tokens: number;
    cost: number;
    pct: number; // percentage of totalCost
  }>;
}
```

Single DB query using Drizzle `groupBy` on `model` with `sum`/`count` aggregates. `avgCostPerRequest` and `pct` computed in application code.

**`ai.usage.history`**

Input (all optional):

```ts
{ from?: Date, to?: Date }
```

Output:

```ts
Array<{
  date: string; // "YYYY-MM-DD"
  tokens: number;
  cost: number;
  count: number;
}>;
```

Uses a `DATE_TRUNC('day', created_at)` group-by via Drizzle `sql` template. Ordered ascending by date.

### Date filter input validation

Both procedures share a single Zod schema:

```ts
const DateRangeInput = z.object({
  from: z.date().optional(),
  to: z.date().optional(),
});
```

Defined in `packages/shared/types/` and imported by both procedures.

---

## UI

### Page: `apps/web/src/app/(dashboard)/ai/usage/page.tsx`

Server component shell, client component for interactivity. Fetches both `ai.usage.summary` and `ai.usage.history` via tRPC.

**Layout (top to bottom):**

1. **Header** — "AI Usage" title + subtitle + "Refresh" button (calls `refetch()` on both queries)
2. **Date range filter bar** — preset buttons: `7d | 30d | 90d | All time` (default: All time). Sets `from`/`to` state passed to both queries.
3. **Stat cards row** (4 cards, responsive grid):
   - Total Requests
   - Total Tokens
   - Total Cost (formatted as `$0.0000`)
   - Avg Cost / Request
4. **Charts row** (2-column grid on lg+):
   - Left: `LineChart` — tokens per day over time
   - Right: `BarChart` — cost per day over time
5. **Model breakdown table** — columns: Model, Requests, Tokens, Cost, % of Total

### Chart component: `apps/web/src/components/ai-usage-charts.tsx`

Exports `TokensOverTimeChart` and `CostOverTimeChart`. Both accept `data: Array<{ date, tokens, cost, count }>`. Isolated from the page for testability. Uses recharts `ResponsiveContainer`.

### Sidebar update: `apps/web/src/components/app-sidebar.tsx`

Add `{ title: 'AI Usage', href: '/ai/usage', icon: BarChart2 }` immediately after the existing `AI Playground` entry.

---

## Error handling

- Both tRPC procedures: Drizzle errors caught, re-thrown as `Errors.internal(...)`. Empty result sets return zero-valued summaries (not 404).
- UI: tRPC query errors surfaced via `toast.error`. Loading states shown with skeleton cards.

---

## Testing

**`apps/api/src/routers/ai/__tests__/usage.test.ts`** — tRPC caller tests:

- `summary` with no rows returns zero values
- `summary` aggregates tokens and cost correctly across multiple rows
- `summary` respects `from`/`to` date filters
- `history` returns one entry per day, ordered ascending
- `history` respects `from`/`to` date filters
- Both procedures require auth (unauthenticated caller throws UNAUTHORIZED)

Tests use `createTestContext` + `createCaller` pattern from existing test infrastructure.

---

## File checklist

| Action | Path                                                   |
| ------ | ------------------------------------------------------ |
| Create | `apps/api/src/routers/ai/generate.ts`                  |
| Create | `apps/api/src/routers/ai/usage.ts`                     |
| Create | `apps/api/src/routers/ai/index.ts`                     |
| Create | `apps/api/src/routers/ai/__tests__/usage.test.ts`      |
| Delete | `apps/api/src/routers/ai.ts`                           |
| Modify | `apps/api/src/routers/index.ts`                        |
| Create | `apps/web/src/app/(dashboard)/ai/usage/page.tsx`       |
| Create | `apps/web/src/components/ai-usage-charts.tsx`          |
| Modify | `apps/web/src/components/app-sidebar.tsx`              |
| Modify | `packages/shared/types/` (add `DateRangeInput` schema) |
