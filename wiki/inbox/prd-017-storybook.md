# PRD-017: Storybook Component Catalog

**PRD ID**: PRD-017
**Title**: Storybook Component Catalog
**Author**: Claude Code
**Status**: Draft
**Version**: 1.0
**Date**: 2026-02-23
**Dependencies**: PRD-004, PRD-010
**Blocks**: None

---

## 1. Problem Statement

x4-mono has 28 shadcn/ui components and 14 custom app components with zero visual documentation or component-level tests. Developers cloning the boilerplate must read source code to understand what components are available, their variants, and usage patterns. This slows onboarding and leads to accidental re-implementation of existing components.

A browsable component catalog with themed variants, dark mode toggle, and usage patterns is critical for a boilerplate's discoverability.

---

## 2. Success Criteria

| Criteria                              | Measurement                               | Target                                                       |
| ------------------------------------- | ----------------------------------------- | ------------------------------------------------------------ |
| All shadcn/ui components have stories | Story count                               | 28 components covered                                        |
| All custom components have stories    | Story count                               | 13 components covered (excluding wrapper-only ThemeProvider) |
| Shared UI components have stories     | Story count                               | 2 components covered                                         |
| Dark mode toggle works in Storybook   | Manual verification                       | Light/dark themes render correctly                           |
| Storybook builds successfully         | `bun turbo storybook:build`               | Exit code 0                                                  |
| No regression in existing builds      | `bun turbo build && bun turbo type-check` | Exit code 0                                                  |

---

## 3. Scope

### In Scope

- Storybook v8 workspace at `apps/storybook/`
- Colocated `.stories.tsx` files next to components
- Stories for all 28 shadcn/ui components in `apps/web/src/components/ui/`
- Stories for 13 custom components in `apps/web/src/components/`
- Stories for 2 shared UI components in `packages/shared/ui/`
- Mock decorators for auth, tRPC, sidebar, and tooltip providers
- Dark mode toggle via `@storybook/addon-themes`
- Accessibility addon (`@storybook/addon-a11y`)
- Static build output for CI

### Out of Scope

- Visual regression testing (Chromatic, Percy) — future enhancement
- Storybook interaction tests — future enhancement
- Mobile/desktop component stories — covered by PRD-011/012
- Documentation pages in MDX format — future enhancement

### Assumptions

- `@storybook/nextjs` framework handles Next.js mocking (Image, Link, router)
- Tailwind v4 PostCSS pipeline works with Storybook's webpack bundler
- All component dependencies are installed in `apps/web/`

---

## 4. System Context

```
apps/storybook/          ← NEW workspace (Storybook config)
  .storybook/
    main.ts              ← stories glob, webpack aliases, addons
    preview.ts           ← globals.css import, theme decorator
    mocks/               ← auth + tRPC mock modules
    decorators/          ← provider wrapper decorators

apps/web/src/components/
  ui/*.tsx                ← 28 shadcn/ui components
  ui/*.stories.tsx        ← NEW colocated stories
  *.tsx                   ← 14 custom components
  *.stories.tsx           ← NEW colocated stories

packages/shared/ui/
  *.tsx                   ← 2 shared UI components
  *.stories.tsx           ← NEW colocated stories
```

### Dependency Map

| Depends On                  | What It Provides                                        |
| --------------------------- | ------------------------------------------------------- |
| PRD-004 (Shared UI & Hooks) | Shared Button and Input components                      |
| PRD-010 (Web App)           | shadcn/ui components, custom components, Tailwind theme |

### Consumed By

| Consumer    | How It's Used                              |
| ----------- | ------------------------------------------ |
| Developers  | Browse component catalog at localhost:6006 |
| CI pipeline | Static build verification                  |

---

## 5. Technical Design

### 5.1 Data Model / Types

No new types introduced. Stories use existing component prop types.

### 5.2 Architecture Decisions

**Decision**: Separate `apps/storybook/` workspace with colocated stories
**Context**: Stories need access to web app components and Tailwind theme
**Options Considered**: (1) Storybook inside apps/web, (2) Separate workspace with colocated stories, (3) Separate workspace with centralized stories
**Rationale**: Separate workspace keeps web build clean while colocated stories stay discoverable next to components
**Tradeoffs**: Webpack aliases needed to resolve `@/` imports from a different workspace

**Decision**: `@storybook/nextjs` framework
**Context**: Components use Next.js features (Link, Image, router)
**Options Considered**: (1) @storybook/nextjs (Webpack), (2) @storybook/experimental-nextjs-vite
**Rationale**: Webpack-based framework has better Tailwind v4 PostCSS compatibility and automatic Next.js mocking
**Tradeoffs**: Slower than Vite but more stable

### 5.3 API Contracts / Interfaces

No API contracts — this is a UI documentation tool.

### 5.4 File Structure

```
apps/storybook/
  package.json
  tsconfig.json
  postcss.config.js
  .storybook/
    main.ts
    preview.ts
    mocks/
      auth-client.ts
      trpc-client.ts
    decorators/
      trpc-decorator.tsx
      sidebar-decorator.tsx
      tooltip-decorator.tsx

apps/web/src/components/ui/
  button.stories.tsx         (+ 27 more)

apps/web/src/components/
  stats-cards.stories.tsx    (+ 12 more)

packages/shared/ui/
  Button.stories.tsx
  Input.stories.tsx
```

