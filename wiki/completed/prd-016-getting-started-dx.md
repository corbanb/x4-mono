# PRD-016: Getting Started Guide & Developer Experience

**PRD ID**: PRD-016
**Title**: Getting Started Guide & Developer Experience
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: All previous PRDs (documents the complete system)
**Blocks**: None

---

## 1. Problem Statement

A boilerplate without documentation is just someone else's codebase. The most perfectly architected monorepo is worthless if a new developer can't go from `git clone` to a running dev environment in under 30 minutes. Even returning developers — including yourself three months later — need to remember which commands seed the database, which env vars are required, and why the auth tables live in a separate migration.

This is also where AI-native development practices become concrete. A `CLAUDE.md` file at the root of the project tells Claude Code everything it needs to know: project structure, coding conventions, what to do and not do. Without it, every Claude Code session starts with "read the codebase and figure it out" — which is slow and error-prone. With it, Claude Code can jump straight into productive work within the project's established patterns.

This PRD creates the documentation layer: the getting started checklist, key commands reference, environment variable guide, README templates, CONTRIBUTING guidelines, a CLAUDE.md file, troubleshooting guide, and an ADR template. It's the difference between "here's a repo" and "here's a usable template."

---

## 2. Success Criteria

| Criteria              | Measurement                                                       | Target                                         |
| --------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| Time to dev server    | New developer: clone → install → running                          | < 30 minutes                                   |
| Zero tribal knowledge | Every setup step is documented                                    | No "ask someone" steps                         |
| CLAUDE.md             | Claude Code can execute tasks using project context               | AI agent productivity within 1 prompt          |
| README quality        | Root README explains what, why, how                               | New developer understands the project in 5 min |
| Key commands          | Every `bun` command is documented                                 | Single reference sheet                         |
| Env var docs          | Every env var has description, where to get it, required/optional | No mystery variables                           |
| Troubleshooting       | Common issues have documented solutions                           | Top 10 gotchas covered                         |

---

## 3. Scope

### In Scope

- **Root README.md** — project overview, architecture diagram, quick start, links to workspace READMEs
- **CONTRIBUTING.md** — development workflow, PR conventions, code style, commit messages, branch strategy
- **CLAUDE.md** — Claude Code project context file:
  - Project structure and architecture
  - Coding conventions (naming, file organization, import patterns)
  - Technology stack with versions
  - What Claude Code should/shouldn't do
  - Common task patterns (add a tRPC router, add a database table, add a UI component)
- **Getting Started Checklist** — Week 1 / Week 2 / Ongoing checklists from spec
- **Key Commands Reference** — all `bun` commands with descriptions
- **Environment Variable Guide** — every env var with description, source, required/optional
- **Per-workspace README.md templates** — for api, web, mobile, desktop, marketing
- **Troubleshooting Guide** — common Bun, Drizzle, Better Auth, tRPC gotchas
- **ADR Template** — lightweight Architecture Decision Record for per-project decisions

### Out of Scope

- Product-specific documentation
- API documentation / OpenAPI spec generation (per-project)
- User-facing documentation / help center (per-project)
- Runbook / incident response documentation (per-project)

### Assumptions

- All PRDs 001-015 are complete (this documents the finished system)
- Developer has basic TypeScript and monorepo familiarity
- Target audience: mid-level to senior TypeScript developers

---

## 4. System Context

This PRD is the documentation layer that sits on top of the entire system. It doesn't modify code — it documents it.

```
PRD-016 (This PRD)
  ├── README.md            → root project docs
  ├── CONTRIBUTING.md      → development workflow
  ├── CLAUDE.md            → AI agent context
  ├── docs/
  │   ├── getting-started.md
  │   ├── commands.md
  │   ├── environment.md
  │   ├── troubleshooting.md
  │   └── adr-template.md
  └── Per-workspace READMEs
```

### Dependency Map

| Depends On         | What It Provides            |
| ------------------ | --------------------------- |
| All PRDs (001-015) | The system being documented |

### Consumed By

| Consumer             | How It's Used                                         |
| -------------------- | ----------------------------------------------------- |
| New developers       | Onboarding, setup, reference                          |
| Returning developers | Command reference, troubleshooting                    |
| Claude Code          | CLAUDE.md provides project context for AI agent tasks |
| Future projects      | Template cloned and customized                        |

---

## 5. Technical Design

### 5.2 Architecture Decisions

**Decision**: Checklist format over prose for getting started
**Context**: New developers need actionable steps, not essays.
**Options Considered**: (1) Prose walkthrough, (2) Checklist with checkboxes, (3) Interactive CLI setup wizard
**Rationale**: Checklists are scannable, completable (checkbox satisfaction), and work in markdown. Developers can track their progress. Prose tends to bury steps in paragraphs.
**Tradeoffs**: Checklists can feel terse. Balance with brief explanations under each step.

