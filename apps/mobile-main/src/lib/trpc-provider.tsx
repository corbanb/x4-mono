import React, { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { TRPCProvider as SharedTRPCProvider } from '@x4/shared/api-client';
import { trpcClient } from './api';

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <SharedTRPCProvider client={trpcClient} queryClient={queryClient}>
      {children}
    </SharedTRPCProvider>
  );
}
