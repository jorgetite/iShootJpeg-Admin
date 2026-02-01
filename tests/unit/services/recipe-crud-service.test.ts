/**
 * Unit tests for RecipeCrudService
 * Tests recipe CRUD operations with transactions
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RecipeCrudService } from '#/services/recipe-crud-service';
import { createMockPoolClient } from '../../utils/db-mocks';
import { suppressConsole } from '../../utils/logger-mocks';

// Mock DatabaseService
vi.mock('#/services/database-service', () => {
  return {
    DatabaseService: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      getClient: vi.fn(),
      delete: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('RecipeCrudService', () => {
  let service: RecipeCrudService;
  let mockDb: any;
  let mockClient: any;
  let consoleSuppress: ReturnType<typeof suppressConsole>;

  beforeEach(() => {
    consoleSuppress = suppressConsole();
    vi.clearAllMocks();

    service = new RecipeCrudService('postgres://test');
    mockDb = (service as any).db;

    // Create mock client
    mockClient = createMockPoolClient();
    mockDb.getClient.mockResolvedValue(mockClient);

    // Default query implementations
    mockClient.query.mockImplementation((sql: string | { text: string }, params?: any[]) => {
      const queryText = typeof sql === 'string' ? sql : sql.text;

      if (queryText === 'BEGIN' || queryText === 'COMMIT' || queryText === 'ROLLBACK') {
        return Promise.resolve();
      }

      // Default: return empty result
      return Promise.resolve({ rows: [] });
    });
  });

  afterEach(() => {
    consoleSuppress.restore();
  });

  describe('connect/disconnect', () => {
    it('should connect via database service', async () => {
      await service.connect();
      expect(mockDb.connect).toHaveBeenCalled();
    });

    it('should disconnect via database service', async () => {
      await service.disconnect();
      expect(mockDb.disconnect).toHaveBeenCalled();
    });
  });

  describe('createRecipe', () => {
    const recipeInput = {
      name: 'Test Recipe',
      slug: 'test-recipe',
      author_id: 1,
      system_id: 1,
      film_simulation_id: 1,
      description: 'A test recipe',
      difficulty_level: 'intermediate' as const,
      source_type: 'original' as const,
    };

    beforeEach(() => {
      mockClient.query.mockImplementation((sql: string, params?: any[]) => {
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
          return Promise.resolve();
        }

        // Check for unique slug
        if (sql.includes('SELECT COUNT(*) FROM recipes WHERE slug')) {
          return Promise.resolve({ rows: [{ count: '0' }] });
        }

        // Insert recipe
        if (sql.includes('INSERT INTO recipes')) {
          return Promise.resolve({
            rows: [{
              id: 1,
              name: params?.[0],
              slug: params?.[1],
              author_id: params?.[2],
              system_id: params?.[3],
              created_at: new Date(),
              updated_at: new Date(),
            }],
          });
        }

        // Insert settings/ranges/tags
        if (sql.includes('INSERT INTO recipe_setting_values')) {
          return Promise.resolve({ rows: [] });
        }
        if (sql.includes('INSERT INTO recipe_setting_ranges')) {
          return Promise.resolve({ rows: [] });
        }
        if (sql.includes('INSERT INTO recipe_tags')) {
          return Promise.resolve({ rows: [] });
        }

        return Promise.resolve({ rows: [] });
      });
    });

    it('should create a recipe with basic fields', async () => {
      const recipe = await service.createRecipe(recipeInput);

      expect(recipe).toBeDefined();
      expect(recipe.id).toBe(1);
      expect(recipe.name).toBe('Test Recipe');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should use transaction for recipe creation', async () => {
      await service.createRecipe(recipeInput);

      const calls = mockClient.query.mock.calls.map((call: any[]) => call[0]);
      const beginIndex = calls.indexOf('BEGIN');
      const commitIndex = calls.indexOf('COMMIT');

      expect(beginIndex).toBeGreaterThanOrEqual(0);
      expect(commitIndex).toBeGreaterThan(beginIndex);
    });

    it('should insert recipe with all provided fields', async () => {
      await service.createRecipe(recipeInput);

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO recipes')
      );

      expect(insertCall).toBeDefined();
      expect(insertCall[1]).toContain('Test Recipe');
      expect(insertCall[1]).toContain('test-recipe');
      expect(insertCall[1]).toContain(1); // author_id
    });

    it('should create recipe with settings', async () => {
      const inputWithSettings = {
        ...recipeInput,
        settings: [
          { setting_definition_id: 1, value: 'DR400', notes: null },
          { setting_definition_id: 2, value: 'Strong', notes: 'For grain' },
        ],
      };

      await service.createRecipe(inputWithSettings);

      const settingCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO recipe_setting_values')
      );

      expect(settingCalls.length).toBeGreaterThan(0);
    });

    it('should create recipe with ranges', async () => {
      const inputWithRanges = {
        ...recipeInput,
        ranges: [
          { setting_definition_id: 3, min_value: '400', max_value: '1600' },
        ],
      };

      await service.createRecipe(inputWithRanges);

      const rangeCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO recipe_setting_ranges')
      );

      expect(rangeCalls.length).toBeGreaterThan(0);
    });

    it('should create recipe with tags', async () => {
      const inputWithTags = {
        ...recipeInput,
        tag_ids: [1, 2, 3],
      };

      await service.createRecipe(inputWithTags);

      const tagCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO recipe_tags')
      );

      expect(tagCalls.length).toBeGreaterThan(0);
    });

    it('should rollback on error', async () => {
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN' || sql === 'ROLLBACK') {
          return Promise.resolve();
        }
        if (sql.includes('INSERT INTO recipes')) {
          throw new Error('Database error');
        }
        if (sql.includes('SELECT COUNT(*) FROM recipes')) {
          return Promise.resolve({ rows: [{ count: '0' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(service.createRecipe(recipeInput)).rejects.toThrow('Database error');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should ensure unique slug by appending suffix if needed', async () => {
      let slugCheckCount = 0;

      mockClient.query.mockImplementation((sql: string, params?: any[]) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return Promise.resolve();

        // Simulate slug already exists on first check
        if (sql.includes('SELECT id, author_id FROM recipes WHERE slug')) {
          slugCheckCount++;
          if (slugCheckCount === 1) {
            return Promise.resolve({ rows: [{ id: 1, author_id: 999 }] }); // Exists, different author
          }
          return Promise.resolve({ rows: [] }); // Doesn't exist
        }

        if (sql.includes('INSERT INTO recipes')) {
          return Promise.resolve({
            rows: [{
              id: 1,
              name: 'Test Recipe',
              slug: params?.[1], // Use the generated slug
              created_at: new Date(),
              updated_at: new Date(),
            }],
          });
        }

        return Promise.resolve({ rows: [] });
      });

      const recipe = await service.createRecipe(recipeInput);

      // Should have checked slug more than once
      expect(slugCheckCount).toBeGreaterThanOrEqual(1);
      // Slug should have a suffix
      expect(recipe.slug).toMatch(/test-recipe-\d+/);
    });
  });

  describe('updateRecipe', () => {
    const updateInput = {
      name: 'Updated Recipe',
      description: 'Updated description',
    };

    beforeEach(() => {
      mockClient.query.mockImplementation((sql: string, params?: any[]) => {
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
          return Promise.resolve();
        }

        // Get existing recipe
        if (sql.includes('SELECT * FROM recipes WHERE id')) {
          return Promise.resolve({
            rows: [{
              id: 1,
              name: 'Updated Recipe',
              slug: 'original-recipe',
              author_id: 1,
              system_id: 1,
              film_simulation_id: 1,
            }],
          });
        }

        // Update recipe
        if (sql.includes('UPDATE recipes')) {
          return Promise.resolve({
            rows: [{
              id: 1,
              name: 'Updated Recipe',
              slug: 'original-recipe',
              updated_at: new Date(),
            }],
          });
        }

        // Delete and re-insert settings/tags
        if (sql.includes('DELETE FROM recipe_setting_values')) {
          return Promise.resolve({ rows: [] });
        }
        if (sql.includes('DELETE FROM recipe_setting_ranges')) {
          return Promise.resolve({ rows: [] });
        }
        if (sql.includes('DELETE FROM recipe_tags')) {
          return Promise.resolve({ rows: [] });
        }

        return Promise.resolve({ rows: [] });
      });
    });

    it('should update recipe fields', async () => {
      const recipe = await service.updateRecipe(1, updateInput);

      expect(recipe).toBeDefined();
      expect(recipe.name).toBe('Updated Recipe');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should use transaction for update', async () => {
      await service.updateRecipe(1, updateInput);

      const calls = mockClient.query.mock.calls.map((call: any[]) => call[0]);
      expect(calls).toContain('BEGIN');
      expect(calls).toContain('COMMIT');
    });

    it('should verify recipe exists before updating', async () => {
      await service.updateRecipe(1, updateInput);

      const selectCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('SELECT * FROM recipes WHERE id')
      );
      expect(selectCall).toBeDefined();
      expect(selectCall[1]).toContain(1);
    });

    it('should throw error if recipe not found', async () => {
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN' || sql === 'ROLLBACK') return Promise.resolve();
        if (sql.includes('SELECT * FROM recipes WHERE id')) {
          return Promise.resolve({ rows: [] }); // Not found
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(service.updateRecipe(999, updateInput)).rejects.toThrow();
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });

    it('should rollback on error', async () => {
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN' || sql === 'ROLLBACK') return Promise.resolve();
        if (sql.includes('SELECT * FROM recipes')) {
          return Promise.resolve({ rows: [{ id: 1, name: 'Test' }] });
        }
        if (sql.includes('UPDATE recipes')) {
          throw new Error('Update failed');
        }
        return Promise.resolve({ rows: [] });
      });

      await expect(service.updateRecipe(1, updateInput)).rejects.toThrow('Update failed');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  describe('deleteRecipe', () => {
    beforeEach(() => {
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT' || sql === 'ROLLBACK') {
          return Promise.resolve();
        }

        // Soft delete (update is_active)
        if (sql.includes('UPDATE recipes SET is_active')) {
          return Promise.resolve({
            rows: [{ id: 1 }],
          });
        }

        return Promise.resolve({ rows: [] });
      });
    });

    it('should soft delete recipe', async () => {
      await service.deleteRecipe(1);
      expect(mockDb.delete).toHaveBeenCalledWith('recipes', 1, true);
    });

    it('should throw error if delete fails', async () => {
      mockDb.delete.mockRejectedValue(new Error('Delete failed'));
      await expect(service.deleteRecipe(1)).rejects.toThrow('Delete failed');
    });
  });
  describe('searchRecipes', () => {
    it('should not filter by is_active by default', async () => {
      mockClient.query.mockImplementation((sql: string | { text: string }) => {
        const queryText = typeof sql === 'string' ? sql : sql.text;
        if (queryText.includes('COUNT(*)')) {
          return Promise.resolve({ rows: [{ count: '10' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      await service.searchRecipes({});

      const call = mockClient.query.mock.calls.find((args: any[]) =>
        typeof args[0] === 'string' && args[0].includes('SELECT * FROM recipes')
      );

      expect(call).toBeDefined();
      const sql = call[0];
      expect(sql).not.toContain('is_active = true');
    });
  });

  describe('searchRecipesWithDetails', () => {
    it('should not filter by is_active by default', async () => {
      mockClient.query.mockImplementation((sql: string | { text: string }) => {
        const queryText = typeof sql === 'string' ? sql : sql.text;
        if (queryText.includes('COUNT(*)')) {
          return Promise.resolve({ rows: [{ count: '10' }] });
        }
        return Promise.resolve({ rows: [] });
      });

      await service.searchRecipesWithDetails({});

      const call = mockClient.query.mock.calls.find((args: any[]) =>
        typeof args[0] === 'string' && args[0].includes('LEFT JOIN authors a')
      );

      expect(call).toBeDefined();
      const sql = call[0];
      expect(sql).not.toContain('r.is_active = true');
    });
  });
});
