# x4-mono

Full-stack TypeScript monorepo boilerplate for building multi-platform applications (web, mobile, desktop) with a shared backend. Production-ready foundation with type-safe APIs, authentication, database ORM, AI integration, and CI/CD.

## Quick Start

The fastest way to get started is with the `create-x4` CLI:

```bash
# Install Bun (if you don't have it)
curl -fsSL https://bun.sh/install | bash

# Create a new project
bunx create-x4 my-app

# Start developing
cd my-app
bun dev
```

The interactive wizard walks you through naming, platform selection, and environment setup. Your app will be running at:

- **Web** — http://localhost:3000
- **API** — http://localhost:3002
- **Marketing** — http://localhost:3001

### Presets

Skip the wizard with a preset for common setups:

```bash
# Full stack — Web + API + Mobile + Desktop + AI + Marketing + Docs
bunx create-x4 my-app --preset full-stack --yes

# SaaS — Web + API + AI (most common)
bunx create-x4 my-app --preset saas --yes

# Landing page — Web + API + Marketing
bunx create-x4 my-app --preset landing --yes

# API only — Hono + tRPC server
bunx create-x4 my-app --preset api-only --yes
```

### Excluding Platforms

Don't need mobile or desktop? Use `--no-*` flags:

```bash
bunx create-x4 my-app --no-mobile --no-desktop
```

Available flags: `--no-mobile`, `--no-desktop`, `--no-marketing`, `--no-docs`, `--no-ai`

### Other Package Managers

Bun is recommended, but npm, yarn, and pnpm work too:

```bash
npx create-x4 my-app
# or
yarn create x4 my-app
# or
pnpm create x4 my-app
```

## Prerequisites

- [Bun](https://bun.sh) >= 1.1 (recommended) or Node.js >= 18
- [Neon](https://neon.tech) Postgres database (free tier works)
- [Anthropic API key](https://console.anthropic.com) for AI features (optional)

## Manual Setup

If you prefer to clone the repo directly instead of using the CLI:

```bash
# Clone and install
git clone https://github.com/corbanb/x4-mono.git my-project
cd my-project
bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials:
#   DATABASE_URL   — Neon Postgres connection string
#   JWT_SECRET     — Random string, 32+ characters
#   BETTER_AUTH_SECRET — Random string, 32+ characters
#   ANTHROPIC_API_KEY  — Your Claude API key (starts with sk-)

# Set up database
bun db:push        # Push schema to dev database
bun db:seed        # Seed with test data

# Start development
bun dev            # Starts all workspaces
```

See [docs/environment.md](docs/environment.md) for the full environment variable reference.

## Architecture

```
apps/
  api/          Hono + tRPC v11 on Bun         :3002
  web/          Next.js 15 App Router           :3000
  mobile-main/  Expo + React Native
  desktop/      Electron
  marketing/    Next.js static site             :3001

packages/
  shared/       Zod types, validators, utils, UI components, hooks
  database/     Drizzle ORM + Neon Postgres
  auth/         Better Auth (server + clients)
  ai-integrations/  Vercel AI SDK (Claude + OpenAI)
```

## Tech Stack

| Layer      | Technology                          |
| ---------- | ----------------------------------- |
| Runtime    | Bun >= 1.1                          |
| Monorepo   | Bun workspaces + Turborepo          |
| API        | Hono + tRPC v11                     |
| Web        | Next.js 15, React 19, Tailwind v4   |
| Mobile     | Expo 52, React Native               |
| Desktop    | Electron 33, electron-vite          |
| Database   | Neon Postgres + Drizzle ORM         |
| Auth       | Better Auth with bearer tokens      |
| AI         | Vercel AI SDK + Claude              |
| Validation | Zod (source of truth for all types) |
| Testing    | Bun test runner + Playwright E2E    |
| CI/CD      | GitHub Actions + Vercel             |

## Key Commands

| Command           | Description                             |
| ----------------- | --------------------------------------- |
| `bun dev`         | Start all workspaces in dev mode        |
| `bun build`       | Build all workspaces                    |
| `bun test`        | Run tests across all workspaces         |
| `bun type-check`  | TypeScript type checking                |
| `bun lint`        | ESLint across all workspaces            |
| `bun db:generate` | Generate Drizzle migration              |
| `bun db:push`     | Push schema to dev database             |
| `bun db:migrate`  | Run migrations (production)             |
| `bun db:seed`     | Seed database with test data            |
| `bun db:studio`   | Open Drizzle Studio GUI                 |
| `bun clean`       | Remove build artifacts and node_modules |

See [docs/commands.md](docs/commands.md) for the full reference.

## AI-Assisted Development

This project includes tooling for AI-assisted development with Claude Code.

### LLM Reference Docs

Download the latest documentation for all major dependencies:

```bash
bun run setup:ai-docs
```

This fetches `llms.txt` files from Hono, Drizzle, tRPC, Better Auth, Bun, Turborepo, Zod, Next.js, Expo, React, Neon, and Vercel into `.claude/docs/`. Claude Code reads these on demand for accurate, up-to-date API guidance.

### Superpowers Skills

Install the [Superpowers](https://github.com/coltontedder/superpowers) skill pack for enhanced Claude Code workflows:

```bash
claude install-skill coltontedder/superpowers
```

This adds skills for test-driven development, systematic debugging, parallel agents, code review, and more.

### Claude Commands

The project includes 24 custom Claude commands in `.claude/commands/` for scaffolding, specialist agents, and PRD lifecycle management. Type `/` in Claude Code to see them.

## Documentation

| Document                                           | Description                          |
| -------------------------------------------------- | ------------------------------------ |
| [Getting Started](docs/getting-started.md)         | Step-by-step setup checklist         |
| [Commands Reference](docs/commands.md)             | All available commands               |
| [Environment Variables](docs/environment.md)       | Every env var documented             |
| [Testing Conventions](docs/testing-conventions.md) | Test patterns, helpers, mocks        |
| [Troubleshooting](docs/troubleshooting.md)         | Common issues and solutions          |
| [Contributing](CONTRIBUTING.md)                    | Development workflow and conventions |
| [ADR Template](docs/adr-template.md)               | Architecture Decision Record format  |

## Dependency Boundaries

Enforced by `eslint-plugin-boundaries`. Violations fail the lint step.

```
packages/shared          (leaf node - imports nothing)
packages/database        -> shared
packages/auth            -> database, shared
packages/ai-integrations -> shared
apps/*                   -> any package
```

Packages **never** import from apps. This is the most important boundary.

## License

Private - All rights reserved.
