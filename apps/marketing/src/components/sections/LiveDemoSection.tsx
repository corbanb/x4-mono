'use client';

import { motion } from 'motion/react';

const USERS = [
  { name: 'Alex', color: '#3b82f6', initial: 'A' },
  { name: 'Jordan', color: '#8b5cf6', initial: 'J' },
  { name: 'Sam', color: '#14b8a6', initial: 'S' },
];

const CURSOR_PATHS = [
  { x: [60, 120, 80, 160, 100], y: [80, 60, 140, 100, 60] },
  { x: [200, 160, 220, 140, 200], y: [120, 80, 160, 100, 120] },
];

export function LiveDemoSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">Built for teams</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
            See who&apos;s online. Watch them move. Presence ships as a boilerplate feature.
          </p>
        </div>

        <div className="rounded-2xl border bg-card p-8">
          {/* Avatar stack */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex -space-x-2">
              {USERS.map((user) => (
                <div
                  key={user.name}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background text-sm font-semibold text-white"
                  style={{ backgroundColor: user.color }}
                  title={user.name}
                >
                  {user.initial}
                </div>
              ))}
            </div>
            <span className="text-sm text-muted-foreground">3 people online</span>
            <span
              className="ml-auto inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
              style={{ backgroundColor: '#14b8a614', color: '#14b8a6' }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: '#14b8a6' }}
              />
              live
            </span>
          </div>

          {/* Mock dashboard card with animated cursors */}
          <div className="relative overflow-hidden rounded-xl border bg-background p-6">
            <div className="mb-4 h-4 w-32 rounded bg-muted" />
            <div className="grid grid-cols-3 gap-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 rounded-lg bg-muted" />
              ))}
            </div>
            <div className="mt-4 space-y-2">
              <div className="h-3 w-full rounded bg-muted" />
              <div className="h-3 w-3/4 rounded bg-muted" />
            </div>

            {/* Animated cursors */}
            {CURSOR_PATHS.map((path, i) => (
              <motion.div
                key={i}
                className="pointer-events-none absolute"
                animate={{ x: path.x, y: path.y }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  repeatType: 'loop',
                  ease: 'easeInOut',
                  delay: i * 1.5,
                }}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill={USERS[i]!.color}
                >
                  <path d="M0 0L16 6L8 8L6 16Z" />
                </svg>
                <span
                  className="ml-1 whitespace-nowrap rounded px-1 text-xs text-white"
                  style={{ backgroundColor: USERS[i]!.color }}
                >
                  {USERS[i]!.name}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
