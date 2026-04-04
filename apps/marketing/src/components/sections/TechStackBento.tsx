'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const TECH_ITEMS = [
  'Next.js 15',
  'Hono',
  'tRPC 11',
  'Drizzle',
  'Neon',
  'Better Auth',
  'Vercel AI SDK',
  'Expo 52',
  'Turborepo',
  'Bun',
];

const PRESETS = ['saas', 'full-stack', 'landing', 'api-only'] as const;

export function TechStackBento() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            The stack you would have chosen anyway.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Not scaffolded toys. Not locked-in frameworks. The exact tools senior engineers pick.
          </p>
        </motion.div>

        {/* Tech grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5"
        >
          {TECH_ITEMS.map((name) => (
            <div
              key={name}
              className="flex items-center justify-center rounded-xl border border-border bg-card px-3 py-2.5 text-center font-mono text-xs font-medium text-foreground/80 transition-colors hover:border-white/15 hover:text-foreground"
            >
              {name}
            </div>
          ))}
        </motion.div>

        {/* Preset pills */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-2"
        >
          {PRESETS.map((preset) => (
            <span
              key={preset}
              className={
                preset === 'saas'
                  ? 'rounded-full px-4 py-1.5 font-mono text-xs font-semibold bg-violet-600 text-white'
                  : 'rounded-full border border-border bg-card px-4 py-1.5 font-mono text-xs font-medium text-muted-foreground'
              }
            >
              {preset}
            </span>
          ))}
        </motion.div>

        {/* Command line */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mt-6 flex justify-center"
        >
          <div className="rounded-xl border border-border bg-black/40 px-5 py-3 font-mono text-sm text-foreground/80">
            <span>
              <span className="text-violet-400 select-none">/</span>x4:create my-app --preset saas
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default TechStackBento;
