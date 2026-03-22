import type { Metadata } from 'next';
import { PluginCards } from '@/components/sections/PluginCards';
import { PluginPipeline } from '@/components/sections/PluginPipeline';
import { CompanionPlugins } from '@/components/sections/CompanionPlugins';
import { HooksSection } from '@/components/sections/HooksSection';
import { PluginInstall } from '@/components/sections/PluginInstall';
import { CTASection } from '@/components/sections/CTASection';

export const metadata: Metadata = {
  title: 'Agent Plugins',
  description:
    'One Claude Code plugin for the complete AI-powered development workflow: scaffolding, backlog management, agent team coordination, and reference docs.',
};

export default function PluginsPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden pb-12 pt-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,oklch(0.541_0.281_293.009_/_6%),transparent_60%)]" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-400">
            Claude Code Plugins
          </span>
          <h1 className="mt-8 text-4xl font-bold sm:text-5xl lg:text-6xl">
            Your AI <span className="gradient-text">Development Team</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            One plugin that turns Claude Code into a complete development pipeline. Scaffold
            projects, design features with AI, dispatch agent teams, and ship PRs — all from your
            terminal. 24 commands, 5 agents, 9 companion plugins.
          </p>
          <div className="mt-8">
            <a
              href="https://github.com/studiox4/x4-agent-plugins"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-all hover:shadow-lg hover:shadow-primary/25"
            >
              <span className="relative z-10">View on GitHub</span>
              <svg
                className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
              </svg>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </a>
          </div>
        </div>
      </section>

      <PluginPipeline />
      <PluginCards />
      <CompanionPlugins />
      <HooksSection />
      <PluginInstall />
      <CTASection />
    </>
  );
}
