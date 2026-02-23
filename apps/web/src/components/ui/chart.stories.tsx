import type { Meta, StoryObj } from '@storybook/react';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './chart';
import { Bar, BarChart, XAxis } from 'recharts';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'var(--chart-1)',
  },
};

const data = [
  { month: 'Jan', desktop: 186 },
  { month: 'Feb', desktop: 305 },
  { month: 'Mar', desktop: 237 },
  { month: 'Apr', desktop: 73 },
  { month: 'May', desktop: 209 },
  { month: 'Jun', desktop: 214 },
];

const meta = {
  title: 'UI/Chart',
  component: ChartContainer,
  tags: ['autodocs'],
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
      <BarChart data={data}>
        <XAxis dataKey="month" />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="desktop" fill="var(--color-desktop)" />
      </BarChart>
    </ChartContainer>
  ),
};
