import type { LanguageModel } from 'ai';
import { getClaudeModel, DEFAULT_CLAUDE_MODEL } from './claude';
import { getOpenAIModel } from './openai';

/**
 * Get a Vercel AI SDK LanguageModel instance by model ID.
 *
 * Claude models (prefix "claude-") use @ai-sdk/anthropic.
 * OpenAI models (prefix "gpt-") use @ai-sdk/openai.
 * Unknown models default to Claude.
 */
export function getProvider(model?: string): LanguageModel {
  const modelId = model ?? DEFAULT_CLAUDE_MODEL;

  if (modelId.startsWith('gpt-') || modelId.startsWith('o1')) {
    return getOpenAIModel(modelId);
  }

  // Default to Claude for claude-* models and unknown models
  return getClaudeModel(modelId);
}

export { DEFAULT_CLAUDE_MODEL } from './claude';
export { DEFAULT_OPENAI_MODEL } from './openai';
