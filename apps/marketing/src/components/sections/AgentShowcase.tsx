'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Server, Layout, Eye, TestTube, Gauge } from 'lucide-react';
import { GlowCard } from '@/components/effects/GlowCard';

const AGENTS = [
  {
    name: 'Backend',
    role: 'Server-side engineer',
    icon: Server,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    description: 'API routes, database schema, tRPC procedures, middleware',
    capabilities: [
      'Drizzle schema & migrations',
      'tRPC router design',
      'Hono middleware',
      'Error handling strategy',
    ],
  },
  {
    name: 'Frontend',
    role: 'UI engineer',
    icon: Layout,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    description: 'Pages, components, styling, client state',
    capabilities: [
      'Next.js App Router pages',
      'React 19 components',
      'Tailwind styling',
      'Client-side state',
    ],
  },
  {
    name: 'Reviewer',
    role: 'Code reviewer (read-only)',
    icon: Eye,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    description: 'Security, architecture, quality audits',
    capabilities: [
      'Security vulnerability scan',
      'Architecture review',
      'Code quality audit',
      'Dependency boundary check',
    ],
  },
  {
    name: 'Tester',
    role: 'Test engineer',
    icon: TestTube,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: 'Unit tests, e2e tests, coverage',
    capabilities: [
      'Bun unit & integration tests',
      'Playwright e2e tests',
      'Mock factories',
      'Coverage analysis',
    ],
  },
  {
    name: 'Performance',
    role: 'Performance auditor (read-only)',
    icon: Gauge,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    description: 'Bundle size, re-renders, memory leaks, query efficiency',
    capabilities: [
      'Bundle size analysis',
      'Re-render detection',
      'Memory leak checks',
      'Database query efficiency',
    ],
  },
];

export function AgentShowcase() {
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
            5 Agent Team — /x4:work
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">A specialist for every role</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            The <code className="text-foreground">/x4:work</code> pipeline dispatches a 5-agent team
            with ownership boundaries — the frontend agent can&apos;t touch API code, the backend
            can&apos;t touch UI code, and reviewers are read-only.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {AGENTS.map((agent, i) => (
            <motion.div
              key={agent.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.4, delay: i * 0.07 }}
            >
              <GlowCard className="h-full">
                <div className="flex items-start gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${agent.bgColor}`}
                  >
                    <agent.icon size={20} className={agent.color} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{agent.name}</h3>
                    <span className="text-xs text-muted-foreground">{agent.role}</span>
                  </div>
                </div>
                <p className="mt-3 text-sm text-muted-foreground">{agent.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {agent.capabilities.map((cap) => (
                    <li key={cap} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span className={`h-1 w-1 shrink-0 rounded-full ${agent.color} opacity-60`} />
                      {cap}
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
