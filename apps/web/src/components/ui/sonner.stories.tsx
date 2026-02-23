import type { Meta, StoryObj } from '@storybook/react';
import { Toaster } from './sonner';
import { toast } from 'sonner';
import { Button } from './button';

const meta = {
  title: 'UI/Sonner',
  component: Toaster,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div>
      <Button variant="outline" onClick={() => toast('Event has been created')}>
        Show Toast
      </Button>
      <Toaster />
    </div>
  ),
};
