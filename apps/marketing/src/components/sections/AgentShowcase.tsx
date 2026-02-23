'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { Server, Layout, Database, TestTube, Shield, Container, FileText } from 'lucide-react';
import { GlowCard } from '@/components/effects/GlowCard';

const AGENTS = [
  {
    name: 'Backend',
    command: '/backend',
    icon: Server,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    description: 'Hono, tRPC v11, API architecture',
    capabilities: [
      'Router & procedure design',
      'Middleware patterns',
      'Error handling strategy',
      'Performance optimization',
    ],
  },
  {
    name: 'Frontend',
    command: '/frontend',
    icon: Layout,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    description: 'Next.js 15, React 19, component design',
    capabilities: [
      'App Router patterns',
      'Server/Client split',
      'State management',
      'Responsive UI',
    ],
  },
  {
    name: 'Database',
    command: '/database',
    icon: Database,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    description: 'Drizzle ORM, Neon Postgres, modeling',
    capabilities: ['Schema design', 'Migration strategy', 'Query optimization', 'Index planning'],
  },
  {
    name: 'Testing',
    command: '/testing',
    icon: TestTube,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    description: 'Bun test runner, test pyramid, patterns',
    capabilities: [
      'Unit & integration tests',
      'Mock factories',
      'Coverage strategy',
      'E2E with Playwright',
    ],
  },
  {
    name: 'Security',
    command: '/security',
    icon: Shield,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    description: 'Better Auth, OWASP, token management',
    capabilities: ['Auth flow design', 'RBAC policies', 'Input validation', 'Vulnerability audit'],
  },
  {
    name: 'DevOps',
    command: '/devops',
    icon: Container,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    description: 'GitHub Actions, Turborepo, deployment',
    capabilities: ['CI/CD pipelines', 'Neon branching', 'Vercel deployment', 'Environment config'],
  },
  {
    name: 'Docs',
    command: '/docs',
    icon: FileText,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    description: 'Fumadocs, READMEs, API reference',
    capabilities: [
      'API documentation',
      'Getting started guides',
      'JSDoc annotations',
      'Architecture docs',
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
            7 Specialist Agents
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">An expert for every layer</h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Each agent is a domain specialist with deep knowledge of its stack layer. Route any task
            to the right expert with a single slash command.
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
                    <code className="text-xs text-muted-foreground">{agent.command}</code>
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
