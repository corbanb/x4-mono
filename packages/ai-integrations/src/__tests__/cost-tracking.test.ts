import { describe, test, expect } from 'bun:test';
import { estimateTokenCost, getModelRates, calculatePreciseCost } from '../cost-tracking';

describe('estimateTokenCost', () => {
  test('returns cost for claude-sonnet-4', () => {
    const cost = estimateTokenCost(1000, 'claude-sonnet-4-20250514');
    // Average of input ($3/1M) and output ($15/1M) = $9/1M
    // 1000 tokens = $0.009
    expect(cost).toBeCloseTo(0.009, 5);
  });

  test('returns cost for claude-opus-4', () => {
    const cost = estimateTokenCost(1000, 'claude-opus-4-20250514');
    // Average of input ($15/1M) and output ($75/1M) = $45/1M
    // 1000 tokens = $0.045
    expect(cost).toBeCloseTo(0.045, 5);
  });

  test('returns cost for gpt-4o', () => {
    const cost = estimateTokenCost(1000, 'gpt-4o');
    // Average of input ($2.5/1M) and output ($10/1M) = $6.25/1M
    // 1000 tokens = $0.00625
    expect(cost).toBeCloseTo(0.00625, 5);
  });

  test('returns default cost for unknown model', () => {
    const cost = estimateTokenCost(1000, 'some-unknown-model');
    // Falls back to Claude Sonnet rates
    const sonnetCost = estimateTokenCost(1000, 'claude-sonnet-4-20250514');
    expect(cost).toBe(sonnetCost);
  });

  test('returns 0 for 0 tokens', () => {
    expect(estimateTokenCost(0, 'claude-sonnet-4-20250514')).toBe(0);
  });
});

describe('getModelRates', () => {
  test('returns rates for known model', () => {
    const rates = getModelRates('claude-sonnet-4-20250514');
    expect(rates).not.toBeNull();
    expect(rates!.input).toBe(3.0);
    expect(rates!.output).toBe(15.0);
  });

  test('returns null for unknown model', () => {
    expect(getModelRates('nonexistent-model')).toBeNull();
  });
});

describe('calculatePreciseCost', () => {
  test('calculates separate input/output costs for known model', () => {
    // 500 input tokens + 500 output tokens for claude-sonnet-4
    // Input: (500/1M) * $3 = $0.0015
    // Output: (500/1M) * $15 = $0.0075
    // Total: $0.009
    const cost = calculatePreciseCost(500, 500, 'claude-sonnet-4-20250514');
    expect(cost).toBeCloseTo(0.009, 5);
  });

  test('falls back to combined estimation for unknown model', () => {
    const cost = calculatePreciseCost(500, 500, 'unknown-model');
    const fallbackCost = estimateTokenCost(1000, 'unknown-model');
    expect(cost).toBe(fallbackCost);
  });

  test('handles zero input tokens', () => {
    const cost = calculatePreciseCost(0, 1000, 'claude-sonnet-4-20250514');
    // Only output: (1000/1M) * $15 = $0.015
    expect(cost).toBeCloseTo(0.015, 5);
  });
});
