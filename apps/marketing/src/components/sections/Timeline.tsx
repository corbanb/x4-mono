'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';

const MILESTONES = [
  {
    title: 'Monorepo Foundation',
    description: 'Bun workspaces, Turborepo, TypeScript config, shared packages.',
    status: 'complete' as const,
  },
  {
    title: 'Shared Types & Database',
    description: 'Zod schemas, Drizzle ORM, Neon Postgres, migrations, seed data.',
    status: 'complete' as const,
  },
  {
    title: 'API Server',
    description: 'Hono + tRPC v11 with CRUD routers, middleware, and OpenAPI docs.',
    status: 'complete' as const,
  },
  {
    title: 'Authentication',
    description: 'Better Auth with sessions, bearer tokens, RBAC, multi-platform clients.',
    status: 'complete' as const,
  },
  {
    title: 'AI Integration',
    description: 'Vercel AI SDK, Claude provider, streaming, cost tracking.',
    status: 'complete' as const,
  },
  {
    title: 'Multi-Platform Clients',
    description: 'Next.js 15 web, Expo mobile, Electron desktop — all sharing the API.',
    status: 'complete' as const,
  },
  {
    title: 'CI/CD & Testing',
    description: 'GitHub Actions, Neon branching, 350+ tests, Playwright E2E.',
    status: 'complete' as const,
  },
  {
    title: 'Documentation & DX',
    description: 'Fumadocs site, getting started guide, contributing docs, READMEs.',
    status: 'complete' as const,
  },
];

export function Timeline() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          className="text-center text-3xl font-bold sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
        >
          How we got here
        </motion.h2>

        <div className="relative mt-16">
          {/* Vertical line */}
          <div className="absolute left-5 top-0 h-full w-px bg-gradient-to-b from-violet-glow/50 via-blue-glow/50 to-transparent" />

          <div className="space-y-8">
            {MILESTONES.map((milestone, i) => (
              <motion.div
                key={milestone.title}
                className="relative flex gap-6 pl-2"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : undefined}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                {/* Dot */}
                <div
                  className={cn(
                    'relative z-10 mt-1.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    milestone.status === 'complete' ? 'bg-violet-glow/20' : 'bg-muted',
                  )}
                >
                  <div
                    className={cn(
                      'h-2.5 w-2.5 rounded-full',
                      milestone.status === 'complete' ? 'bg-violet-glow' : 'bg-muted-foreground',
                    )}
                  />
                </div>

                {/* Content */}
                <div className="pb-2">
                  <h3 className="font-semibold text-foreground">{milestone.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{milestone.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
