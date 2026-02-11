"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Sparkles, Brain, Cpu, DollarSign } from "lucide-react";
import { GlowCard } from "@/components/effects/GlowCard";
import { CodeBlock } from "@/components/ui/code-block";

const SKILLS = [
  {
    name: "Better Auth",
    description:
      "Injects domain knowledge about Better Auth setup, session management, and multi-platform token flows. The agent knows exactly how to configure auth for web, mobile, and desktop.",
  },
  {
    name: "Better Auth Best Practices",
    description:
      "Security patterns, RBAC implementation, token rotation, and session invalidation. Production-hardened auth practices applied automatically.",
  },
];

const AI_FEATURES = [
  {
    icon: Brain,
    title: "Multi-Provider",
    description: "Claude, OpenAI, and more via Vercel AI SDK",
  },
  {
    icon: Cpu,
    title: "Streaming",
    description: "Real-time streaming responses via tRPC",
  },
  {
    icon: DollarSign,
    title: "Cost Tracking",
    description: "Per-request token usage and cost analytics",
  },
];

const CODE_SNIPPET = `// AI as a type-safe tRPC procedure
const result = await trpc.ai.generate.mutate({
  prompt: "Summarize this document",
  model: "claude-sonnet-4-5-20250514",
});

// Streaming with real-time updates
const stream = await trpc.ai.stream.mutate({
  prompt: "Write a blog post",
  onChunk: (chunk) => setContent(prev => prev + chunk),
});

// Cost tracking built in
console.log(result.usage);
// { tokens: 1847, cost: "$0.0032" }`;

export function SkillsSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-400">
            Skills & AI SDK
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            Domain knowledge, built in
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Skills inject specialized knowledge into the AI agent. The AI
            integration package gives every platform type-safe access to Claude
            and other models.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Left: Skills */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-emerald-400" />
              <h3 className="text-lg font-semibold">Agent Skills</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Skills are injectable knowledge modules that give agents deep
              expertise in specific domains.
            </p>

            <div className="mt-6 space-y-4">
              {SKILLS.map((skill, i) => (
                <motion.div
                  key={skill.name}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.3, delay: 0.3 + i * 0.1 }}
                >
                  <GlowCard>
                    <h4 className="font-medium text-foreground">
                      {skill.name}
                    </h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {skill.description}
                    </p>
                  </GlowCard>
                </motion.div>
              ))}
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              {AI_FEATURES.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : undefined}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.1 }}
                  className="rounded-xl border border-border bg-card/50 p-4 text-center"
                >
                  <feature.icon
                    size={20}
                    className="mx-auto text-emerald-400"
                  />
                  <p className="mt-2 text-sm font-medium">{feature.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right: Code snippet */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="overflow-hidden rounded-2xl border border-border bg-[#0d1117]"
          >
            {/* File header */}
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-white/40">
                ai-integration.ts
              </span>
            </div>

            {/* Code */}
            <CodeBlock
              code={CODE_SNIPPET}
              className="overflow-x-auto p-5 text-[13px] leading-relaxed"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
