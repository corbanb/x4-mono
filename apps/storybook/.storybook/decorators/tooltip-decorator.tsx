import React from 'react';
import type { Decorator } from '@storybook/react';
import { TooltipProvider } from '@/components/ui/tooltip';

export const withTooltipProvider: Decorator = (Story) => (
  <TooltipProvider>
    <Story />
  </TooltipProvider>
);
