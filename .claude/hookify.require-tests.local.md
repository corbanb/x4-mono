---
name: require-tests
enabled: false
event: stop
action: warn
pattern: .*
---

**Reminder: Did you run tests before finishing?**

Run one of the following before stopping:

- `bun turbo test` — Run all workspace tests
- `bun test <file>` — Run a specific test file
- `bun turbo type-check` — Verify types across all workspaces

This rule is disabled by default. Enable per-session with `/hookify:configure`.
