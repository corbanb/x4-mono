# Deployment Guide

This guide covers deploying all x4-mono applications to production using Vercel (web apps + API), EAS (mobile), and electron-builder (desktop).

**Total cost: $0/month** on free tiers.

## Prerequisites

- A [Vercel](https://vercel.com) account (free Hobby plan)
- A [Neon](https://neon.tech) account (free tier: 0.5 GB storage)
- A [GitHub](https://github.com) repository with this codebase
- (Optional) [Expo](https://expo.dev) account for mobile builds
- (Optional) [Upstash](https://upstash.com) account for Redis rate limiting

## 1. Neon Database Setup

1. Create a new Neon project at [console.neon.tech](https://console.neon.tech)
2. Copy the connection string (it looks like `postgresql://user:pass@ep-xyz.us-east-2.aws.neon.tech/neondb?sslmode=require`)
3. Run migrations against production:

```bash
DATABASE_URL="your-production-connection-string" bun db:migrate
```

4. (Optional) Seed initial data:

```bash
DATABASE_URL="your-production-connection-string" bun db:seed
```

## 2. Vercel Project Setup

You need **4 Vercel projects** — one for each deployable web app.

### Create Projects

```bash
# Install Vercel CLI
bun add -g vercel

# Link each app (run from each app's directory)
cd apps/api && vercel link
cd apps/web && vercel link
cd apps/marketing && vercel link
cd apps/docs && vercel link
```

Each `vercel link` will create/connect a Vercel project and generate a `.vercel/project.json` with the project ID.

### Collect IDs

After linking, find your IDs:

| Value | Where to find it |
|-------|------------------|
| `VERCEL_TOKEN` | [vercel.com/account/tokens](https://vercel.com/account/tokens) — create a new token |
| `VERCEL_ORG_ID` | Vercel dashboard > Settings > General > "Your ID" |
| `VERCEL_PROJECT_ID_API` | `apps/api/.vercel/project.json` → `projectId` |
| `VERCEL_PROJECT_ID_WEB` | `apps/web/.vercel/project.json` → `projectId` |
| `VERCEL_PROJECT_ID_MARKETING` | `apps/marketing/.vercel/project.json` → `projectId` |
| `VERCEL_PROJECT_ID_DOCS` | `apps/docs/.vercel/project.json` → `projectId` |

### Set Environment Variables in Vercel

For each Vercel project, go to **Settings > Environment Variables** and add the required vars.

**API project** — needs all backend env vars:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon connection string |
| `JWT_SECRET` | `openssl rand -base64 48` |
| `BETTER_AUTH_SECRET` | `openssl rand -base64 48` |
| `BETTER_AUTH_URL` | Your production API URL (e.g., `https://api.yourdomain.com`) |
| `ANTHROPIC_API_KEY` | Your Claude API key |
| `WEB_URL` | Your production web URL (e.g., `https://app.yourdomain.com`) |
| `MARKETING_URL` | Your production marketing URL (e.g., `https://yourdomain.com`) |
| `DOCS_URL` | Your production docs URL (e.g., `https://docs.yourdomain.com`) |
| `NODE_ENV` | `production` |

**Web project** — needs the API URL:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | Your production API URL (e.g., `https://api.yourdomain.com`) |

**Marketing project** — no additional env vars needed (static site).

**Docs project** — no additional env vars needed (static site with bundled OpenAPI spec).

## 3. GitHub Actions Secrets

Go to your GitHub repo > **Settings > Secrets and variables > Actions** and add:

| Secret | Description |
|--------|-------------|
| `VERCEL_TOKEN` | Vercel personal access token |
| `VERCEL_ORG_ID` | Vercel team/org ID |
| `VERCEL_PROJECT_ID_API` | Vercel project ID for `apps/api` |
| `VERCEL_PROJECT_ID_WEB` | Vercel project ID for `apps/web` |
| `VERCEL_PROJECT_ID_MARKETING` | Vercel project ID for `apps/marketing` |
| `VERCEL_PROJECT_ID_DOCS` | Vercel project ID for `apps/docs` |

### Optional Secrets

| Secret | Description |
|--------|-------------|
| `EXPO_TOKEN` | EAS token for mobile builds |
| `NEON_API_KEY` | Neon API key for CI branch previews |
| `NEON_PROJECT_ID` | Neon project ID for CI branch previews |

## 4. Domain Configuration

### Recommended Domain Setup

| App | Subdomain |
|-----|-----------|
| Marketing | `yourdomain.com` |
| Web | `app.yourdomain.com` |
| API | `api.yourdomain.com` |
| Docs | `docs.yourdomain.com` |

In each Vercel project, go to **Settings > Domains** and add your custom domain. Vercel handles SSL automatically.

## 5. How Deployments Work

### Production Deploys

Pushing to `main` triggers production deploys for any changed apps:

- `apps/api/**` changed → deploys API to production
- `apps/web/**` changed → deploys Web to production
- `apps/marketing/**` changed → deploys Marketing to production
- `apps/docs/**` changed → deploys Docs to production
- `packages/**` changed → deploys all apps (shared code changed)

### Preview Deploys

Opening a pull request automatically creates preview deployments for affected apps. Preview URLs are posted as PR comments (e.g., "**API Preview:** https://api-xyz-123.vercel.app").

Preview deploys use `VERCEL_URL` (auto-set by Vercel) as a fallback for `BETTER_AUTH_URL`, so auth works on preview URLs without manual configuration.

## 6. Mobile (Expo / EAS)

The mobile app uses [EAS Build](https://docs.expo.dev/build/introduction/) for building and [EAS Submit](https://docs.expo.dev/submit/introduction/) for app store submission.

### Setup

1. Install EAS CLI: `bun add -g eas-cli`
2. Log in: `eas login`
3. Configure in `apps/mobile/eas.json` (already done)

### Build

```bash
cd apps/mobile

# Development build (includes dev tools)
eas build --profile development --platform all

# Preview build (for TestFlight / internal testing)
eas build --profile preview --platform all

# Production build (for App Store / Play Store)
eas build --profile production --platform all
```

### CI Builds

The `deploy-mobile.yml` workflow triggers on push to `main` when `apps/mobile/**` changes. It requires the `EXPO_TOKEN` GitHub secret.

## 7. Desktop (Electron)

Desktop builds use `electron-builder` configured in `apps/desktop/electron-builder.yml`.

### Build Locally

```bash
cd apps/desktop

# Build for current platform
bun run build

# Build for specific platforms
bun run build:mac
bun run build:win
bun run build:linux
```

### CI Builds

The `deploy-desktop.yml` workflow creates GitHub Releases with platform-specific installers when `apps/desktop/**` changes on `main`.

## 8. Verification Checklist

After deploying, verify everything works:

```bash
# API health check
curl https://api.yourdomain.com/health

# OpenAPI spec
curl https://api.yourdomain.com/openapi.json

# API docs
open https://api.yourdomain.com/docs

# Web app
open https://app.yourdomain.com

# Marketing site
open https://yourdomain.com

# Developer docs
open https://docs.yourdomain.com
```

## 9. Scaling Beyond Free Tier

If you outgrow Vercel's free tier:

| Service | Free Tier | Paid Alternative |
|---------|-----------|------------------|
| Vercel | Hobby (100 GB bandwidth) | Pro ($20/mo) or self-host API on Railway ($5/mo) / Fly.io ($3/mo) |
| Neon | 0.5 GB storage, autosuspend | Launch ($19/mo) for always-on compute |
| EAS Build | 30 builds/month | Production plan ($99/mo) |
| Upstash Redis | 10K commands/day | Pay-as-you-go ($0.2/100K commands) |

The API is a standalone Hono app — to migrate away from Vercel serverless, add a `Dockerfile` and deploy to any container platform. No code changes needed.
