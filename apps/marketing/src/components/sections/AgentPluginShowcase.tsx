'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';
import { Server, Monitor, GitPullRequest, TestTube2, Zap } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface AgentCard {
  name: string;
  icon: LucideIcon;
  scope: string;
  companionBadge?: string;
}

const AGENTS: AgentCard[] = [
  {
    name: 'Backend',
    icon: Server,
    scope: 'API routes, database schema, tRPC procedures, server-side logic',
  },
  {
    name: 'Frontend',
    icon: Monitor,
    scope: 'React components, pages, styling, client-side state',
    companionBadge: 'frontend-design',
  },
  {
    name: 'Reviewer',
    icon: GitPullRequest,
    scope: 'Code review, architecture decisions, security checks',
    companionBadge: 'code-review',
  },
  {
    name: 'Tester',
    icon: TestTube2,
    scope: 'Unit tests, integration tests, E2E with Playwright',
    companionBadge: 'playwright',
  },
  {
    name: 'Performance',
    icon: Zap,
    scope: 'Bundle analysis, Core Web Vitals, query optimization',
  },
];

/* ------------------------------------------------------------------ */
/*  Agent Card                                                         */
/* ------------------------------------------------------------------ */

function AgentCardItem({
  agent,
  index,
  isInView,
}: {
  agent: AgentCard;
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.45, delay: 0.1 * index }}
      className={cn(
        'group relative flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/3 p-6',
        'hover:border-white/15 hover:bg-white/5 transition-colors',
      )}
    >
      {/* Icon */}
      <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5">
        <agent.icon size={20} className="text-violet-400" />
      </div>

      {/* Name + badge row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-foreground">{agent.name}</span>
        {agent.companionBadge && (
          <span className="rounded-full border border-violet-500/30 bg-violet-950 px-2 py-0.5 text-xs text-violet-300">
            {agent.companionBadge}
          </span>
        )}
      </div>

      {/* Scope */}
      <p className="text-sm leading-relaxed text-muted-foreground">{agent.scope}</p>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function AgentPluginShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="relative py-24">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.541_0.281_293.009_/_5%),transparent_65%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-14 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Five specialists. <span className="gradient-text">One pipeline.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Each agent owns its domain. None can touch what isn&apos;t theirs.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {AGENTS.map((agent, i) => (
            <AgentCardItem key={agent.name} agent={agent} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
