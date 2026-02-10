"use client";

import Link from "next/link";
import { useSession } from "@x4/auth/client";
import { trpc } from "@x4/shared/api-client";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { StatsCards } from "@/components/stats-cards";
import { RecentProjects } from "@/components/recent-projects";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { data: projectsData, isLoading: projectsLoading } =
    trpc.projects.list.useQuery({ limit: 50, offset: 0 });

  const projects = projectsData?.items ?? [];
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "active").length;
  const recentProjects = projects.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ""}
          </h1>
          <p className="text-muted-foreground">
            Here&apos;s an overview of your workspace
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/ai">
              <Sparkles className="mr-2 h-4 w-4" />
              AI Playground
            </Link>
          </Button>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <StatsCards
        totalProjects={totalProjects}
        activeProjects={activeProjects}
        tokensUsed={0}
        totalCost={0}
        loading={projectsLoading}
      />

      {/* Recent Projects */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Projects</CardTitle>
            <CardDescription>Your latest projects</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/projects">View All</Link>
          </Button>
        </CardHeader>
        <CardContent>
          <RecentProjects
            projects={recentProjects}
            loading={projectsLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
}
