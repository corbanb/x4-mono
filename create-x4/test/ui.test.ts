import { describe, expect, test, mock, beforeEach } from "bun:test";

// Mock @clack/prompts and process.exit before import
const mockCancel = mock(() => {});
const mockLogError = mock(() => {});
let mockIsCancel = mock((_value: unknown) => false);

mock.module("@clack/prompts", () => ({
  isCancel: (...args: unknown[]) => mockIsCancel(...args),
  cancel: mockCancel,
  log: { error: mockLogError },
}));

// Mock process.exit to throw so we can catch it
const originalExit = process.exit;
class ExitError extends Error {
  code: number;
  constructor(code: number) {
    super(`process.exit(${code})`);
    this.code = code;
  }
}

const { handleCancel, exitWithError } = await import("../src/ui.js");

describe("handleCancel", () => {
  beforeEach(() => {
    mockCancel.mockClear();
    mockIsCancel = mock((_value: unknown) => false);
  });

  test("no-op for non-cancel values", () => {
    mockIsCancel = mock(() => false);
    // Should not throw or exit
    handleCancel("some-value");
    handleCancel(42);
    handleCancel(undefined);
    expect(mockCancel).not.toHaveBeenCalled();
  });

  test("calls process.exit(0) for cancel symbol", () => {
    mockIsCancel = mock(() => true);
    const mockExit = mock((_code?: number) => {
      throw new ExitError(0);
    });
    process.exit = mockExit as never;

    try {
      handleCancel(Symbol("cancel"));
    } catch (err) {
      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(0);
    }

    expect(mockCancel).toHaveBeenCalled();
    process.exit = originalExit;
  });
});

describe("exitWithError", () => {
  test("calls process.exit(1)", () => {
    const mockExit = mock((_code?: number) => {
      throw new ExitError(1);
    });
    process.exit = mockExit as never;

    try {
      exitWithError("something went wrong");
    } catch (err) {
      expect(err).toBeInstanceOf(ExitError);
      expect((err as ExitError).code).toBe(1);
    }

    expect(mockLogError).toHaveBeenCalled();
    process.exit = originalExit;
  });
});
