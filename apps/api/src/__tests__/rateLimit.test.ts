import { describe, test, expect } from 'bun:test';
import { rateLimit, tierConfigs, getIdentifier } from '../middleware/rateLimit';
import type { RateLimitTier } from '../middleware/rateLimit';

describe('tierConfigs', () => {
  test('general tier: 100 requests / 60s', () => {
    expect(tierConfigs.general.limit).toBe(100);
    expect(tierConfigs.general.window).toBe('60 s');
    expect(tierConfigs.general.prefix).toBe('rl:general');
  });

  test('ai tier: 10 requests / 60s', () => {
    expect(tierConfigs.ai.limit).toBe(10);
    expect(tierConfigs.ai.window).toBe('60 s');
    expect(tierConfigs.ai.prefix).toBe('rl:ai');
  });

  test('auth tier: 5 requests / 60s', () => {
    expect(tierConfigs.auth.limit).toBe(5);
    expect(tierConfigs.auth.window).toBe('60 s');
    expect(tierConfigs.auth.prefix).toBe('rl:auth');
  });
});

describe('getIdentifier', () => {
  function makeRequest(headers: Record<string, string> = {}): Request {
    return new Request('http://localhost/test', { headers });
  }

  test('auth tier uses IP from x-forwarded-for', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getIdentifier('auth', req, 'user-123')).toBe('1.2.3.4');
  });

  test('auth tier ignores userId', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    expect(getIdentifier('auth', req, 'user-123')).toBe('1.2.3.4');
  });

  test('auth tier falls back to anonymous', () => {
    const req = makeRequest();
    expect(getIdentifier('auth', req)).toBe('anonymous');
  });

  test('general tier prefers userId', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    expect(getIdentifier('general', req, 'user-123')).toBe('user-123');
  });

  test('general tier falls back to IP', () => {
    const req = makeRequest({ 'x-forwarded-for': '10.0.0.1' });
    expect(getIdentifier('general', req)).toBe('10.0.0.1');
  });

  test('general tier falls back to anonymous', () => {
    const req = makeRequest();
    expect(getIdentifier('general', req)).toBe('anonymous');
  });

  test('ai tier prefers userId', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4' });
    expect(getIdentifier('ai', req, 'user-123')).toBe('user-123');
  });
});

describe('rateLimit middleware', () => {
  test('rateLimit returns a middleware function for all tiers', () => {
    const tiers: RateLimitTier[] = ['general', 'ai', 'auth'];
    for (const tier of tiers) {
      const middleware = rateLimit(tier);
      expect(typeof middleware).toBe('function');
    }
  });
});