---

## 6. Implementation Plan

### Task Breakdown

| #   | Task                                             | Estimate | Dependencies | Claude Code Candidate? | Notes                           |
| --- | ------------------------------------------------ | -------- | ------------ | ---------------------- | ------------------------------- |
| 1   | Create PRD-017, update status.md                 | 15 min   | None         | Yes                    | Documentation only              |
| 2   | Update CLAUDE.md with Storybook commands         | 5 min    | None         | Yes                    | Documentation only              |
| 3   | Scaffold apps/storybook/ workspace               | 30 min   | None         | Yes                    | Config files, mocks, decorators |
| 4   | Update turbo.json, root package.json, .gitignore | 10 min   | Task 3       | Yes                    | Build system config             |
| 5   | Verify Storybook boots                           | 15 min   | Task 3, 4    | Yes                    | Install deps, fix issues        |
| 6   | Write primitive shadcn/ui stories (11)           | 45 min   | Task 5       | Yes                    | button, badge, input, etc.      |
| 7   | Write composite shadcn/ui stories (17)           | 60 min   | Task 5       | Yes                    | card, dialog, tabs, etc.        |
| 8   | Write custom component stories Tier 1+2 (9)      | 45 min   | Task 5       | Yes                    | stats-cards, project-grid, etc. |
| 9   | Write custom component stories Tier 3 (5)        | 30 min   | Task 5       | Yes                    | app-sidebar, user-nav, etc.     |
| 10  | Write shared UI stories (2)                      | 10 min   | Task 5       | Yes                    | Button, Input                   |
| 11  | Full build verification + CI                     | 15 min   | All above    | Yes                    | Build, type-check, lint         |

### Claude Code Task Annotations

**Task 3 (Scaffold Storybook workspace)**:

- **Context needed**: apps/web/package.json (deps versions), apps/web/postcss.config.js, apps/web/tsconfig.json, tsconfig.base.json
- **Constraints**: Must use @storybook/nextjs framework, must alias @/ to apps/web/src, must mock @x4/auth/client and @x4/shared/api-client
- **Done state**: All files exist in apps/storybook/
- **Verification command**: `ls -la apps/storybook/.storybook/`

**Task 5 (Verify Storybook boots)**:

- **Context needed**: apps/storybook/.storybook/main.ts, apps/web/src/styles/globals.css
- **Constraints**: Must not modify apps/web source, Tailwind theme must render
- **Done state**: Storybook dev server starts on port 6006
- **Verification command**: `cd apps/storybook && npx storybook dev --ci --port 6006`

**Task 6 (Primitive stories)**:

- **Context needed**: Each component's source file for prop types and variants
- **Constraints**: Colocate stories next to components, use Meta/StoryObj typing
- **Done state**: 11 story files exist and render in Storybook
- **Verification command**: `ls apps/web/src/components/ui/*.stories.tsx | wc -l`

**Task 7 (Composite stories)**:

- **Context needed**: Each component's source file, decorator files for providers
- **Constraints**: Use appropriate decorators (TooltipProvider, SidebarProvider)
- **Done state**: 17 story files exist and render in Storybook
- **Verification command**: `ls apps/web/src/components/ui/*.stories.tsx | wc -l`

**Task 9 (Tier 3 stories)**:

- **Context needed**: Mock files, decorator files, component source
- **Constraints**: Must use auth mock decorator, must not call real APIs
- **Done state**: 5 story files with mock decorators
- **Verification command**: `ls apps/web/src/components/*.stories.tsx | wc -l`

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level  | What's Tested                     | Tool                  | Count (approx) |
| ------ | --------------------------------- | --------------------- | -------------- |
| Smoke  | Storybook static build            | `storybook build`     | 1              |
| Visual | Component rendering in light/dark | Manual / Storybook UI | 43 stories     |

### Key Test Scenarios

1. **Storybook builds**: `bun turbo storybook:build` exits successfully
2. **No build regression**: `bun turbo build` still passes with story files present
3. **Theme toggle**: Dark mode decorator switches all components correctly
4. **Mock isolation**: Tier 3 components render without auth/tRPC errors

---

## 8. Non-Functional Requirements

| Requirement            | Target                      | How Verified                           |
| ---------------------- | --------------------------- | -------------------------------------- |
| Storybook build time   | < 2 minutes                 | Time `storybook:build`                 |
| No impact on web build | 0 additional seconds        | Story files excluded from build inputs |
| Accessibility          | All stories pass a11y addon | Check addon panel                      |

---

## 9. Rollout & Migration

1. Install: `bun install` registers new workspace
2. Dev: `bun storybook` starts at localhost:6006
3. Build: `bun turbo storybook:build` outputs `apps/storybook/storybook-static/`
4. CI: Optional `build-storybook` job in GitHub Actions

No migration needed — this is purely additive.

---

## 10. Open Questions

| #   | Question                             | Impact                            | Owner | Status |
| --- | ------------------------------------ | --------------------------------- | ----- | ------ |
| 1   | Deploy Storybook to a public URL?    | DX for external contributors      | Team  | Open   |
| 2   | Add Chromatic for visual regression? | Prevents unintended style changes | Team  | Open   |

---

## 11. Revision History

| Version | Date       | Author      | Changes       |
| ------- | ---------- | ----------- | ------------- |
| 1.0     | 2026-02-23 | Claude Code | Initial draft |
