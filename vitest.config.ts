import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Test file patterns
    include: ['tests/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: ['node_modules', '.nuxt', 'dist', 'tests/fixtures/**'],

    // Global test setup/teardown
    setupFiles: ['./tests/setup/vitest-setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        '.nuxt/**',
        'dist/**',
        'tests/**',
        '**/*.config.{js,ts}',
        '**/types/**',
        'src/core/db/**', // SQL files and DB schema
        'src/cli/**', // CLI tools (can be tested separately if needed)
      ],
      // Coverage thresholds
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80,
      },
    },

    // Test timeout (in ms)
    testTimeout: 10000,

    // Allow global test APIs (describe, it, expect, etc.) without imports
    globals: true,

    // Silent console output during tests (can be overridden per test)
    silent: false,

    // Reporter configuration
    reporters: ['verbose'],

    // Pool options for test execution
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
      },
    },
  },

  // Path aliases matching tsconfig.json
  resolve: {
    alias: {
      '~': resolve(__dirname, './src/web'),
      '@': resolve(__dirname, './src/web'),
      '#': resolve(__dirname, './src/core'),
    },
  },
});
