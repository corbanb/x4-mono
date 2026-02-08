// Token cost rates per 1M tokens (USD)
const MODEL_RATES: Record<string, { input: number; output: number }> = {
  // Claude models
  "claude-opus-4-20250514": { input: 15.0, output: 75.0 },
  "claude-sonnet-4-20250514": { input: 3.0, output: 15.0 },
  "claude-haiku-3-20250414": { input: 0.8, output: 4.0 },
  // OpenAI models
  "gpt-4o": { input: 2.5, output: 10.0 },
  "gpt-4o-mini": { input: 0.15, output: 0.6 },
  "gpt-4-turbo": { input: 10.0, output: 30.0 },
};

/**
 * Estimate the cost of a given number of tokens for a model.
 * Uses combined input+output rate averaged for estimation.
 * Returns cost in USD.
 */
export function estimateTokenCost(tokensUsed: number, model: string): number {
  const rates = MODEL_RATES[model];

  if (!rates) {
    // Default to Claude Sonnet rates for unknown models
    const defaultRates = MODEL_RATES["claude-sonnet-4-20250514"];
    const avgRate = (defaultRates.input + defaultRates.output) / 2;
    return (tokensUsed / 1_000_000) * avgRate;
  }

  // Average of input and output rates as a reasonable estimate
  const avgRate = (rates.input + rates.output) / 2;
  return (tokensUsed / 1_000_000) * avgRate;
}

/**
 * Get the known model rates, or null if unknown.
 */
export function getModelRates(
  model: string,
): { input: number; output: number } | null {
  return MODEL_RATES[model] ?? null;
}
