'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { GlowCard } from '@/components/effects/GlowCard';
import { Hammer, ListTodo, Users, BookOpen } from 'lucide-react';

const PLUGINS = [
  {
    icon: Hammer,
    name: 'x4-scaffold',
    color: 'text-blue-400',
    tagline: 'Project scaffolding & environment setup',
    commands: [
      { cmd: '/x4-onboard', desc: 'Check tools, accounts, CLIs' },
      { cmd: '/x4-create [name]', desc: 'Scaffold new project with presets' },
      { cmd: '/x4-add', desc: 'Add mobile or web app to existing project' },
      { cmd: '/x4-env', desc: 'Set up environment variables' },
    ],
    highlights: [
      'Presets: full-stack, saas, landing, api-only',
      'Interactive wizard or --yes for instant setup',
      'Neon DB, Better Auth, AI keys — all configured',
    ],
  },
  {
    icon: ListTodo,
    name: 'x4-project-tracker',
    color: 'text-yellow-400',
    tagline: 'Backlog capture, triage, PRD generation',
    commands: [
      { cmd: '/idea <idea>', desc: 'Capture a feature idea to backlog' },
      { cmd: '/plan-backlog', desc: 'Triage, brainstorm, plan, write PRD' },
      { cmd: '/init-tracker', desc: 'Scaffold STATUS.md, BACKLOG.md, planning dirs' },
    ],
    highlights: [
      'Structured backlog with priority and sizing',
      'Auto-generates PRDs from brainstorm sessions',
      'Integrates with Superpowers brainstorming skill',
    ],
  },
  {
    icon: Users,
    name: 'x4-agent-team-ops',
    color: 'text-violet-400',
    tagline: 'Agent team coordination & shipping',
    commands: [
      { cmd: '/work', desc: '7-phase pipeline: orient to ship' },
      { cmd: '/run-tests', desc: 'Run unit, e2e, lint, typecheck' },
      { cmd: '/pr-create', desc: 'Branch + DB branch + draft PR' },
      { cmd: '/pr-cleanup', desc: 'Post-merge cleanup' },
    ],
    highlights: [
      '5 agent roles: backend, frontend, reviewer, tester, performance',
      'Automated review cycles with auto-fix',
      'Mandatory verification gate before shipping',
    ],
  },
  {
    icon: BookOpen,
    name: 'x4-llmstxt-manager',
    color: 'text-emerald-400',
    tagline: 'AI-readable reference documentation',
    commands: [
      { cmd: '/llmstxt-init', desc: 'Scaffold download script and config' },
      { cmd: '/llmstxt-update', desc: 'Scan, discover, download, sync docs' },
      { cmd: '/llmstxt-status', desc: 'Status report of current docs' },
    ],
    highlights: [
      'Auto-discovers llms.txt endpoints from dependencies',
      'Downloads AI-optimized docs for accurate guidance',
      'Known-sources cache for fast updates',
    ],
  },
];

export function PluginCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-400">
            4 Plugins
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Every stage of development, <span className="gradient-text">automated</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Each plugin handles a distinct phase. Install one or all — they work independently and
            together.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {PLUGINS.map((plugin, i) => (
            <motion.div
              key={plugin.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <GlowCard className="h-full">
                <div className="flex items-center gap-3">
                  <plugin.icon className={`h-6 w-6 ${plugin.color}`} />
                  <div>
                    <h3 className="font-semibold text-foreground">{plugin.name}</h3>
                    <p className="text-xs text-muted-foreground">{plugin.tagline}</p>
                  </div>
                </div>

                {/* Commands */}
                <div className="mt-5 space-y-2">
                  {plugin.commands.map((c) => (
                    <div key={c.cmd} className="flex items-start gap-3 text-sm">
                      <code className="shrink-0 rounded bg-white/5 px-2 py-0.5 font-mono text-xs text-foreground">
                        {c.cmd}
                      </code>
                      <span className="text-muted-foreground">{c.desc}</span>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <ul className="mt-5 space-y-1.5 border-t border-border pt-4">
                  {plugin.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className={`mt-0.5 ${plugin.color}`}>+</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
