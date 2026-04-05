import app from './app';
import { env } from './lib/env';

export default {
  port: Number(process.env.PORT || env.PORT_API),
  fetch: app.fetch,
};

export { app };
export type { AppRouter } from './routers';
