# x4-mono

Full-stack TypeScript monorepo boilerplate for building multi-platform applications with a shared backend.

## Tech Stack

- **Runtime**: Bun + Node.js (for Expo/Electron compatibility)
- **Monorepo**: Bun workspaces + Turborepo
- **API**: Hono + tRPC v11
- **Web**: Next.js 15 App Router
- **Mobile**: Expo + React Native
- **Desktop**: Electron
- **Database**: Neon (Postgres) + Drizzle ORM
- **Auth**: Better Auth
- **AI**: Vercel AI SDK + Claude
- **Validation**: Zod
- **Styling**: Tailwind CSS

## Quick Start

```bash
# Install dependencies
bun install

# Start all workspaces in dev mode
bun turbo dev

# Type-check all workspaces
bun turbo type-check

# Lint all workspaces
bun turbo lint
```

## Workspace Structure

```
packages/
  shared/               # Types, validators, utils, UI components, hooks, API client
  database/             # Drizzle schema, migrations, seed, db client
  auth/                 # Better Auth config, session management
  ai-integrations/      # Vercel AI SDK provider configs, streaming helpers

apps/
  api/                  # Hono + tRPC server (port 3002)
  web/                  # Next.js 15 App Router (port 3000)
  mobile/               # Expo + React Native
  desktop/              # Electron wrapper
  marketing/            # Next.js static marketing site (port 3001)
```

## Available Commands

| Command | Description |
|---------|-------------|
| `bun install` | Install all workspace dependencies |
| `bun turbo dev` | Start all workspaces in dev mode |
| `bun turbo build` | Build all workspaces |
| `bun turbo type-check` | TypeScript type checking across all workspaces |
| `bun turbo lint` | ESLint across all workspaces |
| `bun turbo test` | Run tests across all workspaces |
| `bun db:generate` | Generate Drizzle migration from schema changes |
| `bun db:push` | Push schema to dev database |
| `bun db:migrate` | Run migrations against production database |
| `bun db:studio` | Open Drizzle Studio |
| `bun db:seed` | Seed database with test data |
| `bun clean` | Remove all build artifacts and node_modules |

## Environment Setup

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

See `.env.example` for all required and optional environment variables.

## Dependency Boundaries

Cross-package imports are enforced by `eslint-plugin-boundaries`:

```
packages/shared/types    -> imports NOTHING (leaf node)
packages/shared/utils    -> can import: shared/types
packages/database        -> can import: shared/types
packages/auth            -> can import: database, shared/types
packages/ai-integrations -> can import: shared/types
apps/*                   -> can import: any package
```

**Never import from `apps/*` in `packages/*`.**

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and conventions.
