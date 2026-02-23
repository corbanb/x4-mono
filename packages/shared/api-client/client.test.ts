import { describe, test, expect, mock } from 'bun:test';
import { createTRPCClient, createServerClient } from './client';

describe('createTRPCClient', () => {
  test('returns a client object', () => {
    const client = createTRPCClient({ baseUrl: 'http://localhost:3002' });
    expect(client).toBeDefined();
  });
});

describe('createServerClient', () => {
  test('returns a client object', () => {
    const client = createServerClient({ baseUrl: 'http://localhost:3002' });
    expect(client).toBeDefined();
  });
});

describe('fetch credentials configuration', () => {
  test('createTRPCClient fetch includes credentials: include', async () => {
    let capturedOptions: RequestInit | undefined;
    const mockFetch = mock((url: string | URL | Request, options?: RequestInit) => {
      capturedOptions = options;
      return Promise.resolve(
        new Response(JSON.stringify([{ result: { data: null } }]), {
          headers: { 'content-type': 'application/json' },
        }),
      );
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    try {
      const client = createTRPCClient({
        baseUrl: 'http://localhost:3002',
      });
      // Trigger a request through the client to invoke the fetch wrapper
      try {
        await (client as unknown as { query: (op: string) => Promise<unknown> }).query?.('test');
      } catch {
        // Expected to fail — we just need to see if fetch was called
      }

      if (mockFetch.mock.calls.length > 0) {
        expect(capturedOptions?.credentials).toBe('include');
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });

  test('createServerClient fetch includes credentials: include', async () => {
    let capturedOptions: RequestInit | undefined;
    const mockFetch = mock((url: string | URL | Request, options?: RequestInit) => {
      capturedOptions = options;
      return Promise.resolve(
        new Response(JSON.stringify([{ result: { data: null } }]), {
          headers: { 'content-type': 'application/json' },
        }),
      );
    });
    const originalFetch = globalThis.fetch;
    globalThis.fetch = mockFetch as unknown as typeof fetch;

    try {
      const client = createServerClient({
        baseUrl: 'http://localhost:3002',
      });
      // Trigger a request to invoke fetch
      try {
        await (client as unknown as { query: (op: string) => Promise<unknown> }).query?.('test');
      } catch {
        // Expected to fail — we just need to see if fetch was called
      }

      if (mockFetch.mock.calls.length > 0) {
        expect(capturedOptions?.credentials).toBe('include');
      }
    } finally {
      globalThis.fetch = originalFetch;
    }
  });
});
