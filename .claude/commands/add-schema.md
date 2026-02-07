Scaffold Zod schemas and inferred TypeScript types for an entity.

Input format: `entity-name` (e.g., `notification`, `project`, `team-membership`)

## Steps

1. **Parse the input** — extract the entity name from: $ARGUMENTS
2. **Read existing patterns** — read `packages/shared/types/` and `packages/shared/utils/validators.ts` to understand the existing schema patterns and imports
3. **Create schema file** — write `packages/shared/types/{entity-name}.ts` with:
   - Import `z` from `zod`
   - **Full schema** — `{Entity}Schema`: all fields including `id`, `createdAt`, `updatedAt`
   - **Create schema** — `Create{Entity}Schema`: fields needed for creation (omit `id`, `createdAt`, `updatedAt`)
   - **Update schema** — `Update{Entity}Schema`: all create fields as `.partial()` plus required `id`
   - **Inferred types** — export `type {Entity} = z.infer<typeof {Entity}Schema>` for all three
4. **Update index re-exports** — add exports to the types index file (`packages/shared/types/index.ts` or `packages/shared/index.ts`)
5. **Scaffold unit tests** — create `packages/shared/types/{entity-name}.test.ts` with:
   - Import `describe`, `test`, `expect` from `bun:test`
   - Tests for valid data parsing
   - Tests for invalid data rejection (missing required fields, wrong types)
   - Tests for the partial update schema
6. **Verify** — run `bun turbo type-check` to ensure types are valid

## Rules

- Use Zod schemas as the **source of truth** — never define types manually
- Entity name should be PascalCase in type names, kebab-case in file names
- Always export both the schema object AND the inferred type
- Use `.uuid()` for id fields, `.datetime()` for timestamp fields
- Add `.min()`, `.max()`, `.email()`, `.url()` validators where semantically appropriate
- Follow existing patterns in the `packages/shared/types/` directory
