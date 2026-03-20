'use client';

import { motion } from 'motion/react';
import { ArrowRight, Github } from 'lucide-react';

const MONOREPO_URL = 'https://github.com/corbanb/x4-mono';
const PLUGINS_URL = 'https://github.com/studiox4/x4-agent-plugins';

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
          href={MONOREPO_URL}
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
        Ship Multi-Platform Apps <span className="gradient-text">From One Codebase</span>
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        className="mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >
        Web, mobile, and desktop — powered by TypeScript, tRPC, and a shared backend. Type-safe from
        database to UI, with auth, AI, and CI/CD built in.
      </motion.p>

      {/* CTAs — two GitHub buttons */}
      <motion.div
        className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >
        <a
          href={MONOREPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/80 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/5"
        >
          <Github size={16} />
          View the Monorepo on GitHub
        </a>
        <a
          href={PLUGINS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-8 py-3.5 text-sm font-semibold text-foreground backdrop-blur-sm transition-all hover:border-violet-500/50 hover:bg-violet-500/15"
        >
          <Github size={16} />
          View Agent Plugins on GitHub
        </a>
      </motion.div>

      {/* Side-by-side terminals */}
      <motion.div
        className="mt-16 grid w-full max-w-4xl gap-4 md:grid-cols-2"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
      >
        {/* Left terminal — Manual setup */}
        <div className="gradient-border rounded-xl">
          <div className="rounded-xl bg-card/90 p-4 font-mono text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-auto text-[10px] text-muted-foreground/50">manual</span>
            </div>
            <div className="text-left text-muted-foreground">
              <div>
                <span className="text-cyan-glow">$</span>{' '}
                <span className="text-foreground">bunx create-x4 my-app</span>
              </div>
              <div className="mt-1">
                <span className="text-purple-400">&#9671;</span> Downloaded template.
              </div>
              <div>
                <span className="text-purple-400">&#9671;</span> Cleaned template files.
              </div>
              <div>
                <span className="text-purple-400">&#9671;</span> Applied naming.
              </div>
              <div>
                <span className="text-purple-400">&#9671;</span> Initialized git repository.
              </div>
              <div className="mt-1 font-semibold text-emerald-400">
                <span>&#9670;</span> Your project is ready!
              </div>
              <div className="mt-2 text-xs text-muted-foreground/60">
                Now manually set up database, auth, env vars, deploy targets...
              </div>
            </div>
          </div>
        </div>

        {/* Right terminal — With agent plugins */}
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5">
          <div className="rounded-xl bg-card/90 p-4 font-mono text-sm backdrop-blur-sm">
            <div className="flex items-center gap-2 pb-3">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="ml-auto text-[10px] text-violet-400/70">with agent plugins</span>
            </div>
            <div className="text-left text-muted-foreground">
              <div>
                <span className="text-cyan-glow">$</span>{' '}
                <span className="text-foreground">/x4:onboard</span>
              </div>
              <div className="mt-1">
                <span className="text-emerald-400">&#10003;</span> Bun, Git, GitHub CLI — verified
              </div>
              <div>
                <span className="text-emerald-400">&#10003;</span> Neon database provisioned
              </div>
              <div>
                <span className="text-emerald-400">&#10003;</span> Railway linked &amp; deployed
              </div>
              <div>
                <span className="text-emerald-400">&#10003;</span> Env vars configured
              </div>
              <div className="mt-1 font-semibold text-emerald-400">
                <span>&#9670;</span> Ready — run <span className="text-cyan-glow">/x4:work</span> to
                start building
              </div>
              <div className="mt-2 text-xs text-violet-400/60">
                Database, auth, deploy — all handled by the agent team
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
