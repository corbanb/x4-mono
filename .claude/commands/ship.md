Ship the current work — branch, commit, and open a pull request.

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
4. **Create branch** — create and switch to the new branch from `main`:
   ```
   git checkout -b <branch-name>
   ```
5. **Group changes into atomic commits** — analyze the changed files and group them into logical commits. Each commit should be a self-contained unit of work. Common groupings:
   - By workspace or directory (e.g., all `wiki/` changes, all `.github/` changes, all `.claude/` changes)
   - By feature or concern (e.g., "add issue templates", "add CI workflow", "add PRD system")
   - Config files that belong together (e.g., `CLAUDE.md` + `.claude/settings.json` + `.claude/commands/`)
   - Stage specific files for each commit using `git add <file1> <file2>` (never `git add -A` or `git add .`)
   - Write clear, conventional commit messages:
     - Format: `type(scope): description` (e.g., `docs(wiki): add PRD lifecycle system and template`)
     - Types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`
     - Keep the first line under 72 characters
     - Add a body paragraph if the commit needs more context
6. **Push branch** — push to remote with upstream tracking:
   ```
   git push -u origin <branch-name>
   ```
7. **Open pull request** — create a PR using `gh pr create`:
   - Title: concise summary of the work (under 72 chars)
   - Body: use the PR template format from `.github/PULL_REQUEST_TEMPLATE.md`
   - Include: summary bullets, related PRD reference, type of change, what to review
   - Target: `main` branch
8. **Report** — output the PR URL and a summary of commits created

## Rules

- Never force push
- Never commit to `main` directly — always use a feature branch
- Never use `git add -A` or `git add .` — stage specific files to keep commits atomic
- Never commit `.env.local` or files containing secrets
- Write conventional commit messages (`type(scope): description`)
- Each commit should pass linting/type-check independently if possible
- If there's only one logical group of changes, a single commit is fine — don't split artificially
- Ask the user before pushing if there are any uncommitted changes that look unintentional
