import type { Metadata } from "next";
import { AgentShowcase } from "@/components/sections/AgentShowcase";
import { CommandPalette } from "@/components/sections/CommandPalette";
import { WorkflowDemo } from "@/components/sections/WorkflowDemo";
import { SkillsSection } from "@/components/sections/SkillsSection";
import { CTASection } from "@/components/sections/CTASection";

export const metadata: Metadata = {
  title: "AI",
  description:
    "7 specialist agents, 25 commands, 2 skills — Claude Code automation that ships production code.",
};

export default function AIPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.541_0.281_293.009_/_6%),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full border border-violet-500/20 bg-violet-500/10 px-4 py-1.5 text-xs font-medium text-violet-400">
            Powered by Claude Code
          </span>
          <h1 className="mt-8 text-4xl font-bold sm:text-5xl lg:text-6xl">
            <span className="gradient-text">AI-Powered</span> Development
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            7 specialist agents, 25 commands, 2 skills — Claude Code automation
            that ships production code. From scaffolding to deployment, every
            step is orchestrated by AI that understands your codebase.
          </p>
        </div>
      </section>

      <AgentShowcase />
      <CommandPalette />
      <WorkflowDemo />
      <SkillsSection />
      <CTASection />
    </>
  );
}
