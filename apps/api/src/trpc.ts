import { initTRPC } from '@trpc/server';
import type { FetchCreateContextFnOptions } from '@trpc/server/adapters/fetch';
import type { OpenApiMeta } from 'trpc-to-openapi';
import { db } from '@x4/database';
import type { Database } from '@x4/database';
import { auth } from '@x4/auth';
import { ZodError } from 'zod';
import { AppError, Errors } from './lib/errors';

// --- Context ---

export type User = {
  userId: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
  emailVerified: boolean;
};

export type Context = {
  db: Database;
  user: User | null;
  req: Request;
};

export async function createContext(opts: FetchCreateContextFnOptions): Promise<Context> {
  const session = await auth.api.getSession({
    headers: opts.req.headers,
  });

  const user: User | null = session?.user
    ? {
        userId: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: (session.user as { role?: string }).role ?? 'user',
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      }
    : null;

  return { db, user, req: opts.req };
}

// --- tRPC Init ---

const t = initTRPC
  .context<Context>()
  .meta<OpenApiMeta>()
  .create({
    errorFormatter({ shape, error }) {
      const cause = error.cause;
      return {
        ...shape,
        data: {
          ...shape.data,
          zodError: cause instanceof ZodError ? cause.flatten() : null,
          appError: cause instanceof AppError ? { code: cause.code, details: cause.details } : null,
        },
      };
    },
  });

export const router = t.router;
export const publicProcedure = t.procedure;
export const createCallerFactory = t.createCallerFactory;

// --- Auth Middleware ---

const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw Errors.unauthorized('You must be logged in to access this resource').toTRPCError();
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw Errors.unauthorized('You must be logged in to access this resource').toTRPCError();
  }
  if (ctx.user.role !== 'admin') {
    throw Errors.forbidden('Admin access required').toTRPCError();
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
