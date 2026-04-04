'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Category = 'All' | 'Setup' | 'Planning' | 'Discovery' | 'Build' | 'Docs';

interface Command {
  command: string;
  description: string;
  category: Exclude<Category, 'All'>;
}

const COMMANDS: Command[] = [
  {
    command: '/x4:create',
    description: 'Scaffold a new full-stack project with preset',
    category: 'Setup',
  },
  {
    command: '/x4:kickstart',
    description: 'Guided planning session — vision to PRD backlog',
    category: 'Planning',
  },
  { command: '/x4:plan', description: 'Generate a PRD for a single feature', category: 'Planning' },
  {
    command: '/x4:plan-backlog',
    description: 'Triage and prioritize the feature backlog',
    category: 'Planning',
  },
  {
    command: '/x4:work',
    description: 'Dispatch agent team to build next feature',
    category: 'Build',
  },
  {
    command: '/x4:work-batch',
    description: 'Build multiple features in sequence',
    category: 'Build',
  },
  {
    command: '/x4:review',
    description: 'Review code quality, security, and coverage',
    category: 'Build',
  },
  {
    command: '/x4:gaps',
    description: 'Scan app for dead ends and missing flows',
    category: 'Discovery',
  },
  {
    command: '/x4:dream',
    description: 'Generate ideas for what to build next',
    category: 'Discovery',
  },
  { command: '/x4:status', description: 'Project health dashboard', category: 'Build' },
  {
    command: '/x4:ship',
    description: 'Branch, commit, and open a pull request',
    category: 'Build',
  },
  {
    command: '/x4:check-boundaries',
    description: 'Audit dependency boundary violations',
    category: 'Build',
  },
  {
    command: '/x4:add-page',
    description: 'Scaffold a new Next.js App Router page',
    category: 'Build',
  },
  {
    command: '/x4:add-schema',
    description: 'Add Zod schemas and inferred types',
    category: 'Build',
  },
  {
    command: '/x4:add-router',
    description: 'Add a tRPC router with CRUD procedures',
    category: 'Build',
  },
  {
    command: '/x4:add-table',
    description: 'Add a Drizzle database table with migration',
    category: 'Build',
  },
  {
    command: '/x4:add-middleware',
    description: 'Add Hono middleware with test file',
    category: 'Build',
  },
  {
    command: '/x4:add-form',
    description: 'Add react-hook-form wired to tRPC mutation',
    category: 'Build',
  },
  { command: '/x4:add-hook', description: 'Add a shared React hook', category: 'Build' },
  {
    command: '/x4:add-env',
    description: 'Sync environment variable across all configs',
    category: 'Build',
  },
  {
    command: '/x4:add-workflow',
    description: 'Add GitHub Actions workflow scaffold',
    category: 'Build',
  },
  {
    command: '/x4:add-test',
    description: 'Generate tests for an existing file',
    category: 'Build',
  },
  { command: '/x4:docs', description: 'Generate or update documentation', category: 'Docs' },
  { command: '/x4:tour', description: 'Guided walkthrough of the project', category: 'Docs' },
  {
    command: '/x4:llmstxt-update',
    description: 'Refresh llms.txt reference docs',
    category: 'Docs',
  },
];

const CATEGORIES: Category[] = ['All', 'Setup', 'Planning', 'Discovery', 'Build', 'Docs'];

const CATEGORY_STYLES: Record<Exclude<Category, 'All'>, string> = {
  Setup: 'bg-violet-500/15 text-violet-400 ring-1 ring-violet-500/30',
  Planning: 'bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30',
  Discovery: 'bg-cyan-500/15 text-cyan-400 ring-1 ring-cyan-500/30',
  Build: 'bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30',
  Docs: 'bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30',
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
