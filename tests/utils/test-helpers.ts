/**
 * General test helpers and utilities
 */

/**
 * Wait for a specified number of milliseconds
 * Useful for testing async operations
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a random string for testing
 */
export function randomString(length: number = 10): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number = 0, max: number = 100): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Create a slug from a string
 * Matches the slug creation logic used in the app
 */
export function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Deep clone an object
 */
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Assert that an object matches a partial shape
 */
export function matchesPartial<T extends Record<string, any>>(
  obj: T,
  partial: Partial<T>
): boolean {
  return Object.entries(partial).every(([key, value]) => {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return matchesPartial(obj[key], value);
    }
    return obj[key] === value;
  });
}

/**
 * Create a date string in ISO format
 */
export function createISODate(daysOffset: number = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString();
}

/**
 * Mock environment variables
 */
export function mockEnv(vars: Record<string, string>) {
  const original = { ...process.env };

  Object.assign(process.env, vars);

  return {
    restore: () => {
      process.env = original;
    },
  };
}
