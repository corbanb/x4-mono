'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Category = 'All' | 'Setup' | 'Planning' | 'Discovery' | 'Agents' | 'Sources' | 'Utility';

interface Command {
  command: string;
  description: string;
  category: Exclude<Category, 'All'>;
}

const COMMANDS: Command[] = [
  // Scaffolding & Setup
  {
    command: '/x4:onboard',
    description: 'Check tools, accounts, CLIs, companion plugins — set up your dev environment',
    category: 'Setup',
  },
  {
    command: '/x4:create',
    description: 'Scaffold a new project (presets: full-stack, saas, landing, api-only)',
    category: 'Setup',
  },
  {
    command: '/x4:tour',
    description: 'Guided walkthrough — explore apps, test login, try AI chat, set up git',
    category: 'Setup',
  },
  {
    command: '/x4:add',
    description: 'Add a mobile or web app to an existing project',
    category: 'Setup',
  },
  {
    command: '/x4:env',
    description: 'Set up environment variables (database, auth, AI keys)',
    category: 'Setup',
  },
  {
    command: '/x4:status',
    description: 'Quick project health dashboard — apps, ports, database, git, plugins',
    category: 'Setup',
  },
  // Project Planning
  {
    command: '/x4:kickstart',
    description: 'Brainstorm features, design UI, prioritize, and batch-generate PRDs',
    category: 'Planning',
  },
  {
    command: '/x4:idea',
    description: 'Capture a feature idea to the backlog',
    category: 'Planning',
  },
  {
    command: '/x4:plan-backlog',
    description: 'Triage backlog → brainstorm → implementation plan → write PRD',
    category: 'Planning',
  },
  {
    command: '/x4:plan-bridge',
    description: 'Convert any planning session into a PRD',
    category: 'Planning',
  },
  {
    command: '/x4:init-tracker',
    description: 'Scaffold STATUS.md, BACKLOG.md, planning folders',
    category: 'Planning',
  },
  // Discovery
  {
    command: '/x4:gaps',
    description: 'Find product gaps — dead ends, missing connections, incomplete flows',
    category: 'Discovery',
  },
  {
    command: '/x4:dream',
    description:
      'Explore big ideas — bold features, natural evolutions, untapped tech stack capabilities',
    category: 'Discovery',
  },
  // Agent Team Ops
  {
    command: '/x4:work',
    description: '7-phase pipeline with auto-loop: Orient → Build → Review → Ship → Next',
    category: 'Agents',
  },
  {
    command: '/x4:run-tests',
    description: 'Run configured test commands — app-type-aware for e2e (web, marketing, desktop)',
    category: 'Agents',
  },
  {
    command: '/x4:e2e-setup',
    description: 'One-time Playwright scaffold wizard for monorepo apps',
    category: 'Agents',
  },
  {
    command: '/x4:init-setup',
    description: 'Interactive wizard for database, hosting, CI, tests, tracker, opensrc',
    category: 'Agents',
  },
  {
    command: '/x4:init-agents',
    description: 'Generate project-specific agent files from templates',
    category: 'Agents',
  },
  {
    command: '/x4:verify-local',
    description: 'Run all checks with auto-fix — mandatory ship gate',
    category: 'Agents',
  },
  {
    command: '/x4:pr-create',
    description: 'Create branch + DB branch + draft PR',
    category: 'Agents',
  },
  {
    command: '/x4:pr-status',
    description: 'Check CI, preview URLs, review state',
    category: 'Agents',
  },
  {
    command: '/x4:pr-cleanup',
    description: 'Post-merge cleanup',
    category: 'Agents',
  },
  {
    command: '/x4:debt-scan',
    description:
      'Post-build technical debt audit — TODOs, dead code, complexity hotspots, dependency drift',
    category: 'Agents',
  },
  {
    command: '/x4:deploy-setup',
    description: 'One-time Railway wizard — detect services, generate railway.toml, sync env vars',
    category: 'Agents',
  },
  // Source Code References
  {
    command: '/x4:opensrc-init',
    description: 'One-time setup: clone runtime dependency sources via opensrc, update CLAUDE.md',
    category: 'Sources',
  },
  {
    command: '/x4:opensrc-update',
    description: 'Diff package.json vs sources.json, fetch new/updated packages, remove orphans',
    category: 'Sources',
  },
  {
    command: '/x4:opensrc-status',
    description:
      'Read-only report: fetched packages, version freshness vs lockfile, missing coverage',
    category: 'Sources',
  },
  // Utility
  {
    command: '/x4:help',
    description:
      'Contextual plugin guide — detects project state, shows all commands, suggests next step',
    category: 'Utility',
  },
  {
    command: '/x4:doctor',
    description:
      'Project health diagnostic — prerequisites, config, agents, env vars, database, version, plugins',
    category: 'Utility',
  },
  {
    command: '/x4:upgrade',
    description: 'Apply x4 project migrations after updating the plugin',
    category: 'Utility',
  },
  {
    command: '/x4:market-update',
    description: 'Sync marketing site with shipped features',
    category: 'Utility',
  },
  {
    command: '/x4:market-subscribe',
    description: 'Scaffold email capture form + /api/subscribe route into the marketing site',
    category: 'Utility',
  },
  {
    command: '/x4:market-email',
    description:
      'Generate release email from changelog — subject line, preview text, body, Resend snippet',
    category: 'Utility',
  },
  {
    command: '/x4:market-linkedin',
    description: 'Generate LinkedIn post from changelog — hook, body, hashtags, clipboard',
    category: 'Utility',
  },
  {
    command: '/x4:market-tweet',
    description:
      'Generate X/Twitter thread from changelog — 280-char enforced, clipboard or --post',
    category: 'Utility',
  },
];

