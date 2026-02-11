"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { CodeBlock } from "@/components/ui/code-block";
import { Monitor, Smartphone, MonitorDot } from "lucide-react";

const PLATFORMS = [
  {
    id: "web",
    label: "Web",
    icon: Monitor,
    code: `// apps/web/src/app/dashboard/page.tsx
"use client";

import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { data: projects } = trpc.projects.list.useQuery();

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {projects?.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}`,
  },
  {
    id: "mobile",
    label: "Mobile",
    icon: Smartphone,
    code: `// apps/mobile/app/(dashboard)/index.tsx
import { trpc } from "@/lib/trpc";
import { FlatList } from "react-native";

export default function Dashboard() {
  const { data: projects } = trpc.projects.list.useQuery();

  return (
    <FlatList
      data={projects}
      keyExtractor={(p) => p.id}
      renderItem={({ item }) => (
        <ProjectCard project={item} />
      )}
    />
  );
}`,
  },
  {
    id: "desktop",
    label: "Desktop",
    icon: MonitorDot,
    code: `// apps/desktop/src/renderer/Dashboard.tsx
import { trpc } from "./lib/trpc";

export function Dashboard() {
  const { data: projects } = trpc.projects.list.useQuery();

  return (
    <div className="grid gap-4">
      {projects?.map((p) => (
        <ProjectCard key={p.id} project={p} />
      ))}
    </div>
  );
}`,
  },
];

export function CodeShowcase() {
  const [active, setActive] = useState("web");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const activePlatform = PLATFORMS.find((p) => p.id === active)!;

  return (
    <section ref={ref} className="relative py-32">
      {/* Background decoration */}
      <div className="absolute inset-0 dot-grid opacity-30" />

      <div className="relative mx-auto max-w-7xl px-6">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Same API,{" "}
            <span className="gradient-text">every platform</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Write your tRPC procedure once. Call it the same way from web,
            mobile, and desktop — fully type-safe, zero code generation.
          </p>
        </motion.div>

        <motion.div
          className="mx-auto mt-12 max-w-3xl"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          {/* Platform tabs */}
          <div className="flex items-center justify-center gap-1 rounded-xl bg-card p-1">
            {PLATFORMS.map((platform) => (
              <button
                key={platform.id}
                onClick={() => setActive(platform.id)}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium transition-colors",
                  active === platform.id
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {active === platform.id && (
                  <motion.div
                    layoutId="code-tab"
                    className="absolute inset-0 rounded-lg bg-white/10"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <platform.icon size={16} className="relative z-10" />
                <span className="relative z-10">{platform.label}</span>
              </button>
            ))}
          </div>

          {/* Code display */}
          <div className="mt-4 overflow-hidden rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 border-b border-border px-4 py-3">
              <span className="h-3 w-3 rounded-full bg-red-500/60" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <span className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-3 text-xs text-muted-foreground">
                {activePlatform.id === "web" && "apps/web/src/app/dashboard/page.tsx"}
                {activePlatform.id === "mobile" && "apps/mobile/app/(dashboard)/index.tsx"}
                {activePlatform.id === "desktop" && "apps/desktop/src/renderer/Dashboard.tsx"}
              </span>
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <CodeBlock
                  code={activePlatform.code}
                  className="overflow-x-auto p-6 font-mono text-sm leading-relaxed"
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
