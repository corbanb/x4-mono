import { describe, test, expect } from "bun:test";
import { AIOptionsSchema, AIGenerateInputSchema } from "../types";

describe("AIOptionsSchema", () => {
  test("parses valid options with defaults", () => {
    const result = AIOptionsSchema.parse({});
    expect(result.maxTokens).toBe(1000);
  });

  test("accepts all optional fields", () => {
    const result = AIOptionsSchema.parse({
      model: "claude-sonnet-4-20250514",
      maxTokens: 2000,
      temperature: 0.7,
      systemPrompt: "You are helpful.",
    });
    expect(result.model).toBe("claude-sonnet-4-20250514");
    expect(result.maxTokens).toBe(2000);
    expect(result.temperature).toBe(0.7);
  });

  test("rejects maxTokens > 4000", () => {
    const result = AIOptionsSchema.safeParse({ maxTokens: 5000 });
    expect(result.success).toBe(false);
  });

  test("rejects maxTokens < 1", () => {
    const result = AIOptionsSchema.safeParse({ maxTokens: 0 });
    expect(result.success).toBe(false);
  });

  test("rejects temperature > 2", () => {
    const result = AIOptionsSchema.safeParse({ temperature: 3 });
    expect(result.success).toBe(false);
  });
});

describe("AIGenerateInputSchema", () => {
  test("parses valid input with defaults", () => {
    const result = AIGenerateInputSchema.parse({ prompt: "Hello" });
    expect(result.prompt).toBe("Hello");
    expect(result.maxTokens).toBe(1000);
  });

  test("rejects empty prompt", () => {
    const result = AIGenerateInputSchema.safeParse({ prompt: "" });
    expect(result.success).toBe(false);
  });

  test("rejects prompt > 10000 chars", () => {
    const result = AIGenerateInputSchema.safeParse({
      prompt: "x".repeat(10001),
    });
    expect(result.success).toBe(false);
  });

  test("accepts prompt at max length", () => {
    const result = AIGenerateInputSchema.safeParse({
      prompt: "x".repeat(10000),
    });
    expect(result.success).toBe(true);
  });

  test("accepts optional systemPrompt", () => {
    const result = AIGenerateInputSchema.parse({
      prompt: "Hello",
      systemPrompt: "Be helpful",
      maxTokens: 500,
    });
    expect(result.systemPrompt).toBe("Be helpful");
    expect(result.maxTokens).toBe(500);
  });

  test("rejects maxTokens > 4000", () => {
    const result = AIGenerateInputSchema.safeParse({
      prompt: "Hello",
      maxTokens: 5000,
    });
    expect(result.success).toBe(false);
  });
});
