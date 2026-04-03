'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { GlowCard } from '@/components/effects/GlowCard';

const GAPS_ISSUES = [
  { emoji: '🔴', severity: 'High', label: 'Payment flow has no error state' },
  { emoji: '🟡', severity: 'Medium', label: 'Profile page unreachable from mobile nav' },
  { emoji: '🟡', severity: 'Medium', label: "Settings changes don't persist on refresh" },
];

const DREAM_IDEAS = [
  { emoji: '💙', type: 'What if', label: 'Add offline mode for mobile' },
  { emoji: '💚', type: "What's next", label: 'Team collaboration features' },
  { emoji: '💜', type: 'Emerging', label: 'AI-powered search across all content' },
];

const PIPELINE_STEPS = [
  { label: 'gaps / dream', highlight: true },
  { label: 'backlog' },
  { label: 'plan-backlog' },
  { label: 'work' },
  { label: 'ship' },
  { label: 'gaps', highlight: true },
];

export function DiscoveryExplainer() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        {/* Two-panel explainer */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* /x4:gaps — left panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <GlowCard className="h-full border-violet-500/40">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-base font-bold text-violet-400">/x4:gaps</p>
                <span className="rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                  Discovery
                </span>
              </div>

              <p className="mb-5 text-sm text-muted-foreground">
                x4 analyzes your entire codebase and surfaces dead ends, missing connections, and
                incomplete user flows. Each issue comes with a severity rating and a direct path to
                your backlog.
              </p>

              <ul className="space-y-3">
                {GAPS_ISSUES.map((issue) => (
                  <li
                    key={issue.label}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5"
                  >
                    <span className="mt-0.5 shrink-0 text-base leading-none">{issue.emoji}</span>
                    <div>
                      <span className="text-xs font-semibold text-foreground/60">
                        {issue.severity}:{' '}
                      </span>
                      <span className="text-sm text-foreground/80">{issue.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </GlowCard>
          </motion.div>

          {/* /x4:dream — right panel */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <GlowCard className="h-full border-emerald-500/40">
              <div className="mb-4 flex items-center justify-between">
                <p className="font-mono text-base font-bold text-emerald-400">/x4:dream</p>
                <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                  Discovery
                </span>
              </div>

              <p className="mb-5 text-sm text-muted-foreground">
                x4 suggests what to build next based on your existing product. Ideas are categorized
                by type and can be sent directly to your backlog for /x4:work to pick up.
              </p>

              <ul className="space-y-3">
                {DREAM_IDEAS.map((idea) => (
                  <li
                    key={idea.label}
                    className="flex items-start gap-3 rounded-lg border border-border bg-background/40 px-3 py-2.5"
                  >
                    <span className="mt-0.5 shrink-0 text-base leading-none">{idea.emoji}</span>
                    <div>
                      <span className="text-xs font-semibold text-foreground/60">
                        {idea.type}:{' '}
                      </span>
                      <span className="text-sm text-foreground/80">{idea.label}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </GlowCard>
          </motion.div>
        </div>

        {/* Pipeline diagram */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-10"
        >
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <p className="mb-5 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              The loop never ends.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              {PIPELINE_STEPS.map((step, i) => (
                <div key={step.label + i} className="flex items-center gap-2">
                  <span
                    className={[
                      'rounded-lg border px-3 py-1.5 font-mono text-xs font-medium',
                      step.highlight
                        ? 'border-violet-500/40 bg-violet-500/10 text-violet-400'
                        : 'border-border bg-background/60 text-foreground/70',
                    ].join(' ')}
                  >
                    /x4:{step.label}
                  </span>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <span className="text-muted-foreground/40 select-none">→</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
