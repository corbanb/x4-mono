import type { Meta, StoryObj } from '@storybook/react';
import { EditProjectDialog } from './edit-project-dialog';

const meta = {
  title: 'Components/EditProjectDialog',
  component: EditProjectDialog,
  tags: ['autodocs'],
} satisfies Meta<typeof EditProjectDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {
  args: {
    projectId: 'proj-123',
    currentName: 'My Project',
    currentDescription: 'A sample project description',
    open: true,
    onOpenChange: () => {},
  },
};

export const NoDescription: Story = {
  args: {
    projectId: 'proj-456',
    currentName: 'Another Project',
    currentDescription: null,
    open: true,
    onOpenChange: () => {},
  },
};
