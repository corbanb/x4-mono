# Idea: Cross-Platform Design System Sync

**Captured:** 2026-04-04

## Summary

A shared design token layer that keeps web (Tailwind), mobile (React Native StyleSheet), and desktop (Electron) visually consistent automatically. Design changes in one place propagate everywhere.

## What to Implement

1. **Token source of truth** — `packages/shared/tokens/` with a single `tokens.ts` file defining colors, spacing, typography, radii as plain JS constants
2. **Web binding** — CSS custom properties generated from tokens, imported into Tailwind v4 config via `@theme`
3. **Mobile binding** — `packages/shared/tokens/native.ts` exports a `StyleSheet`-compatible object derived from the same tokens
4. **Desktop binding** — Electron renderer inherits web tokens via the same CSS custom properties
5. **Token CLI** — a script that validates all three bindings are in sync with the source tokens
6. **Storybook integration** — token viewer story showing all colors, spacing, and typography

## Open Questions

- Should tokens be in JSON (standard) or TypeScript (type-safe)?
- Dark mode tokens: separate dark variants in the token file or CSS media query layer?

## Next Step

Brainstorm → spec → implementation plan → execute.
