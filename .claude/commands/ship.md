Ship the current work — branch, commit, open a pull request, then watch CI and fix failures.

Input format: `short description of the work` (e.g., `PRD-001 monorepo foundation scaffolding`)

## Steps

1. **Parse the input** — extract the work description from: $ARGUMENTS
2. **Generate branch name** — create a kebab-case branch name from the description, prefixed with a category:
   - `feat/` for new features or PRD implementations
   - `fix/` for bug fixes
   - `docs/` for documentation-only changes
   - `chore/` for tooling, config, or infrastructure
   - Example: `feat/prd-001-monorepo-foundation` or `chore/dev-infrastructure-scaffolding`
3. **Check current state** — run `git status` to see all changed, staged, and untracked files. Confirm there are changes to ship.
4. **Run boundary check** — scan for convention violations before committing:
   - Check for `console.log` in production code (outside test files)
   - Check for `any` type annotations in changed files
   - Check for dependency boundary violations (packages importing from apps)
   - Check for banned package imports (jest, express, prisma, next-auth)
   - If violations found: report them and ask whether to proceed or fix first
5. **Test coverage review** — verify that changed code has adequate test coverage:
   - **Detect change type** from `git diff`/`git status`:
     - Docs-only (all `.md`, `.mdx`, `meta.json`, `docs/**`, `wiki/**`) → skip with note "Docs-only change — test review skipped"
     - Config-only (all `*.json`, `*.config.*`, `*.yml` with no logic) → skip with note "Config-only change — test review skipped"
     - Code change → proceed with review
   - **For each changed source file**, check for a co-located test file:
     - `apps/api/src/routers/foo.ts` → look for `foo.test.ts` in the same directory
     - `packages/shared/utils/bar.ts` → look for `bar.test.ts` in the same directory
     - `apps/web/src/components/Foo.tsx` → look for `Foo.test.tsx` in the same directory
   - **Classify gaps**:
     - **Critical**: new source file with exports but no test file exists
     - **Warning**: modified source file where test file exists but was NOT modified (tests may be stale)
     - **Info**: file types that typically don't need tests (config, types-only, CSS, layouts, `.mdx`)
   - **Report** a summary table of findings (file, status, classification)
   - **Ask user**: choose one of:
     - (a) Generate missing tests now — create test files following the project's test patterns (see CLAUDE.md Test Patterns), then stage them
     - (b) Proceed without tests — continue shipping, note the gap in the PR body
     - (c) Abort — stop the ship workflow
6. **Documentation review** — check if changed code requires documentation updates:
   - **Scan changed files** and categorize documentation impact:
     - New/modified tRPC routers → run `bun --filter @x4/docs run generate` to regenerate API reference pages
     - New/modified workspace structure (new app or package) → check for workspace README
     - New environment variables → check `docs/environment.md` and `.env.example`
     - Auth, error handling, or rate limiting changes → check corresponding Fumadocs pages in `apps/docs/content/docs/`
     - Middleware order changes → check CLAUDE.md middleware section
   - **Classify each gap**:
     - **Auto-update**: clear pattern that can be fixed automatically (regenerate API pages, add missing README section)
     - **Manual review**: ambiguous impact that needs user judgment
     - **No action**: no documentation impact detected
   - **Report** findings
   - **Ask user**: choose one of:
     - (a) Auto-update now — generate/update docs, run OpenAPI regeneration if needed, update `meta.json`, stage changes
     - (b) Proceed without updates — continue shipping, note the gap in the PR body
     - (c) Abort — stop the ship workflow
7. **Create branch** — create and switch to the new branch from `main`:
   ```
   git checkout -b <branch-name>
   ```
