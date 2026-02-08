import { generateText, streamText } from "ai";
import type { AIOptions, AIResponse } from "@x4/shared/ai";
import { getProvider, DEFAULT_CLAUDE_MODEL } from "./providers";

/**
 * Generate a text response from an AI model.
 * Uses Vercel AI SDK for provider abstraction.
 */
export async function generateAIResponse(
  prompt: string,
  options?: AIOptions,
): Promise<AIResponse> {
  const model = getProvider(options?.model ?? DEFAULT_CLAUDE_MODEL);

  const result = await generateText({
    model,
    prompt,
    maxOutputTokens: options?.maxTokens ?? 1000,
    temperature: options?.temperature,
    system: options?.systemPrompt,
  });

  const inputTokens = result.usage.inputTokens ?? 0;
  const outputTokens = result.usage.outputTokens ?? 0;

  return {
    text: result.text,
    usage: {
      promptTokens: inputTokens,
      completionTokens: outputTokens,
      totalTokens: inputTokens + outputTokens,
    },
  };
}

/**
 * Stream a text response from an AI model.
 * Returns a ReadableStream of text chunks.
 */
export async function streamAIResponse(
  prompt: string,
  options?: AIOptions,
): Promise<ReadableStream> {
  const model = getProvider(options?.model ?? DEFAULT_CLAUDE_MODEL);

  const result = streamText({
    model,
    prompt,
    maxOutputTokens: options?.maxTokens ?? 1000,
    temperature: options?.temperature,
    system: options?.systemPrompt,
  });

  return result.textStream as unknown as ReadableStream;
}
