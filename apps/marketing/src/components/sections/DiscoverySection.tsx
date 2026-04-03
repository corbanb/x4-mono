'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface IssueItem {
  label: string;
  color: string;
}

interface IdeaItem {
  label: string;
  color: string;
}

const GAPS_ISSUES: IssueItem[] = [
  { label: 'No error handling on /api/payments', color: '#ef4444' },
  { label: 'Profile page has no loading state', color: '#f59e0b' },
  { label: 'Settings route unreachable from nav', color: '#f59e0b' },
];

const DREAM_IDEAS: IdeaItem[] = [
  { label: '[What if] Dark mode toggle', color: '#22d3ee' },
  { label: "[What's next] Stripe billing integration", color: '#4ade80' },
  { label: '[Emerging] AI-powered search', color: '#a78bfa' },
];

export function DiscoverySection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">Shipped is never finished.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            x4 scans what you&apos;ve built and finds what&apos;s missing before your users do.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {/* Gaps card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="rounded-2xl border border-violet-500/30 bg-card p-6"
          >
            <p className="font-mono text-sm font-semibold text-violet-400">/x4:gaps</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Dead ends. Missing connections. Incomplete flows.
            </p>

            <ul className="mt-5 space-y-2">
              {GAPS_ISSUES.map((issue) => (
                <li key={issue.label} className="flex items-start gap-2 font-mono text-xs">
                  <span style={{ color: issue.color }} className="mt-0.5 shrink-0">
                    ●
                  </span>
                  <span className="text-foreground/80">{issue.label}</span>
                </li>
              ))}
            </ul>

            <label className="mt-5 flex cursor-default items-center gap-2 text-xs text-muted-foreground select-none">
              <span className="flex h-4 w-4 items-center justify-center rounded border border-border bg-white/5">
                <span className="h-2 w-2 rounded-sm bg-violet-500" />
              </span>
              Send to backlog
            </label>
          </motion.div>

          {/* Dream card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="rounded-2xl border border-emerald-500/30 bg-card p-6"
          >
            <p className="font-mono text-sm font-semibold text-emerald-400">/x4:dream</p>
            <p className="mt-1 text-xs text-muted-foreground">
              What if. What&apos;s next. What&apos;s emerging.
            </p>

            <ul className="mt-5 space-y-2">
              {DREAM_IDEAS.map((idea) => (
                <li key={idea.label} className="flex items-start gap-2 font-mono text-xs">
                  <span style={{ color: idea.color }} className="mt-0.5 shrink-0">
                    ●
                  </span>
                  <span className="text-foreground/80">{idea.label}</span>
                </li>
              ))}
            </ul>

            <label className="mt-5 flex cursor-default items-center gap-2 text-xs text-muted-foreground select-none">
              <span className="flex h-4 w-4 items-center justify-center rounded border border-border bg-white/5">
                <span className="h-2 w-2 rounded-sm bg-emerald-500" />
              </span>
              Add to backlog
            </label>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 text-center text-sm text-muted-foreground"
        >
          Selected ideas feed straight back into{' '}
          <span className="font-mono text-violet-400">/x4:work</span>. The loop never ends.
        </motion.p>
      </div>
    </section>
  );
}

export default DiscoverySection;
