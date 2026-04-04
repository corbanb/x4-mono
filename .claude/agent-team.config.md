# Agent Team Config

## Project
x4-mono — full-stack TypeScript monorepo (Bun + Turborepo)

## Work Queue
source: wiki/inbox/          # PRDs to pick up
active: wiki/active/         # In-progress PRDs
completed: wiki/completed/   # Done PRDs

## Test Commands
- bun turbo type-check
- bun turbo lint
- bun turbo test

## Branch Strategy
base: main
pattern: feature/{prd-slug}

## Agent Routing
- backend: Hono, tRPC, API routes, auth, database
- frontend: Next.js, React, components, pages
- database: Drizzle schema, migrations, seeds
- testing: Bun test runner, test patterns
- devops: CI/CD, GitHub Actions, Railway, Turborepo
