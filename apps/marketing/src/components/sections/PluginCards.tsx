'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { GlowCard } from '@/components/effects/GlowCard';
import { Hammer, ListTodo, Users, BookOpen } from 'lucide-react';

const PLUGIN_SECTIONS = [
  {
    icon: Hammer,
    name: 'Scaffolding',
    color: 'text-blue-400',
    tagline: 'Project scaffolding & environment setup',
    commands: [
      { cmd: '/x4:onboard', desc: 'Check tools, accounts, CLIs' },
      { cmd: '/x4:create [name]', desc: 'Scaffold new project with presets' },
      { cmd: '/x4:tour', desc: 'Guided walkthrough — test login, AI chat, git setup' },
      { cmd: '/x4:add', desc: 'Add mobile or web app to existing project' },
      { cmd: '/x4:env', desc: 'Set up environment variables' },
      { cmd: '/x4:status', desc: 'Quick project health dashboard' },
    ],
    highlights: [
      'Presets: full-stack, saas, landing, api-only, custom',
      'Interactive wizard or --yes for instant setup',
      'Neon DB, Better Auth, AI keys — all configured',
    ],
  },
  {
    icon: ListTodo,
    name: 'Project Planning',
    color: 'text-yellow-400',
    tagline: 'Feature brainstorming, UI design, PRD generation',
    commands: [
      { cmd: '/x4:kickstart', desc: 'Brainstorm features, design UI, batch-generate PRDs' },
      { cmd: '/x4:idea <idea>', desc: 'Capture a feature idea to backlog' },
      { cmd: '/x4:plan-backlog', desc: 'Triage, brainstorm, plan, write PRD' },
      { cmd: '/x4:init-tracker', desc: 'Scaffold STATUS.md, BACKLOG.md, planning dirs' },
    ],
    highlights: [
      'Kickstart: vision → brainstorm → UI design → batch PRDs',
      'Two modes: kickstart (new projects) or incremental (ongoing)',
      'Integrates with superpowers + frontend-design plugins',
    ],
  },
  {
    icon: Users,
    name: 'Agent Team Ops',
    color: 'text-violet-400',
    tagline: 'Agent team coordination & shipping',
    commands: [
      { cmd: '/x4:work', desc: '7-phase pipeline: orient to ship' },
      { cmd: '/x4:run-tests', desc: 'Run unit, e2e, lint, typecheck' },
      { cmd: '/x4:pr-create', desc: 'Branch + DB branch + draft PR' },
      { cmd: '/x4:pr-cleanup', desc: 'Post-merge cleanup' },
    ],
    highlights: [
      '5 agent roles: backend, frontend, reviewer, tester, performance',
      'Automated review cycles with auto-fix',
      'Mandatory verification gate before shipping',
    ],
  },
  {
    icon: BookOpen,
    name: 'LLMs.txt Management',
    color: 'text-emerald-400',
    tagline: 'AI-readable reference documentation',
    commands: [
      { cmd: '/x4:llmstxt-init', desc: 'Scaffold download script and config' },
      { cmd: '/x4:llmstxt-update', desc: 'Scan, discover, download, sync docs' },
      { cmd: '/x4:llmstxt-status', desc: 'Status report of current docs' },
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
            One Plugin, Every Stage
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Every stage of development, <span className="gradient-text">automated</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            One plugin covers the complete pipeline — scaffolding, tracking, building, and shipping.
            All commands live under the <code className="text-foreground">/x4:</code> namespace.
          </p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {PLUGIN_SECTIONS.map((section, i) => (
            <motion.div
              key={section.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: 0.1 * i }}
            >
              <GlowCard className="h-full">
                <div className="flex items-center gap-3">
                  <section.icon className={`h-6 w-6 ${section.color}`} />
                  <div>
                    <h3 className="font-semibold text-foreground">{section.name}</h3>
                    <p className="text-xs text-muted-foreground">{section.tagline}</p>
                  </div>
                </div>

                {/* Commands */}
                <div className="mt-5 space-y-2">
                  {section.commands.map((c) => (
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
                  {section.highlights.map((h) => (
                    <li key={h} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <span className={`mt-0.5 ${section.color}`}>+</span>
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
