'use client';

import { FolderKanban, Activity, Sparkles, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type StatsCardsProps = {
  totalProjects: number;
  activeProjects: number;
  tokensUsed: number;
  totalCost: number;
  loading?: boolean;
};

export function StatsCards({
  totalProjects,
  activeProjects,
  tokensUsed,
  totalCost,
  loading,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Total Projects',
      value: totalProjects,
      icon: FolderKanban,
      format: (v: number) => v.toString(),
    },
    {
      title: 'Active Projects',
      value: activeProjects,
      icon: Activity,
      format: (v: number) => v.toString(),
    },
    {
      title: 'AI Tokens Used',
      value: tokensUsed,
      icon: Sparkles,
      format: (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v.toString()),
    },
    {
      title: 'Total Cost',
      value: totalCost,
      icon: DollarSign,
      format: (v: number) => `$${v.toFixed(4)}`,
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.format(stat.value)}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
