Scaffold a shared React hook in packages/shared/hooks/.

Input format: `hook-name` (e.g., `use-projects`, `use-debounce`, `use-local-storage`)

## Steps

1. **Parse the input** — extract the hook name from: $ARGUMENTS
2. **Determine hook type**:
   - **Data hook** (e.g., `use-projects`, `use-user`): wraps tRPC query with loading/error states
   - **Utility hook** (e.g., `use-debounce`, `use-local-storage`): reusable logic without tRPC
3. **Read existing patterns** — read `packages/shared/hooks/` to understand the existing hook patterns and exports
4. **Create the hook file** — write `packages/shared/hooks/{hook-name}.ts`:
   - For data hooks:
     - Import tRPC hooks
     - Wrap `useQuery`/`useMutation` with typed return values
     - Include `isLoading`, `error`, and `data` in return
     - Include cache invalidation helpers if the hook wraps mutations
   - For utility hooks:
     - Implement with proper TypeScript generics
     - Include cleanup in `useEffect` return if applicable
     - Handle edge cases (SSR safety, null refs, etc.)
5. **Update index re-exports** — add export to `packages/shared/hooks/index.ts`
6. **Create test file** — write `packages/shared/hooks/{hook-name}.test.ts` with basic test cases
7. **Verify** — run `bun turbo type-check` to ensure types are correct

## Rules

- Hook names must start with `use` (React convention)
- File names are kebab-case (e.g., `use-projects.ts`)
- Export names are camelCase (e.g., `useProjects`)
- Hooks go in `packages/shared/hooks/` for cross-platform use
- Always export from the hooks index file
- Data hooks should return `{ data, isLoading, error }` at minimum
- Utility hooks should be SSR-safe (check `typeof window` if accessing browser APIs)
- Follow existing patterns in the hooks directory
