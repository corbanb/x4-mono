/**
 * Shared @clack/prompts mock for all test files.
 *
 * Bun runs test files in the same process, so mock.module() calls compete —
 * the first file to register wins. This shared module ensures one
 * comprehensive mock is registered, preventing "p.text is not a function"
 * errors when test file execution order varies.
 *
 * Usage: import the mock functions you need, then use .mockResolvedValueOnce()
 * or .mockImplementation() to customize per-test behavior.
 */
import { mock } from 'bun:test';

// Prompt mocks
export const mockText = mock(async () => '' as string | symbol);
export const mockSelect = mock(async () => '' as string | symbol);
export const mockMultiselect = mock(async () => [] as string[] | symbol);
export const mockConfirm = mock(async () => true as boolean | symbol);
export const mockPassword = mock(async () => '' as string | symbol);

// UI mocks
export const mockIsCancel = mock((_value: unknown) => false);
export const mockCancel = mock(() => {});

// Spinner mocks (stable references so tests can assert on them)
export const mockSpinnerStart = mock(() => {});
export const mockSpinnerStop = mock(() => {});

// Log mocks
export const mockLogError = mock(() => {});
export const mockLogStep = mock(() => {});
export const mockLogInfo = mock(() => {});
export const mockLogSuccess = mock(() => {});
export const mockLogWarning = mock(() => {});
export const mockLogMessage = mock(() => {});

// Register the comprehensive mock — only the first call takes effect in Bun
mock.module('@clack/prompts', () => ({
  text: mockText,
  select: mockSelect,
  multiselect: mockMultiselect,
  confirm: mockConfirm,
  password: mockPassword,
  isCancel: (...args: unknown[]) => mockIsCancel(...args),
  cancel: mockCancel,
  spinner: () => ({ start: mockSpinnerStart, stop: mockSpinnerStop }),
  log: {
    error: mockLogError,
    step: mockLogStep,
    info: mockLogInfo,
    success: mockLogSuccess,
    warning: mockLogWarning,
    message: mockLogMessage,
  },
}));

/** Clear all @clack/prompts mocks — call in beforeEach */
export function clearAllClackMocks() {
  mockText.mockClear();
  mockSelect.mockClear();
  mockMultiselect.mockClear();
  mockConfirm.mockClear();
  mockPassword.mockClear();
  mockIsCancel.mockClear();
  mockCancel.mockClear();
  mockSpinnerStart.mockClear();
  mockSpinnerStop.mockClear();
  mockLogError.mockClear();
  mockLogStep.mockClear();
  mockLogInfo.mockClear();
  mockLogSuccess.mockClear();
  mockLogWarning.mockClear();
  mockLogMessage.mockClear();
  // Reset isCancel to default (non-cancel)
  mockIsCancel.mockImplementation(() => false);
}
