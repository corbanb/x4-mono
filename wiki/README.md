# x4-mono Wiki

Welcome to the x4-mono project wiki. This is the knowledge base for a full-stack TypeScript monorepo boilerplate that supports web, mobile, and desktop applications from a single codebase.

## What is x4-mono?

x4-mono is a production-ready monorepo boilerplate built with:

- **Bun** — Runtime and package manager
- **Turborepo** — Monorepo build orchestration
- **Hono + tRPC** — Type-safe API server
- **Next.js 15** — Web application (App Router)
- **Expo** — Mobile application (React Native)
- **Electron** — Desktop application
- **Drizzle ORM** — Database layer (Neon Postgres)
- **Better Auth** — Authentication and authorization
- **Vercel AI SDK** — AI integration (Claude)
- **Zod** — Schema validation and type inference

## Wiki Contents

### PRDs (Product Requirements Documents)

The project is defined by 16 PRDs that specify every subsystem from monorepo tooling to developer experience. Each PRD follows an [11-section template](_templates/prd-template.md) with structured implementation plans and Claude Code task annotations.

| Directory                  | Contents                                       |
| -------------------------- | ---------------------------------------------- |
| [`inbox/`](inbox/)         | Unstarted PRDs — all 16 initial PRDs live here |
| [`active/`](active/)       | PRDs currently being implemented               |
| [`completed/`](completed/) | PRDs verified against success criteria         |
| [`archived/`](archived/)   | Superseded or abandoned PRDs                   |

See **[status.md](status.md)** for the full PRD inventory, dependency graph, and progress log.

### Naming Convention

PRD files follow this pattern:

```
prd-NNN-short-slug.md
```

- `NNN`: Zero-padded 3-digit ID (001, 002, ... 017)
- `short-slug`: Kebab-case summary of the PRD title
- Examples: `prd-001-monorepo-foundation.md`, `prd-017-notifications.md`

### Creating a New PRD

1. Copy [`_templates/prd-template.md`](_templates/prd-template.md) to `inbox/prd-NNN-short-slug.md`
2. Fill in all 11 sections (use existing PRDs as reference)
3. Update the PRD Inventory table in [status.md](status.md)
4. Add the PRD to the dependency graph if it has dependencies or blocks other PRDs
5. Or use the `/new-prd` Claude Code command for assisted creation

### PRD Template

The canonical template is at [`_templates/prd-template.md`](_templates/prd-template.md). Sections:

1. Problem Statement
2. Success Criteria
3. Scope
4. System Context
5. Technical Design
6. Implementation Plan
7. Testing Strategy
8. Non-Functional Requirements
9. Rollout & Migration
10. Open Questions
11. Revision History

Each PRD also has header metadata: PRD ID, Title, Author, Status, Version, Date, Dependencies, Blocks.

## Project Architecture

```
x4-mono/
├── packages/
│   ├── shared/               # Types, validators, utils, UI, hooks, API client
│   ├── database/             # Drizzle schema, migrations, seed, db client
│   ├── auth/                 # Better Auth config, session management
│   └── ai-integrations/     # Vercel AI SDK provider configs
│
├── apps/
│   ├── api/                  # Hono + tRPC server (standalone backend)
│   ├── web/                  # Next.js 15 App Router
│   ├── mobile/               # Expo + React Native
│   ├── desktop/              # Electron wrapper
│   └── marketing/            # Next.js static marketing site
│
├── wiki/                     # This wiki — PRDs, templates, status
├── .github/                  # Issue templates, PR template, CI, CODEOWNERS
├── CLAUDE.md                 # Claude Code project context
└── .claude/                  # Claude Code settings and commands
```

## Key Links

- [Project Status & PRD Tracking](status.md)
- [PRD Template](_templates/prd-template.md)
- [CLAUDE.md](../CLAUDE.md) — Claude Code project context and conventions
