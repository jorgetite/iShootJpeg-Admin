/**
 * Global Vitest setup file
 * Runs before all test files
 */

import { beforeAll, afterAll, beforeEach, afterEach } from 'vitest';

// Global test setup
beforeAll(() => {
  // Set test environment variables
  process.env.NODE_ENV = 'test';

  // Suppress console logs during tests (optional - can be commented out for debugging)
  // console.log = vi.fn();
  // console.error = vi.fn();
  // console.warn = vi.fn();
});

// Global test teardown
afterAll(() => {
  // Cleanup any global resources if needed
});

// Run before each test
beforeEach(() => {
  // Reset mocks before each test
  // vi.clearAllMocks();
});

// Run after each test
afterEach(() => {
  // Cleanup after each test
  // vi.restoreAllMocks();
});
