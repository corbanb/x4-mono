import type { Meta, StoryObj } from '@storybook/react';
import { UserNav } from './user-nav';

const meta = {
  title: 'Components/UserNav',
  component: UserNav,
  tags: ['autodocs'],
} satisfies Meta<typeof UserNav>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
