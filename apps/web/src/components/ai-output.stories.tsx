import type { Meta, StoryObj } from '@storybook/react';
import { AIOutput } from './ai-output';

const meta = {
  title: 'Components/AIOutput',
  component: AIOutput,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ height: '400px' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AIOutput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const WithContent: Story = {
  args: {
    text: 'Here is a sample AI response that demonstrates the output component.\n\nIt supports multiple paragraphs and preserves whitespace formatting. The component also shows token usage and estimated cost in badges at the bottom.',
    tokensUsed: 1250,
    estimatedCost: 0.0187,
    loading: false,
  },
};

export const Loading: Story = {
  args: {
    text: null,
    tokensUsed: 0,
    estimatedCost: 0,
    loading: true,
  },
};

export const Empty: Story = {
  args: {
    text: null,
    tokensUsed: 0,
    estimatedCost: 0,
    loading: false,
  },
};

export const LongOutput: Story = {
  args: {
    text: Array(20)
      .fill(
        'This is a long paragraph of AI-generated text that demonstrates scrolling behavior within the output area.',
      )
      .join('\n\n'),
    tokensUsed: 15000,
    estimatedCost: 0.225,
    loading: false,
  },
};
