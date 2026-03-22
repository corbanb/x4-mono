'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { GlowCard } from '@/components/effects/GlowCard';

const REQUIRED = [
  {
    name: 'superpowers',
    usedBy: '/x4:kickstart, /x4:plan-backlog',
    description: 'Structured brainstorming + writing plans',
  },
  {
    name: 'code-simplifier',
    usedBy: '/x4:work Phase 4',
    description: 'Simplifies complex code after review',
  },
  {
    name: 'frontend-design',
    usedBy: '/x4:kickstart, Frontend agent',
    description: 'UI design patterns, accessibility, responsive layout',
  },
];

const RECOMMENDED = [
  {
    name: 'code-review',
    enhances: 'Reviewer agent',
    description: 'Structured review patterns, vulnerability detection',
  },
  {
    name: 'playwright',
    enhances: 'Tester agent',
    description: 'Playwright e2e test authoring and execution',
  },
  {
    name: 'typescript-lsp',
    enhances: 'All agents',
    description: 'TypeScript diagnostics and type checking',
  },
  { name: 'commit-commands', enhances: 'Git workflow', description: 'Commit message helpers' },
  { name: 'github', enhances: 'PR management', description: 'GitHub issue and PR tools' },
  { name: 'railway', enhances: 'Deployment', description: 'Railway deployment management' },
];

export function CompanionPlugins() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            9 Companion Plugins
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Better together — <span className="gradient-text">plugin ecosystem</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            x4 integrates with official Claude Code plugins for an enhanced experience. All are
            installed via <code className="text-foreground">/x4:onboard</code>.
          </p>
        </motion.div>

        {/* Required tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10"
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-emerald-400">
            Required by x4 Workflows
          </h3>
          <div className="grid gap-4 sm:grid-cols-3">
            {REQUIRED.map((plugin, i) => (
              <motion.div
                key={plugin.name}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.3, delay: 0.15 + i * 0.07 }}
              >
                <GlowCard className="h-full">
                  <code className="text-sm font-bold text-foreground">{plugin.name}</code>
                  <p className="mt-2 text-sm text-muted-foreground">{plugin.description}</p>
                  <p className="mt-3 text-[11px] text-muted-foreground/70">
                    Used by <span className="text-foreground">{plugin.usedBy}</span>
                  </p>
                </GlowCard>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Recommended tier */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Recommended
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {RECOMMENDED.map((plugin, i) => (
              <motion.div
                key={plugin.name}
                initial={{ opacity: 0, y: 15 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.3, delay: 0.35 + i * 0.05 }}
                className="flex items-start gap-3 rounded-xl border border-border bg-card/50 p-4"
              >
                <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-muted-foreground/40" />
                <div>
                  <code className="text-sm font-medium text-foreground">{plugin.name}</code>
                  <p className="mt-1 text-xs text-muted-foreground">{plugin.description}</p>
                  <p className="mt-1 text-[10px] text-muted-foreground/60">
                    Enhances: {plugin.enhances}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
