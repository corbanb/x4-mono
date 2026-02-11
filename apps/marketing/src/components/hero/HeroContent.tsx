"use client";

import { motion } from "motion/react";
import { ShimmerButton } from "@/components/effects/ShimmerButton";
import { ArrowRight, Github } from "lucide-react";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export function HeroContent() {
  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <a
          href="https://github.com/corbanb/x4-mono"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-white/20 hover:text-foreground"
        >
          <span className="flex h-2 w-2 rounded-full bg-emerald-500" />
          Open Source — Star on GitHub
          <ArrowRight size={12} />
        </a>
      </motion.div>

      {/* Headline */}
      <motion.h1
        className="mt-8 max-w-4xl text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-7xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.25, 0.4, 0, 1] }}
      >
        Ship Multi-Platform Apps{" "}
        <span className="gradient-text">From One Codebase</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Web, mobile, and desktop — powered by TypeScript, tRPC, and a shared
        backend. Type-safe from database to UI, with auth, AI, and CI/CD
        built in.
      </motion.p>

      {/* CTAs */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <ShimmerButton href={`${APP_URL}/signup`}>
          Get Started Free
          <ArrowRight size={16} className="ml-2" />
        </ShimmerButton>
        <a
          href="https://github.com/corbanb/x4-mono"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/5"
        >
          <Github size={16} />
          View on GitHub
        </a>
      </motion.div>

      {/* Terminal preview teaser */}
      <motion.div
        className="mt-16 w-full max-w-lg"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        <div className="gradient-border rounded-xl">
          <div className="rounded-xl bg-card/90 p-4 font-mono text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>
            <div className="text-muted-foreground">
              <span className="text-cyan-glow">$</span>{" "}
              <span className="text-foreground">bunx create-x4 my-app</span>
            </div>
            <div className="mt-1 text-muted-foreground">
              <span className="text-purple-400">&#9671;</span> Downloaded template.
            </div>
            <div className="text-muted-foreground">
              <span className="text-purple-400">&#9671;</span> Cleaned template files.
            </div>
            <div className="text-muted-foreground">
              <span className="text-purple-400">&#9671;</span> Applied naming.
            </div>
            <div className="text-muted-foreground">
              <span className="text-purple-400">&#9671;</span> Initialized git repository.
            </div>
            <div className="mt-1 text-emerald-400 font-semibold">
              <span className="text-emerald-400">&#9670;</span> Your project is ready!
            </div>
            <div className="mt-1 text-muted-foreground">
              {"  "}<span className="text-foreground font-semibold">API</span>{"       "}
              <span className="text-cyan-glow">http://localhost:3002</span>
            </div>
            <div className="text-muted-foreground">
              {"  "}<span className="text-foreground font-semibold">Web</span>{"       "}
              <span className="text-cyan-glow">http://localhost:3000</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
