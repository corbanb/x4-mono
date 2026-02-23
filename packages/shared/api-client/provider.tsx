import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { trpc, createTRPCClient } from './client';

export function TRPCProvider({
  client,
  queryClient,
  children,
}: {
  client: ReturnType<typeof createTRPCClient>;
  queryClient: QueryClient;
  children: React.ReactNode;
}) {
  return (
    <trpc.Provider client={client} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
