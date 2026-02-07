Add a new Drizzle database table with migration.

Input format: table name (e.g., `notifications`)

## Steps

1. **Parse the input** — extract the table name from: $ARGUMENTS
2. **Read existing schema** — read `packages/database/schema.ts` to understand the patterns and imports in use
3. **Add the table** — append to `packages/database/schema.ts`:
   - Use `pgTable()` with snake_case table name
   - Include standard columns:
     - `id` — uuid, primary key, default `gen_random_uuid()`
     - `createdAt` — timestamp, not null, default `now()`
     - `updatedAt` — timestamp, not null, default `now()`, with `$onUpdate`
   - Add domain-specific columns based on the table name
   - Add foreign key references where obvious (e.g., `userId` → `users.id`)
   - Add indexes on foreign keys and frequently-filtered columns
4. **Add relations** — if the table has foreign keys, add Drizzle relations in the same file (both sides)
5. **Export** — ensure the table is exported from `packages/database/index.ts`
6. **Add seed data** — add factory function and sample rows to `packages/database/seed.ts`:
   - Use `.returning()` for FK dependencies
   - Create realistic test data
7. **Check for Zod schema** — look in `packages/shared/types/` for a matching Zod schema. If not found, suggest running `/add-schema {name}` to create one
8. **Generate migration** — run `bun db:generate` to create the migration file
9. **Report** — show the table definition, migration file path, and seed data additions

## Rules

- Use snake_case for table and column names
- Always include `id`, `createdAt`, `updatedAt` standard columns
- Use `uuid` for id columns, not auto-increment
- Add appropriate indexes for foreign keys and frequently queried columns
- Always export from `packages/database/index.ts`
- Always add seed data to `packages/database/seed.ts`
- Follow existing schema patterns in the file
- Do NOT run `bun db:push` or `bun db:migrate` — let the developer decide when to apply
