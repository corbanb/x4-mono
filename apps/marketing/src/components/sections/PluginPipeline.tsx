'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const STAGES = [
  {
    command: '/x4:onboard',
    label: 'Onboard',
    description: 'Check tools, accounts, CLI access',
    color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
  },
  {
    command: '/x4:create',
    label: 'Scaffold',
    description: 'Create a full-stack TypeScript monorepo',
    color: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
  },
  {
    command: '/x4:idea',
    label: 'Capture',
    description: 'Drop feature ideas into a structured backlog',
    color: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  },
  {
    command: '/x4:plan-backlog',
    label: 'Plan',
    description: 'Brainstorm, create plan, write PRD',
    color: 'border-orange-500/30 bg-orange-500/10 text-orange-400',
  },
  {
    command: '/x4:work',
    label: 'Build',
    description: 'Dispatch agent team to build & review',
    color: 'border-violet-500/30 bg-violet-500/10 text-violet-400',
  },
  {
    command: 'PR',
    label: 'Ship',
    description: 'Auto-create branch, PR, and cleanup',
    color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400',
  },
];

export function PluginPipeline() {
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
          <h2 className="text-3xl font-bold sm:text-4xl">
            The complete <span className="gradient-text">development pipeline</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            From idea to shipped PR in a single conversation. Each stage is a slash command.
          </p>
        </motion.div>

        <div className="relative grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STAGES.map((stage, i) => (
            <motion.div
              key={stage.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: 0.1 * i }}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-colors hover:border-white/15"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm font-bold text-muted-foreground">
                  {i + 1}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${stage.color}`}
                >
                  {stage.label}
                </span>
              </div>
              <code className="mt-4 block font-mono text-sm text-foreground">{stage.command}</code>
              <p className="mt-2 text-sm text-muted-foreground">{stage.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
