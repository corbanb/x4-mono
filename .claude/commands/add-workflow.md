Scaffold a GitHub Actions workflow.

Input format: `workflow-name` (e.g., `ci`, `deploy-api`, `neon-branch`, `release-desktop`)

## Steps

1. **Parse the input** — extract the workflow name from: $ARGUMENTS
2. **Detect workflow type** based on name:
   - `ci` / `test` → CI pipeline (lint, type-check, test)
   - `deploy-*` → Deployment workflow for specific app
   - `neon-*` → Neon database branch management
   - `release-*` → Release/build workflow for specific platform
   - Other → General workflow scaffold
3. **Read existing workflows** — check `.github/workflows/` for existing patterns and naming conventions
4. **Create the workflow file** — write `.github/workflows/{name}.yml` with:
   - Appropriate triggers (`push`, `pull_request`, `workflow_dispatch`)
   - **Path filters** — scope to relevant directories (e.g., `paths: ['apps/api/**']` for deploy-api)
   - **Bun setup** — `oven-sh/setup-bun@v2` action
   - **Dependency install** — `bun install --frozen-lockfile`
   - **Turbo cache** — `actions/cache` with `.turbo` directory key
   - **Affected-only execution** — `--filter=[HEAD^]` where appropriate
   - **Secret references** — `${{ secrets.* }}` syntax (never hardcoded)
   - **Job dependencies** — proper `needs:` chains between jobs
5. **Report** — list the created workflow file and any GitHub secrets that need to be configured in repo settings

## Rules

- Always use `bun install --frozen-lockfile` in CI (never plain `bun install`)
- Always add path filters to scoped workflows (don't run deploy-api on web changes)
- Always use `actions/cache` for `.turbo` directory
- Always use `${{ secrets.* }}` for sensitive values — never hardcode
- Use `oven-sh/setup-bun@v2` for Bun setup
- Use `--filter=[HEAD^]` for affected-only test runs
- Include cleanup jobs where applicable (Neon branch deletion, preview teardown)
- Follow the naming pattern of existing workflows
