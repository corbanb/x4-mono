'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ExternalLink } from 'lucide-react';

interface TechItem {
  name: string;
  abbr: string;
  description: string;
  url: string;
  color: string;
  span?: string;
}

const TECH_STACK: TechItem[] = [
  {
    name: 'TypeScript',
    abbr: 'TS',
    description:
      'Strict type safety from database to UI. Catch errors at compile time, not in production.',
    url: 'https://www.typescriptlang.org',
    color: 'text-blue-400',
    span: 'md:col-span-2',
  },
  {
    name: 'React',
    abbr: 'Re',
    description: 'Component-based UI library powering web, mobile, and desktop from one skillset.',
    url: 'https://react.dev',
    color: 'text-cyan-400',
  },
  {
    name: 'Next.js',
    abbr: 'Nx',
    description:
      'Full-stack React framework with SSR, SSG, and API routes. Deploys to Vercel in seconds.',
    url: 'https://nextjs.org',
    color: 'text-foreground',
  },
  {
    name: 'Expo',
    abbr: 'Ex',
    description: 'Build native iOS and Android apps with React. OTA updates and universal modules.',
    url: 'https://expo.dev',
    color: 'text-violet-400',
  },
  {
    name: 'Electron',
    abbr: 'El',
    description: 'Desktop apps for macOS, Windows, and Linux using the same React components.',
    url: 'https://www.electronjs.org',
    color: 'text-blue-300',
  },
  {
    name: 'Hono',
    abbr: 'Ho',
    description:
      'Ultra-fast web framework for the API layer. Runs on Bun, Node, Cloudflare, and Deno.',
    url: 'https://hono.dev',
    color: 'text-orange-400',
    span: 'md:col-span-2',
  },
  {
    name: 'tRPC',
    abbr: 'tR',
    description:
      'End-to-end type-safe APIs. Change a backend procedure, TypeScript catches every caller.',
    url: 'https://trpc.io',
    color: 'text-blue-500',
  },
  {
    name: 'Drizzle ORM',
    abbr: 'Dz',
    description:
      'Type-safe SQL ORM with zero overhead. Migrations, schema, and queries in TypeScript.',
    url: 'https://orm.drizzle.team',
    color: 'text-green-400',
  },
  {
    name: 'Neon',
    abbr: 'Ne',
    description:
      'Serverless Postgres with branching. Scale to zero, instant provisioning, edge-ready.',
    url: 'https://neon.tech',
    color: 'text-emerald-400',
  },
  {
    name: 'Better Auth',
    abbr: 'BA',
    description:
      'Authentication framework with sessions, bearer tokens, OAuth, and role-based access.',
    url: 'https://www.better-auth.com',
    color: 'text-yellow-400',
  },
  {
    name: 'Vercel AI SDK',
    abbr: 'AI',
    description:
      'Streaming AI responses, tool calling, and multi-provider support with Claude and GPT.',
    url: 'https://sdk.vercel.ai',
    color: 'text-violet-glow',
    span: 'md:col-span-2',
  },
  {
    name: 'Bun',
    abbr: 'Bn',
    description:
      'All-in-one JavaScript runtime. Package manager, test runner, and bundler — blazing fast.',
    url: 'https://bun.sh',
    color: 'text-amber-300',
  },
  {
    name: 'Turborepo',
    abbr: 'Tb',
    description: 'Monorepo build orchestration with caching, parallelism, and incremental builds.',
    url: 'https://turbo.build/repo',
    color: 'text-red-400',
  },
  {
    name: 'Tailwind CSS',
    abbr: 'Tw',
    description:
      'Utility-first CSS framework for rapid UI development. Dark mode and theming built in.',
    url: 'https://tailwindcss.com',
    color: 'text-cyan-glow',
  },
  {
    name: 'Zod',
    abbr: 'Zd',
    description:
      'Schema validation and type inference. Single source of truth for all data shapes.',
    url: 'https://zod.dev',
    color: 'text-blue-glow',
  },
  {
    name: 'Pino',
    abbr: 'Pi',
    description:
      'Structured JSON logging with near-zero overhead. Child loggers for every service.',
    url: 'https://getpino.io',
    color: 'text-green-300',
  },
];

function TechCard({ item, index, isInView }: { item: TechItem; index: number; isInView: boolean }) {
  return (
    <motion.a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group relative overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.03] ${item.span ?? ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, delay: 0.03 * index }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 font-mono text-xs font-bold ${item.color}`}
          >
            {item.abbr}
          </span>
          <span className="text-sm font-semibold text-foreground">{item.name}</span>
        </div>
        <ExternalLink
          size={14}
          className="text-muted-foreground/0 transition-all group-hover:text-muted-foreground/60"
        />
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">{item.description}</p>
    </motion.a>
  );
}

export function TechStackBento() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Built with the <span className="gradient-text">modern stack</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Every tool carefully chosen for developer experience, performance, and type safety.
            Click any to learn more.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {TECH_STACK.map((item, i) => (
            <TechCard key={item.name} item={item} index={i} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
}
