import type { Meta, StoryObj } from '@storybook/react';
import { ProjectGrid } from './project-grid';

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
  {
    id: '6',
    name: 'Auth Service',
    description: 'SSO and OAuth integration',
    status: 'active',
    createdAt: '2025-07-22',
  },
];

const meta = {
  title: 'Components/ProjectGrid',
  component: ProjectGrid,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
} satisfies Meta<typeof ProjectGrid>;

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

export const SingleProject: Story = {
  args: { projects: [sampleProjects[0]] },
};
