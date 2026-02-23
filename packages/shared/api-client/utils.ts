import { TRPCClientError } from '@trpc/client';
import type { AppRouter } from './client';

/** Type guard for tRPC client errors */
export function isTRPCClientError(error: unknown): error is TRPCClientError<AppRouter> {
  return error instanceof TRPCClientError;
}

/** Extract a user-friendly message from a tRPC error */
export function extractErrorMessage(error: unknown): string {
  if (isTRPCClientError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/** Extract the tRPC error code from a tRPC error */
export function extractErrorCode(error: unknown): string | undefined {
  if (isTRPCClientError(error)) {
    return error.data?.code;
  }
  return undefined;
}

/** Extract Zod field errors from a tRPC error with Zod validation failure */
export function extractZodErrors(error: unknown): Record<string, string[]> | undefined {
  if (isTRPCClientError(error)) {
    const zodError = (error.data as { zodError?: { fieldErrors?: Record<string, string[]> } })
      ?.zodError;
    return zodError?.fieldErrors;
  }
  return undefined;
}

/**
 * Create a token getter from a simple storage mechanism.
 * Useful for wrapping localStorage, SecureStore, etc.
 */
export function createTokenGetter(
  storage: { getItem: (key: string) => string | null | Promise<string | null> },
  key = 'auth-token',
): () => Promise<string | undefined> {
  return async () => {
    const token = await storage.getItem(key);
    return token ?? undefined;
  };
}
