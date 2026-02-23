import type { Meta, StoryObj } from '@storybook/react';
import { StatsCards } from './stats-cards';

const meta = {
  title: 'Components/StatsCards',
  component: StatsCards,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof StatsCards>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    totalProjects: 12,
    activeProjects: 8,
    tokensUsed: 24500,
    totalCost: 3.4521,
  },
};

export const Empty: Story = {
  args: {
    totalProjects: 0,
    activeProjects: 0,
    tokensUsed: 0,
    totalCost: 0,
  },
};

export const Loading: Story = {
  args: {
    totalProjects: 0,
    activeProjects: 0,
    tokensUsed: 0,
    totalCost: 0,
    loading: true,
  },
};

export const HighUsage: Story = {
  args: {
    totalProjects: 156,
    activeProjects: 42,
    tokensUsed: 1250000,
    totalCost: 187.9234,
  },
};
