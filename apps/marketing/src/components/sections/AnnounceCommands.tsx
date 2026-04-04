'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const ANNOUNCE_COLOR = '#f59e0b';

interface AnnounceCard {
  command: string;
  outcome: string;
}

const CARDS: AnnounceCard[] = [
  { command: '/x4:market-update', outcome: 'Sync marketing site with what shipped' },
  { command: '/x4:market-email', outcome: 'Generate release email from changelog' },
  { command: '/x4:market-linkedin', outcome: 'Write LinkedIn post, copy to clipboard' },
  { command: '/x4:market-tweet', outcome: 'Write X thread, 280-char enforced' },
  { command: '/x4:market-subscribe', outcome: 'Scaffold email capture form into marketing site' },
];

export function AnnounceCommands() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-3xl">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {CARDS.map((card, index) => (
            <motion.div
              key={card.command}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.08 }}
              className="rounded-lg border border-slate-800 border-l-2 bg-slate-900/50 p-4"
              style={{ borderLeftColor: ANNOUNCE_COLOR }}
            >
              <p className="font-mono text-sm text-violet-400">{card.command}</p>
              <p className="mt-1 text-sm text-slate-400">{card.outcome}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default AnnounceCommands;
