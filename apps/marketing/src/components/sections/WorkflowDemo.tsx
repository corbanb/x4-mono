"use client";

import { useRef } from "react";
import { motion, useInView } from "motion/react";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Route,
  Bot,
  CheckCircle,
  GitBranch,
  ShieldCheck,
  TestTube,
  FileText,
  GitCommit,
  GitPullRequest,
  Eye,
  Wrench,
} from "lucide-react";

interface WorkflowStep {
  icon: React.ElementType;
  label: string;
  description: string;
}

const WORKFLOWS = [
  {
    name: "/next-prd",
    title: "Auto-pilot PRD implementation",
    description:
      "Reads project state, picks the next PRD by dependency order, routes tasks to specialist agents, implements sequentially, and verifies against success criteria.",
    color: "from-violet-500 to-purple-600",
    dotColor: "bg-violet-400",
    lineColor: "from-violet-500/40 to-purple-600/40",
    steps: [
      {
        icon: BookOpen,
        label: "Read state",
        description: "Scan wiki/status.md for progress",
      },
      {
        icon: Route,
        label: "Pick PRD",
        description: "Follow dependency graph to next PRD",
      },
      {
        icon: Bot,
        label: "Route to agents",
        description: "Assign tasks to specialist agents",
      },
      {
        icon: Wrench,
        label: "Implement",
        description: "Execute tasks sequentially",
      },
      {
        icon: CheckCircle,
        label: "Verify & complete",
        description: "Run checks, mark PRD done",
      },
    ] satisfies WorkflowStep[],
  },
  {
    name: "/ship",
    title: "Branch to PR in one command",
    description:
      "Creates a branch, runs boundary checks, tests, and docs review, commits with context, opens a PR, watches CI, and auto-fixes failures.",
    color: "from-cyan-500 to-blue-600",
    dotColor: "bg-cyan-400",
    lineColor: "from-cyan-500/40 to-blue-600/40",
    steps: [
      {
        icon: GitBranch,
        label: "Branch",
        description: "Create feature branch from main",
      },
      {
        icon: ShieldCheck,
        label: "Boundary check",
        description: "Audit dependency conventions",
      },
      {
        icon: TestTube,
        label: "Test review",
        description: "Run and validate test suite",
      },
      {
        icon: FileText,
        label: "Docs review",
        description: "Check docs accuracy & coverage",
      },
      {
        icon: GitCommit,
        label: "Commit",
        description: "Stage changes with context",
      },
      {
        icon: GitPullRequest,
        label: "Open PR",
        description: "Create pull request with summary",
      },
      {
        icon: Eye,
        label: "Watch CI",
        description: "Monitor pipeline, auto-fix failures",
      },
    ] satisfies WorkflowStep[],
  },
];

function WorkflowTimeline({
  workflow,
  index,
  isInView,
}: {
  workflow: (typeof WORKFLOWS)[number];
  index: number;
  isInView: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.5, delay: index * 0.2 }}
      className="overflow-hidden rounded-2xl border border-border bg-card"
    >
      {/* Header */}
      <div className="border-b border-border p-6">
        <code
          className={cn(
            "inline-block rounded-md bg-gradient-to-r px-3 py-1 text-sm font-bold text-white",
            workflow.color
          )}
        >
          {workflow.name}
        </code>
        <h3 className="mt-3 text-xl font-semibold">{workflow.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {workflow.description}
        </p>
      </div>

      {/* Steps timeline */}
      <div className="p-6">
        <div className="relative space-y-0">
          {workflow.steps.map((step, i) => (
            <motion.div
              key={step.label}
              initial={{ opacity: 0, x: -15 }}
              animate={isInView ? { opacity: 1, x: 0 } : undefined}
              transition={{
                duration: 0.3,
                delay: index * 0.2 + i * 0.08 + 0.3,
              }}
              className="relative flex items-start gap-4 pb-6 last:pb-0"
            >
              {/* Vertical line */}
              {i < workflow.steps.length - 1 && (
                <div
                  className={cn(
                    "absolute left-[15px] top-[32px] h-[calc(100%-20px)] w-px bg-gradient-to-b",
                    workflow.lineColor
                  )}
                />
              )}

              {/* Icon dot */}
              <div
                className={cn(
                  "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-card",
                )}
              >
                <step.icon size={14} className={cn("opacity-80", workflow.dotColor.replace("bg-", "text-"))} />
              </div>

              {/* Content */}
              <div className="pt-0.5">
                <p className="text-sm font-medium text-foreground">
                  {step.label}
                </p>
                <p className="text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export function WorkflowDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          className="mb-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-block rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-400">
            Automated Workflows
          </span>
          <h2 className="mt-6 text-3xl font-bold sm:text-4xl">
            From idea to production, automated
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            Two commands that orchestrate the entire development lifecycle. The
            AI reads your project state, makes decisions, and ships code — with
            human oversight at every step.
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {WORKFLOWS.map((workflow, i) => (
            <WorkflowTimeline
              key={workflow.name}
              workflow={workflow}
              index={i}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
