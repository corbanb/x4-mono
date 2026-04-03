'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const AGENT_PILLS = [
  { label: 'Backend', color: '#4ade80' },
  { label: 'Frontend', color: '#4ade80' },
  { label: 'Reviewer', color: '#f59e0b' },
  { label: 'Tester', color: '#3b82f6' },
  { label: 'Performance', color: '#8b5cf6' },
] as const;

type TerminalLineType = 'done' | 'active' | 'detail' | 'queued';

interface TerminalLine {
  type: TerminalLineType;
  text: string;
}

const TERMINAL_LINES: TerminalLine[] = [
  { type: 'done', text: '✓ [1/8] Auth — branch: feat/auth · PR #41 merged' },
  { type: 'done', text: '✓ [2/8] Workout Tracking — PR #42 merged' },
  { type: 'done', text: '✓ [3/8] AI Coaching — PR #43 merged' },
  { type: 'done', text: '✓ [4/8] Social Feed — PR #44 merged' },
  { type: 'done', text: '✓ [5/8] Progress Charts — PR #45 merged' },
  { type: 'done', text: '✓ [6/8] Notifications — PR #46 merged' },
  { type: 'active', text: '→ [7/8] Mobile App — building...' },
  { type: 'detail', text: '  Backend: scaffolding tRPC routes' },
  { type: 'detail', text: '  Frontend: generating Expo screens' },
  { type: 'queued', text: '◌ [8/8] Analytics — queued' },
];

const LINE_COLORS: Record<TerminalLineType, string> = {
  done: '#4ade80',
  active: '#f59e0b',
  detail: '#334155',
  queued: '#64748b',
};

const STATS = [
  { value: '6', label: 'PRs merged' },
  { value: '5', label: 'agents active' },
  { value: '0', label: 'manual PRs' },
] as const;

export function AutoLoopTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 px-4" style={{ backgroundColor: '#020209' }}>
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.6, ease: [0.25, 0.4, 0, 1] }}
        >
          {/* Headline */}
          <div className="text-center mb-10">
            <h2 className="text-4xl font-bold tracking-tight text-white mb-3">
              Your terminal just got a team.
            </h2>
            <p className="text-slate-400 text-lg">
              Eight features. One command. Agents handle the rest.
            </p>
          </div>

          {/* Agent status bar */}
          <div
            className="rounded-xl p-3 mb-4 flex items-center justify-between flex-wrap gap-3"
            style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
          >
            <div className="flex items-center gap-2 flex-wrap">
              {AGENT_PILLS.map((agent) => (
                <span
                  key={agent.label}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs text-slate-300"
                  style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
                >
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: agent.color }}
                  />
                  {agent.label}
                </span>
              ))}
            </div>
            <span
              className="font-mono text-xs font-semibold rounded-full px-3 py-1"
              style={{ color: '#4ade80', border: '1px solid #166534' }}
            >
              ↻ Auto-loop · 6/8 PRDs complete
            </span>
          </div>

          {/* Terminal window */}
          <div
            className="rounded-xl overflow-hidden mb-4"
            style={{ backgroundColor: '#0a0a0a', border: '1px solid #1e293b' }}
          >
            {/* Terminal title bar */}
            <div
              className="flex items-center gap-2 px-4 py-2.5 border-b"
              style={{ borderColor: '#1e293b' }}
            >
              <span className="w-3 h-3 rounded-full bg-red-500/70" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
              <span className="w-3 h-3 rounded-full bg-green-500/70" />
              <span className="ml-2 font-mono text-xs text-slate-500">x4 · auto-loop</span>
            </div>

            {/* Terminal content */}
            <div className="p-5 space-y-1">
              {TERMINAL_LINES.map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -6 }}
                  animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -6 }}
                  transition={{
                    duration: 0.35,
                    delay: 0.15 + i * 0.06,
                    ease: 'easeOut',
                  }}
                  className="font-mono text-xs leading-relaxed"
                  style={{ color: LINE_COLORS[line.type] }}
                >
                  {line.text}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-3">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
                transition={{
                  duration: 0.4,
                  delay: 0.5 + i * 0.08,
                  ease: [0.25, 0.4, 0, 1],
                }}
                className="rounded-xl p-4 text-center"
                style={{ backgroundColor: '#0f172a', border: '1px solid #1e293b' }}
              >
                <div className="text-2xl font-bold text-white mb-0.5">{stat.value}</div>
                <div className="font-mono text-xs text-slate-500">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
