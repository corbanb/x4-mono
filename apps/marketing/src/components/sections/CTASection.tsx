'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Github } from 'lucide-react';

const MONOREPO_URL = 'https://github.com/corbanb/x4-mono';
const PLUGINS_URL = 'https://github.com/studiox4/x4-agent-plugins';

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-glow/5 to-transparent" />

      <motion.div
        className="relative mx-auto max-w-3xl px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold sm:text-5xl">
          Ready to build <span className="gradient-text">something great</span>?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Get started in minutes with a production-ready monorepo. Web, mobile, and desktop — all
          wired up and ready to ship.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={MONOREPO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/5"
          >
            <Github size={16} />
            View the Monorepo on GitHub
          </a>
          <a
            href={PLUGINS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-violet-500/50 hover:bg-violet-500/15"
          >
            <Github size={16} />
            View Agent Plugins on GitHub
          </a>
        </div>
      </motion.div>
    </section>
  );
}
