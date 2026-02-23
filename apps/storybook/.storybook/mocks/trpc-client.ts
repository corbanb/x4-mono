/**
 * Mock for @x4/shared/api-client — used in Storybook to avoid real tRPC calls.
 */

const noop = () => {};

function createMockProcedure() {
  return {
    useQuery: () => ({ data: undefined, isLoading: false, error: null }),
    useMutation: () => ({
      mutate: noop,
      mutateAsync: async () => ({}),
      isLoading: false,
      error: null,
    }),
    useSuspenseQuery: () => ({ data: undefined }),
  };
}

const handler: ProxyHandler<object> = {
  get(_target, _prop) {
    return new Proxy(createMockProcedure(), handler);
  },
};

export const trpc = new Proxy({} as Record<string, unknown>, handler);

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  return children;
}
