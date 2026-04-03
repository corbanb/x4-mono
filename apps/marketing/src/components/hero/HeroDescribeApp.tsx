'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';

const TYPED_PHRASE = 'A fitness tracker with AI coaching and social features';
const FEATURE_TAGS = [
  'Auth',
  'Workout Tracking',
  'AI Coaching',
  'Social Feed',
  'Progress Charts',
  'Notifications',
  'Mobile App',
  'Analytics',
];

export function HeroDescribeApp() {
  const [typedCount, setTypedCount] = useState(0);
  const [showPlan, setShowPlan] = useState(false);

  useEffect(() => {
    // Start typing after 600ms
    const startDelay = setTimeout(() => {
      const interval = setInterval(() => {
        setTypedCount((c) => {
          if (c >= TYPED_PHRASE.length) {
            clearInterval(interval);
            // Show plan card 400ms after typing completes
            setTimeout(() => setShowPlan(true), 400);
            return c;
          }
          return c + 1;
        });
      }, 38);
      return () => clearInterval(interval);
    }, 600);

    return () => clearTimeout(startDelay);
  }, []);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(124,58,237,0.15),transparent)]" />

      {/* Version badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6"
      >
        <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/5 px-4 py-1.5 font-mono text-xs text-violet-400">
          v3.5.0 · Claude Code Plugin · Apache 2.0
        </span>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="mb-4 text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0, 1] }}
      >
        What are you <span className="gradient-text">building?</span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        className="mb-10 max-w-xl text-lg text-muted-foreground"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Describe your app. x4 plans it, agents build it, ships it to production.
      </motion.p>

      {/* Input */}
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >
        <div className="gradient-border rounded-xl">
          <div className="flex items-center gap-3 rounded-xl bg-card/95 px-5 py-4 backdrop-blur-sm">
            <span className="text-lg font-mono text-violet-400">›</span>
            <span className="font-mono text-sm text-foreground">
              {TYPED_PHRASE.slice(0, typedCount)}
              {typedCount < TYPED_PHRASE.length && (
                <span className="inline-block h-4 w-0.5 animate-pulse bg-violet-400 align-middle" />
              )}
            </span>
          </div>
        </div>

        {/* Plan card */}
        <AnimatedPlanCard show={showPlan} />
      </motion.div>

      {/* Scroll hint */}
      <motion.p
        className="mt-16 text-xs text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: showPlan ? 1 : 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        ↓ watch agents build it
      </motion.p>
    </div>
  );
}

function AnimatedPlanCard({ show }: { show: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.98 }}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 12, scale: 0.98 }}
      transition={{ duration: 0.5, ease: [0.25, 0.4, 0, 1] }}
      className="mt-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-left"
    >
      <div className="mb-3 flex items-center gap-2">
        <span className="text-emerald-400">✓</span>
        <span className="font-mono text-xs font-semibold text-emerald-400">
          Kickstart plan generated · 8 features · 4 phases · PRDs ready
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {FEATURE_TAGS.map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-0.5 font-mono text-xs text-emerald-300"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-3 font-mono text-xs text-emerald-500/70">
        Run /x4:work to start building →
      </div>
    </motion.div>
  );
}
