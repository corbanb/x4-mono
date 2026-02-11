"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "motion/react";

interface TerminalLine {
  text: string;
  type: "command" | "output" | "success" | "info";
  delay: number;
}

const TERMINAL_LINES: TerminalLine[] = [
  { text: "$ git clone https://github.com/corbanb/x4-mono my-app", type: "command", delay: 0 },
  { text: "Cloning into 'my-app'...", type: "output", delay: 800 },
  { text: "done.", type: "success", delay: 1600 },
  { text: "", type: "output", delay: 1800 },
  { text: "$ cd my-app && bun install", type: "command", delay: 2000 },
  { text: "bun install v1.1.0 (b64edcb4)", type: "output", delay: 2800 },
  { text: "Resolved, downloaded and extracted [892]", type: "info", delay: 3200 },
  { text: "892 packages installed [3.21s]", type: "success", delay: 3800 },
  { text: "", type: "output", delay: 4000 },
  { text: "$ bun turbo dev", type: "command", delay: 4200 },
  { text: "  @x4/api:dev     → http://localhost:3002", type: "info", delay: 5000 },
  { text: "  @x4/web:dev     → http://localhost:3000", type: "info", delay: 5200 },
  { text: "  @x4/marketing:dev → http://localhost:3001", type: "info", delay: 5400 },
  { text: "  @x4/docs:dev    → http://localhost:3003", type: "info", delay: 5600 },
  { text: "", type: "output", delay: 5800 },
  { text: "Ready in 2.1s — all 4 apps running", type: "success", delay: 6000 },
];

export function AnimatedTerminal() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    if (!isInView) return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    TERMINAL_LINES.forEach((line, i) => {
      const timer = setTimeout(() => {
        setVisibleLines(i + 1);
      }, line.delay);
      timers.push(timer);
    });

    return () => timers.forEach(clearTimeout);
  }, [isInView]);

  return (
    <motion.div
      ref={ref}
      className="gradient-border overflow-hidden rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.6 }}
    >
      <div className="rounded-xl bg-card/95 backdrop-blur-sm">
        {/* Title bar */}
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="h-3 w-3 rounded-full bg-red-500/80" />
          <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
          <span className="h-3 w-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs text-muted-foreground">
            Terminal
          </span>
        </div>

        {/* Terminal body */}
        <div className="h-80 overflow-y-auto p-4 font-mono text-sm">
          {TERMINAL_LINES.slice(0, visibleLines).map((line, i) => (
            <div key={i} className="min-h-[1.5rem]">
              {line.type === "command" && (
                <span>
                  <span className="text-cyan-glow">$</span>{" "}
                  <span className="text-foreground">
                    {line.text.slice(2)}
                  </span>
                </span>
              )}
              {line.type === "output" && (
                <span className="text-muted-foreground">{line.text}</span>
              )}
              {line.type === "success" && (
                <span className="text-emerald-400">{line.text}</span>
              )}
              {line.type === "info" && (
                <span className="text-blue-glow">{line.text}</span>
              )}
            </div>
          ))}
          {visibleLines < TERMINAL_LINES.length && isInView && (
            <span className="inline-block h-4 w-2 animate-pulse bg-foreground" />
          )}
        </div>
      </div>
    </motion.div>
  );
}
