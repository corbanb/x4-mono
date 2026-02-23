import { mock } from 'bun:test';

/**
 * Mock AI generation response factory.
 * Returns a mock function that resolves with a configurable AI response.
 */
export function createMockAIResponse(overrides?: {
  text?: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
}) {
  return mock(() =>
    Promise.resolve({
      text: overrides?.text ?? 'Mock AI response',
      usage: {
        promptTokens: overrides?.promptTokens ?? 10,
        completionTokens: overrides?.completionTokens ?? 50,
        totalTokens: overrides?.totalTokens ?? 60,
      },
    }),
  );
}

/**
 * Creates the full mock module shape for `@x4/ai-integrations`.
 * Usage: `mock.module("@x4/ai-integrations", () => createMockAIModule())`
 */
export function createMockAIModule(generateFn?: ReturnType<typeof mock>) {
  const mockGenerate = generateFn ?? createMockAIResponse();

  return {
    generateAIResponse: mockGenerate,
    calculatePreciseCost: (_input: number, _output: number, _model: string) => 0.00054,
    estimateTokenCost: (_tokens: number, _model: string) => 0.00054,
    getModelRates: (_model: string) => ({ input: 3.0, output: 15.0 }),
    getProvider: () => ({}),
    DEFAULT_CLAUDE_MODEL: 'claude-sonnet-4-20250514',
    DEFAULT_OPENAI_MODEL: 'gpt-4o',
    streamAIResponse: () => Promise.resolve(new ReadableStream()),
  };
}
