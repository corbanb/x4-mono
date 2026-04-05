# Idea: AI Usage Analytics Dashboard

**Captured:** 2026-04-04

## Summary

A built-in dashboard showing token usage, cost per user, model performance, and AI feature adoption. Ships with the boilerplate, powered by the existing `ai_usage_logs` table. Developers get immediate visibility into AI spend and usage patterns without any extra setup.

## What to Implement

1. **Enhanced `ai_usage_logs` schema** — add `cost_usd` (computed from token counts + model pricing), `feature` (which product feature triggered the call), `latency_ms`
2. **Analytics tRPC router** — `ai.usage.summary`, `ai.usage.byUser`, `ai.usage.byFeature`, `ai.usage.byDay` procedures
3. **Dashboard page** — `/dashboard/ai-usage` in `apps/web` with charts (recharts, already installed): total spend, tokens over time, top users, feature breakdown
4. **Cost computation** — a `packages/ai-integrations/pricing.ts` file with model → cost-per-token lookup, updated when new models are added
5. **Budget alerts** — optional env var `AI_MONTHLY_BUDGET_USD` that triggers a warning log + optional webhook when threshold is crossed

## Open Questions

- Real-time (WebSocket updates as requests come in) or polling (refresh every 30s) for v1?
- Expose usage data to end users (per-account usage page) or admin-only in v1?

## Next Step

Brainstorm → spec → implementation plan → execute.
