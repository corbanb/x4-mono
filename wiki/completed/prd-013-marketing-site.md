# PRD-013: Marketing Site — Next.js Static

**PRD ID**: PRD-013
**Title**: Marketing Site — Next.js Static
**Author**: AI-Native TPM
**Status**: Completed
**Version**: 1.0
**Date**: 2026-02-07
**Dependencies**: PRD-001 (Monorepo Foundation), PRD-010 (Web App — follows same Next.js patterns)
**Blocks**: None

---

## 1. Problem Statement

Every product needs a marketing site, and the temptation is to bolt it onto the main web app — add a `/` landing page, a `/pricing` page, and call it done. But marketing sites have fundamentally different requirements: they need to be static-first (fast, cacheable, SEO-optimized), they change on a content-editing cadence (not a sprint cadence), and they should never be blocked by a deploy of the product app.

Keeping the marketing site as a separate workspace in the monorepo gives it its own deployment lifecycle (deploy content changes without touching the product), its own domain (`example.com` vs. `app.example.com`), and its own performance profile (static generation, aggressive caching, minimal JavaScript). It can still share the monorepo's TypeScript config, linting, and Turbo pipeline — just not the product's React components or data layer.

---

## 2. Success Criteria

| Criteria           | Measurement                                            | Target                                |
| ------------------ | ------------------------------------------------------ | ------------------------------------- |
| Static generation  | All marketing pages statically generated at build time | Zero server-side rendering at runtime |
| Build speed        | `next build` for marketing site < 15s                  | Independent of web app build          |
| Lighthouse perf    | Performance score on landing page                      | > 95                                  |
| Independent deploy | Marketing deploys without touching web app             | Separate Vercel project               |
| Domain config      | `example.com` → marketing, `app.example.com` → web app | DNS routing correct                   |
| SEO basics         | Meta tags, OG tags, sitemap present                    | Lighthouse SEO > 90                   |

---

## 3. Scope

### In Scope

- `apps/marketing/` workspace structure
- Next.js with static generation focus (`export const dynamic = 'force-static'` or static by default)
- Pages:
  - `src/app/page.tsx` — landing page
  - `src/app/pricing/page.tsx` — pricing page (placeholder)
  - `src/app/about/page.tsx` — about page (placeholder)
- `src/content/` directory structure for markdown or static content
- `src/components/` — marketing-specific components (Hero, CTA, Footer, Header)
- Tailwind CSS configuration
- `next.config.ts` — static export or standard Next.js config
- Separate Vercel deployment config (`vercel.json`)
- `.env.example` with marketing-specific vars
- Links to `app.example.com` for "Get Started" / "Sign In" CTAs

### Out of Scope

- CMS integration (Contentlayer, Sanity, etc. — per-project)
- Blog system (per-project)
- Analytics integration (per-project)
- A/B testing infrastructure (per-project)
- Contact forms / lead capture (per-project)
- Shared components with web app (marketing has its own component set)

### Assumptions

- PRD-001 monorepo structure exists
- PRD-010 web app patterns provide reference for Next.js setup
- No data fetching from the API — this is a static site
- Content is committed to the repo (not from a CMS)

---

## 4. System Context

```
apps/marketing              ← This PRD (standalone static site)
       │
       ├── Links to: app.example.com (PRD-010 web app)
       └── Deployed to: example.com (separate Vercel project)

No runtime dependencies on other packages.
Uses only: TypeScript config, ESLint, Prettier from PRD-001.
```

### Dependency Map

| Depends On                    | What It Provides                                   |
| ----------------------------- | -------------------------------------------------- |
| PRD-001 (Monorepo Foundation) | Workspace structure, TypeScript config, linting    |
| PRD-010 (Web App)             | Next.js patterns to follow (not a code dependency) |

### Consumed By

| Consumer        | How It's Used                                      |
| --------------- | -------------------------------------------------- |
| PRD-014 (CI/CD) | Separate deploy workflow or filtered Vercel deploy |
| Users           | Public-facing marketing presence at `example.com`  |

---

## 5. Technical Design

### 5.2 Architecture Decisions

**Decision**: Separate workspace, not a route group in the web app
**Context**: Marketing content and product app have different deployment cadences and performance requirements.
**Options Considered**: (1) Route group in `apps/web`, (2) Separate `apps/marketing` workspace, (3) External site (Webflow, etc.)
**Rationale**: Separate workspace allows independent deployments, independent builds, and different optimization strategies (static vs. dynamic). Marketing changes don't trigger web app rebuilds. Different domains improve SEO (product pages don't dilute marketing page authority).
**Tradeoffs**: Two Next.js configurations to maintain. Some component duplication (Header, Footer). Acceptable for the deployment independence gained.

**Decision**: Static generation by default
**Context**: Marketing pages don't need dynamic data. Static pages are fastest and cheapest to serve.
**Options Considered**: SSR, ISR, full static export
**Rationale**: Static generation at build time. Pages are HTML files served from CDN. Zero server-side compute at runtime. Maximum Lighthouse scores.
**Tradeoffs**: Content changes require a rebuild + deploy. For teams updating content frequently, add a CMS with ISR (incremental static regeneration) — that's per-project scope.

