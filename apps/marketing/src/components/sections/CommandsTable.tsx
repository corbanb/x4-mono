'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Category =
  | 'All'
  | 'Setup'
  | 'Planning'
  | 'Build'
  | 'Discovery'
  | 'Announce'
  | 'DevOps'
  | 'Open Source';

interface Command {
  command: string;
  description: string;
  category: Exclude<Category, 'All'>;
}

const COMMANDS: Command[] = [
  { command: '/x4:create', description: 'Scaffold a new full-stack monorepo with interactive preset', category: 'Setup' },
  { command: '/x4:onboard', description: 'Check local dev environment and walk through setup', category: 'Setup' },
  { command: '/x4:add', description: 'Add a new mobile app or web app to an existing project', category: 'Setup' },
  { command: '/x4:deploy-setup', description: 'One-time Railway deployment wizard — creates project, generates domains', category: 'Setup' },
  { command: '/x4:env', description: 'Set up or update environment variables for the project', category: 'Setup' },
  { command: '/x4:init-setup', description: 'Interactive wizard to configure database, hosting, CI, package manager', category: 'Setup' },
  { command: '/x4:init-agents', description: 'Generate project-specific agent files from templates', category: 'Setup' },
  { command: '/x4:init-tracker', description: 'Scaffold project tracking files (STATUS.md, BACKLOG.md)', category: 'Setup' },
  { command: '/x4:e2e-setup', description: 'Scaffold Playwright e2e test suites for x4-mono apps', category: 'Setup' },
  { command: '/x4:kickstart', description: 'Brainstorm app vision, design UI, batch-generate PRDs', category: 'Planning' },
  { command: '/x4:plan-backlog', description: 'Triage backlog, brainstorm approaches, create implementation plan', category: 'Planning' },
  { command: '/x4:idea', description: 'Add an idea or feature to the project backlog', category: 'Planning' },
  { command: '/x4:work', description: 'Pick up next piece of work, dispatch agent team, and ship it', category: 'Build' },
  { command: '/x4:run-tests', description: 'Run all configured test commands from agent-team config', category: 'Build' },
  { command: '/x4:verify-local', description: 'Run all configured checks with auto-fix — mandatory before PRs', category: 'Build' },
  { command: '/x4:upgrade', description: 'Apply x4 project migrations after a plugin update', category: 'Build' },
  { command: '/x4:gaps', description: 'Find product gaps — dead ends, missing connections, incomplete flows', category: 'Discovery' },
  { command: '/x4:dream', description: 'Explore big ideas — bold features and untapped directions', category: 'Discovery' },
  { command: '/x4:market-update', description: 'Sync marketing site with recently shipped features', category: 'Announce' },
  { command: '/x4:market-email', description: 'Generate a release email campaign from recent changelog', category: 'Announce' },
  { command: '/x4:market-linkedin', description: 'Generate a LinkedIn post from recently shipped features', category: 'Announce' },
  { command: '/x4:market-tweet', description: 'Generate an X/Twitter thread from recently shipped features', category: 'Announce' },
  { command: '/x4:market-subscribe', description: 'Scaffold an email capture form into the marketing site', category: 'Announce' },
  { command: '/x4:pr-create', description: 'Create a feature branch, DB branch, push, and open a draft PR', category: 'DevOps' },
  { command: '/x4:pr-status', description: "Check current branch's PR status — CI checks, preview URLs", category: 'DevOps' },
  { command: '/x4:pr-cleanup', description: 'Post-merge cleanup — delete DB branch and remove local git branch', category: 'DevOps' },
  { command: '/x4:doctor', description: 'Diagnose project setup — checks prerequisites, config, env vars', category: 'DevOps' },
  { command: '/x4:status', description: 'Quick dashboard showing app status, ports, database, git', category: 'DevOps' },
  { command: '/x4:tour', description: 'Guided post-scaffold tour of your x4-mono project', category: 'DevOps' },
  { command: '/x4:help', description: 'Show all available commands and contextual next step', category: 'DevOps' },
  { command: '/x4:opensrc-init', description: 'Set up opensrc — fetches npm package source code for AI agents', category: 'Open Source' },
  { command: '/x4:opensrc-status', description: 'Check opensrc health — which packages have source fetched', category: 'Open Source' },
  { command: '/x4:opensrc-update', description: 'Refresh opensrc — add source for new deps, update outdated', category: 'Open Source' },
];

const CATEGORIES: Category[] = ['All', 'Setup', 'Planning', 'Build', 'Discovery', 'Announce', 'DevOps', 'Open Source'];

const CATEGORY_STYLES: Record<Exclude<Category, 'All'>, string> = {
  Setup: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30',
  Planning: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  Discovery: 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30',
  Build: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  Announce: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
  DevOps: 'bg-rose-500/15 text-rose-400 ring-1 ring-rose-500/30',
  'Open Source': 'bg-green-500/15 text-green-400 ring-1 ring-green-500/30',
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
