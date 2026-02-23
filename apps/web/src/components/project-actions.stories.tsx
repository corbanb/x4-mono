import type { Meta, StoryObj } from '@storybook/react';
import { ProjectActions } from './project-actions';

const meta = {
  title: 'Components/ProjectActions',
  component: ProjectActions,
  tags: ['autodocs'],
} satisfies Meta<typeof ProjectActions>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    projectId: 'proj-123',
    projectName: 'My Project',
  },
};
