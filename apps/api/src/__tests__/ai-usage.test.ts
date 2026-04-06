import { describe, test, expect } from 'bun:test';
import { createTestContext, createCaller, createTestUser, createMockDb } from './helpers';

// --- ai.usage.summary ---

describe('ai.usage.summary', () => {
  test('returns zero-valued summary when no rows', async () => {
    const db = createMockDb({ select: [] });
    const caller = createCaller(createTestContext({ db, user: createTestUser() }));
    const result = await caller.ai.usage.summary({});
    expect(result).toEqual({
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      avgCostPerRequest: 0,
      byModel: [],
    });
  });

  test('aggregates tokens and cost correctly', async () => {
    const db = createMockDb({
      select: [
        { model: 'claude-3', count: '3', totalTokens: '1500', totalCost: '0.003000' },
        { model: 'gpt-4', count: '2', totalTokens: '800', totalCost: '0.002000' },
      ],
    });
    const caller = createCaller(createTestContext({ db, user: createTestUser() }));
    const result = await caller.ai.usage.summary({});
    expect(result.totalRequests).toBe(5);
    expect(result.totalTokens).toBe(2300);
    expect(result.totalCost).toBeCloseTo(0.005);
    expect(result.avgCostPerRequest).toBeCloseTo(0.001);
    expect(result.byModel).toHaveLength(2);
    // pct should sum to ~100
    const totalPct = result.byModel.reduce((s, r) => s + r.pct, 0);
    expect(totalPct).toBeCloseTo(100);
  });

  test('handles null estimatedCost without NaN', async () => {
    const db = createMockDb({
      select: [{ model: 'claude-3', count: '2', totalTokens: '1000', totalCost: null }],
    });
    const caller = createCaller(createTestContext({ db, user: createTestUser() }));
    const result = await caller.ai.usage.summary({});
    expect(result.totalCost).toBe(0);
    expect(result.avgCostPerRequest).toBe(0);
    expect(isNaN(result.totalCost)).toBe(false);
    expect(result.byModel[0].pct).toBe(0);
    expect(isNaN(result.byModel[0].pct)).toBe(false);
  });

  test('respects from/to date filters (passes without error)', async () => {
    const db = createMockDb({ select: [] });
    const caller = createCaller(createTestContext({ db, user: createTestUser() }));
    // Should not throw — filters are applied to the WHERE clause
    const result = await caller.ai.usage.summary({
      from: new Date('2026-01-01'),
      to: new Date('2026-01-31'),
    });
    expect(result.totalRequests).toBe(0);
  });

  test('requires auth — throws UNAUTHORIZED when no user', async () => {
    const caller = createCaller(createTestContext());
    await expect(caller.ai.usage.summary({})).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});

// --- ai.usage.history ---

describe('ai.usage.history', () => {
  test('returns entries ordered ascending by date', async () => {
    const db = createMockDb({
      select: [
        { date: '2026-01-15T00:00:00.000Z', tokens: '500', cost: '0.001000', count: '2' },
        { date: '2026-01-16T00:00:00.000Z', tokens: '300', cost: '0.000500', count: '1' },
      ],
    });
    const caller = createCaller(createTestContext({ db, user: createTestUser() }));
    const result = await caller.ai.usage.history({});
    expect(result[0].date).toBe('2026-01-15');
    expect(result[1].date).toBe('2026-01-16');
  });

  test('serializes dates as YYYY-MM-DD strings', async () => {
    const db = createMockDb({
      select: [{ date: '2026-03-20T00:00:00.000Z', tokens: '100', cost: '0.000200', count: '1' }],
    });
    const caller = createCaller(createTestContext({ db, user: createTestUser() }));
    const result = await caller.ai.usage.history({});
    expect(result[0].date).toBe('2026-03-20');
    expect(typeof result[0].date).toBe('string');
  });

  test('respects from/to date filters (passes without error)', async () => {
    const db = createMockDb({ select: [] });
    const caller = createCaller(createTestContext({ db, user: createTestUser() }));
    const result = await caller.ai.usage.history({
      from: new Date('2026-01-01'),
      to: new Date('2026-01-31'),
    });
    expect(result).toEqual([]);
  });

  test('requires auth — throws UNAUTHORIZED when no user', async () => {
    const caller = createCaller(createTestContext());
    await expect(caller.ai.usage.history({})).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });
});