const CATEGORIES: Category[] = [
  'All',
  'Setup',
  'Planning',
  'Discovery',
  'Agents',
  'Sources',
  'Utility',
];

const CATEGORY_STYLES: Record<Exclude<Category, 'All'>, string> = {
  Setup: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30',
  Planning: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  Discovery: 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30',
  Agents: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  Sources: 'bg-orange-500/15 text-orange-400 ring-1 ring-orange-500/30',
  Utility: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
};

export function CommandsTable() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filtered = COMMANDS.filter((cmd) => {
    const matchesSearch =
      search === '' ||
      cmd.command.toLowerCase().includes(search.toLowerCase()) ||
      cmd.description.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === 'All' || cmd.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="mx-auto max-w-4xl px-6">
      {/* Search */}
      <div className="relative mb-6">
        <svg
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search commands..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-border bg-card/50 py-2.5 pl-9 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:border-violet-500/50 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
        />
      </div>

      {/* Category filter tabs */}
      <div className="mb-6 flex flex-wrap gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={cn(
              'rounded-full px-4 py-1.5 text-sm font-medium transition-colors',
              activeCategory === cat
                ? 'bg-violet-600 text-white'
                : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-border',
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border">
        {/* Header */}
        <div className="grid grid-cols-[2fr_3fr_auto] gap-4 border-b border-border bg-card/50 px-6 py-3.5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Command
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Description
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Category
          </div>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div className="px-6 py-12 text-center text-sm text-muted-foreground">
            No commands match your search.
          </div>
        ) : (
          filtered.map((cmd, i) => (
            <div
              key={cmd.command}
              className={cn(
                'grid grid-cols-[2fr_3fr_auto] items-center gap-4 px-6 py-3.5',
                i % 2 === 1 && 'bg-card/20',
                i < filtered.length - 1 && 'border-b border-border/50',
              )}
            >
              <div className="font-mono text-sm text-violet-400">{cmd.command}</div>
              <div className="text-sm text-muted-foreground">{cmd.description}</div>
              <div>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
                    CATEGORY_STYLES[cmd.category],
                  )}
                >
                  {cmd.category}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {filtered.length > 0 && (
        <p className="mt-4 text-right text-xs text-muted-foreground">
          {filtered.length} of {COMMANDS.length} commands
        </p>
      )}
    </div>
  );
}
