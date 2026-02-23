import { describe, test, expect } from 'bun:test';
import { logger, aiLogger, dbLogger, authLogger } from '../lib/logger';

describe('Logger', () => {
  test('root logger is defined', () => {
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  test('logger level is silent in test environment', () => {
    expect(logger.level).toBe('silent');
  });
});

describe('Child loggers', () => {
  test('aiLogger is defined with module field', () => {
    expect(aiLogger).toBeDefined();
    expect(typeof aiLogger.info).toBe('function');
  });

  test('dbLogger is defined with module field', () => {
    expect(dbLogger).toBeDefined();
    expect(typeof dbLogger.info).toBe('function');
  });

  test('authLogger is defined with module field', () => {
    expect(authLogger).toBeDefined();
    expect(typeof authLogger.info).toBe('function');
  });
});
