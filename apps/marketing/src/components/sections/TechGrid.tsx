"use client";

import { useRef, useState } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { GlowCard } from "@/components/effects/GlowCard";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechItem {
  name: string;
  abbr: string;
  version: string;
  category: string;
  description: string;
  why: string;
  color: string;
}

const TECH: TechItem[] = [
  {
    name: "Bun",
    abbr: "Bn",
    version: "1.1+",
    category: "Runtime",
    description: "All-in-one JavaScript runtime with built-in bundler, test runner, and package manager.",
    why: "3-5x faster installs than npm, built-in test runner eliminates Jest, native TypeScript execution without compilation step.",
    color: "text-orange-400",
  },
  {
    name: "TypeScript",
    abbr: "TS",
    version: "5.6",
    category: "Language",
    description: "Strict type system across the entire monorepo.",
    why: "Catches bugs at compile time, enables tRPC's end-to-end type inference, and provides the best developer experience for multi-package repos.",
    color: "text-blue-glow",
  },
  {
    name: "Turborepo",
    abbr: "Tb",
    version: "latest",
    category: "Build",
    description: "High-performance build system for monorepos with remote caching.",
    why: "Parallel task execution, dependency-aware builds, and remote caching mean CI times stay fast as the repo grows.",
    color: "text-red-400",
  },
  {
    name: "Next.js",
    abbr: "Nx",
    version: "15",
    category: "Web",
    description: "React framework with App Router, Server Components, and static export.",
    why: "App Router enables granular server/client splits. React 19 support. Vercel-optimized deployment with zero config.",
    color: "text-foreground",
  },
  {
    name: "Expo",
    abbr: "Ex",
    version: "52",
    category: "Mobile",
    description: "React Native framework with managed workflow and Expo Router.",
    why: "File-based routing mirrors Next.js patterns. OTA updates without app store resubmission. Managed workflow eliminates native build complexity.",
    color: "text-violet-glow",
  },
  {
    name: "Electron",
    abbr: "El",
    version: "33",
    category: "Desktop",
    description: "Cross-platform desktop apps with Chromium and Node.js.",
    why: "Shares the React/TypeScript stack with web. IPC bridge pattern keeps renderer secure. safeStorage for credential management.",
    color: "text-cyan-glow",
  },
  {
    name: "Hono",
    abbr: "Ho",
    version: "4.x",
    category: "API",
    description: "Ultrafast web framework for the edge, Cloudflare Workers, and Node.js.",
    why: "Faster than Express with modern API patterns. Runs on any runtime (Bun, Node, Edge, Workers). Built-in middleware for CORS, auth, and more.",
    color: "text-orange-300",
  },
  {
    name: "tRPC",
    abbr: "tR",
    version: "11",
    category: "API",
    description: "End-to-end typesafe API layer with zero code generation.",
    why: "Change a server procedure, get instant type errors in every client. No GraphQL schema, no REST boilerplate, no code generation step.",
    color: "text-blue-400",
  },
  {
    name: "Drizzle ORM",
    abbr: "Dz",
    version: "latest",
    category: "Database",
    description: "TypeScript ORM with SQL-like query builder and migration toolkit.",
    why: "Schema-as-code generates type-safe queries. Zero overhead — compiles to raw SQL. Migration generation from schema diffs.",
    color: "text-green-400",
  },
  {
    name: "Neon",
    abbr: "Ne",
    version: "serverless",
    category: "Database",
    description: "Serverless Postgres with branching, autoscaling, and zero cold starts.",
    why: "Branch databases for every PR. Scale to zero when idle, scale up under load. HTTP driver for serverless functions.",
    color: "text-emerald-400",
  },
  {
    name: "Better Auth",
    abbr: "BA",
    version: "latest",
    category: "Auth",
    description: "Type-safe authentication with session management and RBAC.",
    why: "Works with any database adapter. Bearer token support for mobile/desktop. Plugin system for OAuth, 2FA, and more.",
    color: "text-yellow-400",
  },
  {
    name: "Vercel AI SDK",
    abbr: "AI",
    version: "4.x",
    category: "AI",
    description: "Unified API for AI providers with streaming and tool calling.",
    why: "Provider-agnostic — switch from Claude to GPT with one line. Streaming support for real-time UX. Built-in token counting and cost tracking.",
    color: "text-violet-400",
  },
  {
    name: "Zod",
    abbr: "Zd",
    version: "3.x",
    category: "Validation",
    description: "TypeScript-first schema validation with static type inference.",
    why: "Single source of truth for types — define once, infer everywhere. Works with tRPC, react-hook-form, and Drizzle. Runtime + compile-time safety.",
    color: "text-blue-300",
  },
  {
    name: "Tailwind CSS",
    abbr: "Tw",
    version: "4.x",
    category: "Styling",
    description: "Utility-first CSS framework with JIT compilation.",
    why: "No CSS-in-JS runtime cost. v4 CSS-native engine is even faster. Consistent design tokens across all web apps in the monorepo.",
    color: "text-cyan-400",
  },
  {
    name: "Pino",
    abbr: "Pi",
    version: "9.x",
    category: "Logging",
    description: "Ultra-fast structured JSON logger for Node.js.",
    why: "10x faster than Winston. Structured JSON output for log aggregation services. Child loggers for per-module context.",
    color: "text-green-300",
  },
];

function TechCard({ item, index }: { item: TechItem; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <GlowCard className="h-full">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 font-mono text-sm font-bold",
                item.color
              )}
            >
              {item.abbr}
            </span>
            <div>
              <h3 className="font-semibold text-foreground">{item.name}</h3>
              <span className="text-xs text-muted-foreground">
                {item.category}
              </span>
            </div>
          </div>
          <span className="rounded-full border border-border bg-card px-2.5 py-0.5 font-mono text-xs text-muted-foreground">
            {item.version}
          </span>
        </div>

        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {item.description}
        </p>

        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-3 flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:text-primary/80"
        >
          Why we chose this
          <ChevronDown
            size={12}
            className={cn(
              "transition-transform duration-200",
              expanded && "rotate-180"
            )}
          />
        </button>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <p className="mt-2 border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
                {item.why}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </GlowCard>
    </motion.div>
  );
}

export function TechGrid() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TECH.map((item, i) => (
            <TechCard key={item.name} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
