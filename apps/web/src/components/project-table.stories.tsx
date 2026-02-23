import type { Meta, StoryObj } from '@storybook/react';
import { ProjectTable } from './project-table';

const sampleProjects = [
  {
    id: '1',
    name: 'Website Redesign',
    description: 'Complete overhaul of the marketing site',
    status: 'active',
    createdAt: '2025-12-01',
  },
  {
    id: '2',
    name: 'Mobile App',
    description: 'React Native app for iOS and Android',
    status: 'active',
    createdAt: '2025-11-15',
  },
  { id: '3', name: 'API v2', description: null, status: 'archived', createdAt: '2025-10-20' },
  {
    id: '4',
    name: 'Design System',
    description: 'Shared component library',
    status: 'active',
    createdAt: '2025-09-05',
  },
  {
    id: '5',
    name: 'Data Pipeline',
    description: 'ETL pipeline for analytics',
    status: 'draft',
    createdAt: '2025-08-10',
  },
];

const meta = {
  title: 'Components/ProjectTable',
  component: ProjectTable,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProjectTable>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: { projects: sampleProjects },
};

export const Empty: Story = {
  args: { projects: [] },
};

export const Loading: Story = {
  args: { projects: [], loading: true },
};
