Scaffold a new tRPC router with test file.

Input format: router name (e.g., `notifications`)

## Steps

1. **Parse the input** — extract the router name from: $ARGUMENTS
2. **Check for Zod schemas** — look in `packages/shared/types/` for a matching Zod schema (e.g., `{Name}Schema`, `Create{Name}Schema`, `Update{Name}Schema`). If not found, suggest running `/add-schema {name}` first
3. **Read existing patterns** — read `apps/api/src/routers/index.ts` and one existing router file to understand the patterns in use
4. **Create the router file** — write `apps/api/src/routers/{name}.ts` with:
   - Import tRPC procedures from `../trpc`
   - Import Zod schemas from `@packages/shared` (not inline definitions)
   - Import `Errors.*` constructors from `../lib/errors`
   - Import Pino child logger (`apiLogger`)
   - Create router with standard CRUD procedures:
     - `list` — `publicProcedure` with pagination input
     - `get` — `protectedProcedure` with id input
     - `create` — `protectedProcedure` with Zod input schema
     - `update` — `protectedProcedure` with Zod input schema + ownership check
     - `delete` — `protectedProcedure` with id input + ownership check
   - Use `Errors.*` constructors for error handling (not raw `TRPCError`)
   - Use Pino logger (not `console.log`)
   - Use `.returning()` on inserts/updates
   - Export the router
5. **Register in appRouter** — update `apps/api/src/routers/index.ts`:
   - Add import for the new router
   - Add to the `appRouter` object
6. **Create test file** — write `apps/api/src/routers/{name}.test.ts` with:
   - Import test utilities from `bun:test`
   - Scaffold test cases for each procedure
   - Include auth rejection tests for protected procedures
   - Include ownership check tests for update/delete
7. **Verify** — run `bun turbo type-check` to ensure `AppRouter` type updates correctly
8. **Report** — list created/modified files

## Rules

- Follow naming conventions from CLAUDE.md (camelCase for router namespace)
- Use `protectedProcedure` for mutations, `publicProcedure` for list queries
- Always add Zod `.input()` schemas — never skip input validation
- Import Zod schemas from `@packages/shared` — never define inline
- Use `Errors.*` constructors — never raw `TRPCError`
- Use Pino child logger — never `console.log`
- Check resource ownership in update/delete: `ownerId === ctx.user.userId || isAdmin`
- Use `.returning()` on all inserts/updates
