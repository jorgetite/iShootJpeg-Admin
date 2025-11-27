/**
 * Logger mocks for testing
 * Provides utilities to suppress or capture console output during tests
 */

import { vi } from 'vitest';

/**
 * Suppress all console output
 * Useful for keeping test output clean
 */
export function suppressConsole() {
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  const originalInfo = console.info;

  console.log = vi.fn();
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();

  return {
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
      console.info = originalInfo;
    },
  };
}

/**
 * Capture console output for assertions
 * Returns captured logs that can be inspected in tests
 */
export function captureConsole() {
  const logs: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;

  console.log = vi.fn((...args) => {
    logs.push(args.map(String).join(' '));
  });

  console.error = vi.fn((...args) => {
    errors.push(args.map(String).join(' '));
  });

  console.warn = vi.fn((...args) => {
    warnings.push(args.map(String).join(' '));
  });

  return {
    logs,
    errors,
    warnings,
    restore: () => {
      console.log = originalLog;
      console.error = originalError;
      console.warn = originalWarn;
    },
    clear: () => {
      logs.length = 0;
      errors.length = 0;
      warnings.length = 0;
    },
  };
}

/**
 * Parse structured JSON logs
 * Many services log JSON, this helper parses and validates them
 */
export function parseJsonLogs(logs: string[]): any[] {
  return logs.map((log) => {
    try {
      return JSON.parse(log);
    } catch {
      return null;
    }
  }).filter(Boolean);
}

/**
 * Assert that a structured log was emitted
 */
export function assertLogContains(
  logs: string[],
  expected: Partial<Record<string, any>>
): boolean {
  const parsedLogs = parseJsonLogs(logs);

  return parsedLogs.some((log) => {
    return Object.entries(expected).every(([key, value]) => {
      return log[key] === value;
    });
  });
}
