Determine the next PRD to implement and step through its tasks sequentially, routing each task to the right specialist agent(s).

No input required — this command auto-detects what's next.

## Steps

1. **Read current state** — read `wiki/status.md` to get the PRD inventory, dependency graph, and progress log
2. **Scan directories** — check `wiki/active/`, `wiki/completed/`, and `wiki/inbox/` to determine each PRD's actual stage
3. **Check for active PRDs** — if any PRD is already in `wiki/active/`, resume it instead of starting a new one:
   - Read the active PRD file
   - Find the first incomplete task in Section 6 (Implementation Plan)
   - Skip to step 7 to continue implementation
4. **Determine the next PRD** — using the recommended implementation order from `wiki/status.md`:
   ```
   PRD-001 → PRD-002 → PRD-003 → PRD-004 + PRD-005 (parallel) → PRD-006 → PRD-007 → PRD-008 → PRD-009 → PRD-010 → PRD-011 + PRD-012 (parallel) → PRD-013 → PRD-014 → PRD-015 → PRD-016
   ```
   Find the first PRD that is:
   - Still in `wiki/inbox/` (not started)
   - Has ALL dependency PRDs in `wiki/completed/`
   - If multiple PRDs can run in parallel (e.g., PRD-004 + PRD-005), pick the first one by number unless the user specifies otherwise
5. **Report the pick** — tell the user which PRD is next and why (dependencies satisfied), show its title and brief summary. Ask for confirmation before proceeding.
6. **Move to active** — move the PRD file from `wiki/inbox/` to `wiki/active/` using `git mv`, update its `Status:` header to `In Progress`, and update `wiki/status.md`
7. **Read the PRD** — read the full PRD file, understand the technical design (Section 5) and implementation plan (Section 6)
8. **Step through tasks** — for each task in Section 6, in order:
   a. **Check dependencies** — verify that dependency tasks (from the Dependencies column) are complete
   b. **Read annotations** — read the Claude Code Task Annotations block for context, constraints, and done state
   c. **Read context files** — read all files mentioned in "Context needed"
   d. **Route to agent(s)** — determine which specialist agent(s) to consult based on the task's domain (see Agent Routing below). Invoke the agent with the task context to get its implementation guidance, then follow that guidance while implementing.
   e. **Implement** — create or modify files following the task description, constraints, CLAUDE.md conventions, agent guidance, and the PRD's technical design
   f. **Verify** — run the verification command from the annotations
   g. **Report progress** — summarize what was done for this task, which agent(s) were consulted, and the verification result
   h. **Continue** — move to the next task
9. **Check PRD completion** — after all tasks pass, run the equivalent of `/check-prd` inline:
   - Verify all file artifacts from Section 5.4 exist
   - Run all verification commands
   - Evaluate success criteria from Section 7
10. **Move to completed** — if all checks pass, move the PRD to `wiki/completed/` using `git mv`, update its `Status:` header to `Completed`, and update `wiki/status.md` with a progress log entry
11. **Summary** — report the full PRD completion:
    - Files created/modified
    - All verification results
    - Which PRD is next in the implementation order
    - Suggest running `/next-prd` again to continue

## Agent Routing

Before implementing each task, determine which specialist agent(s) to consult by matching the task's file paths, annotations, and domain keywords against this routing table:

### Path-based routing (primary signal)

