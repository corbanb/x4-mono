import { describe, test, expect } from "bun:test";
import { getProvider, DEFAULT_CLAUDE_MODEL, DEFAULT_OPENAI_MODEL } from "../providers";

describe("getProvider", () => {
  test("returns a provider for default model (Claude)", () => {
    const provider = getProvider();
    expect(provider).toBeDefined();
    expect((provider as unknown as { modelId: string }).modelId).toBe(DEFAULT_CLAUDE_MODEL);
  });

  test("returns Claude provider for claude-* model", () => {
    const provider = getProvider("claude-sonnet-4-20250514");
    expect(provider).toBeDefined();
    expect((provider as unknown as { modelId: string }).modelId).toBe("claude-sonnet-4-20250514");
  });

  test("returns OpenAI provider for gpt-* model", () => {
    const provider = getProvider("gpt-4o");
    expect(provider).toBeDefined();
    expect((provider as unknown as { modelId: string }).modelId).toBe("gpt-4o");
  });

  test("defaults to Claude for unknown model prefix", () => {
    const provider = getProvider("some-random-model");
    expect(provider).toBeDefined();
    // Unknown prefix falls through to Claude provider
    expect((provider as unknown as { modelId: string }).modelId).toBe("some-random-model");
  });

  test("DEFAULT_CLAUDE_MODEL is set", () => {
    expect(DEFAULT_CLAUDE_MODEL).toBe("claude-sonnet-4-20250514");
  });

  test("DEFAULT_OPENAI_MODEL is set", () => {
    expect(DEFAULT_OPENAI_MODEL).toBe("gpt-4o");
  });
});
