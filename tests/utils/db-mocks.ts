/**
 * Database mocks for testing
 * Provides mock implementations of pg Pool, Client, and QueryResult
 */

import { vi } from 'vitest';
import type { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

/**
 * Create a mock QueryResult
 */
export function createMockQueryResult<T extends QueryResultRow = any>(
  rows: T[] = [],
  rowCount: number | null = null,
  command = 'SELECT'
): QueryResult<T> {
  return {
    rows,
    rowCount: rowCount ?? rows.length,
    command,
    oid: 0,
    fields: [],
  };
}

/**
 * Create a mock PoolClient
 */
export function createMockPoolClient(
  queryResults: QueryResult[] = []
): Partial<PoolClient> {
  let queryCallCount = 0;

  return {
    query: vi.fn().mockImplementation((text: string, values?: any[]) => {
      const result = queryResults[queryCallCount] || createMockQueryResult([]);
      queryCallCount++;
      return Promise.resolve(result);
    }),
    release: vi.fn(),
  };
}

/**
 * Create a mock Pool
 */
export function createMockPool(
  queryResults: QueryResult[] = [],
  clientMock?: Partial<PoolClient>
): Partial<Pool> {
  const client = clientMock || createMockPoolClient(queryResults);

  return {
    query: vi.fn().mockImplementation((text: string, values?: any[]) => {
      const result = queryResults.length > 0
        ? queryResults.shift()
        : createMockQueryResult([]);
      return Promise.resolve(result);
    }),
    connect: vi.fn().mockResolvedValue(client),
    end: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  };
}

/**
 * Create a mock DatabaseService
 */
export function createMockDatabaseService() {
  return {
    connect: vi.fn().mockResolvedValue(undefined),
    disconnect: vi.fn().mockResolvedValue(undefined),
    getClient: vi.fn().mockResolvedValue(createMockPoolClient()),
    getAll: vi.fn().mockResolvedValue([]),
    getById: vi.fn().mockResolvedValue(null),
    create: vi.fn().mockResolvedValue({}),
    update: vi.fn().mockResolvedValue({}),
    delete: vi.fn().mockResolvedValue(true),
    query: vi.fn().mockResolvedValue(createMockQueryResult([])),
  };
}

/**
 * Mock transaction helpers
 */
export function createMockTransaction() {
  const client = createMockPoolClient();

  return {
    client,
    begin: vi.fn().mockResolvedValue(undefined),
    commit: vi.fn().mockResolvedValue(undefined),
    rollback: vi.fn().mockResolvedValue(undefined),
  };
}
