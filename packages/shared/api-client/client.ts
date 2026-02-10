import { createTRPCReact } from "@trpc/react-query";
import {
  createTRPCClient as createVanillaClient,
  httpBatchLink,
} from "@trpc/client";
// Type-only import — no runtime dependency on @x4/api.
// Uses relative path to avoid circular package.json dependency.
import type { AppRouter } from "../../../apps/api/src/routers";

export type TRPCClientConfig = {
  baseUrl: string;
  getToken?: () => string | Promise<string | undefined>;
};

/** React hooks client — use with trpc.*.useQuery() / useMutation() */
export const trpc = createTRPCReact<AppRouter>();

/** Factory for creating a tRPC client bound to React hooks */
export function createTRPCClient(config: TRPCClientConfig) {
  return trpc.createClient({
    links: [
      httpBatchLink({
        url: `${config.baseUrl}/trpc`,
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
        async headers() {
          const token = await config.getToken?.();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

/** Vanilla tRPC client for server components / non-React contexts */
export function createServerClient(config: TRPCClientConfig) {
  return createVanillaClient<AppRouter>({
    links: [
      httpBatchLink({
        url: `${config.baseUrl}/trpc`,
        fetch(url, options) {
          return fetch(url, { ...options, credentials: "include" });
        },
        async headers() {
          const token = await config.getToken?.();
          return token ? { authorization: `Bearer ${token}` } : {};
        },
      }),
    ],
  });
}

export type { AppRouter };
