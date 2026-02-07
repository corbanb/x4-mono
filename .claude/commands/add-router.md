Scaffold a new tRPC router with test file.

Input format: router name (e.g., `notifications`)

## Steps

1. **Parse the input** — extract the router name from: $ARGUMENTS
2. **Read existing patterns** — read `apps/api/src/routers/index.ts` and one existing router file to understand the patterns in use
3. **Create the router file** — write `apps/api/src/routers/{name}.ts` with:
   - Import tRPC procedures from `../trpc`
   - Import Zod from `zod`
   - Create router with standard CRUD procedures:
     - `list` — `publicProcedure` with pagination input
     - `get` — `protectedProcedure` with id input
     - `create` — `protectedProcedure` with Zod input schema
     - `update` — `protectedProcedure` with Zod input schema
     - `delete` — `protectedProcedure` with id input
   - Export the router
4. **Register in appRouter** — update `apps/api/src/routers/index.ts`:
   - Add import for the new router
   - Add to the `appRouter` object
5. **Create test file** — write `apps/api/src/routers/{name}.test.ts` with:
   - Import test utilities from `bun:test`
   - Scaffold test cases for each procedure
   - Include auth rejection tests for protected procedures
6. **Verify** — run `bun turbo type-check` to ensure `AppRouter` type updates correctly
7. **Report** — list created/modified files

## Rules

- Follow naming conventions from CLAUDE.md (camelCase for router namespace)
- Use `protectedProcedure` for mutations, `publicProcedure` for list queries
- Always add Zod `.input()` schemas — never skip input validation
- Check resource ownership in update/delete procedures
- Use `.returning()` on all inserts/updates
