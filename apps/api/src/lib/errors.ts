import { TRPCError } from '@trpc/server';
import type { ErrorCode } from '@x4/shared/types';

// --- tRPC Code Mapping ---

const trpcCodeMap: Record<ErrorCode, TRPCError['code']> = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'BAD_REQUEST',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'INTERNAL_SERVER_ERROR',
  RATE_LIMITED: 'TOO_MANY_REQUESTS',
};

const httpStatusMap: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 400,
  BAD_REQUEST: 400,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  RATE_LIMITED: 429,
};

// --- AppError Class ---

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(code: ErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.details = details;
  }

  toTRPCError(): TRPCError {
    return new TRPCError({
      code: trpcCodeMap[this.code] ?? 'INTERNAL_SERVER_ERROR',
      message: this.message,
      cause: this,
    });
  }

  get httpStatus(): number {
    return httpStatusMap[this.code] ?? 500;
  }
}

// --- Convenience Constructors ---

export const Errors = {
  notFound: (resource: string) => new AppError('NOT_FOUND', `${resource} not found`),

  unauthorized: (message?: string) =>
    new AppError('UNAUTHORIZED', message ?? 'Authentication required'),

  forbidden: (message?: string) => new AppError('FORBIDDEN', message ?? 'Insufficient permissions'),

  validation: (details: Record<string, unknown>) =>
    new AppError('VALIDATION_ERROR', 'Validation failed', details),

  rateLimited: () => new AppError('RATE_LIMITED', 'Too many requests, please try again later'),

  conflict: (resource: string) => new AppError('CONFLICT', `${resource} already exists`),

  badRequest: (message: string) => new AppError('BAD_REQUEST', message),

  internal: (message?: string) =>
    new AppError('INTERNAL_ERROR', message ?? 'An unexpected error occurred'),
};
