'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface FlowStep {
  number: number;
  name: string;
  color: string;
  description: string;
}

const FLOW_STEPS: FlowStep[] = [
  { number: 1, name: 'Vision', color: '#7c3aed', description: "Describe what you're building" },
  {
    number: 2,
    name: 'Brainstorm',
    color: '#3b82f6',
    description: 'AI expands your idea into features',
  },
  {
    number: 3,
    name: 'Prioritize',
    color: '#06b6d4',
    description: 'Rank and scope the feature list',
  },
  { number: 4, name: 'UI Design', color: '#4ade80', description: 'Sketch screens and user flows' },
  {
    number: 5,
    name: 'Batch PRDs',
    color: '#f59e0b',
    description: 'Generate product requirements docs',
  },
  {
    number: 6,
    name: 'Summary',
    color: '#8b5cf6',
    description: 'Review the full plan before building',
  },
];

interface PlanningMode {
  name: string;
  description: string;
  highlighted: boolean;
}

const PLANNING_MODES: PlanningMode[] = [
  {
    name: 'Kickstart',
    description: 'Full guided session. Best for new projects.',
    highlighted: true,
  },
  {
    name: 'Incremental',
    description: 'Add features one at a time via /x4:work',
    highlighted: false,
  },
  {
    name: 'Discovery',
    description: 'Let x4 scan your app and suggest next steps',
    highlighted: false,
  },
];

export function KickstartFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Horizontal flow */}
        <div className="overflow-x-auto pb-4">
          <div className="flex min-w-max flex-row gap-4 md:min-w-0 md:flex-row md:flex-wrap md:justify-center lg:flex-nowrap">
            {FLOW_STEPS.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="flex w-44 shrink-0 flex-col rounded-2xl border bg-card p-5 md:w-40 lg:w-44"
                style={{ borderColor: `${step.color}40` }}
              >
                {/* Step number */}
                <div
                  className="mb-3 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                  style={{ backgroundColor: step.color }}
                >
                  {step.number}
                </div>

                {/* Step name */}
                <p className="font-semibold text-foreground" style={{ color: step.color }}>
                  {step.name}
                </p>

                {/* Description */}
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {step.description}
                </p>

                {/* Connector dots — not shown on last item */}
                {index < FLOW_STEPS.length - 1 && (
                  <div className="absolute right-0 top-1/2 hidden -translate-y-1/2 translate-x-1/2 lg:block">
                    <div className="h-1.5 w-1.5 rounded-full bg-border" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Command line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mt-10 flex justify-center"
        >
          <div className="inline-flex flex-col items-start rounded-xl border border-violet-500/30 bg-card px-6 py-4 font-mono text-sm sm:flex-row sm:items-center sm:gap-4">
            <span className="text-violet-400">/x4:work</span>
            <span className="mt-1 text-muted-foreground sm:mt-0">
              ← agents build all features, in order, automatically
            </span>
          </div>
        </motion.div>

        {/* Three ways to plan */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mt-16"
        >
          <h3 className="mb-6 text-center text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Three ways to plan
          </h3>

          <div className="grid gap-4 sm:grid-cols-3">
            {PLANNING_MODES.map((mode) => (
              <div
                key={mode.name}
                className={`rounded-2xl border p-6 transition-colors ${
                  mode.highlighted
                    ? 'border-violet-500/50 bg-violet-500/10'
                    : 'border-border bg-card'
                }`}
              >
                <p
                  className={`font-semibold ${
                    mode.highlighted ? 'text-violet-400' : 'text-foreground'
                  }`}
                >
                  {mode.name}
                  {mode.highlighted && (
                    <span className="ml-2 rounded-full bg-violet-500/20 px-2 py-0.5 text-xs text-violet-300">
                      this page
                    </span>
                  )}
                </p>
                <p className="mt-2 text-sm text-muted-foreground">{mode.description}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default KickstartFlow;
