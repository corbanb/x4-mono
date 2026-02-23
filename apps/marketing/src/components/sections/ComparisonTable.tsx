'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Check, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const COMPARISON = [
  { feature: 'Type-safe API layer', x4: true, scratch: false },
  { feature: 'Multi-platform (web + mobile + desktop)', x4: true, scratch: false },
  { feature: 'Shared types & validation', x4: true, scratch: false },
  { feature: 'Authentication & RBAC', x4: true, scratch: false },
  { feature: 'Database ORM with migrations', x4: true, scratch: false },
  { feature: 'AI integration', x4: true, scratch: false },
  { feature: 'Structured logging', x4: true, scratch: false },
  { feature: 'Rate limiting & caching', x4: true, scratch: false },
  { feature: 'CI/CD pipeline', x4: true, scratch: false },
  { feature: '350+ tests', x4: true, scratch: false },
  { feature: 'Ready in minutes', x4: true, scratch: false },
  { feature: 'Full customization', x4: true, scratch: true },
];

export function ComparisonTable() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-4xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            x4 vs <span className="text-muted-foreground">building from scratch</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            Weeks of setup work, done for you. Start shipping features on day one.
          </p>
        </motion.div>

        <motion.div
          className="mt-12 overflow-hidden rounded-xl border border-border"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Header */}
          <div className="grid grid-cols-3 border-b border-border bg-card/50 px-6 py-4">
            <div className="text-sm font-medium text-muted-foreground">Feature</div>
            <div className="text-center text-sm font-semibold text-foreground">
              <span className="gradient-text">x4</span>
            </div>
            <div className="text-center text-sm font-medium text-muted-foreground">
              From Scratch
            </div>
          </div>

          {/* Rows */}
          {COMPARISON.map((row, i) => (
            <motion.div
              key={row.feature}
              className={cn(
                'grid grid-cols-3 items-center px-6 py-3.5',
                i < COMPARISON.length - 1 && 'border-b border-border',
              )}
              initial={{ opacity: 0, x: -10 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
            >
              <div className="text-sm text-muted-foreground">{row.feature}</div>
              <div className="flex justify-center">
                {row.x4 ? (
                  <Check size={18} className="text-emerald-400" />
                ) : (
                  <XIcon size={18} className="text-red-400/60" />
                )}
              </div>
              <div className="flex justify-center">
                {row.scratch ? (
                  <Check size={18} className="text-emerald-400" />
                ) : (
                  <XIcon size={18} className="text-red-400/60" />
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
