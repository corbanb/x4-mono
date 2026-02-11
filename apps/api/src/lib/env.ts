import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().default(3002),
  DATABASE_URL: z.string().url("DATABASE_URL must be a valid URL"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  BETTER_AUTH_SECRET: z.string().min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
  BETTER_AUTH_URL: z.string().url().default("http://localhost:3002"),
  ANTHROPIC_API_KEY: z.string().startsWith("sk-", "ANTHROPIC_API_KEY must start with 'sk-'"),
  WEB_URL: z.string().url().default("http://localhost:3000"),
  MARKETING_URL: z.string().url().default("http://localhost:3001"),
  DOCS_URL: z.string().url().default("http://localhost:3003"),
  VERCEL_URL: z.string().optional(),
  GITHUB_CLIENT_ID: z.string().optional(),
  GITHUB_CLIENT_SECRET: z.string().optional(),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  APP_VERSION: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof envSchema>;

function validateEnv(): Env {
  // On Vercel preview deploys, VERCEL_URL is auto-set (without protocol).
  // Use it as fallback for BETTER_AUTH_URL when not explicitly configured.
  if (process.env.VERCEL_URL && !process.env.BETTER_AUTH_URL) {
    process.env.BETTER_AUTH_URL = `https://${process.env.VERCEL_URL}`;
  }

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const fields = result.error.flatten().fieldErrors;
    console.error("Invalid environment variables:", JSON.stringify(fields));
    throw new Error(`Invalid environment variables: ${Object.keys(fields).join(", ")}`);
  }

  return result.data;
}

export const env = validateEnv();
