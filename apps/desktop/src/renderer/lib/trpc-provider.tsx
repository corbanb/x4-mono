import { useState } from "react";
import { QueryClient } from "@tanstack/react-query";
import {
  TRPCProvider as SharedTRPCProvider,
  createTRPCClient,
} from "@x4/shared/api-client";

const API_URL =
  (typeof import.meta !== "undefined" &&
    (import.meta as unknown as { env: Record<string, string> }).env
      ?.VITE_API_URL) ||
  "http://localhost:3002";

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
      getToken: async () => {
        const token = await window.electronAuth.getToken();
        return token ?? undefined;
      },
    }),
  );

  return (
    <SharedTRPCProvider client={trpcClient} queryClient={queryClient}>
      {children}
    </SharedTRPCProvider>
  );
}
