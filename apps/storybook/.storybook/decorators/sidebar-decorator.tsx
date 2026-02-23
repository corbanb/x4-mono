import React from 'react';
import type { Decorator } from '@storybook/react';
import { SidebarProvider } from '@/components/ui/sidebar';

export const withSidebarProvider: Decorator = (Story) => (
  <SidebarProvider defaultOpen={true}>
    <Story />
  </SidebarProvider>
);
