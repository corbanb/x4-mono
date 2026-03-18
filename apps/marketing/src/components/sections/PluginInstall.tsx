'use client';

import { useRef } from 'react';
import { motion, useInView } from 'motion/react';
import { CodeBlock } from '@/components/ui/code-block';

const INSTALL_CODE = `# Add the x4 plugin marketplace
/plugin marketplace add studiox4/x4-agent-plugins

# Install all plugins
/plugin install x4-scaffold@x4-agent-plugins
/plugin install x4-project-tracker@x4-agent-plugins
/plugin install x4-agent-team-ops@x4-agent-plugins
/plugin install x4-llmstxt-manager@x4-agent-plugins

# Run the onboarding wizard
/x4-onboard

# Create your first project
/x4-create my-app --preset saas

# Start building
cd my-app && bun dev`;

const TEAM_CONFIG = `# Auto-suggest plugins for your team
# Add to .claude/settings.json:
{
  "extraKnownMarketplaces": {
    "x4-agent-plugins": {
      "source": {
        "source": "github",
        "repo": "studiox4/x4-agent-plugins"
      }
    }
  },
  "enabledPlugins": {
    "x4-scaffold@x4-agent-plugins": true,
    "x4-project-tracker@x4-agent-plugins": true,
    "x4-agent-team-ops@x4-agent-plugins": true,
    "x4-llmstxt-manager@x4-agent-plugins": true
  }
}`;

export function PluginInstall() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">
            Get started in <span className="gradient-text">30 seconds</span>
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Install in Claude Code, run onboarding, and you&apos;re shipping with agents.
          </p>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Install */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="overflow-hidden rounded-2xl border border-border bg-[#0d1117]"
          >
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-white/40">claude-code</span>
            </div>
            <CodeBlock
              code={INSTALL_CODE}
              className="overflow-x-auto p-5 text-[13px] leading-relaxed"
            />
          </motion.div>

          {/* Team config */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : undefined}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="overflow-hidden rounded-2xl border border-border bg-[#0d1117]"
          >
            <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-500/60" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/60" />
              <div className="h-3 w-3 rounded-full bg-green-500/60" />
              <span className="ml-2 text-xs text-white/40">.claude/settings.json</span>
            </div>
            <CodeBlock
              code={TEAM_CONFIG}
              className="overflow-x-auto p-5 text-[13px] leading-relaxed"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
