/**
 * Test setup — sets required environment variables before any test imports.
 * This runs via Bun's preload mechanism before test files are loaded.
 */
process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
process.env.JWT_SECRET = 'test-secret-that-is-at-least-32-characters-long';
process.env.BETTER_AUTH_SECRET = 'test-better-auth-secret-at-least-32-chars';
process.env.BETTER_AUTH_URL = 'http://localhost:3002';
process.env.ANTHROPIC_API_KEY = 'sk-ant-test-key-for-testing';
process.env.UPSTASH_REDIS_REST_URL = 'https://fake-redis.upstash.io';
process.env.UPSTASH_REDIS_REST_TOKEN = 'fake-token-for-testing';
(process.env as Record<string, string>).NODE_ENV = 'test';