| File path pattern | Primary agent | Secondary agent |
|---|---|---|
| `packages/database/**` — schema, migrations, seed, client | `/database` | — |
| `packages/auth/**` — auth config, session management | `/security` | `/backend` |
| `packages/ai-integrations/**` — AI SDK providers, streaming | `/backend` | — |
| `packages/shared/types/**`, `packages/shared/utils/**` — Zod schemas, validators, utilities | — | — |
| `packages/shared/ui/**`, `packages/shared/hooks/**` — shared components, hooks | `/frontend` | — |
| `apps/api/src/routers/**` — tRPC routers | `/backend` | `/database` |
| `apps/api/src/middleware/**` — Hono middleware | `/backend` | `/security` |
| `apps/api/src/lib/**` — API utilities, error handling, env | `/backend` | — |
| `apps/web/**` — Next.js pages, components, layouts | `/frontend` | — |
| `apps/mobile/**` — Expo/React Native | `/frontend` | — |
| `apps/desktop/**` — Electron | `/frontend` | `/security` |
| `apps/marketing/**` — Marketing site | `/frontend` | — |
| `.github/workflows/**` — CI/CD pipelines | `/devops` | — |
| `turbo.json`, `vercel.json`, `eas.json` — infra config | `/devops` | — |
| `apps/docs/**`, `docs/**`, `*.md`, `*.mdx`, `CONTRIBUTING.md` — documentation | `/docs` | — |
| `**/*.test.ts`, `**/*.test.tsx` — test files | `/testing` | (domain agent) |

### Keyword-based routing (secondary signal)

Use these when path patterns aren't sufficient or the task spans multiple domains:

| Task keywords | Agent |
|---|---|
| auth, session, token, login, permission, role, CORS | `/security` |
| schema, migration, table, seed, query, index, relation | `/database` |
| router, procedure, middleware, endpoint, API, tRPC, Hono | `/backend` |
| component, page, layout, form, hook, UI, Tailwind, React | `/frontend` |
| test, mock, fixture, coverage, assertion | `/testing` |
| workflow, CI, deploy, cache, pipeline, action | `/devops` |
| documentation, README, MDX, JSDoc, guide, API reference, docs site, Fumadocs | `/docs` |

### Multi-agent tasks

Some tasks touch multiple domains. Route to multiple agents in this order:

1. **Data layer first** — if the task creates a schema + router + page, consult `/database` first (schema design), then `/backend` (router design), then `/frontend` (page design)
2. **Security review** — if the task involves auth, tokens, or user data, consult `/security` after the primary domain agent
3. **Testing** — if the task includes writing tests alongside implementation, consult `/testing` for the test strategy after the primary implementation agent
4. **DevOps** — if the task modifies CI/CD or deployment config, consult `/devops`

### When NOT to route

Skip agent routing for simple tasks that don't need specialist guidance:
- Pure config file changes (tsconfig, package.json, turbo.json tweaks)
- Simple Zod schema definitions in `packages/shared/types/`
- File moves or renames
- Documentation-only changes that are trivial (typo fixes, formatting). For substantial documentation changes, route to `/docs`
- Tasks where the annotation block has complete, unambiguous instructions

### How to invoke agents

When routing to an agent, use the corresponding slash command with a structured prompt:

```
/{agent} Review this task and provide implementation guidance:

PRD: {PRD-ID} — {PRD title}
Task: #{task-number} — {task description}
Files to create/modify: {list from annotations}
Constraints: {from annotations}
Technical design context: {relevant excerpt from PRD Section 5}

What is the recommended implementation approach?
```

Capture the agent's guidance and follow it during the implementation step. If the agent flags concerns or suggests a different approach than the PRD, report this to the user before proceeding.

## Rules

- Follow the "Do NOT" section in CLAUDE.md strictly
- Respect dependency boundaries from CLAUDE.md
- Use Zod schemas as source of truth for types
- Run verification commands after each task before moving on
- If a verification command fails, stop and report the failure — do not skip tasks
- If a task is marked "Partial" for Claude Code, note which parts need human review and ask whether to continue or pause
- Never skip ahead — tasks must be implemented in order respecting their dependencies
- If no PRDs are ready (all remaining have unmet dependencies), report which dependencies are blocking and what needs to be done
- For parallel PRDs (e.g., PRD-004 + PRD-005), implement one at a time — note that the other can be started after
- Always use `git mv` when moving PRD files
- Update `wiki/status.md` whenever a PRD changes stage
- Always consult the routed agent(s) before implementing — don't skip the routing step for non-trivial tasks
- If an agent's guidance conflicts with the PRD's technical design, flag the discrepancy to the user
