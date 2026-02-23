'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { ShimmerButton } from '@/components/effects/ShimmerButton';
import { ArrowRight } from 'lucide-react';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

export function CTASection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative overflow-hidden py-32">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-glow/5 to-transparent" />

      <motion.div
        className="relative mx-auto max-w-3xl px-6 text-center"
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.6 }}
      >
        <h2 className="text-4xl font-bold sm:text-5xl">
          Ready to build <span className="gradient-text">something great</span>?
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
          Get started in minutes with a production-ready monorepo. Web, mobile, and desktop — all
          wired up and ready to ship.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <ShimmerButton href={`${APP_URL}/signup`}>
            Start Building
            <ArrowRight size={16} className="ml-2" />
          </ShimmerButton>
          <span className="text-sm text-muted-foreground">Free and open source</span>
        </div>
      </motion.div>
    </section>
  );
}
