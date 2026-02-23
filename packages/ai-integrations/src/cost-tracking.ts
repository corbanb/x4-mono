import { estimateTokenCost, getModelRates } from '@x4/shared/ai';

// Re-export from shared for convenience
export { estimateTokenCost, getModelRates };

/**
 * Calculate precise cost given separate input/output token counts.
 */
export function calculatePreciseCost(
  promptTokens: number,
  completionTokens: number,
  model: string,
): number {
  const rates = getModelRates(model);

  if (!rates) {
    // Fallback to combined estimation
    return estimateTokenCost(promptTokens + completionTokens, model);
  }

  const inputCost = (promptTokens / 1_000_000) * rates.input;
  const outputCost = (completionTokens / 1_000_000) * rates.output;
  return inputCost + outputCost;
}
