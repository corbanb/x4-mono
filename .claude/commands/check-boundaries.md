Audit the codebase for convention violations and dependency boundary issues.

Input format: optional workspace name (e.g., `api`, `web`, `shared`) — defaults to all workspaces

## Steps

1. **Parse the input** — extract the optional workspace filter from: $ARGUMENTS
2. **Scan for dependency boundary violations**:
   - Check `packages/*` for imports from `apps/*` (critical violation)
   - Check `packages/shared/types` for imports from any other package (leaf node)
   - Check `packages/shared/utils` for imports outside `shared/types`
   - Check `packages/database` for imports outside `shared/types`
   - Check `packages/auth` for imports outside `database`, `shared/types`
   - Check `packages/ai-integrations` for imports outside `shared/types`
3. **Check naming conventions**:
   - Files should be kebab-case (flag PascalCase or camelCase `.ts`/`.tsx` files)
   - Components should be PascalCase in their export name
   - Database tables should be snake_case
   - Constants should be SCREAMING_SNAKE_CASE
4. **Flag banned patterns**:
   - `console.log` in production code (outside test files)
   - `any` type annotations
   - `jest` imports (should use `bun:test`)
   - `express` imports (should use Hono)
   - `prisma` imports (should use Drizzle)
   - `next-auth` imports (should use Better Auth)
   - Hard-coded environment values (e.g., `localhost:3002` not from env)
5. **Check import style**:
   - Cross-package imports should use `@packages/*` aliases
   - Relative imports that cross package boundaries
6. **Report** — categorize all violations by severity:
   - **Critical**: dependency boundary violations, banned packages
   - **Warning**: naming convention issues, `console.log`, `any` types
   - **Info**: style issues, suggestions for improvement
   - Show total count and list each violation with file path and line number

## Rules

- Read actual source files, don't just check file names
- Skip `node_modules/`, `dist/`, `.turbo/`, and other build artifacts
- Skip test files when checking for `console.log` (allowed in tests for debugging)
- If no violations found, report a clean bill of health
- This is a read-only audit — do not modify any files
