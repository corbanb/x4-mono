'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

interface CommandCard {
  command: string;
  outcome: string;
}

interface Chapter {
  number: string;
  label: string;
  color: string;
  cards: CommandCard[];
}

const CHAPTERS: Chapter[] = [
  {
    number: '01',
    label: 'Day 1 · Morning — Get your machine ready',
    color: '#7c3aed',
    cards: [
      { command: '/x4:onboard', outcome: 'Machine ready, companion plugins installed' },
      { command: '/x4:create my-app', outcome: 'Full-stack monorepo scaffolded in seconds' },
      { command: '/x4:deploy-setup', outcome: 'Railway configured, PR previews enabled' },
      { command: '/x4:tour', outcome: 'Test login, try AI chat, explore your running app' },
    ],
  },
  {
    number: '02',
    label: 'Day 1 · Afternoon — Plan everything you want to build',
    color: '#3b82f6',
    cards: [
      {
        command: '/x4:kickstart',
        outcome: 'Brainstorm features, design UI, batch-generate PRDs',
      },
    ],
  },
  {
    number: '03',
    label: 'Day 2 — Agent teams build your features',
    color: '#4ade80',
    cards: [
      { command: '/x4:work', outcome: 'Auto-loop: agents build all features, one PR at a time' },
    ],
  },
  {
    number: '04',
    label: "Week 2+ — Find what's missing and what's next",
    color: '#06b6d4',
    cards: [
      { command: '/x4:gaps', outcome: 'Find dead ends, missing connections, incomplete flows' },
      { command: '/x4:dream', outcome: 'Explore bold ideas informed by your tech stack' },
      { command: '/x4:plan-backlog', outcome: 'Turn selected ideas into PRDs' },
      { command: '/x4:work', outcome: 'Build the next wave' },
    ],
  },
  {
    number: '05',
    label: 'Ongoing — Tell the world what shipped',
    color: '#f59e0b',
    cards: [
      { command: '/x4:market-update', outcome: 'Sync marketing site with what shipped' },
      { command: '/x4:market-email', outcome: 'Generate release email from changelog' },
      { command: '/x4:market-linkedin', outcome: 'Write LinkedIn post, copy to clipboard' },
      { command: '/x4:market-tweet', outcome: 'Write X thread, 280-char enforced' },
    ],
  },
];

export function DayInLifeSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">A day in the life.</h2>
          <p className="mt-4 text-muted-foreground">
            From zero to shipped app — with one plugin.
          </p>
        </motion.div>

        {/* Chapters */}
        <div className="flex flex-col gap-8">
          {CHAPTERS.map((chapter, index) => (
            <motion.div
              key={chapter.number}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Chapter label */}
              <p
                className="mb-3 font-mono text-xs uppercase tracking-wider"
                style={{ color: chapter.color }}
              >
                {chapter.number} · {chapter.label}
              </p>

              {/* Command cards */}
              <div className="flex flex-col gap-3 md:flex-row md:flex-wrap">
                {chapter.cards.map((card) => (
                  <div
                    key={`${chapter.number}-${card.command}`}
                    className="rounded-lg border border-slate-800 border-l-2 bg-slate-900/50 p-4 md:min-w-[220px]"
                    style={{ borderLeftColor: chapter.color }}
                  >
                    <p className="font-mono text-sm text-violet-400">{card.command}</p>
                    <p className="mt-1 text-sm text-slate-400">{card.outcome}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default DayInLifeSection;
