import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { trpcServer } from '@hono/trpc-server';
import { apiReference } from '@scalar/hono-api-reference';
import { auth } from '@x4/auth';
import { appRouter } from './routers';
import { createContext } from './trpc';
import { env } from './lib/env';
import { AppError } from './lib/errors';
import { generateOpenAPISpec } from './lib/openapi';
import { logger } from './lib/logger';
import { requestLogger } from './middleware/logger';
import { rateLimit } from './middleware/rateLimit';

const app = new Hono();

// --- Request Logger (first middleware — generates requestId) ---

app.use('*', requestLogger);

// --- Global Middleware ---

const allowedOrigins = [env.WEB_URL, env.MARKETING_URL, env.DOCS_URL];

app.use(
  '/trpc/*',
  cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

app.use(
  '/api/auth/*',
  cors({
    origin: allowedOrigins,
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
);

// --- Rate Limiting ---

app.use('/api/auth/*', rateLimit('auth'));
app.use('/trpc/*', rateLimit('general'));

// --- Global Error Handler ---

app.onError((err, c) => {
  const requestId = c.get('requestId') ?? crypto.randomUUID();

  if (err instanceof AppError) {
    logger.warn(
      { err: { code: err.code, message: err.message }, requestId },
      `AppError: ${err.code}`,
    );
    return c.json(
      {
        code: err.code,
        message: err.message,
        details: err.details,
        requestId,
      },
      err.httpStatus as never,
    );
  }

  logger.error({ err, requestId }, 'Unhandled error');
  return c.json(
    {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
      requestId,
    },
    500,
  );
});

// --- Better Auth Handler ---

app.on(['POST', 'GET'], '/api/auth/**', (c) => {
  return auth.handler(c.req.raw);
});

// --- Health Check ---

app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: env.APP_VERSION ?? '0.0.0',
  });
});

// --- OpenAPI Spec & Docs ---

const openApiSpec = generateOpenAPISpec();

app.get('/openapi.json', (c) => {
  return c.json(openApiSpec);
});

app.get(
  '/docs',
  apiReference({
    sources: [{ url: '/openapi.json' }],
    pageTitle: 'x4 API Reference',
  }),
);

// --- tRPC Adapter ---

app.use(
  '/trpc/*',
  trpcServer({
    router: appRouter,
    createContext,
    onError({ error }) {
      logger.error({ code: error.code, message: error.message }, 'tRPC error');
    },
  }),
);

export default app;
export { app };
export type { AppRouter } from './routers';
