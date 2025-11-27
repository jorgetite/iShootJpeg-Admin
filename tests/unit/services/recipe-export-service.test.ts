/**
 * Unit tests for RecipeExportService
 * Tests recipe export orchestration logic
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { RecipeExportService } from '#/services/recipe-export-service';
import type { ExportOptions } from '#/services/recipe-export-service';
import { suppressConsole } from '../../utils/logger-mocks';
import fs from 'node:fs/promises';

// Mock the filesystem module
vi.mock('node:fs/promises');

// Mock the query and transformer services
vi.mock('#/services/recipe-query-service', () => {
  return {
    RecipeQueryService: vi.fn().mockImplementation(() => ({
      connect: vi.fn().mockResolvedValue(undefined),
      disconnect: vi.fn().mockResolvedValue(undefined),
      fetchRecipes: vi.fn().mockResolvedValue([]),
      fetchRecipeById: vi.fn().mockResolvedValue(null),
      fetchRecipeSettings: vi.fn().mockResolvedValue([]),
      fetchRecipeTags: vi.fn().mockResolvedValue([]),
      fetchRecipeImages: vi.fn().mockResolvedValue([]),
    })),
  };
});

vi.mock('#/services/export-transformer-service', () => {
  return {
    ExportTransformerService: vi.fn().mockImplementation(() => ({
      transformRecipe: vi.fn().mockReturnValue({
        name: 'Test Recipe',
        slug: 'test-recipe',
      }),
    })),
  };
});

describe('RecipeExportService', () => {
  let service: RecipeExportService;
  let mockQueryService: any;
  let mockTransformer: any;
  let consoleSuppress: ReturnType<typeof suppressConsole>;

  beforeEach(() => {
    consoleSuppress = suppressConsole();
    vi.clearAllMocks();

    service = new RecipeExportService('postgres://test');
    mockQueryService = (service as any).queryService;
    mockTransformer = (service as any).transformer;

    // Mock filesystem methods
    vi.mocked(fs.mkdir).mockResolvedValue(undefined as any);
    vi.mocked(fs.writeFile).mockResolvedValue(undefined);
  });

  afterEach(() => {
    consoleSuppress.restore();
  });

  describe('connect/disconnect', () => {
    it('should connect to database via query service', async () => {
      await service.connect();
      expect(mockQueryService.connect).toHaveBeenCalled();
    });

    it('should disconnect from database via query service', async () => {
      await service.disconnect();
      expect(mockQueryService.disconnect).toHaveBeenCalled();
    });
  });

  describe('exportRecipes', () => {
    const exportOptions: ExportOptions = {
      outputPath: '/tmp/test-export.json',
      prettyPrint: true,
      includeMetadata: true,
    };

    it('should export empty recipe list', async () => {
      mockQueryService.fetchRecipes.mockResolvedValueOnce([]);

      const stats = await service.exportRecipes(exportOptions);

      expect(stats.totalRecipes).toBe(0);
      expect(stats.exportedRecipes).toBe(0);
      expect(stats.errors).toBe(0);
      expect(stats.outputFile).toBe(exportOptions.outputPath);
    });

    it('should export single recipe', async () => {
      const rawRecipe = {
        id: 1,
        name: 'Test Recipe',
        slug: 'test-recipe',
      };

      mockQueryService.fetchRecipes.mockResolvedValueOnce([rawRecipe]);
      mockQueryService.fetchRecipeSettings.mockResolvedValueOnce([]);
      mockQueryService.fetchRecipeTags.mockResolvedValueOnce([]);
      mockQueryService.fetchRecipeImages.mockResolvedValueOnce([]);

      const stats = await service.exportRecipes(exportOptions);

      expect(stats.totalRecipes).toBe(1);
      expect(stats.exportedRecipes).toBe(1);
      expect(stats.errors).toBe(0);

      expect(mockQueryService.fetchRecipeSettings).toHaveBeenCalledWith(1);
      expect(mockQueryService.fetchRecipeTags).toHaveBeenCalledWith(1);
      expect(mockQueryService.fetchRecipeImages).toHaveBeenCalledWith(1);
      expect(mockTransformer.transformRecipe).toHaveBeenCalled();
    });

    it('should export multiple recipes', async () => {
      const rawRecipes = [
        { id: 1, name: 'Recipe 1' },
        { id: 2, name: 'Recipe 2' },
        { id: 3, name: 'Recipe 3' },
      ];

      mockQueryService.fetchRecipes.mockResolvedValueOnce(rawRecipes);
      mockQueryService.fetchRecipeSettings.mockResolvedValue([]);
      mockQueryService.fetchRecipeTags.mockResolvedValue([]);
      mockQueryService.fetchRecipeImages.mockResolvedValue([]);

      const stats = await service.exportRecipes(exportOptions);

      expect(stats.totalRecipes).toBe(3);
      expect(stats.exportedRecipes).toBe(3);
      expect(stats.errors).toBe(0);
      expect(mockTransformer.transformRecipe).toHaveBeenCalledTimes(3);
    });

    it('should fetch related data in parallel for each recipe', async () => {
      const rawRecipe = { id: 1, name: 'Test' };
      mockQueryService.fetchRecipes.mockResolvedValueOnce([rawRecipe]);
      mockQueryService.fetchRecipeSettings.mockResolvedValueOnce([{ setting_slug: 'iso' }]);
      mockQueryService.fetchRecipeTags.mockResolvedValueOnce([{ tag_name: 'landscape' }]);
      mockQueryService.fetchRecipeImages.mockResolvedValueOnce([{ image_type: 'sample' }]);

      await service.exportRecipes(exportOptions);

      // Verify all three fetches were called
      expect(mockQueryService.fetchRecipeSettings).toHaveBeenCalledWith(1);
      expect(mockQueryService.fetchRecipeTags).toHaveBeenCalledWith(1);
      expect(mockQueryService.fetchRecipeImages).toHaveBeenCalledWith(1);

      // Verify transformer received the data
      expect(mockTransformer.transformRecipe).toHaveBeenCalledWith(
        rawRecipe,
        [{ setting_slug: 'iso' }],
        [{ tag_name: 'landscape' }],
        [{ image_type: 'sample' }]
      );
    });

    it('should write batch export with metadata', async () => {
      const rawRecipe = { id: 1, name: 'Test' };
      mockQueryService.fetchRecipes.mockResolvedValueOnce([rawRecipe]);
      mockQueryService.fetchRecipeSettings.mockResolvedValueOnce([]);
      mockQueryService.fetchRecipeTags.mockResolvedValueOnce([]);
      mockQueryService.fetchRecipeImages.mockResolvedValueOnce([]);

      await service.exportRecipes(exportOptions);

      expect(fs.writeFile).toHaveBeenCalledWith(
        exportOptions.outputPath,
        expect.stringContaining('"metadata"'),
        'utf-8'
      );

      const writtenData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      expect(writtenData.metadata).toBeDefined();
      expect(writtenData.metadata.version).toBe('1.0');
      expect(writtenData.metadata.totalRecipes).toBe(1);
      expect(writtenData.metadata.exportDate).toBeDefined();
      expect(writtenData.recipes).toHaveLength(1);
    });

    it('should create output directory if it does not exist', async () => {
      mockQueryService.fetchRecipes.mockResolvedValueOnce([]);

      await service.exportRecipes({ outputPath: '/tmp/nested/dir/export.json' });

      expect(fs.mkdir).toHaveBeenCalledWith('/tmp/nested/dir', { recursive: true });
    });

    it('should write pretty-printed JSON when prettyPrint is true', async () => {
      mockQueryService.fetchRecipes.mockResolvedValueOnce([]);

      await service.exportRecipes({ ...exportOptions, prettyPrint: true });

      const writtenJson = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      expect(writtenJson).toContain('\n'); // Pretty printed has newlines
      expect(writtenJson).toContain('  '); // Pretty printed has indentation
    });

    it('should write minified JSON when prettyPrint is false', async () => {
      mockQueryService.fetchRecipes.mockResolvedValueOnce([]);

      await service.exportRecipes({ ...exportOptions, prettyPrint: false });

      const writtenJson = vi.mocked(fs.writeFile).mock.calls[0][1] as string;
      const parsed = JSON.parse(writtenJson);
      expect(JSON.stringify(parsed)).toBe(writtenJson); // Minified JSON
    });

    it('should handle transformation errors for individual recipes', async () => {
      const rawRecipes = [
        { id: 1, name: 'Recipe 1' },
        { id: 2, name: 'Recipe 2' },
        { id: 3, name: 'Recipe 3' },
      ];

      mockQueryService.fetchRecipes.mockResolvedValueOnce(rawRecipes);
      mockQueryService.fetchRecipeSettings.mockResolvedValue([]);
      mockQueryService.fetchRecipeTags.mockResolvedValue([]);
      mockQueryService.fetchRecipeImages.mockResolvedValue([]);

      // Second recipe transformation fails
      mockTransformer.transformRecipe
        .mockReturnValueOnce({ name: 'Recipe 1' })
        .mockImplementationOnce(() => {
          throw new Error('Transform failed');
        })
        .mockReturnValueOnce({ name: 'Recipe 3' });

      const stats = await service.exportRecipes(exportOptions);

      expect(stats.totalRecipes).toBe(3);
      expect(stats.exportedRecipes).toBe(2); // Only 2 succeeded
      expect(stats.errors).toBe(1);
    });

    it('should throw error if database fetch fails', async () => {
      mockQueryService.fetchRecipes.mockRejectedValueOnce(new Error('Database error'));

      await expect(service.exportRecipes(exportOptions)).rejects.toThrow('Database error');
    });
  });

  describe('exportRecipeById', () => {
    const exportOptions: ExportOptions = {
      outputPath: '/tmp/single-recipe.json',
      prettyPrint: true,
    };

    it('should export single recipe by ID', async () => {
      const mockData = {
        recipe: { id: 1, name: 'Test Recipe' },
        settings: [{ setting_slug: 'iso' }],
        tags: [{ tag_name: 'landscape' }],
        images: [{ image_type: 'sample' }],
      };

      mockQueryService.fetchRecipeById.mockResolvedValueOnce(mockData);

      const stats = await service.exportRecipeById(1, exportOptions);

      expect(stats.totalRecipes).toBe(1);
      expect(stats.exportedRecipes).toBe(1);
      expect(stats.errors).toBe(0);

      expect(mockQueryService.fetchRecipeById).toHaveBeenCalledWith(1);
      expect(mockTransformer.transformRecipe).toHaveBeenCalledWith(
        mockData.recipe,
        mockData.settings,
        mockData.tags,
        mockData.images
      );
    });

    it('should write single recipe without metadata wrapper', async () => {
      const mockData = {
        recipe: { id: 1, name: 'Test' },
        settings: [],
        tags: [],
        images: [],
      };

      mockQueryService.fetchRecipeById.mockResolvedValueOnce(mockData);
      mockTransformer.transformRecipe.mockReturnValueOnce({
        name: 'Test Recipe',
        slug: 'test-recipe',
      });

      await service.exportRecipeById(1, exportOptions);

      const writtenData = JSON.parse(vi.mocked(fs.writeFile).mock.calls[0][1] as string);
      expect(writtenData.metadata).toBeUndefined(); // No metadata wrapper
      expect(writtenData.name).toBe('Test Recipe');
      expect(writtenData.slug).toBe('test-recipe');
    });

    it('should throw error if recipe not found', async () => {
      mockQueryService.fetchRecipeById.mockResolvedValueOnce(null);

      await expect(service.exportRecipeById(999, exportOptions)).rejects.toThrow(
        'Recipe with ID 999 not found'
      );

      expect(fs.writeFile).not.toHaveBeenCalled();
    });

    it('should handle transformation errors', async () => {
      const mockData = {
        recipe: { id: 1, name: 'Test' },
        settings: [],
        tags: [],
        images: [],
      };

      mockQueryService.fetchRecipeById.mockResolvedValueOnce(mockData);
      mockTransformer.transformRecipe.mockImplementationOnce(() => {
        throw new Error('Transform failed');
      });

      await expect(service.exportRecipeById(1, exportOptions)).rejects.toThrow('Transform failed');
    });
  });
});
