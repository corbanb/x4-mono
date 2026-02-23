import type { Meta, StoryObj } from '@storybook/react';

const meta = {
  title: 'UI/Form',
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Placeholder: Story = {
  render: () => (
    <p className="text-muted-foreground text-sm">
      Form stories require react-hook-form integration. See app components for form examples.
    </p>
  ),
};
