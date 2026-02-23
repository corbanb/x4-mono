'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, useInView } from 'motion/react';

interface StatProps {
  value: number;
  suffix?: string;
  label: string;
  delay?: number;
}

function AnimatedStat({ value, suffix = '', label, delay = 0 }: StatProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = value / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= value) {
          setCount(value);
          clearInterval(interval);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timeout);
  }, [isInView, value, delay]);

  return (
    <motion.div
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: delay / 1000 }}
    >
      <div className="gradient-text text-5xl font-bold tabular-nums sm:text-6xl">
        {count}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-muted-foreground">{label}</div>
    </motion.div>
  );
}

const STATS = [
  { value: 351, suffix: '+', label: 'Tests Passing' },
  { value: 16, label: 'PRDs Completed' },
  { value: 9, label: 'Packages' },
  { value: 3, label: 'Platforms' },
];

export function StatsCounter() {
  return (
    <section className="relative border-y border-border py-24">
      <div className="mx-auto grid max-w-5xl grid-cols-2 gap-12 px-6 md:grid-cols-4">
        {STATS.map((stat, i) => (
          <AnimatedStat key={stat.label} {...stat} delay={i * 150} />
        ))}
      </div>
    </section>
  );
}
