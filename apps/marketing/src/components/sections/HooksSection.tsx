'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Shield, Paintbrush, TestTube, Play } from 'lucide-react';

const HOOKS = [
  {
    icon: Shield,
    name: 'Protected files',
    trigger: 'Before any edit',
    description: 'Prevents accidental changes to lock files, configs',
    color: 'text-orange-400',
  },
  {
    icon: Paintbrush,
    name: 'Auto-format',
    trigger: 'After any edit',
    description: "Runs the project's formatter on changed files",
    color: 'text-blue-400',
  },
  {
    icon: TestTube,
    name: 'Teammate idle',
    trigger: 'Agent goes idle',
    description: 'Runs test gate when tester agent finishes',
    color: 'text-emerald-400',
  },
  {
    icon: Play,
    name: 'Session start',
    trigger: 'New session',
    description: 'Shows key commands, checks if llms.txt docs are stale (30+ days)',
    color: 'text-violet-400',
  },
];

export function HooksSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-400">
            4 Built-in Hooks
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Automation that runs <span className="gradient-text">in the background</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Hooks fire automatically on events — protecting files, formatting code, running tests,
            and keeping your AI context fresh. Zero configuration.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2">
          {HOOKS.map((hook, i) => (
            <motion.div
              key={hook.name}
              initial={{ opacity: 0, y: 15 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.3, delay: 0.1 + i * 0.07 }}
              className="flex items-start gap-4 rounded-xl border border-border bg-card/50 p-5"
            >
              <div className={`mt-0.5 ${hook.color}`}>
                <hook.icon size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{hook.name}</h3>
                <p className="mt-0.5 text-xs text-muted-foreground/70">Trigger: {hook.trigger}</p>
                <p className="mt-2 text-sm text-muted-foreground">{hook.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
