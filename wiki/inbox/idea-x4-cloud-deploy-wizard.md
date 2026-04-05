# Idea: x4 Cloud — One-Click Deploy Wizard

**Captured:** 2026-04-04

## Summary

A hosted dashboard (or CLI wizard) where developers paste Railway + Neon credentials once, and `/x4:deploy-setup` provisions everything automatically — services, domains, DB branches, env vars — with zero manual CLI steps. The boilerplate ships with a deployment wizard that talks to user accounts directly.

## What to Implement

1. **Enhanced `/x4:deploy-setup`** — interactive wizard that uses Railway MCP + Neon MCP to create project, services, domains, and DB in one command
2. **Credential storage** — secure local storage of Railway token + Neon API key (`.claude/deploy.config.json`, gitignored)
3. **Auto env sync** — after provisioning, automatically populate `.env.local` with generated DATABASE_URL, service URLs, etc.
4. **Status dashboard** — `/x4:status` shows live Railway service health, DB branch, and deploy URLs
5. **Teardown** — `/x4:pr-cleanup` extended to also tear down Railway preview environments

## Open Questions

- Should this be purely CLI (Claude Code commands) or also a web UI?
- Multi-environment support (staging + production) in v1 or later?

## Next Step

Brainstorm → spec → implementation plan → execute.
