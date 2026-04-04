'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';

const DEPLOYMENT_COLOR = '#3b82f6';

interface DeploymentCard {
  command: string;
  outcome: string;
}

const CARDS: DeploymentCard[] = [
  {
    command: '/x4:deploy-setup',
    outcome: 'Railway project created, services configured, domains generated',
  },
  {
    command: 'Push to main',
    outcome: 'Production deploys automatically via GitHub integration',
  },
  {
    command: 'Open a PR',
    outcome: 'Preview environment spins up, URL posted as PR comment',
  },
];

export function DeploymentFlow() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-20 px-4">
      <div className="mx-auto max-w-2xl">
        <div className="flex flex-col gap-4">
          {CARDS.map((card, index) => (
            <motion.div
              key={card.command}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="rounded-lg border border-slate-800 border-l-2 bg-slate-900/50 p-4"
              style={{ borderLeftColor: DEPLOYMENT_COLOR }}
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

export default DeploymentFlow;
