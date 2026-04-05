# Idea: Live Collaboration Layer

**Captured:** 2026-04-04

## Summary

Real-time multiplayer built into the boilerplate. Liveblocks or PartyKit wired into `packages/shared`, presence indicators, collaborative cursors, conflict-free shared state. Any app cloned from x4 gets multiplayer out of the box via a shared hook and provider.

## What to Implement

1. **Provider package** — `packages/shared/collaboration/` with a `CollaborationProvider` wrapping Liveblocks or PartyKit client
2. **Shared hooks** — `usePresence`, `useOthers`, `useMutation` hooks in `packages/shared/hooks/`
3. **Web integration** — Provider wired into `apps/web` layout, presence avatars in `DashboardHeader`
4. **Mobile integration** — Lightweight presence hooks for `apps/mobile-main`
5. **Env vars** — `LIVEBLOCKS_SECRET_KEY` or `PARTYKIT_TOKEN` wired into env schema + `.env.example`

## Open Questions

- Liveblocks (hosted, generous free tier) vs PartyKit (self-hostable, more control)?
- CRDT for document sync or just presence + cursors for v1?

## Next Step

Brainstorm → spec → implementation plan → execute.
