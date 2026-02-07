Scaffold a Next.js App Router page with proper Server/Client component split.

Input format: `app-name path` (e.g., `web dashboard/settings`, `marketing pricing`)

## Steps

1. **Parse the input** — extract the app name and page path from: $ARGUMENTS
2. **Determine the app** — resolve to `apps/web` or `apps/marketing`
3. **Determine auth requirement** — based on the page path:
   - Dashboard, settings, profile, admin pages → auth-gated
   - Landing, pricing, docs, blog pages → public
4. **Create the Server Component (page.tsx)** — write `apps/{app}/src/app/{path}/page.tsx`:
   - If auth-gated: check session via `await auth()`, redirect to `/login` if unauthenticated
   - Import and render the Client Component
   - Set page metadata (`export const metadata`)
5. **Create the Client Component** — write `apps/{app}/src/app/{path}/{PageName}Client.tsx`:
   - Add `"use client"` directive
   - Use tRPC hooks for data fetching (`useQuery`, `useMutation`)
   - Include loading state handling
   - Include error state handling
   - Use Tailwind CSS for styling
6. **Create loading.tsx** (optional) — if the page has async data, add a loading skeleton
7. **Verify** — run `bun turbo type-check` to ensure the page types are correct

## Rules

- Always split Server Component (auth + metadata) from Client Component (interactivity)
- Never use tRPC hooks in Server Components
- Never use `useEffect` for data fetching — use tRPC hooks
- Always add `"use client"` directive on interactive components
- Use Tailwind CSS — no CSS-in-JS or inline styles
- Follow file naming: kebab-case directories, `page.tsx` for route files
- Auth-gated pages must check session in the Server Component, not the Client Component
- Import from `@/*` for intra-app, `@packages/*` for cross-package
