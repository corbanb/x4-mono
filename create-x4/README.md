# create-x4

Scaffold a full-stack TypeScript monorepo with [x4](https://github.com/corbanb/x4-mono).

## Quick Start

```bash
bunx create-x4 my-app
cd my-app
cp .env.example .env.local
bun db:push
bun dev
```

Or with npm:

```bash
npx create-x4 my-app
```

## What You Get

- **API** — Hono + tRPC v11 (port 3002)
- **Web** — Next.js 15 App Router (port 3000)
- **Mobile** — Expo + React Native
- **Desktop** — Electron
- **Marketing** — Next.js static site (port 3001)
- **Docs** — Fumadocs (port 3003)
- **Database** — Neon Postgres + Drizzle ORM
- **Auth** — Better Auth with bearer tokens
- **AI** — Vercel AI SDK + Claude
- **CI/CD** — GitHub Actions with Neon branching

## Options

```
Usage: create-x4 [project-name] [options]

Arguments:
  project-name          Directory and monorepo name (e.g., my-app)

Options:
  -s, --scope <scope>   npm scope for packages (default: @{project-name})
  --bundle-id <id>      Reverse-domain prefix (default: com.{project-name})
  --mobile-name <name>  Mobile app name (default: main)
  --no-mobile           Exclude Expo mobile app
  --no-desktop          Exclude Electron desktop app
  --no-marketing        Exclude marketing site
  --no-docs             Exclude docs site
  --no-ai               Exclude AI integration package
  --pm <manager>        Package manager: bun|npm|yarn|pnpm (default: auto-detect)
  --no-git              Skip git initialization
  --no-install          Skip dependency installation
  --branch <branch>     Template branch (default: main)
  -v, --verbose         Verbose output
  --version             Print version
  -h, --help            Print help
```

## Examples

Create with a custom npm scope:

```bash
bunx create-x4 my-app --scope @acme
```

Web + API only (no mobile, desktop, marketing, or docs):

```bash
bunx create-x4 my-app --no-mobile --no-desktop --no-marketing --no-docs
```

Skip dependency installation:

```bash
bunx create-x4 my-app --no-install
```

Custom mobile app name:

```bash
bunx create-x4 my-app --mobile-name consumer
```

## Adding Apps to an Existing Monorepo

Use `create-x4 add` to scaffold additional mobile or web apps into an existing x4 monorepo.

```bash
# Add a new mobile app
bunx create-x4 add mobile-app --name admin

# Add a new web app
bunx create-x4 add web-app --name portal
```

Run from anywhere inside the monorepo. The command auto-detects the root, scope, and bundle ID.

### Options

```
Usage: create-x4 add <template> [options]

Templates:
  mobile-app            Expo + React Native app
  web-app               Next.js 15 app

Options:
  --name <name>         App name (kebab-case)
  --bundle-id <id>      Override bundle ID prefix (mobile only)
  --no-install          Skip dependency installation
```

## License

MIT
