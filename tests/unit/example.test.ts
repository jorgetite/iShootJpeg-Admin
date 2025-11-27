/**
 * Example test to verify Vitest setup
 * This demonstrates the test infrastructure is working correctly
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createMockRecipe, createMockAuthor } from '../utils/mock-factories';
import { randomString, createSlug } from '../utils/test-helpers';
import { suppressConsole } from '../utils/logger-mocks';

describe('Test Infrastructure', () => {
  describe('Mock Factories', () => {
    it('should create mock recipe with default values', () => {
      const recipe = createMockRecipe();

      expect(recipe).toBeDefined();
      expect(recipe.id).toBeGreaterThan(0);
      expect(recipe.name).toBeTruthy();
      expect(recipe.slug).toBeTruthy();
      expect(recipe.is_active).toBe(true);
    });

    it('should create mock recipe with custom values', () => {
      const recipe = createMockRecipe({
        name: 'Custom Recipe',
        slug: 'custom-recipe',
        difficulty_level: 'advanced',
      });

      expect(recipe.name).toBe('Custom Recipe');
      expect(recipe.slug).toBe('custom-recipe');
      expect(recipe.difficulty_level).toBe('advanced');
    });

    it('should create mock author', () => {
      const author = createMockAuthor({
        name: 'Test Author',
        is_verified: true,
      });

      expect(author.name).toBe('Test Author');
      expect(author.slug).toBe('test-author');
      expect(author.is_verified).toBe(true);
    });
  });

  describe('Test Helpers', () => {
    it('should generate random string', () => {
      const str1 = randomString(10);
      const str2 = randomString(10);

      expect(str1).toHaveLength(10);
      expect(str2).toHaveLength(10);
      expect(str1).not.toBe(str2); // Should be random
    });

    it('should create slug from text', () => {
      expect(createSlug('Hello World')).toBe('hello-world');
      expect(createSlug('Test Recipe 123')).toBe('test-recipe-123');
      expect(createSlug('  Spaces   Around  ')).toBe('spaces-around');
      expect(createSlug('Special!@#$%Characters')).toBe('special-characters');
    });
  });

  describe('Logger Mocks', () => {
    it('should suppress console output', () => {
      const { restore } = suppressConsole();

      console.log('This should be suppressed');
      console.error('This should also be suppressed');

      expect(console.log).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalled();

      restore();
    });
  });

  describe('Vitest Features', () => {
    let counter: number;

    beforeEach(() => {
      counter = 0;
    });

    it('should run beforeEach hook', () => {
      expect(counter).toBe(0);
      counter++;
      expect(counter).toBe(1);
    });

    it('should reset state between tests', () => {
      expect(counter).toBe(0);
    });

    it('should support async tests', async () => {
      const promise = Promise.resolve(42);
      const result = await promise;
      expect(result).toBe(42);
    });

    it('should support mock functions', () => {
      const mockFn = vi.fn((x: number) => x * 2);

      const result = mockFn(5);

      expect(result).toBe(10);
      expect(mockFn).toHaveBeenCalledWith(5);
      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });
});
