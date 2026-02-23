import { describe, test, expect } from 'bun:test';
import { TRPCClientError } from '@trpc/client';
import {
  isTRPCClientError,
  extractErrorMessage,
  extractErrorCode,
  extractZodErrors,
  createTokenGetter,
} from './utils';

describe('isTRPCClientError', () => {
  test('returns true for TRPCClientError instance', () => {
    const error = new TRPCClientError('test error');
    expect(isTRPCClientError(error)).toBe(true);
  });

  test('returns false for generic Error', () => {
    expect(isTRPCClientError(new Error('test'))).toBe(false);
  });

  test('returns false for plain object', () => {
    expect(isTRPCClientError({ message: 'test' })).toBe(false);
  });

  test('returns false for null and undefined', () => {
    expect(isTRPCClientError(null)).toBe(false);
    expect(isTRPCClientError(undefined)).toBe(false);
  });
});

describe('extractErrorMessage', () => {
  test('extracts message from TRPCClientError', () => {
    const error = new TRPCClientError('tRPC error message');
    expect(extractErrorMessage(error)).toBe('tRPC error message');
  });

  test('extracts message from generic Error', () => {
    expect(extractErrorMessage(new Error('generic error'))).toBe('generic error');
  });

  test('returns fallback for non-Error values', () => {
    expect(extractErrorMessage({ foo: 'bar' })).toBe('An unexpected error occurred');
    expect(extractErrorMessage(null)).toBe('An unexpected error occurred');
    expect(extractErrorMessage(42)).toBe('An unexpected error occurred');
  });
});

describe('extractErrorCode', () => {
  test('returns undefined for non-tRPC errors', () => {
    expect(extractErrorCode(new Error('test'))).toBeUndefined();
    expect(extractErrorCode(null)).toBeUndefined();
  });
});

describe('extractZodErrors', () => {
  test('returns undefined for non-tRPC errors', () => {
    expect(extractZodErrors(new Error('test'))).toBeUndefined();
  });

  test('returns undefined for tRPC errors without zod data', () => {
    const error = new TRPCClientError('not a zod error');
    expect(extractZodErrors(error)).toBeUndefined();
  });
});

describe('createTokenGetter', () => {
  test('returns token from sync storage', async () => {
    const storage = { getItem: () => 'test-token' };
    const getToken = createTokenGetter(storage);
    expect(await getToken()).toBe('test-token');
  });

  test('returns token from async storage', async () => {
    const storage = { getItem: async () => 'async-token' };
    const getToken = createTokenGetter(storage);
    expect(await getToken()).toBe('async-token');
  });

  test('returns undefined when storage returns null', async () => {
    const storage = { getItem: () => null };
    const getToken = createTokenGetter(storage);
    expect(await getToken()).toBeUndefined();
  });

  test('uses custom key when provided', async () => {
    let requestedKey = '';
    const storage = {
      getItem: (key: string) => {
        requestedKey = key;
        return 'token';
      },
    };
    const getToken = createTokenGetter(storage, 'custom-key');
    await getToken();
    expect(requestedKey).toBe('custom-key');
  });

  test("uses default key 'auth-token'", async () => {
    let requestedKey = '';
    const storage = {
      getItem: (key: string) => {
        requestedKey = key;
        return null;
      },
    };
    const getToken = createTokenGetter(storage);
    await getToken();
    expect(requestedKey).toBe('auth-token');
  });
});
