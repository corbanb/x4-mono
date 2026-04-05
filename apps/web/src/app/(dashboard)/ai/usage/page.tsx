'use client';

import { useState } from 'react';
import { trpc } from '@x4/shared/api-client';
import { toast } from 'sonner';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TokensOverTimeChart, CostOverTimeChart } from '@/components/ai-usage-charts';

type Preset = '7d' | '30d' | '90d' | 'all';

function getPresetDates(preset: Preset): { from: Date | undefined; to: Date | undefined } {
  if (preset === 'all') return { from: undefined, to: undefined };
  const days = preset === '7d' ? 7 : preset === '30d' ? 30 : 90;
  return { from: new Date(Date.now() - days * 24 * 60 * 60 * 1000), to: undefined };
}

export default function AIUsagePage() {
  const [preset, setPreset] = useState<Preset>('all');
  const { from, to } = getPresetDates(preset);

  const summaryQuery = trpc.ai.usage.summary.useQuery(
    { from, to },
    {
      throwOnError: (err) => {
        toast.error(err.message);
        return false;
      },
    },
  );

  const historyQuery = trpc.ai.usage.history.useQuery(
    { from, to },
    {
      throwOnError: (err) => {
        toast.error(err.message);
        return false;
      },
    },
  );

  const summary = summaryQuery.data;
  const history = historyQuery.data ?? [];
  const isLoading = summaryQuery.isLoading || historyQuery.isLoading;

  function handleRefresh() {
    summaryQuery.refetch();
    historyQuery.refetch();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Usage</h1>
          <p className="text-muted-foreground">Your token consumption and cost history.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Date range filter */}
      <div className="flex gap-2">
        {(['7d', '30d', '90d', 'all'] as Preset[]).map((p) => (
          <Button
            key={p}
            variant={preset === p ? 'default' : 'outline'}
            size="sm"
            onClick={() => setPreset(p)}
          >
            {p === 'all' ? 'All time' : p}
          </Button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <StatCard title="Total Requests" value={String(summary?.totalRequests ?? 0)} />
            <StatCard title="Total Tokens" value={String(summary?.totalTokens ?? 0)} />
            <StatCard title="Total Cost" value={`$${(summary?.totalCost ?? 0).toFixed(4)}`} />
            <StatCard
              title="Avg Cost / Request"
              value={`$${(summary?.avgCostPerRequest ?? 0).toFixed(4)}`}
            />
          </>
        )}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tokens Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <TokensOverTimeChart data={history} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cost Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <CostOverTimeChart data={history} />
          </CardContent>
        </Card>
      </div>

      {/* Model breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Model Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !summary?.byModel.length ? (
            <p className="text-sm text-muted-foreground">No data for the selected period.</p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">Model</th>
                  <th className="pb-2 text-right font-medium">Requests</th>
                  <th className="pb-2 text-right font-medium">Tokens</th>
                  <th className="pb-2 text-right font-medium">Cost</th>
                  <th className="pb-2 text-right font-medium">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.byModel.map((row) => (
                  <tr key={row.model} className="border-b last:border-0">
                    <td className="py-2 font-mono text-xs">{row.model}</td>
                    <td className="py-2 text-right">{row.count}</td>
                    <td className="py-2 text-right">{row.tokens}</td>
                    <td className="py-2 text-right">${row.cost.toFixed(4)}</td>
                    <td className="py-2 text-right">{row.pct.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
