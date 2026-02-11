"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const STEPS = [
  {
    step: 1,
    title: "Clone the repository",
    command: "git clone https://github.com/corbanb/x4-mono my-app && cd my-app",
  },
  {
    step: 2,
    title: "Install dependencies",
    command: "bun install",
  },
  {
    step: 3,
    title: "Set up environment",
    command: "cp .env.example .env.local",
  },
  {
    step: 4,
    title: "Start development",
    command: "bun turbo dev",
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
      aria-label="Copy command"
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
    </button>
  );
}

export function QuickStartSteps() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <motion.h2
          className="text-center text-3xl font-bold"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
        >
          Quick start
        </motion.h2>

        <div className="mt-12 space-y-4">
          {STEPS.map((step, i) => (
            <motion.div
              key={step.step}
              className="flex items-start gap-4"
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <span
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                  "bg-primary/10 text-primary"
                )}
              >
                {step.step}
              </span>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-foreground">
                  {step.title}
                </h3>
                <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
                  <code className="font-mono text-sm text-muted-foreground">
                    {step.command}
                  </code>
                  <CopyButton text={step.command} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
