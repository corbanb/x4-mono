import { describe, test, expect } from "bun:test";
import { TRPCError } from "@trpc/server";
import { AppError, Errors } from "../lib/errors";

describe("AppError", () => {
  test("extends Error", () => {
    const err = new AppError("NOT_FOUND", "Project not found");
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(AppError);
  });

  test("has correct name", () => {
    const err = new AppError("NOT_FOUND", "test");
    expect(err.name).toBe("AppError");
  });

  test("stores code and message", () => {
    const err = new AppError("UNAUTHORIZED", "Login required");
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Login required");
  });

  test("stores optional details", () => {
    const details = { field: "email", reason: "invalid" };
    const err = new AppError("VALIDATION_ERROR", "Validation failed", details);
    expect(err.details).toEqual(details);
  });

  test("details is undefined when not provided", () => {
    const err = new AppError("NOT_FOUND", "not found");
    expect(err.details).toBeUndefined();
  });
});

describe("AppError.toTRPCError()", () => {
  const mappings: Array<[string, string]> = [
    ["UNAUTHORIZED", "UNAUTHORIZED"],
    ["FORBIDDEN", "FORBIDDEN"],
    ["NOT_FOUND", "NOT_FOUND"],
    ["CONFLICT", "CONFLICT"],
    ["VALIDATION_ERROR", "BAD_REQUEST"],
    ["BAD_REQUEST", "BAD_REQUEST"],
    ["INTERNAL_ERROR", "INTERNAL_SERVER_ERROR"],
    ["SERVICE_UNAVAILABLE", "INTERNAL_SERVER_ERROR"],
    ["RATE_LIMITED", "TOO_MANY_REQUESTS"],
  ];

  test.each(mappings)(
    "maps %s to tRPC code %s",
    (errorCode, expectedTrpcCode) => {
      const err = new AppError(errorCode as never, "test message");
      const trpcErr = err.toTRPCError();

      expect(trpcErr).toBeInstanceOf(TRPCError);
      expect(trpcErr.code).toBe(expectedTrpcCode as TRPCError["code"]);
      expect(trpcErr.message).toBe("test message");
    },
  );

  test("sets AppError as cause", () => {
    const err = new AppError("NOT_FOUND", "Project not found");
    const trpcErr = err.toTRPCError();
    expect(trpcErr.cause).toBe(err);
  });
});

describe("AppError.httpStatus", () => {
  const statusMappings: Array<[string, number]> = [
    ["UNAUTHORIZED", 401],
    ["FORBIDDEN", 403],
    ["NOT_FOUND", 404],
    ["CONFLICT", 409],
    ["VALIDATION_ERROR", 400],
    ["BAD_REQUEST", 400],
    ["INTERNAL_ERROR", 500],
    ["SERVICE_UNAVAILABLE", 503],
    ["RATE_LIMITED", 429],
  ];

  test.each(statusMappings)(
    "maps %s to HTTP %d",
    (errorCode, expectedStatus) => {
      const err = new AppError(errorCode as never, "test");
      expect(err.httpStatus).toBe(expectedStatus);
    },
  );
});

describe("Errors convenience constructors", () => {
  test("Errors.notFound()", () => {
    const err = Errors.notFound("Project");
    expect(err).toBeInstanceOf(AppError);
    expect(err.code).toBe("NOT_FOUND");
    expect(err.message).toBe("Project not found");
  });

  test("Errors.unauthorized() with default message", () => {
    const err = Errors.unauthorized();
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Authentication required");
  });

  test("Errors.unauthorized() with custom message", () => {
    const err = Errors.unauthorized("Token expired");
    expect(err.code).toBe("UNAUTHORIZED");
    expect(err.message).toBe("Token expired");
  });

  test("Errors.forbidden() with default message", () => {
    const err = Errors.forbidden();
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Insufficient permissions");
  });

  test("Errors.forbidden() with custom message", () => {
    const err = Errors.forbidden("Admin only");
    expect(err.code).toBe("FORBIDDEN");
    expect(err.message).toBe("Admin only");
  });

  test("Errors.validation()", () => {
    const details = { email: "invalid format" };
    const err = Errors.validation(details);
    expect(err.code).toBe("VALIDATION_ERROR");
    expect(err.message).toBe("Validation failed");
    expect(err.details).toEqual(details);
  });

  test("Errors.rateLimited()", () => {
    const err = Errors.rateLimited();
    expect(err.code).toBe("RATE_LIMITED");
    expect(err.message).toBe("Too many requests, please try again later");
  });

  test("Errors.conflict()", () => {
    const err = Errors.conflict("User");
    expect(err.code).toBe("CONFLICT");
    expect(err.message).toBe("User already exists");
  });

  test("Errors.badRequest()", () => {
    const err = Errors.badRequest("Missing required field");
    expect(err.code).toBe("BAD_REQUEST");
    expect(err.message).toBe("Missing required field");
  });

  test("Errors.internal() with default message", () => {
    const err = Errors.internal();
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.message).toBe("An unexpected error occurred");
  });

  test("Errors.internal() with custom message", () => {
    const err = Errors.internal("Database connection failed");
    expect(err.code).toBe("INTERNAL_ERROR");
    expect(err.message).toBe("Database connection failed");
  });
});
