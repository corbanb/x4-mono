"use client";

import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  TRPCProvider as SharedTRPCProvider,
  createTRPCClient,
} from "@x4/shared/api-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002";

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
      baseUrl: API_URL,
    }),
  );

  return (
    <SharedTRPCProvider client={trpcClient} queryClient={queryClient}>
      {children}
    </SharedTRPCProvider>
  );
}
