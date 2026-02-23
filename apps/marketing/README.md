# @x4/marketing

Static marketing site built with **Next.js 15**.

## Overview

- **Framework**: Next.js 15 (static export)
- **UI**: React 19, Tailwind CSS v4
- **Port**: 3001
- **Output**: Fully static (no server-side rendering)

## Development

```bash
bun run dev       # Start on :3001
bun run build     # Build static site
bun run start     # Serve built site on :3001
```

## Structure

```
src/
  app/
    layout.tsx          # Root layout with Header + Footer
    page.tsx            # Landing page (Hero + CTA)
    pricing/page.tsx    # Pricing page
    about/page.tsx      # About page
  components/
    Header.tsx          # Navigation header
    Footer.tsx          # Site footer
    Hero.tsx            # Landing hero section
    CTA.tsx             # Call-to-action section
```

## Pages

| Path       | Description                    |
| ---------- | ------------------------------ |
| `/`        | Landing page with hero and CTA |
| `/pricing` | Pricing tiers                  |
| `/about`   | About the product              |

## Deployment

Configured for Vercel deployment. All pages are statically generated at build time. Vercel config is in `vercel.json` at the project root.
