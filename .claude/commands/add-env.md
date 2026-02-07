Add an environment variable with 3-way sync across env.ts, .env.example, and CLAUDE.md.

Input format: `VAR_NAME "description" required|optional [default=value]`

## Steps

1. **Parse the input** — extract variable name, description, required/optional flag, and optional default from: $ARGUMENTS
2. **Update Zod schema** — add the variable to `apps/api/src/lib/env.ts`:
   - If required: `VAR_NAME: z.string().min(1)` (add specific validators like `.url()`, `.startsWith("sk-")` if appropriate)
   - If optional with default: `VAR_NAME: z.string().default("value")`
   - If optional without default: `VAR_NAME: z.string().optional()`
3. **Update .env.example** — add a commented entry to `.env.example`:
   - Format: `VAR_NAME=  # description`
   - If it has a default: `VAR_NAME=default_value  # description (optional)`
4. **Update CLAUDE.md** — add a row to the Environment Variables table:
   - Format: `| VAR_NAME | description | Yes/No |`
5. **Report** — confirm all 3 files were updated and show the exact additions made

## Rules

- Always update all 3 locations — never leave them out of sync
- Use appropriate Zod validators based on the variable name:
  - URLs → `.url()`
  - API keys → `.min(1)` with descriptive note
  - Ports → `z.coerce.number().int().positive()`
  - Boolean flags → `z.enum(["true", "false"]).transform(v => v === "true")`
- Never add the actual secret value to `.env.example` — only placeholders
- Never add the actual value to CLAUDE.md — only describe it
- If `apps/api/src/lib/env.ts` doesn't exist yet, note that it should be created as part of PRD-002
