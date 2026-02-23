import { describe, test, expect } from 'bun:test';
import { SystemPrompts } from '../prompts/system';

describe('SystemPrompts', () => {
  test('CUSTOMER_SUPPORT is defined', () => {
    expect(SystemPrompts.CUSTOMER_SUPPORT).toBeDefined();
    expect(typeof SystemPrompts.CUSTOMER_SUPPORT).toBe('string');
    expect(SystemPrompts.CUSTOMER_SUPPORT.length).toBeGreaterThan(0);
  });

  test('CONTENT_GENERATION is defined', () => {
    expect(SystemPrompts.CONTENT_GENERATION).toBeDefined();
    expect(typeof SystemPrompts.CONTENT_GENERATION).toBe('string');
  });

  test('CODE_REVIEW is defined', () => {
    expect(SystemPrompts.CODE_REVIEW).toBeDefined();
    expect(typeof SystemPrompts.CODE_REVIEW).toBe('string');
  });

  test('DATA_ANALYSIS is defined', () => {
    expect(SystemPrompts.DATA_ANALYSIS).toBeDefined();
    expect(typeof SystemPrompts.DATA_ANALYSIS).toBe('string');
  });

  test('SUMMARIZATION is defined', () => {
    expect(SystemPrompts.SUMMARIZATION).toBeDefined();
    expect(typeof SystemPrompts.SUMMARIZATION).toBe('string');
  });

  test('has exactly 5 prompt categories', () => {
    expect(Object.keys(SystemPrompts)).toHaveLength(5);
  });
});
