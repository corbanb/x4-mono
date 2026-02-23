'use client';

import { useState } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { TRPCProvider as SharedTRPCProvider, createTRPCClient } from '@x4/shared/api-client';

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

  const [trpcClient] = useState(() =>
    createTRPCClient({
      baseUrl: '',
    }),
  );

  return (
    <SharedTRPCProvider client={trpcClient} queryClient={queryClient}>
      {children}
    </SharedTRPCProvider>
  );
}