8. **Group changes into atomic commits** — analyze the changed files and group them into logical commits. Each commit should be a self-contained unit of work. Common groupings:
   - By workspace or directory (e.g., all `wiki/` changes, all `.github/` changes, all `.claude/` changes)
   - By feature or concern (e.g., "add issue templates", "add CI workflow", "add PRD system")
   - Config files that belong together (e.g., `CLAUDE.md` + `.claude/settings.json` + `.claude/commands/`)
   - Generated test files → `test(scope): add tests for {feature}`
   - Updated documentation → `docs(scope): update documentation for {feature}`
   - Test and docs commits come AFTER the main feature/fix commits
   - Stage specific files for each commit using `git add <file1> <file2>` (never `git add -A` or `git add .`)
   - Write clear, conventional commit messages:
     - Format: `type(scope): description` (e.g., `docs(wiki): add PRD lifecycle system and template`)
     - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`
     - Keep the first line under 72 characters
     - Add a body paragraph if the commit needs more context
9. **Push branch** — push to remote with upstream tracking:
   ```
   git push -u origin <branch-name>
   ```
10. **Open pull request** — create a PR using `gh pr create`:
    - Title: concise summary of the work (under 72 chars)
    - Body: use the PR template format from `.github/PULL_REQUEST_TEMPLATE.md`
    - Include: summary bullets, related PRD reference, type of change, what to review
    - Include optional **Test Coverage** section: what was reviewed, gaps found, tests generated or skipped
    - Include optional **Documentation** section: what was updated, API pages regenerated, or gaps noted
    - Target: `main` branch
11. **Report** — output the PR URL and a summary of commits created

12. **Watch CI** — monitor the PR's CI checks until they all complete:
    - Run `gh pr checks <pr-number> --watch` to stream check status in real time
    - If `--watch` is unavailable or times out, poll with `gh pr checks <pr-number>` every 30 seconds
    - Wait until every check reaches a terminal state (pass, fail, or cancelled)
    - Report the final status of all checks to the user

13. **Fix CI failures** — if any checks failed, enter a fix loop (max 3 iterations):
    - **Diagnose**: For each failed check, fetch the logs:
      ```
      gh run view <run-id> --log-failed
      ```
      If `--log-failed` output is too large or unclear, try `gh run view <run-id> --log` and search for the error.
    - **Analyze**: Read the failure logs and identify the root cause. Common failures:
      - Type errors → fix the type issue in the relevant file
      - Lint errors → fix the lint violation
      - Test failures → read the failing test, understand the assertion, fix the code or test
      - Build errors → fix imports, missing deps, config issues
      - Timeout/infra flakes → note as non-actionable, do not retry
    - **Fix**: Make the necessary code changes to resolve the failure
    - **Commit & push**: Stage only the fix files, commit with message format:
      ```
      fix(scope): resolve CI failure — <brief description>
      ```
      Then push to the same branch (never force push):
      ```
      git push
      ```
    - **Re-watch**: After pushing the fix, go back to step 12 to watch the new CI run
    - **Bail out**: If after 3 fix iterations CI still fails, or if the failure is not actionable (infra flake, secret not configured, external service down), report the situation to the user and stop. Do NOT keep looping.

## Rules

- Never force push
- Never commit to `main` directly — always use a feature branch
- Never use `git add -A` or `git add .` — stage specific files to keep commits atomic
- Never commit `.env.local` or files containing secrets
- Write conventional commit messages (`type(scope): description`)
- Each commit should pass linting/type-check independently if possible
- If there's only one logical group of changes, a single commit is fine — don't split artificially
- Ask the user before pushing if there are any uncommitted changes that look unintentional
- Run boundary checks before committing — report violations and let the user decide
- During CI fix loop: only fix what the CI logs clearly indicate — do not make unrelated changes
- If a CI failure requires a secret or external service that isn't configured, report it and stop — don't try to work around it
- Cap the fix loop at 3 attempts to avoid infinite cycles
- Test review is advisory — the user always decides whether to generate tests, skip, or abort
- Documentation review is advisory — the user always decides whether to update docs, skip, or abort
- For docs-only changes (all files are `.md`, `.mdx`, `meta.json`, or under `docs/`/`wiki/`), skip test review entirely
- Never generate tests for config files, type-only files, or `.mdx` files
- When regenerating API reference pages, run `bun --filter @x4/docs run generate`
