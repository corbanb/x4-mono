'use client';

import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface Command {
  name: string;
  description: string;
}

const TABS = [
  {
    label: 'Scaffolding & Setup',
    commands: [
      {
        name: '/x4:onboard',
        description: 'Check tools, accounts, CLIs, companion plugins — set up your dev environment',
      },
      {
        name: '/x4:create [name]',
        description: 'Scaffold a new project (presets: full-stack, saas, landing, api-only)',
      },
      {
        name: '/x4:tour',
        description: 'Guided walkthrough — explore apps, test login, try AI chat, set up git',
      },
      { name: '/x4:add', description: 'Add a mobile or web app to an existing project' },
      { name: '/x4:env', description: 'Set up environment variables (database, auth, AI keys)' },
      {
        name: '/x4:status',
        description: 'Quick project health dashboard — apps, ports, database, git, plugins',
      },
    ] satisfies Command[],
  },
  {
    label: 'Project Planning',
    commands: [
      {
        name: '/x4:kickstart',
        description: 'Brainstorm features, design UI, prioritize, and batch-generate PRDs',
      },
      { name: '/x4:idea <idea>', description: 'Capture a feature idea to the backlog' },
      {
        name: '/x4:plan-backlog',
        description: 'Triage backlog → brainstorm → implementation plan → write PRD',
      },
      { name: '/x4:init-tracker', description: 'Scaffold STATUS.md, BACKLOG.md, planning folders' },
    ] satisfies Command[],
  },
  {
    label: 'Agent Team Ops',
    commands: [
      { name: '/x4:work', description: '7-phase pipeline: Orient → Build → Review → Ship' },
      {
        name: '/x4:run-tests',
        description: 'Run configured test commands (unit, e2e, lint, typecheck)',
      },
      {
        name: '/x4:init-setup',
        description: 'Interactive wizard for database, hosting, CI, tests, tracker, llms.txt',
      },
      {
        name: '/x4:init-agents',
        description: 'Generate project-specific agent files from templates',
      },
      {
        name: '/x4:verify-local',
        description: 'Run all checks with auto-fix — mandatory ship gate',
      },
      { name: '/x4:pr-create', description: 'Create branch + DB branch + draft PR' },
      { name: '/x4:pr-status', description: 'Check CI, preview URLs, review state' },
      { name: '/x4:pr-cleanup', description: 'Post-merge cleanup' },
    ] satisfies Command[],
  },
  {
    label: 'LLMs.txt Docs',
    commands: [
      { name: '/x4:llmstxt-init', description: 'Scaffold download script and docs directory' },
      {
        name: '/x4:llmstxt-update',
        description: 'Scan dependencies, discover, download llms.txt docs',
      },
      { name: '/x4:llmstxt-status', description: 'Read-only status report of current docs' },
    ] satisfies Command[],
  },
];

export function CommandPalette() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [activeTab, setActiveTab] = useState(0);

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-blue-500/20 bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-400">
            24 Commands
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">A command for everything</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Scaffold components, manage PRDs, run quality checks, and ship — all from the command
            palette. Every command follows project conventions automatically.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          {/* Terminal header */}
          <div className="flex items-center gap-2 border-b border-border px-4 py-3">
            <div className="h-3 w-3 rounded-full bg-red-500/60" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
            <div className="h-3 w-3 rounded-full bg-green-500/60" />
            <span className="ml-2 text-xs text-muted-foreground">claude code</span>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-border">
            {TABS.map((tab, i) => (
              <button
                key={tab.label}
                onClick={() => setActiveTab(i)}
                className={cn(
                  'relative px-5 py-3 text-sm font-medium transition-colors',
                  activeTab === i
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
                <span className="ml-1.5 text-xs text-muted-foreground">
                  ({tab.commands.length})
                </span>
                {activeTab === i && (
                  <motion.div
                    layoutId="command-tab-active"
                    className="absolute inset-x-0 -bottom-px h-px bg-gradient-to-r from-violet-glow to-blue-glow"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Command list */}
          <div className="p-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-1"
              >
                {TABS[activeTab].commands.map((cmd, i) => (
                  <motion.div
                    key={cmd.name}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: i * 0.03 }}
                    className="flex items-baseline gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5"
                  >
                    <code className="shrink-0 font-mono text-sm font-medium text-violet-400">
                      {cmd.name}
                    </code>
                    <span className="text-sm text-muted-foreground">{cmd.description}</span>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
