'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const PLUGINS_URL = 'https://github.com/studiox4/x4-agent-plugins';

const INSTALL_COMMANDS = `# Add the marketplace
/plugin marketplace add studiox4/x4-agent-plugins

# Install x4
/plugin install x4@x4-agent-plugins

# Start onboarding
/x4:onboard`;

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
        <h2 className="text-4xl font-bold sm:text-5xl">Ready to stop building manually?</h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Three commands. Your machine is ready. Your agents are waiting.
        </p>

        {/* Code block */}
        <div className="mt-10 overflow-hidden rounded-xl border border-border bg-black/50 text-left">
          <pre className="overflow-x-auto px-5 py-4 font-mono text-xs leading-relaxed text-foreground/80 sm:text-sm">
            {INSTALL_COMMANDS}
          </pre>
        </div>

        {/* Buttons */}
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <a
            href={PLUGINS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-500"
          >
            Install x4
          </a>
          <a
            href={PLUGINS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-border bg-transparent px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:border-white/20 hover:bg-white/5"
          >
            View on GitHub ↗
          </a>
        </div>

        {/* Footer line */}
        <p className="mt-8 font-mono text-xs text-muted-foreground/60">
          v3.10.0 · Apache 2.0 · studiox4/x4-agent-plugins
        </p>
      </motion.div>
    </section>
  );
}

export default CTASection;
