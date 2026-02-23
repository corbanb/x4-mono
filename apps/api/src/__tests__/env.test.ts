import { describe, test, expect } from 'bun:test';
import { z } from 'zod';

// Test the env schema shape directly without triggering process.exit
// by defining the same schema here (env.ts validates eagerly on import)

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-', "ANTHROPIC_API_KEY must start with 'sk-'"),
  WEB_URL: z.string().url().default('http://localhost:3000'),
  MARKETING_URL: z.string().url().default('http://localhost:3001'),
  APP_VERSION: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

describe('Environment validation schema', () => {
  test('accepts valid environment', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_SECRET: 'a'.repeat(32),
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
    });
    expect(result.success).toBe(true);
  });

  test('applies defaults for optional fields', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_SECRET: 'a'.repeat(32),
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
    });
    expect(result.PORT).toBe(3002);
    expect(result.WEB_URL).toBe('http://localhost:3000');
    expect(result.MARKETING_URL).toBe('http://localhost:3001');
    expect(result.NODE_ENV).toBe('development');
  });

  test('rejects missing DATABASE_URL', () => {
    const result = envSchema.safeParse({
      JWT_SECRET: 'a'.repeat(32),
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
    });
    expect(result.success).toBe(false);
  });

  test('rejects short JWT_SECRET', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_SECRET: 'short',
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
    });
    expect(result.success).toBe(false);
  });

  test('rejects ANTHROPIC_API_KEY without sk- prefix', () => {
    const result = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_SECRET: 'a'.repeat(32),
      ANTHROPIC_API_KEY: 'invalid-key',
    });
    expect(result.success).toBe(false);
  });

  test('coerces PORT to number', () => {
    const result = envSchema.parse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_SECRET: 'a'.repeat(32),
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
      PORT: '8080',
    });
    expect(result.PORT).toBe(8080);
  });

  test('validates NODE_ENV enum values', () => {
    const valid = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_SECRET: 'a'.repeat(32),
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
      NODE_ENV: 'production',
    });
    expect(valid.success).toBe(true);

    const invalid = envSchema.safeParse({
      DATABASE_URL: 'postgresql://user:pass@host/db',
      JWT_SECRET: 'a'.repeat(32),
      ANTHROPIC_API_KEY: 'sk-ant-test-key',
      NODE_ENV: 'staging',
    });
    expect(invalid.success).toBe(false);
  });
});