**Decision**: CLAUDE.md as a first-class deliverable
**Context**: Claude Code reads CLAUDE.md to understand project context, conventions, and constraints.
**Options Considered**: (1) No CLAUDE.md (let AI figure it out), (2) Minimal CLAUDE.md, (3) Comprehensive CLAUDE.md
**Rationale**: Comprehensive CLAUDE.md dramatically improves AI agent productivity. Specifying conventions, file locations, and "do/don't" rules prevents hallucinated architectures and keeps AI-generated code consistent with the project style.
**Tradeoffs**: CLAUDE.md needs maintenance when the stack changes. Worth it for the productivity gain.

### 5.3 Key Documents

**CLAUDE.md Structure**:

```markdown
# CLAUDE.md — [Project Name]

## Project Overview

[One paragraph: what this project is and who it's for]

## Architecture

- Monorepo: Bun + Turborepo
- API: Hono + tRPC on Bun (apps/api)
- Web: Next.js 15 App Router (apps/web)
- Database: Neon + Drizzle ORM (packages/database)
- Auth: Better Auth with bearer tokens (packages/auth)
- AI: Vercel AI SDK + Claude (packages/ai-integrations)

## Key Conventions

- Types: Zod schemas in packages/shared/utils/validators.ts → infer types, never duplicate
- Errors: Always use Errors.\* constructors (apps/api/src/lib/errors.ts)
- Auth: protectedProcedure for authenticated, adminProcedure for admin-only
- Logging: Use child loggers (aiLogger, dbLogger, authLogger), never console.log in production
- Tests: Bun test, createCaller + createTestContext for tRPC tests

## File Organization

- New tRPC router → apps/api/src/routers/{name}.ts, add to appRouter in index.ts
- New database table → packages/database/schema.ts, run bun db:generate
- New shared type → packages/shared/types/domain.ts + Zod schema in utils/validators.ts
- New UI component → packages/shared/ui/ (cross-platform) or apps/web/src/components/ (web-only)

## Do NOT

- Add API routes to apps/web (API is standalone in apps/api)
- Use console.log for logging (use Pino logger)
- Create types manually when a Zod schema exists (use z.infer)
- Import from apps/_ in packages/_ (dependency boundary violation)
- Hard-code environment variables (use apps/api/src/lib/env.ts)

## Common Tasks

### Add a new tRPC router

1. Create apps/api/src/routers/{name}.ts
2. Add to appRouter in apps/api/src/routers/index.ts
3. Run bun type-check to verify AppRouter type updates
4. Use trpc.{name}.{procedure}.useQuery/useMutation in web/mobile

### Add a database table

1. Add table to packages/database/schema.ts
2. Add relations if needed
3. Run bun db:generate to create migration
4. Run bun db:push (dev) or bun db:migrate (prod)
5. Add seed data to packages/database/seed.ts
```

### 5.4 File Structure

```
# Root documentation
README.md                     # Project overview, architecture, quick start
CONTRIBUTING.md               # Dev workflow, PR conventions, style guide
CLAUDE.md                     # Claude Code project context

# docs/ directory
docs/
├── getting-started.md        # Week 1/2/Ongoing checklists
├── commands.md               # All bun commands with descriptions
├── environment.md            # Every env var documented
├── troubleshooting.md        # Common issues and solutions
└── adr-template.md           # Lightweight ADR format

# Per-workspace READMEs
apps/api/README.md
apps/web/README.md
apps/mobile/README.md
apps/desktop/README.md
apps/marketing/README.md
```

---

## 6. Implementation Plan

### Task Breakdown

| #   | Task                                                         | Estimate | Dependencies          | Claude Code Candidate? | Notes                                                |
| --- | ------------------------------------------------------------ | -------- | --------------------- | ---------------------- | ---------------------------------------------------- |
| 1   | Write root `README.md` — overview, architecture, quick start | 30m      | All PRDs              | 🟡 Partial             | AI drafts, human refines voice and accuracy          |
| 2   | Write `CONTRIBUTING.md` — workflow, conventions, style guide | 25m      | PRD-001 (conventions) | 🟡 Partial             | AI drafts, human reviews conventions                 |
| 3   | Write `CLAUDE.md` — full Claude Code context file            | 30m      | All PRDs              | 🟡 Partial             | Critical document — human reviews every section      |
| 4   | Write `docs/getting-started.md` — checklists from spec       | 20m      | All PRDs              | ✅ Yes                 | Checklist format from spec                           |
| 5   | Write `docs/commands.md` — key commands reference            | 15m      | All PRDs              | ✅ Yes                 | Extract from spec and package.json scripts           |
| 6   | Write `docs/environment.md` — env var documentation          | 15m      | All PRDs              | ✅ Yes                 | Extract from .env.example with descriptions          |
| 7   | Write `docs/troubleshooting.md` — common gotchas             | 20m      | All PRDs              | 🟡 Partial             | AI lists known issues, human adds real-world fixes   |
| 8   | Write `docs/adr-template.md` — ADR format                    | 10m      | None                  | ✅ Yes                 | Standard ADR template                                |
| 9   | Write per-workspace README.md files (5 workspaces)           | 25m      | PRDs 005, 010-013     | ✅ Yes                 | Template with workspace-specific details             |
| 10  | Review all documentation for accuracy                        | 20m      | Tasks 1-9             | ❌ No                  | Human reviews every document against actual codebase |

