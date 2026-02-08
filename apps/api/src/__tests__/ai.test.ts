import { describe, test, expect, mock, beforeAll } from "bun:test";
import { createCallerFactory } from "../trpc";
import { appRouter } from "../routers";
import type { Context } from "../trpc";

// Mock the AI generation function
const mockGenerateAIResponse = mock(() =>
  Promise.resolve({
    text: "Hello! I'm an AI assistant.",
    usage: {
      promptTokens: 10,
      completionTokens: 50,
      totalTokens: 60,
    },
  }),
);

// Mock the ai-integrations module
mock.module("@x4/ai-integrations", () => ({
  generateAIResponse: mockGenerateAIResponse,
  calculatePreciseCost: (_input: number, _output: number, _model: string) =>
    0.00054,
  estimateTokenCost: (_tokens: number, _model: string) => 0.00054,
  getModelRates: (_model: string) => ({ input: 3.0, output: 15.0 }),
  getProvider: () => ({}),
  DEFAULT_CLAUDE_MODEL: "claude-sonnet-4-20250514",
  DEFAULT_OPENAI_MODEL: "gpt-4o",
  streamAIResponse: () => Promise.resolve(new ReadableStream()),
}));

const createCaller = createCallerFactory(appRouter);

function createTestContext(overrides?: Partial<Context>): Context {
  return {
    db: {
      insert: () => ({
        values: () => ({
          returning: () => Promise.resolve([{ id: "test-usage-id" }]),
        }),
      }),
    } as unknown as Context["db"],
    user: {
      userId: "test-user-id",
      name: "Test User",
      email: "test@example.com",
      role: "user",
      emailVerified: true,
    },
    req: new Request("http://localhost:3002/trpc/ai.generate"),
    ...overrides,
  };
}

describe("ai.generate", () => {
  test("returns generated text with usage info", async () => {
    const caller = createCaller(createTestContext());

    const result = await caller.ai.generate({
      prompt: "Hello, who are you?",
    });

    expect(result.text).toBe("Hello! I'm an AI assistant.");
    expect(result.tokensUsed).toBe(60);
    expect(typeof result.estimatedCost).toBe("number");
  });

  test("passes systemPrompt to generator", async () => {
    const caller = createCaller(createTestContext());

    await caller.ai.generate({
      prompt: "Hello",
      systemPrompt: "You are a pirate.",
      maxTokens: 500,
    });

    expect(mockGenerateAIResponse).toHaveBeenCalledWith("Hello", {
      systemPrompt: "You are a pirate.",
      maxTokens: 500,
    });
  });

  test("rejects unauthenticated request", async () => {
    const caller = createCaller(createTestContext({ user: null }));

    await expect(
      caller.ai.generate({ prompt: "Hello" }),
    ).rejects.toThrow();
  });

  test("rejects empty prompt", async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.ai.generate({ prompt: "" }),
    ).rejects.toThrow();
  });

  test("rejects prompt exceeding max length", async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.ai.generate({ prompt: "x".repeat(10001) }),
    ).rejects.toThrow();
  });

  test("rejects maxTokens exceeding limit", async () => {
    const caller = createCaller(createTestContext());

    await expect(
      caller.ai.generate({ prompt: "Hello", maxTokens: 5000 }),
    ).rejects.toThrow();
  });

  test("uses default maxTokens of 1000", async () => {
    const caller = createCaller(createTestContext());

    await caller.ai.generate({ prompt: "Hello" });

    expect(mockGenerateAIResponse).toHaveBeenCalledWith("Hello", {
      systemPrompt: undefined,
      maxTokens: 1000,
    });
  });

  test("handles AI provider errors gracefully", async () => {
    mockGenerateAIResponse.mockRejectedValueOnce(new Error("API timeout"));

    const caller = createCaller(createTestContext());

    await expect(
      caller.ai.generate({ prompt: "Hello" }),
    ).rejects.toThrow();
  });
});
