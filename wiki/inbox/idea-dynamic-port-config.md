# Idea: Dynamic Port Configuration

**Captured:** 2026-04-04

## Summary

Implement dynamic port configuration for the monorepo so developers can change app ports by editing only the root `.env` file. No developer should need to change anything to keep existing behavior — shell fallback syntax preserves defaults.

## What to Implement

1. **Named port env vars** — add `PORT_WEB`, `PORT_API`, `PORT_MARKETING`, `PORT_DOCS` (and others) to root `.env` and `.env.example` with current default values (3000, 3002, 3001, 3003).

2. **`turbo.json` globalEnv** — add all port vars so Turbo busts cache when they change.

3. **App dev/start scripts** — update each app's `package.json` scripts to use shell fallback syntax:
   ```
   next dev --port ${PORT_WEB:-3000}
   ```
   Every app that has a hardcoded port in its `dev` or `start` script needs this treatment.

4. **API server entry** — rename `PORT` to `PORT_API` in the env schema. In the server entry point, use `Number(process.env.PORT ?? env.PORT_API)` so Railway's injected `PORT` takes precedence in production.

5. **Docs** — update `CLAUDE.md` port references and any other docs that reference old port variable names.

## Constraints

- Shell fallback `${VAR:-default}` must preserve existing behavior when vars are not set
- `.env` is gitignored — update locally only; commit `.env.example` only
- Per-app `.env.example` files (if any) also need updating
- Railway injects its own `PORT` — API must listen on it via `Number(process.env.PORT ?? env.PORT_API)`

## Next Step

Brainstorm → spec → implementation plan → execute.
