import { createOpenAI } from '@ai-sdk/openai';

const DEFAULT_MODEL = 'gpt-4o';

export function createOpenAIProvider(apiKey?: string) {
  return createOpenAI({
    apiKey: apiKey ?? process.env.OPENAI_API_KEY,
  });
}

export function getOpenAIModel(modelId?: string) {
  const provider = createOpenAIProvider();
  return provider(modelId ?? DEFAULT_MODEL);
}

export { DEFAULT_MODEL as DEFAULT_OPENAI_MODEL };
