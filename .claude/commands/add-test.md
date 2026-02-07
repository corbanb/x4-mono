Generate tests for an existing source file.

Input format: `path/to/source/file.ts` (e.g., `apps/api/src/routers/projects.ts`)

## Steps

1. **Parse the input** — extract the file path from: $ARGUMENTS
2. **Read the source file** — read the file to understand its exports, functions, and patterns
3. **Detect the test pattern** — based on file location:
   | Source Location | Pattern | Key Import |
   |---|---|---|
   | `apps/api/src/routers/*.ts` | tRPC caller test | `createCaller`, `createTestContext` |
   | `apps/api/src/middleware/*.ts` | Hono request test | `app.request()` |
   | `apps/api/src/lib/*.ts` | Unit test | Direct function calls |
   | `packages/shared/utils/*.ts` | Unit test | Direct function calls + Zod parse |
   | `packages/shared/types/*.ts` | Schema validation test | Zod `.parse()` / `.safeParse()` |
   | `apps/web/src/components/*.tsx` | Component test | `@testing-library/react` |
4. **Create the test file** — write `{source-dir}/{name}.test.ts` (co-located) with:
   - Import from `bun:test` (NEVER jest)
   - **Happy path tests** — test expected behavior for each exported function/procedure
   - **Error/edge case tests** — test invalid inputs, missing data, boundary conditions
   - **Auth tests** (if applicable) — test unauthorized access rejection for protected procedures
   - **Setup/teardown** — `beforeAll`/`afterAll` for any shared state or cleanup
5. **Run tests** — execute `bun test {test-file-path}` to verify tests pass

## Rules

- Always use `bun:test` — NEVER import from `jest`
- Co-locate test files with source files (`.test.ts` in same directory)
- Use behavior-driven naming: `test("should {behavior}")` not `test("{implementation detail}")`
- Test behavior, not implementation details
- Every test must have at least one assertion
- Include cleanup in `afterAll` if tests create state
- For tRPC routers, always test both authenticated and unauthenticated scenarios
- Do not mock what you can call directly — only mock external dependencies
