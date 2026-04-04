import type { Metadata } from 'next';
import { Users, GitBranch, Zap } from 'lucide-react';
import { GlowCard } from '@/components/effects/GlowCard';

export const metadata: Metadata = {
  title: 'For Teams — x4',
  description:
    'Ship the x4 workflow with your codebase. New teammates get the full agent setup automatically.',
};

const BENEFIT_CARDS = [
  {
    icon: Users,
    title: 'Auto-installs for new teammates',
    description: 'Clone the repo, get the agents. No manual setup required.',
  },
  {
    icon: GitBranch,
    title: 'Same plugin version',
    description: 'Everyone runs the same x4 version, pinned in the repo.',
  },
  {
    icon: Zap,
    title: 'No manual setup',
    description: 'Settings are committed to git. The workflow ships with the code.',
  },
];

const COMPANION_PLUGINS = [
  {
    name: 'frontend-design',
    role: 'Enhances Frontend agent with design patterns',
    required: 'Recommended',
  },
  {
    name: 'code-review',
    role: 'Enhances Reviewer agent with review checklists',
    required: 'Recommended',
  },
  {
    name: 'playwright',
    role: 'Enhances Tester agent with E2E test patterns',
    required: 'Recommended',
  },
  { name: 'neon-plugin', role: 'Database management with MCP tools', required: 'Recommended' },
  { name: 'vercel', role: 'Deployment integration', required: 'Recommended' },
  { name: 'stripe', role: 'Stripe API patterns and test cards', required: 'Recommended' },
  { name: 'security-guidance', role: 'Auto-warns on security anti-patterns', required: 'Required' },
  { name: 'ralph-loop', role: 'Autonomous iteration loops', required: 'Recommended' },
  { name: 'pr-review-toolkit', role: 'PR review automation', required: 'Recommended' },
];

const SETTINGS_JSON = `{
  "mcpServers": {
    "x4": {
      "command": "npx",
      "args": ["x4-mcp-server"]
    }
  }
}`;

export default function TeamsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pb-12 pt-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center rounded-full border border-blue-500/40 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400">
              For Teams
            </span>
          </div>

          <h1 className="text-4xl font-bold sm:text-5xl">
            Ship the workflow <span className="gradient-text">with the code.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            x4 lives in your repo. Every teammate gets the full agent setup when they clone.
          </p>
        </div>
      </section>

      {/* Settings snippet */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <p className="mb-4 text-center text-sm font-medium text-muted-foreground">
            Drop this in your repo:
          </p>
          <div className="overflow-hidden rounded-2xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border bg-background/40 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-2 font-mono text-xs text-muted-foreground">
                .claude/settings.json
              </span>
            </div>
            <pre className="overflow-x-auto p-6 font-mono text-sm leading-relaxed text-foreground/90">
              <code>{SETTINGS_JSON}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Benefit cards */}
      <section className="py-8">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 sm:grid-cols-3">
            {BENEFIT_CARDS.map((card) => (
              <GlowCard key={card.title}>
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/60">
                  <card.icon className="h-5 w-5 text-foreground/70" />
                </div>
                <h3 className="font-semibold text-foreground">{card.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{card.description}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </section>

      {/* Companion plugins table */}
      <section className="py-24">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">Companion plugins</h2>
            <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
              Extend x4 agents with specialized Claude Code plugins
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-background/40">
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Plugin
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Role
                  </th>
                  <th className="px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Required?
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPANION_PLUGINS.map((plugin, i) => (
                  <tr
                    key={plugin.name}
                    className={[
                      'border-b border-border last:border-0',
                      i % 2 === 0 ? 'bg-card' : 'bg-background/20',
                    ].join(' ')}
                  >
                    <td className="px-5 py-3.5">
                      <code className="font-mono text-sm font-medium text-foreground">
                        {plugin.name}
                      </code>
                    </td>
                    <td className="px-5 py-3.5 text-muted-foreground">{plugin.role}</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={[
                          'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
                          plugin.required === 'Required'
                            ? 'bg-violet-500/15 text-violet-400'
                            : 'bg-muted/50 text-muted-foreground',
                        ].join(' ')}
                      >
                        {plugin.required}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}
