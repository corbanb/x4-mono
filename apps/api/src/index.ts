import app from './app';
import { env } from './lib/env';

export default {
  port: env.PORT,
  fetch: app.fetch,
};

export { app };
export type { AppRouter } from './routers';
