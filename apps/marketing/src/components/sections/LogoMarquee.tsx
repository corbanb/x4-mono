"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";

const TECH_LOGOS = [
  { name: "TypeScript", abbr: "TS" },
  { name: "React", abbr: "Re" },
  { name: "Next.js", abbr: "Nx" },
  { name: "Expo", abbr: "Ex" },
  { name: "Electron", abbr: "El" },
  { name: "Hono", abbr: "Ho" },
  { name: "tRPC", abbr: "tR" },
  { name: "Drizzle", abbr: "Dz" },
  { name: "Neon", abbr: "Ne" },
  { name: "Tailwind", abbr: "Tw" },
  { name: "Better Auth", abbr: "BA" },
  { name: "Vercel AI", abbr: "AI" },
  { name: "Bun", abbr: "Bn" },
  { name: "Turborepo", abbr: "Tb" },
  { name: "Zod", abbr: "Zd" },
  { name: "Pino", abbr: "Pi" },
];

function LogoPill({ name, abbr }: { name: string; abbr: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 rounded-full border border-border bg-card/50 px-5 py-2.5 backdrop-blur-sm">
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 font-mono text-xs font-bold text-violet-glow">
        {abbr}
      </span>
      <span className="text-sm font-medium text-muted-foreground">
        {name}
      </span>
    </div>
  );
}

export function LogoMarquee() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <section ref={ref} className="py-20 overflow-hidden">
      <motion.div
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 1 } : undefined}
        transition={{ duration: 0.8 }}
      >
        <p className="text-center text-sm font-medium text-muted-foreground">
          Built with the modern stack
        </p>

        {/* First row - scrolling left */}
        <div className="relative mt-8">
          <div className="absolute left-0 top-0 z-10 h-full w-24 bg-gradient-to-r from-background to-transparent" />
          <div className="absolute right-0 top-0 z-10 h-full w-24 bg-gradient-to-l from-background to-transparent" />

          <div className="flex animate-[scroll_30s_linear_infinite] gap-4">
            {[...TECH_LOGOS, ...TECH_LOGOS].map((logo, i) => (
              <LogoPill key={`${logo.name}-${i}`} {...logo} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
