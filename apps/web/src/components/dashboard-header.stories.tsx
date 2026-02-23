import type { Meta, StoryObj } from '@storybook/react';
import { DashboardHeader } from './dashboard-header';
import { SidebarProvider } from '@/components/ui/sidebar';

const meta = {
  title: 'Components/DashboardHeader',
  component: DashboardHeader,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <Story />
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof DashboardHeader>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
