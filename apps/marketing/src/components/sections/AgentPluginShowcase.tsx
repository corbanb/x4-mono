'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useInView, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import type { LucideIcon } from 'lucide-react';
import {
  CheckCircle2,
  Hammer,
  Lightbulb,
  Map,
  Users,
  Rocket,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

interface PipelineStage {
  id: string;
  label: string;
  icon: LucideIcon;
  color: string;
  glowColor: string;
  plugin: string;
  headline: string;
  description: string;
  terminal: TerminalLine[];
}

interface TerminalLine {
  text: string;
  type: 'command' | 'output' | 'success' | 'info';
  delay: number;
}

const STAGES: PipelineStage[] = [
  {
    id: 'onboard',
    label: 'Onboard',
    icon: CheckCircle2,
    color: 'text-emerald-400',
    glowColor: 'emerald',
    plugin: 'x4',
    headline: 'Get your machine ready in seconds',
    description:
      "The onboarding wizard checks every tool, account, and CLI you need — Bun, Git, GitHub CLI, Neon, Railway, Vercel. It detects what you already have and only walks through what's missing.",
    terminal: [
      { text: '$ /x4:onboard', type: 'command', delay: 0 },
      { text: '', type: 'output', delay: 400 },
      { text: 'Checking prerequisites...', type: 'output', delay: 600 },
      { text: '  Bun >= 1.1          ✓ installed (1.1.34)', type: 'success', delay: 1000 },
      { text: '  Node.js >= 18       ✓ installed (22.5.1)', type: 'success', delay: 1300 },
      { text: '  Git                 ✓ installed', type: 'success', delay: 1600 },
      { text: '  GitHub CLI          ✓ authenticated', type: 'success', delay: 1900 },
      { text: '  Neon account        ✓ connected', type: 'success', delay: 2200 },
      { text: '  Railway account     ✗ not found', type: 'info', delay: 2500 },
      { text: '', type: 'output', delay: 2700 },
      { text: 'Setting up Railway...', type: 'output', delay: 2900 },
      { text: '  Railway account     ✓ connected', type: 'success', delay: 3400 },
      { text: '', type: 'output', delay: 3600 },
      { text: "All prerequisites met — you're ready to build!", type: 'success', delay: 3800 },
    ],
  },
  {
    id: 'scaffold',
    label: 'Scaffold',
    icon: Hammer,
    color: 'text-blue-400',
    glowColor: 'blue',
    plugin: 'x4',
    headline: 'Full-stack project in one command',
    description:
      'Choose a preset — saas, full-stack, landing, or api-only — and get a complete TypeScript monorepo with Next.js, Hono, tRPC, Drizzle, Better Auth, and AI integration. Database provisioned, env vars configured, ready to dev.',
    terminal: [
      { text: '$ /x4:create my-app --preset saas', type: 'command', delay: 0 },
      { text: '', type: 'output', delay: 400 },
      { text: 'Creating project "my-app" with saas preset...', type: 'output', delay: 600 },
      { text: '  Scaffolding monorepo structure', type: 'info', delay: 1000 },
      { text: '  Installing 892 packages [3.2s]', type: 'info', delay: 1800 },
      { text: '  Provisioning Neon database', type: 'info', delay: 2400 },
      { text: '  Configuring Better Auth', type: 'info', delay: 3000 },
      { text: '  Setting up AI integration', type: 'info', delay: 3400 },
      { text: '', type: 'output', delay: 3800 },
      { text: 'Project ready!', type: 'success', delay: 4000 },
      { text: '  Web     → http://localhost:3000', type: 'info', delay: 4200 },
      { text: '  API     → http://localhost:3002', type: 'info', delay: 4400 },
    ],
  },
  {
    id: 'capture',
    label: 'Capture',
    icon: Lightbulb,
    color: 'text-yellow-400',
    glowColor: 'yellow',
    plugin: 'x4',
    headline: 'Drop ideas, build a backlog',
    description:
      'Capture feature ideas as structured backlog items with a single command. Each idea gets priority, sizing, and dependencies. Your backlog becomes the input for the planning phase.',
    terminal: [
      { text: '$ /x4:idea "Add user dashboard with analytics"', type: 'command', delay: 0 },
      { text: '', type: 'output', delay: 400 },
      { text: 'Capturing idea...', type: 'output', delay: 600 },
      { text: '  Title: User dashboard with analytics', type: 'info', delay: 1000 },
      { text: '  Priority: High', type: 'info', delay: 1400 },
      { text: '  Size: Medium (3-5 tasks)', type: 'info', delay: 1800 },
      { text: '  Tags: frontend, dashboard, analytics', type: 'info', delay: 2200 },
      { text: '', type: 'output', delay: 2600 },
      { text: 'Added to BACKLOG.md — 4 items total', type: 'success', delay: 2800 },
    ],
  },
  {
    id: 'plan',
    label: 'Plan',
    icon: Map,
    color: 'text-orange-400',
    glowColor: 'orange',
    plugin: 'x4',
    headline: 'Brainstorm, plan, write PRD — automatically',
    description:
      'The planner triages your backlog, runs a brainstorming session to explore approaches, builds an implementation plan with task dependencies, and outputs a full PRD ready for the agent team.',
    terminal: [
      { text: '$ /x4:plan-backlog', type: 'command', delay: 0 },
      { text: '', type: 'output', delay: 400 },
      { text: 'Triaging backlog (4 items)...', type: 'output', delay: 600 },
      { text: '  → Selected: "User dashboard with analytics"', type: 'info', delay: 1200 },
      { text: '', type: 'output', delay: 1600 },
      { text: 'Brainstorming approaches...', type: 'output', delay: 1800 },
      { text: '  Option A: Server components + tRPC queries', type: 'info', delay: 2400 },
      {
        text: '  Option B: Client-side with React Query cache  ← recommended',
        type: 'info',
        delay: 3000,
      },
      { text: '', type: 'output', delay: 3400 },
      { text: 'Writing PRD...', type: 'output', delay: 3600 },
      { text: '  8 tasks, 3 test suites, 2 migration files', type: 'info', delay: 4200 },
      { text: '', type: 'output', delay: 4600 },
      { text: 'PRD written → planning/todo/user-dashboard.md', type: 'success', delay: 4800 },
    ],
  },
  {
    id: 'build',
    label: 'Build',
    icon: Users,
    color: 'text-violet-400',
    glowColor: 'violet',
    plugin: 'x4',
    headline: 'Agent team builds, reviews, verifies',
    description:
      'The /x4:work command dispatches a 5-agent team: backend builds the API and schema, frontend builds the UI, reviewer audits for security and architecture issues, tester writes and runs tests, and performance agent checks bundle size and query efficiency.',
    terminal: [
      { text: '$ /x4:work', type: 'command', delay: 0 },
      { text: '', type: 'output', delay: 400 },
      { text: 'Phase 1 — Orient: Reading PRD...', type: 'output', delay: 600 },
      { text: 'Phase 2 — Setup: Creating feature branch', type: 'output', delay: 1200 },
      { text: '', type: 'output', delay: 1600 },
      { text: 'Phase 3 — Build:', type: 'output', delay: 1800 },
      { text: '  [backend]  Adding analytics schema + tRPC router', type: 'info', delay: 2200 },
      { text: '  [frontend] Building dashboard page + charts', type: 'info', delay: 2800 },
      { text: '  [tester]   Writing 12 test cases', type: 'info', delay: 3400 },
      { text: '', type: 'output', delay: 3800 },
      { text: 'Phase 4 — Review:', type: 'output', delay: 4000 },
      { text: '  [reviewer] 0 critical, 1 suggestion (applied)', type: 'info', delay: 4400 },
      { text: '', type: 'output', delay: 4800 },
      { text: 'Phase 5 — Verify: 12/12 tests passing', type: 'success', delay: 5000 },
    ],
  },
  {
    id: 'ship',
    label: 'Ship',
    icon: Rocket,
    color: 'text-cyan-400',
    glowColor: 'cyan',
    plugin: 'x4',
    headline: 'Branch, PR, and cleanup — handled',
    description:
      'Creates a draft PR with full context, watches CI, auto-fixes lint or type errors, and cleans up database branches and local branches after merge. You review and click merge.',
    terminal: [
      { text: 'Phase 6 — Ship:', type: 'output', delay: 0 },
      { text: '  Creating pull request...', type: 'output', delay: 400 },
      {
        text: '  PR #42 opened → "Add user dashboard with analytics"',
        type: 'success',
        delay: 1000,
      },
      { text: '', type: 'output', delay: 1400 },
      { text: '  Watching CI pipeline...', type: 'output', delay: 1600 },
      { text: '  ✓ Type check passed', type: 'success', delay: 2200 },
      { text: '  ✓ Lint passed', type: 'success', delay: 2600 },
      { text: '  ✓ Tests passed (12/12)', type: 'success', delay: 3000 },
      { text: '  ✓ Build succeeded', type: 'success', delay: 3400 },
      { text: '', type: 'output', delay: 3800 },
      { text: 'Phase 7 — Memory Sweep: Saving lessons learned', type: 'output', delay: 4000 },
      { text: '', type: 'output', delay: 4400 },
      { text: 'Done — PR #42 ready for review', type: 'success', delay: 4600 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Pipeline Node                                                      */
/* ------------------------------------------------------------------ */

function PipelineNode({
  stage,
  index,
  isActive,
  onClick,
  isInView,
}: {
  stage: PipelineStage;
  index: number;
  isActive: boolean;
  onClick: () => void;
  isInView: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, delay: 0.08 * index }}
      className={cn(
        'group relative flex flex-col items-center gap-2 rounded-xl px-3 py-3 transition-all sm:px-4',
        isActive ? 'scale-105' : 'opacity-60 hover:opacity-90',
      )}
    >
      {/* Glow ring */}
      {isActive && (
        <motion.div
          layoutId="pipeline-glow"
          className={cn(
            'absolute -inset-1 rounded-xl border',
            stage.glowColor === 'emerald' && 'border-emerald-500/40 bg-emerald-500/5',
            stage.glowColor === 'blue' && 'border-blue-500/40 bg-blue-500/5',
            stage.glowColor === 'yellow' && 'border-yellow-500/40 bg-yellow-500/5',
            stage.glowColor === 'orange' && 'border-orange-500/40 bg-orange-500/5',
            stage.glowColor === 'violet' && 'border-violet-500/40 bg-violet-500/5',
            stage.glowColor === 'cyan' && 'border-cyan-500/40 bg-cyan-500/5',
          )}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
      )}

      {/* Icon */}
      <div
        className={cn(
          'relative z-10 flex h-10 w-10 items-center justify-center rounded-xl border transition-colors sm:h-12 sm:w-12',
          isActive ? 'border-white/15 bg-white/10' : 'border-border bg-card',
        )}
      >
        <stage.icon size={20} className={cn('transition-colors', stage.color)} />
      </div>

      {/* Label */}
      <span
        className={cn(
          'relative z-10 text-xs font-medium transition-colors sm:text-sm',
          isActive ? 'text-foreground' : 'text-muted-foreground',
        )}
      >
        {stage.label}
      </span>
    </motion.button>
  );
}

/* ------------------------------------------------------------------ */
/*  Connector Line (between nodes)                                     */
/* ------------------------------------------------------------------ */

function Connector({
  active,
  isInView,
  delay,
}: {
  active: boolean;
  isInView: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="relative hidden h-0.5 w-6 self-center sm:block lg:w-10"
      initial={{ opacity: 0, scaleX: 0 }}
      animate={isInView ? { opacity: 1, scaleX: 1 } : undefined}
      transition={{ duration: 0.3, delay }}
    >
      <div className="absolute inset-0 rounded-full bg-border" />
      {active && (
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-violet-glow to-cyan-glow"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.4 }}
        />
      )}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stage Terminal                                                     */
/* ------------------------------------------------------------------ */

function StageTerminal({ stage }: { stage: PipelineStage }) {
  const [visibleLines, setVisibleLines] = useState(0);

  useEffect(() => {
    setVisibleLines(0);
    const timers: ReturnType<typeof setTimeout>[] = [];

    stage.terminal.forEach((line, i) => {
      const timer = setTimeout(() => setVisibleLines(i + 1), line.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [stage]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/95">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
        <span className="h-2.5 w-2.5 rounded-full bg-green-500/60" />
        <span className="ml-2 text-xs text-white/40">claude-code</span>
      </div>

      {/* Terminal body */}
      <div className="h-64 overflow-y-auto p-4 font-mono text-[13px] leading-relaxed sm:h-72">
        {stage.terminal.slice(0, visibleLines).map((line, i) => (
          <div key={`${stage.id}-${i}`} className="min-h-[1.4rem]">
            {line.type === 'command' && (
              <span>
                <span className="text-cyan-glow">$</span>{' '}
                <span className="text-foreground">{line.text.slice(2)}</span>
              </span>
            )}
            {line.type === 'output' && <span className="text-muted-foreground">{line.text}</span>}
            {line.type === 'success' && <span className="text-emerald-400">{line.text}</span>}
            {line.type === 'info' && <span className="text-blue-glow">{line.text}</span>}
          </div>
        ))}
        {visibleLines < stage.terminal.length && (
          <span className="inline-block h-3.5 w-1.5 animate-pulse bg-foreground/70" />
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const AUTO_PLAY_INTERVAL = 7000;

export function AgentPluginShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeStage = STAGES[activeIndex];

  const startAutoPlay = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % STAGES.length);
    }, AUTO_PLAY_INTERVAL);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (!isInView || paused) return;
    startAutoPlay();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isInView, paused, startAutoPlay]);

  function handleNodeClick(index: number) {
    setActiveIndex(index);
    setPaused(true);
    // Resume auto-play after 15s of inactivity
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setTimeout(() => {
      setPaused(false);
    }, 15000) as unknown as ReturnType<typeof setInterval>;
  }

  return (
    <section ref={ref} className="relative py-24">
      {/* Background accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,oklch(0.541_0.281_293.009_/_4%),transparent_60%)]" />

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-400">
            Agent Plugins — New
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Your AI <span className="gradient-text">development team</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            One Claude Code plugin that turns a single conversation into a shipped pull request.
            Idea to production — fully orchestrated.
          </p>
        </motion.div>

        {/* Pipeline Nodes */}
        <div className="mb-10 flex items-center justify-center">
          {STAGES.map((stage, i) => (
            <div key={stage.id} className="flex items-center">
              <PipelineNode
                stage={stage}
                index={i}
                isActive={activeIndex === i}
                onClick={() => handleNodeClick(i)}
                isInView={isInView}
              />
              {i < STAGES.length - 1 && (
                <Connector active={i < activeIndex} isInView={isInView} delay={0.08 * i + 0.2} />
              )}
            </div>
          ))}
        </div>

        {/* Detail Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeStage.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            {/* Left: Description */}
            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2">
                <activeStage.icon size={18} className={activeStage.color} />
                <span className="text-xs font-medium text-muted-foreground">
                  Powered by <span className="text-foreground">{activeStage.plugin}</span>
                </span>
              </div>
              <h3 className="mt-3 text-2xl font-bold text-foreground">{activeStage.headline}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground">
                {activeStage.description}
              </p>

              {/* Progress dots */}
              <div className="mt-6 flex items-center gap-2">
                {STAGES.map((s, i) => (
                  <button
                    key={s.id}
                    onClick={() => handleNodeClick(i)}
                    className={cn(
                      'h-1.5 rounded-full transition-all',
                      i === activeIndex
                        ? 'w-8 bg-gradient-to-r from-violet-glow to-cyan-glow'
                        : 'w-1.5 bg-white/15 hover:bg-white/25',
                    )}
                    aria-label={`Go to ${s.label} stage`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Terminal */}
            <StageTerminal stage={activeStage} />
          </motion.div>
        </AnimatePresence>

        {/* CTA strip */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : undefined}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Link
            href="/plugins"
            className="group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Explore the plugin and installation guide
            <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <div className="mt-3">
            <a
              href="https://github.com/studiox4/x4-agent-plugins"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-card/80 px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:border-white/20 hover:bg-white/5"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              View on GitHub
              <ArrowRight size={14} />
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
