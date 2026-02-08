import { initTRPC, TRPCError } from "@trpc/server";
import type { FetchCreateContextFnOptions } from "@trpc/server/adapters/fetch";
import { db } from "@x4/database";
import type { Database } from "@x4/database";
import { ZodError } from "zod";

// --- Context ---

export type User = {
  userId: string;
  role: string;
};

export type Context = {
  db: Database;
  user: User | null;
  req: Request;
};

/**
 * Placeholder auth: decodes a Base64-encoded JSON token from Authorization header.
 * Token format: base64({ userId: string, role: string })
 * PRD-006 replaces this with Better Auth session validation.
 */
function decodeAuthToken(header: string | null): User | null {
  if (!header) return null;

  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) return null;

  try {
    const decoded = JSON.parse(atob(token));
    if (typeof decoded.userId === "string" && typeof decoded.role === "string") {
      return { userId: decoded.userId, role: decoded.role };
    }
    return null;
  } catch {
    return null;
  }
}

export function createContext(opts: FetchCreateContextFnOptions): Context {
  const user = decodeAuthToken(opts.req.headers.get("authorization"));
  return { db, user, req: opts.req };
}

// --- tRPC Init ---

const t = initTRPC.context<Context>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
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
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

const isAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be logged in to access this resource",
    });
  }
  if (ctx.user.role !== "admin") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Admin access required",
    });
  }
  return next({ ctx: { ...ctx, user: ctx.user } });
});

export const protectedProcedure = t.procedure.use(isAuthed);
export const adminProcedure = t.procedure.use(isAdmin);
