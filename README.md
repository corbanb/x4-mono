# x4-mono

Full-stack TypeScript monorepo boilerplate for building multi-platform applications (web, mobile, desktop) with a shared backend. Production-ready foundation with type-safe APIs, authentication, database ORM, AI integration, and CI/CD.

## Architecture

```
apps/
  api/          Hono + tRPC v11 on Bun         :3002
  web/          Next.js 15 App Router           :3000
  mobile/       Expo + React Native
  desktop/      Electron
  marketing/    Next.js static site             :3001

packages/
  shared/       Zod types, validators, utils, UI components, hooks
  database/     Drizzle ORM + Neon Postgres
  auth/         Better Auth (server + clients)
  ai-integrations/  Vercel AI SDK (Claude + OpenAI)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Bun >= 1.1 |
| Monorepo | Bun workspaces + Turborepo |
| API | Hono + tRPC v11 |
| Web | Next.js 15, React 19, Tailwind v4 |
| Mobile | Expo 52, React Native |
| Desktop | Electron 33, electron-vite |
| Database | Neon Postgres + Drizzle ORM |
| Auth | Better Auth with bearer tokens |
| AI | Vercel AI SDK + Claude |
| Validation | Zod (source of truth for all types) |
| Testing | Bun test runner + Playwright E2E |
| CI/CD | GitHub Actions + Vercel |

## Quick Start

```bash
bunx create-x4 my-app
cd my-app
bun dev
```

Or with a preset:

```bash
bunx create-x4 my-app --preset saas --yes
```

### Prerequisites

- [Bun](https://bun.sh) >= 1.1
- [Neon](https://neon.tech) Postgres database
- [Anthropic API key](https://console.anthropic.com) for AI features

### Manual Setup

```bash
# Clone and install
git clone <repo-url> my-project
cd my-project
bun install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your credentials (see docs/environment.md)

# Set up database
bun db:push        # Push schema to dev database
bun db:seed        # Seed with test data

# Start development
bun dev            # Starts all workspaces
```

The API runs on `http://localhost:3002`, web on `http://localhost:3000`, and marketing on `http://localhost:3001`.

## Key Commands

| Command | Description |
|---------|-------------|
| `bun dev` | Start all workspaces in dev mode |
| `bun build` | Build all workspaces |
| `bun test` | Run tests across all workspaces |
| `bun type-check` | TypeScript type checking |
| `bun lint` | ESLint across all workspaces |
| `bun db:generate` | Generate Drizzle migration |
| `bun db:push` | Push schema to dev database |
| `bun db:migrate` | Run migrations (production) |
| `bun db:seed` | Seed database with test data |
| `bun db:studio` | Open Drizzle Studio GUI |
| `bun clean` | Remove build artifacts and node_modules |

See [docs/commands.md](docs/commands.md) for the full reference.

## Documentation

| Document | Description |
|----------|-------------|
| [Getting Started](docs/getting-started.md) | Step-by-step setup checklist |
| [Commands Reference](docs/commands.md) | All available commands |
| [Environment Variables](docs/environment.md) | Every env var documented |
| [Testing Conventions](docs/testing-conventions.md) | Test patterns, helpers, mocks |
| [Troubleshooting](docs/troubleshooting.md) | Common issues and solutions |
| [Contributing](CONTRIBUTING.md) | Development workflow and conventions |
| [ADR Template](docs/adr-template.md) | Architecture Decision Record format |

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