### 5.4 File Structure

```
apps/marketing/
├── src/
│   ├── app/
│   │   ├── layout.tsx        # Root layout with Header, Footer
│   │   ├── page.tsx          # Landing page
│   │   ├── pricing/
│   │   │   └── page.tsx      # Pricing page
│   │   └── about/
│   │       └── page.tsx      # About page
│   ├── components/
│   │   ├── Header.tsx        # Marketing header with nav
│   │   ├── Footer.tsx        # Marketing footer
│   │   ├── Hero.tsx          # Hero section component
│   │   └── CTA.tsx           # Call-to-action component
│   ├── content/              # Static content (markdown, JSON)
│   │   └── .gitkeep
│   └── lib/                  # Marketing-specific utilities
│       └── .gitkeep
├── public/                   # Static assets (images, favicons)
│   └── .gitkeep
├── .env.example
├── next.config.ts
├── tailwind.config.ts
├── vercel.json
├── tsconfig.json
├── package.json
└── README.md
```

---

## 6. Implementation Plan

### Task Breakdown

| #   | Task                                                   | Estimate | Dependencies | Claude Code Candidate? | Notes                       |
| --- | ------------------------------------------------------ | -------- | ------------ | ---------------------- | --------------------------- |
| 1   | Create `apps/marketing/` workspace with Next.js config | 15m      | PRD-001      | ✅ Yes                 | Config scaffolding          |
| 2   | Implement root layout with Header and Footer           | 15m      | Task 1       | ✅ Yes                 | Static components           |
| 3   | Implement landing page with Hero and CTA sections      | 20m      | Task 2       | ✅ Yes                 | Static page                 |
| 4   | Implement pricing and about page placeholders          | 10m      | Task 2       | ✅ Yes                 | Placeholder content         |
| 5   | Configure Tailwind + static generation settings        | 10m      | Task 1       | ✅ Yes                 | Config files                |
| 6   | Create `vercel.json` for separate deployment           | 5m       | Task 1       | ✅ Yes                 | Deployment config           |
| 7   | Verify `next build` produces static output             | 10m      | All above    | ❌ No                  | Manual — check build output |
| 8   | Lighthouse audit                                       | 10m      | Task 7       | ❌ No                  | Manual — run Lighthouse     |

---

## 7. Testing Strategy

### Test Pyramid for This PRD

| Level       | What's Tested                                        | Tool       | Count (approx) |
| ----------- | ---------------------------------------------------- | ---------- | -------------- |
| Unit        | Component rendering, meta tags, semantic HTML        | Bun test   | 5-8            |
| Integration | N/A (static site)                                    | —          | 0              |
| E2E         | Pages load, links work, CTA links to app.example.com | Playwright | 1-2            |

### Key Test Scenarios

1. **Landing page loads**: Status 200, Hero visible
2. **Navigation works**: Click Pricing → pricing page loads
3. **CTA links to app**: "Get Started" button links to `app.example.com/signup`
4. **Static output**: `next build` produces only static files (no serverless functions)
5. **Lighthouse**: Performance > 95, SEO > 90
6. **Meta tags present**: Title, description, and OG tags present on all pages
7. **Semantic HTML structure**: Pages use proper semantic elements (main, header, footer, nav, section)
8. **Content visible without JavaScript**: Static HTML output contains all content (no JS-only rendering)

---

## 8. Non-Functional Requirements

| Requirement            | Target                                  | How Verified                 |
| ---------------------- | --------------------------------------- | ---------------------------- |
| Lighthouse Performance | > 95                                    | Lighthouse audit             |
| Lighthouse SEO         | > 90                                    | Lighthouse audit             |
| Build time             | < 15s                                   | CI timing                    |
| TTFB                   | < 100ms (CDN-served static)             | WebPageTest                  |
| Zero JS (optional)     | Marketing pages work without JavaScript | Manual test with JS disabled |

---

## 9. Rollout & Migration

1. Implement all files
2. `bun turbo dev --filter=marketing` — verify on localhost:3001
3. `next build` — verify static output
4. Create separate Vercel project for marketing
5. Connect repo with path filter: `apps/marketing/**`
6. Configure domain: `example.com` → Vercel marketing project
7. Set up redirect: `example.com/app` → `app.example.com`

---

## 10. Open Questions

| #   | Question                                                                       | Impact                                                           | Owner    | Status                                                          |
| --- | ------------------------------------------------------------------------------ | ---------------------------------------------------------------- | -------- | --------------------------------------------------------------- |
| 1   | Full static export (`output: 'export'`) or standard Next.js with static pages? | Full export can't use any server features (middleware, rewrites) | Frontend | Open — start with standard Next.js, pages are static by default |
| 2   | Shared Tailwind theme with web app or independent?                             | Affects brand consistency                                        | Design   | Resolved — independent config, same brand colors as constants   |

---

## 11. Revision History

| Version | Date       | Author        | Changes       |
| ------- | ---------- | ------------- | ------------- |
| 1.0     | 2026-02-07 | AI-Native TPM | Initial draft |
