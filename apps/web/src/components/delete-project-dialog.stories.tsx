import type { Meta, StoryObj } from '@storybook/react';
import { DeleteProjectDialog } from './delete-project-dialog';

const meta = {
  title: 'Components/DeleteProjectDialog',
  component: DeleteProjectDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof DeleteProjectDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    projectId: 'proj-123',
    projectName: 'My Important Project',
    open: true,
    onOpenChange: () => {},
  },
};

export const Closed: Story = {
  args: {
    projectId: 'proj-123',
    projectName: 'My Important Project',
    open: false,
    onOpenChange: () => {},
  },
};
