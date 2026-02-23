import { createAnthropic } from '@ai-sdk/anthropic';

const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

export function createClaudeProvider(apiKey?: string) {
  return createAnthropic({
    apiKey: apiKey ?? process.env.ANTHROPIC_API_KEY,
  });
}

export function getClaudeModel(modelId?: string) {
  const provider = createClaudeProvider();
  return provider(modelId ?? DEFAULT_MODEL);
}

export { DEFAULT_MODEL as DEFAULT_CLAUDE_MODEL };
