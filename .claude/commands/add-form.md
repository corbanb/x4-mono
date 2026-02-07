Scaffold a react-hook-form component wired to a tRPC mutation.

Input format: `form-name SchemaName` (e.g., `create-project CreateProjectSchema`, `edit-profile UpdateProfileSchema`)

## Steps

1. **Parse the input** — extract the form name and Zod schema name from: $ARGUMENTS
2. **Find the Zod schema** — read `packages/shared/types/` to locate the schema definition and understand its fields
3. **Find the matching tRPC mutation** — read `apps/api/src/routers/` to identify the mutation that accepts this schema as input
4. **Create the form component** — write the Client Component with:
   - `"use client"` directive
   - Import `useForm` from `react-hook-form`
   - Import `zodResolver` from `@hookform/resolvers/zod`
   - Import the Zod schema from `@packages/shared`
   - Import tRPC hooks
   - Configure form with `zodResolver(SchemaName)`
   - Wire `onSubmit` to `trpc.{entity}.{mutation}.useMutation()`
   - Add `onSuccess` handler with cache invalidation: `trpc.useUtils().{entity}.list.invalidate()`
   - Add `onError` handler with error display
   - Render form fields with `register()` and error messages from `formState.errors`
   - Include submit button with loading state from `mutation.isPending`
5. **Verify** — run `bun turbo type-check` to ensure types align between schema, form, and mutation

## Rules

- Always use `zodResolver` — client validation MUST match server validation (same Zod schema)
- Always use tRPC mutations — never manual `fetch()` calls
- Always invalidate relevant queries in `onSuccess`
- Always show error messages from `formState.errors` per field
- Always show mutation error messages (toast or inline)
- Always disable submit button while `mutation.isPending`
- Use Tailwind CSS for styling
- Add `"use client"` directive — forms are always Client Components
