import { describe, expect, test, beforeEach, afterEach, mock } from 'bun:test';
import { createNeonProject } from '../src/neon.js';

describe('createNeonProject', () => {
  let originalFetch: typeof globalThis.fetch;

  beforeEach(() => {
    originalFetch = globalThis.fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test('sends POST to correct URL with correct headers', async () => {
    let capturedUrl: string | undefined;
    let capturedInit: RequestInit | undefined;

    globalThis.fetch = mock(async (url: string | URL | Request, init?: RequestInit) => {
      capturedUrl = url as string;
      capturedInit = init;
      return new Response(
        JSON.stringify({
          project: { id: 'proj-1', name: 'test', region_id: 'aws-us-east-2' },
          connection_uris: [{ connection_uri: 'postgresql://user:pass@host/db' }],
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    await createNeonProject('test-api-key', 'my-project');

    expect(capturedUrl).toBe('https://console.neon.tech/api/v2/projects');
    expect(capturedInit?.method).toBe('POST');
    expect(capturedInit?.headers).toEqual({
      Authorization: 'Bearer test-api-key',
      'Content-Type': 'application/json',
    });
  });

  test('sends correct body with project name', async () => {
    let capturedBody: string | undefined;

    globalThis.fetch = mock(async (_url: string | URL | Request, init?: RequestInit) => {
      capturedBody = init?.body as string;
      return new Response(
        JSON.stringify({
          project: { id: 'proj-1', name: 'cool-app', region_id: 'aws-us-east-2' },
          connection_uris: [{ connection_uri: 'postgresql://user:pass@host/db' }],
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    await createNeonProject('key', 'cool-app');

    const body = JSON.parse(capturedBody!);
    expect(body.project.name).toBe('cool-app');
  });

  test('returns connectionString and region on success', async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          project: { id: 'proj-1', name: 'test', region_id: 'aws-eu-central-1' },
          connection_uris: [
            {
              connection_uri:
                'postgresql://neon:pass@ep-cool-123.eu-central-1.aws.neon.tech/neondb',
            },
          ],
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    const result = await createNeonProject('key', 'test');

    expect(result.connectionString).toBe(
      'postgresql://neon:pass@ep-cool-123.eu-central-1.aws.neon.tech/neondb',
    );
    expect(result.region).toBe('aws-eu-central-1');
  });

  test('throws on non-OK response with status and body', async () => {
    globalThis.fetch = mock(async () => {
      return new Response('Unauthorized: bad API key', { status: 401 });
    }) as typeof fetch;

    await expect(createNeonProject('bad-key', 'test')).rejects.toThrow(/Neon API error \(401\)/);
  });

  test('throws on 500 server error', async () => {
    globalThis.fetch = mock(async () => {
      return new Response('Internal server error', { status: 500 });
    }) as typeof fetch;

    await expect(createNeonProject('key', 'test')).rejects.toThrow(/Neon API error \(500\)/);
  });

  test('throws when no connection_uris returned', async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          project: { id: 'proj-1', name: 'test', region_id: 'aws-us-east-2' },
          connection_uris: [],
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    await expect(createNeonProject('key', 'test')).rejects.toThrow(/no connection string returned/);
  });

  test('throws when connection_uris is undefined', async () => {
    globalThis.fetch = mock(async () => {
      return new Response(
        JSON.stringify({
          project: { id: 'proj-1', name: 'test', region_id: 'aws-us-east-2' },
        }),
        { status: 200 },
      );
    }) as typeof fetch;

    await expect(createNeonProject('key', 'test')).rejects.toThrow();
  });

  test('error message includes response body text', async () => {
    globalThis.fetch = mock(async () => {
      return new Response('{"error":"quota exceeded"}', { status: 429 });
    }) as typeof fetch;

    try {
      await createNeonProject('key', 'test');
      expect.unreachable('Should have thrown');
    } catch (err) {
      expect((err as Error).message).toContain('quota exceeded');
      expect((err as Error).message).toContain('429');
    }
  });
});
