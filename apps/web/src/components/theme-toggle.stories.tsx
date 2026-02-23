import type { Meta, StoryObj } from '@storybook/react';
import { ThemeToggle } from './theme-toggle';

const meta = {
  title: 'Components/ThemeToggle',
  component: ThemeToggle,
  tags: ['autodocs'],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
