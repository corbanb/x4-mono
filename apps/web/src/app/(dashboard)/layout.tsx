'use client';

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/app-sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { CommandMenu } from '@/components/command-menu';
import { CollaborationProvider } from '@x4/shared/collaboration';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <CollaborationProvider roomId="room-dashboard">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <DashboardHeader />
          <main className="flex-1 overflow-auto p-6">{children}</main>
        </SidebarInset>
        <CommandMenu />
      </SidebarProvider>
    </CollaborationProvider>
  );
}
