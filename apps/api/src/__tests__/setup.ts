/**
 * Test setup — sets required environment variables before any test imports.
 * This runs via Bun's preload mechanism before test files are loaded.
 */
process.env.DATABASE_URL = "postgresql://test:test@localhost/test";
process.env.JWT_SECRET = "test-secret-that-is-at-least-32-characters-long";
process.env.ANTHROPIC_API_KEY = "sk-ant-test-key-for-testing";
process.env.NODE_ENV = "test";
