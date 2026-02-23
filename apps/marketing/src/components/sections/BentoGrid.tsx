'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { GlowCard } from '@/components/effects/GlowCard';
import { Shield, Zap, Smartphone, Brain, Lock, Globe } from 'lucide-react';

const FEATURES = [
  {
    icon: Zap,
    title: 'Type-Safe End to End',
    description:
      'tRPC connects frontend to backend with zero code generation. Change an API — TypeScript catches every caller instantly.',
    color: 'text-yellow-400',
    span: 'md:col-span-2',
  },
  {
    icon: Smartphone,
    title: 'Three Platforms, One Codebase',
    description:
      'Next.js for web, Expo for mobile, Electron for desktop. Shared types, validation, and business logic across all.',
    color: 'text-blue-glow',
    span: '',
  },
  {
    icon: Brain,
    title: 'AI-Powered',
    description:
      'Vercel AI SDK with Claude integration. Streaming responses, cost tracking, and usage analytics built in.',
    color: 'text-violet-glow',
    span: '',
  },
  {
    icon: Lock,
    title: 'Auth Built-In',
    description:
      'Better Auth with session management, bearer tokens, role-based access control. Works across all platforms.',
    color: 'text-emerald-400',
    span: '',
  },
  {
    icon: Globe,
    title: 'Edge-Ready',
    description:
      'Deploy to Vercel, Cloudflare, or any edge runtime. Neon serverless Postgres for globally distributed data.',
    color: 'text-cyan-glow',
    span: 'md:col-span-2',
  },
  {
    icon: Shield,
    title: 'Production Ready',
    description:
      'Error handling, rate limiting, structured logging, CI/CD pipelines, and 350+ tests. Ship with confidence.',
    color: 'text-orange-400',
    span: '',
  },
];

export function BentoGrid() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section className="relative py-32">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          ref={ref}
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Everything you need to <span className="gradient-text">ship fast</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            A batteries-included monorepo boilerplate so you can focus on your product, not your
            infrastructure.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              className={feature.span}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <GlowCard className="h-full">
                <feature.icon className={`h-8 w-8 ${feature.color}`} />
                <h3 className="mt-4 text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
