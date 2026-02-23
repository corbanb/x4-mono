import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList>
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <p className="text-sm">Manage your account settings and preferences.</p>
      </TabsContent>
      <TabsContent value="password">
        <p className="text-sm">Change your password and security options.</p>
      </TabsContent>
      <TabsContent value="settings">
        <p className="text-sm">Configure application settings.</p>
      </TabsContent>
    </Tabs>
  ),
};
