"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { GlowCard } from "@/components/effects/GlowCard";
import { Code, Sparkles, Shield, Layers } from "lucide-react";

const PRINCIPLES = [
  {
    icon: Code,
    title: "Type Safety First",
    description:
      "Types flow from database schema to UI components. Zod validates at runtime. TypeScript catches errors at compile time. No gaps.",
    color: "text-blue-glow",
  },
  {
    icon: Sparkles,
    title: "Developer Experience",
    description:
      "Fast builds with Turborepo, instant feedback with hot reload, clear conventions with CLAUDE.md. Spend time coding, not configuring.",
    color: "text-violet-glow",
  },
  {
    icon: Shield,
    title: "Production Ready",
    description:
      "Not a toy. Error handling, rate limiting, structured logging, auth, CI/CD, and 350+ tests. Everything you need to ship confidently.",
    color: "text-emerald-400",
  },
  {
    icon: Layers,
    title: "Modular by Design",
    description:
      "Use the whole stack or just the parts you need. Every package is independent. Swap any technology without touching the rest.",
    color: "text-cyan-glow",
  },
];

export function PhilosophyCards() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.h2
          className="text-center text-3xl font-bold sm:text-4xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
        >
          Our <span className="gradient-text">philosophy</span>
        </motion.h2>

        <div className="mt-16 grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((principle, i) => (
            <motion.div
              key={principle.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <GlowCard className="h-full">
                <principle.icon className={`h-8 w-8 ${principle.color}`} />
                <h3 className="mt-4 text-lg font-semibold text-foreground">
                  {principle.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {principle.description}
                </p>
              </GlowCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