### Claude Code Task Annotations

**Task 3 (CLAUDE.md)**:

- **Context needed**: Full project architecture from all PRDs. File organization patterns. Coding conventions. Dependency boundaries from PRD-001. Testing patterns from PRD-015.
- **Constraints**: Must be accurate — incorrect CLAUDE.md is worse than none. Include "Do NOT" section to prevent common AI mistakes. Keep under 500 lines. Focus on actionable patterns, not prose explanations.
- **Done state**: A new Claude Code session can read CLAUDE.md and immediately: add a tRPC router, add a database table, write tests, without additional context.
- **Verification command**: Give CLAUDE.md to Claude Code and ask it to add a new feature — verify it follows the conventions.

**Task 7 (Troubleshooting)**:

- **Context needed**: Known Bun quirks (Pino worker threads, ESM resolution). Drizzle gotchas (migration vs. push, $onUpdate behavior). Better Auth setup issues (auth tables, CLI commands). tRPC version compatibility.
- **Constraints**: Every issue must have a concrete solution, not just "check the docs." Include the error message the developer would see.
- **Done state**: Top 10 most likely setup issues have documented solutions.
- **Verification command**: Code review — are these real issues?

---

## 7. Testing Strategy

### Test Pyramid for This PRD

Documentation doesn't have traditional tests, but it has verification:

| Level        | What's Tested                       | Tool          | Method                                                 |
| ------------ | ----------------------------------- | ------------- | ------------------------------------------------------ |
| Accuracy     | Commands actually work              | Manual        | Run every command in docs/commands.md                  |
| Completeness | Every env var documented            | Script        | Compare .env.example with docs/environment.md          |
| Links        | No broken links in markdown         | Markdown lint | `markdownlint` or manual check                         |
| CLAUDE.md    | AI agent can follow the conventions | Claude Code   | Give CLAUDE.md to Claude Code, ask it to add a feature |

### Key Test Scenarios

1. **Fresh clone test**: New developer follows getting-started.md → running dev environment in < 30 min
2. **Command accuracy**: Every command in docs/commands.md runs successfully
3. **Env var completeness**: Every var in `.env.example` has an entry in docs/environment.md
4. **CLAUDE.md test**: Claude Code reads CLAUDE.md, adds a tRPC router — follows all conventions

---

## 8. Non-Functional Requirements

| Requirement             | Target                                                   | How Verified                                                |
| ----------------------- | -------------------------------------------------------- | ----------------------------------------------------------- |
| Readability             | Scannable by someone in a hurry                          | Human review — no walls of text                             |
| Accuracy                | Every command, path, and convention matches the codebase | Manual verification                                         |
| Maintenance             | Documents updated when stack changes                     | CONTRIBUTING.md includes "update docs" as PR checklist item |
| CLAUDE.md effectiveness | AI agent follows conventions on first prompt             | Test with Claude Code                                       |

---

## 9. Rollout & Migration

1. Write all documentation
2. Verify commands against actual codebase
3. Test getting-started checklist on a fresh environment
4. Test CLAUDE.md with Claude Code
5. Commit as the final PR in the boilerplate setup

This is the capstone — it ships last because it documents everything that came before.

---

## 10. Open Questions

| #   | Question                                                                    | Impact                                     | Owner | Status                                                                             |
| --- | --------------------------------------------------------------------------- | ------------------------------------------ | ----- | ---------------------------------------------------------------------------------- |
| 1   | Should CLAUDE.md live in the root or in a `.claude/` directory?             | Affects Claude Code's auto-discovery       | DX    | Resolved — root. Claude Code looks for CLAUDE.md at project root.                  |
| 2   | Should we include a video walkthrough or just written docs?                 | Richer onboarding vs. maintenance overhead | DX    | Open — written docs first. Video per-project if team wants it.                     |
| 3   | Should docs/ be a separate workspace with its own build (e.g., Docusaurus)? | Affects discoverability and maintenance    | DX    | Resolved — plain markdown in `docs/`. No build system for docs in the boilerplate. |

---

## 11. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-02-07 | AI-Native TPM | Initial draft |
