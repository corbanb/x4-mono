import type { Meta, StoryObj } from '@storybook/react';
import { AppSidebar } from './app-sidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

const meta = {
  title: 'Components/AppSidebar',
  component: AppSidebar,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={true}>
        <Story />
        <SidebarInset>
          <div className="p-6">
            <p className="text-muted-foreground text-sm">Main content area</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    ),
  ],
} satisfies Meta<typeof AppSidebar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Collapsed: Story = {
  decorators: [
    (Story) => (
      <SidebarProvider defaultOpen={false}>
        <Story />
        <SidebarInset>
          <div className="p-6">
            <p className="text-muted-foreground text-sm">Main content area</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    ),
  ],
};
