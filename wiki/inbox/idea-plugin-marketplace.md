# Idea: x4 Plugin Marketplace

**Captured:** 2026-04-04

## Summary

Third-party x4 plugins — Stripe billing, Resend email, PostHog analytics, feature flags — installable via `/x4:add stripe`. Each plugin wires itself into the monorepo (schema, routes, UI, env vars) automatically in one command.

## What to Implement

1. **Plugin spec format** — a `x4-plugin.json` manifest describing what a plugin adds (schema tables, tRPC routes, UI components, env vars)
2. **`/x4:add <plugin>`** — command that fetches plugin manifest, applies schema migrations, registers routes, scaffolds UI, updates `.env.example`
3. **Built-in plugins** — ship with first-party plugins: `stripe` (billing), `resend` (email), `posthog` (analytics), `flags` (feature flags)
4. **Plugin registry** — a simple JSON registry at a known URL listing available plugins + versions
5. **Undo support** — `/x4:remove <plugin>` reverses the scaffold

## Open Questions

- Registry hosted where? GitHub repo, npm, or custom API?
- Plugin isolation — how to handle conflicts between plugins that touch the same files?

## Next Step

Brainstorm → spec → implementation plan → execute.
