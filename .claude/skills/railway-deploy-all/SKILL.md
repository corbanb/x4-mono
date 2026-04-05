---
name: railway-deploy-all
description: Deploy all Railway services (api, marketing, docs) for the x4-mono project. Use when the user says "deploy everything", "deploy all services", "deploy to railway", "push to railway", "nothing deployed", or wants to check why Railway deployments aren't happening. Also handles checking deployment status and diagnosing stale GitHub webhook issues.
---

# Deploy All Railway Services

Deploy all x4-mono services to Railway and verify they're healthy.

## Services

The x4-mono project has 3 Railway services:

| Service       | Build Command                                       | Start Command                                              |
| ------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| **api**       | `bun install`                                       | `cd apps/api && bun run src/index.ts`                      |
| **marketing** | `bun install && cd apps/marketing && bun run build` | `cd apps/marketing && npx next start --port ${PORT:-3001}` |
| **docs**      | `bun install && cd apps/docs && bun run build`      | `cd apps/docs && npx next start --port ${PORT:-3003}`      |

## Step 1: Check Current State

```bash
railway status --json
```

Then check recent deployments for each service to see what's stale:

```bash
railway service status --all --json
```

## Step 2: Check GitHub Integration

If auto-deploys from GitHub aren't triggering, the webhook may be stale. Check the last deployment date for each service:

```bash
# Check each service's latest deployment
railway logs --service api --lines 5
railway logs --service marketing --lines 5
railway logs --service docs --lines 5
```

If the last deployment is older than the latest git push, the GitHub webhook is likely disconnected. Solutions:

1. **Manual deploy** with `railway up --service <name> --detach -m "description"`
2. **Fix webhook** in Railway Dashboard → Project → Settings → Source → Reconnect GitHub

## Step 3: Deploy All Services

Deploy each service with a descriptive commit message:

```bash
# Deploy all three services in parallel
railway up --service api --detach -m "Deploy latest changes"
railway up --service marketing --detach -m "Deploy latest changes"
railway up --service docs --detach -m "Deploy latest changes"
```

If only specific services need updating (e.g., only marketing site changed):

```bash
railway up --service marketing --detach -m "Update marketing site content"
```

## Step 4: Verify Deployments

After deploying, check that all services are healthy:

```bash
railway service status --all --json
```

Or check individual service logs for errors:

```bash
railway logs --service api --lines 20
railway logs --service marketing --lines 20
railway logs --service docs --lines 20
```

## Diagnosing Auto-Deploy Failures

If pushes to `main` aren't triggering Railway deploys:

1. **Check deployment history** — if recent deploys lack `commitHash` and `repo` fields, they were manual, not GitHub-triggered
2. **Stale webhook** — Railway's GitHub integration webhook can go stale. Fix by:
   - Going to Railway Dashboard → Project → Settings
   - Disconnecting and reconnecting the GitHub repo
   - Or using `railway redeploy --service <name>` to trigger a fresh deploy from the connected repo
3. **`railway redeploy` vs `railway up`** — `redeploy` reuses the old image. Use `railway up --service <name>` for a fresh deploy from local code.

## Production URLs

| Service   | URL                                        |
| --------- | ------------------------------------------ |
| API       | `api-production-435d.up.railway.app`       |
| Marketing | `marketing-production-2468.up.railway.app` |
| Docs      | `docs-production-c302.up.railway.app`      |

## Quick Reference

| Action             | Command                                                     |
| ------------------ | ----------------------------------------------------------- |
| Deploy all         | Run `railway up --service <name> --detach` for each service |
| Check status       | `railway service status --all --json`                       |
| View logs          | `railway logs --service <name> --lines 50`                  |
| Redeploy from repo | `railway redeploy --service <name>`                         |
| Manual deploy      | `railway up --service <name> --detach -m "message"`         |
