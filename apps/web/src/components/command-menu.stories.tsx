import type { Meta, StoryObj } from '@storybook/react';
import { CommandMenu } from './command-menu';

const meta = {
  title: 'Components/CommandMenu',
  component: CommandMenu,
  tags: ['autodocs'],
  parameters: {
    docs: {
      description: {
        component: 'Press Cmd+K (Mac) or Ctrl+K (Windows) to open the command menu.',
      },
    },
  },
} satisfies Meta<typeof CommandMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
