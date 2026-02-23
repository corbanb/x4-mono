import type { Database } from '@x4/database';

type QueryResult = Record<string, unknown>[];

interface MockDbConfig {
  select?: QueryResult | QueryResult[];
  insert?: QueryResult;
  update?: QueryResult;
  delete?: QueryResult;
}

/**
 * Creates a proxy-based mock of the Drizzle Database that supports
 * chainable query APIs (select/from/where/etc.) and resolves as a Promise.
 *
 * For `select`, pass an array of result sets — each `select()` call
 * consumes the next result set (needed for `Promise.all()` patterns).
 */
export function createMockDb(config: MockDbConfig = {}): Database {
  let selectCallIndex = 0;
  const selectResults = Array.isArray(config.select?.[0])
    ? (config.select as QueryResult[])
    : config.select
      ? [config.select as QueryResult]
      : [[]];

  function chainable(result: QueryResult): unknown {
    const handler: ProxyHandler<object> = {
      get(_target, prop) {
        if (prop === 'then') {
          return (resolve: (v: unknown) => void) => resolve(result);
        }
        return () => new Proxy({}, handler);
      },
    };
    return new Proxy({}, handler);
  }

  const db = {
    select: (..._args: unknown[]) => {
      const result = selectResults[selectCallIndex] ?? [];
      selectCallIndex++;
      return chainable(result);
    },
    insert: () => chainable(config.insert ?? []),
    update: () => chainable(config.update ?? []),
    delete: () => chainable(config.delete ?? []),
  };

  return db as unknown as Database;
}
