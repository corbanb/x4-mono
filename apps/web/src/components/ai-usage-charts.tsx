'use client';

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type UsageDataPoint = {
  date: string;
  tokens: number;
  cost: number;
  count: number;
};

type ChartProps = {
  data: UsageDataPoint[];
};

export function TokensOverTimeChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Line type="monotone" dataKey="tokens" stroke="#6366f1" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function CostOverTimeChart({ data }: ChartProps) {
  return (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${Number(v).toFixed(4)}`} />
        <Tooltip formatter={(v) => [`$${Number(v).toFixed(4)}`, 'Cost']} />
        <Bar dataKey="cost" fill="#6366f1" />
      </BarChart>
    </ResponsiveContainer>
  );
}
