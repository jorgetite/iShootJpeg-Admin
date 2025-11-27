/**
 * Unit tests for ExportTransformerService
 * Tests transformation of database records to export JSON format
 */

import { describe, it, expect } from 'vitest';
import { ExportTransformerService } from '#/services/export-transformer-service';
import type {
  RawRecipeData,
  RawSettingData,
  RawTagData,
  RawImageData,
} from '#/services/recipe-query-service';

describe('ExportTransformerService', () => {
  let service: ExportTransformerService;

  beforeEach(() => {
    service = new ExportTransformerService();
  });

  describe('transformRecipe', () => {
    it('should transform complete recipe data', () => {
      const rawRecipe: RawRecipeData = {
        recipe_id: 1,
        name: 'Test Recipe',
        slug: 'test-recipe',
        description: 'A test recipe',
        difficulty_level: 'intermediate',
        source_type: 'original',
        source_url: 'https://example.com',
        publish_date: new Date('2024-01-15'),
        view_count: 100,
        is_featured: true,
        style_category_name: 'Color',
        author_name: 'John Doe',
        author_slug: 'john-doe',
        author_bio: 'Photographer',
        author_website_url: 'https://johndoe.com',
        author_social_handle: '@johndoe',
        author_social_platform: 'instagram',
        author_is_verified: true,
        system_name: 'X-Series',
        system_manufacturer: 'Fujifilm',
        sensor_name: 'X-Trans V HR',
        sensor_type: 'X-Trans',
        sensor_megapixels: 40,
        sensor_description: '40.2MP sensor',
        camera_name: 'X-T5',
        camera_release_year: 2022,
        film_sim_name: 'Classic Chrome',
        film_sim_label: 'Classic Chrome',
        film_sim_description: 'Soft tones',
      };

      const rawSettings: RawSettingData[] = [
        {
          setting_id: 1,
          setting_name: 'Dynamic Range',
          setting_slug: 'dynamic-range',
          category_name: 'Image Quality',
          value: 'DR400',
          min_value: null,
          max_value: null,
          notes: 'Use DR400 for high contrast',
          unit: null,
        },
      ];

      const rawTags: RawTagData[] = [
        { tag_id: 1, tag_name: 'Landscape', tag_slug: 'landscape', tag_category: 'subject' },
      ];

      const rawImages: RawImageData[] = [
        {
          image_id: 'img-1',
          image_type: 'sample',
          thumb_url: 'https://example.com/thumb.jpg',
          full_url: 'https://example.com/full.jpg',
          width: 1920,
          height: 1080,
          alt_text: 'Sample image',
          caption: 'A beautiful landscape',
          sort_order: 1,
        },
      ];

      const result = service.transformRecipe(rawRecipe, rawSettings, rawTags, rawImages);

      expect(result.name).toBe('Test Recipe');
      expect(result.slug).toBe('test-recipe');
      expect(result.description).toBe('A test recipe');
      expect(result.difficultyLevel).toBe('intermediate');
      expect(result.isFeatured).toBe(true);
      expect(result.viewCount).toBe(100);
    });

    it('should transform author info', () => {
      const rawRecipe: RawRecipeData = {
        recipe_id: 1,
        name: 'Test',
        slug: 'test',
        description: null,
        difficulty_level: null,
        source_type: null,
        source_url: null,
        publish_date: null,
        view_count: 0,
        is_featured: false,
        style_category_name: null,
        author_name: 'Jane Smith',
        author_slug: 'jane-smith',
        author_bio: 'Street photographer',
        author_website_url: 'https://jane.com',
        author_social_handle: '@janesmith',
        author_social_platform: 'twitter',
        author_is_verified: false,
        system_name: 'X-Series',
        system_manufacturer: 'Fujifilm',
        sensor_name: null,
        sensor_type: null,
        sensor_megapixels: null,
        sensor_description: null,
        camera_name: null,
        camera_release_year: null,
        film_sim_name: 'Velvia',
        film_sim_label: 'Velvia',
        film_sim_description: null,
      };

      const result = service.transformRecipe(rawRecipe, [], [], []);

      expect(result.author).toEqual({
        name: 'Jane Smith',
        slug: 'jane-smith',
        bio: 'Street photographer',
        websiteUrl: 'https://jane.com',
        socialHandle: '@janesmith',
        socialPlatform: 'twitter',
        isVerified: false,
      });
    });

    it('should transform system info with sensor and camera', () => {
      const rawRecipe: RawRecipeData = {
        recipe_id: 1,
        name: 'Test',
        slug: 'test',
        description: null,
        difficulty_level: null,
        source_type: null,
        source_url: null,
        publish_date: null,
        view_count: 0,
        is_featured: false,
        style_category_name: null,
        author_name: 'Test',
        author_slug: 'test',
        author_bio: null,
        author_website_url: null,
        author_social_handle: null,
        author_social_platform: null,
        author_is_verified: false,
        system_name: 'X-Series',
        system_manufacturer: 'Fujifilm',
        sensor_name: 'X-Trans IV',
        sensor_type: 'X-Trans',
        sensor_megapixels: 26,
        sensor_description: '26.1MP sensor',
        camera_name: 'X-T4',
        camera_release_year: 2020,
        film_sim_name: 'Provia',
        film_sim_label: 'Provia',
        film_sim_description: null,
      };

      const result = service.transformRecipe(rawRecipe, [], [], []);

      expect(result.system).toEqual({
        name: 'X-Series',
        manufacturer: 'Fujifilm',
        sensor: {
          name: 'X-Trans IV',
          type: 'X-Trans',
          megapixels: 26,
          description: '26.1MP sensor',
        },
        camera: {
          name: 'X-T4',
          releaseYear: 2020,
        },
      });
    });

    it('should handle null sensor and camera', () => {
      const rawRecipe: RawRecipeData = {
        recipe_id: 1,
        name: 'Test',
        slug: 'test',
        description: null,
        difficulty_level: null,
        source_type: null,
        source_url: null,
        publish_date: null,
        view_count: 0,
        is_featured: false,
        style_category_name: null,
        author_name: 'Test',
        author_slug: 'test',
        author_bio: null,
        author_website_url: null,
        author_social_handle: null,
        author_social_platform: null,
        author_is_verified: false,
        system_name: 'X-Series',
        system_manufacturer: 'Fujifilm',
        sensor_name: null,
        sensor_type: null,
        sensor_megapixels: null,
        sensor_description: null,
        camera_name: null,
        camera_release_year: null,
        film_sim_name: 'Acros',
        film_sim_label: 'Acros',
        film_sim_description: null,
      };

      const result = service.transformRecipe(rawRecipe, [], [], []);

      expect(result.system.sensor).toBeNull();
      expect(result.system.camera).toBeNull();
    });

    it('should transform film simulation', () => {
      const rawRecipe: RawRecipeData = {
        recipe_id: 1,
        name: 'Test',
        slug: 'test',
        description: null,
        difficulty_level: null,
        source_type: null,
        source_url: null,
        publish_date: null,
        view_count: 0,
        is_featured: false,
        style_category_name: null,
        author_name: 'Test',
        author_slug: 'test',
        author_bio: null,
        author_website_url: null,
        author_social_handle: null,
        author_social_platform: null,
        author_is_verified: false,
        system_name: 'X-Series',
        system_manufacturer: 'Fujifilm',
        sensor_name: null,
        sensor_type: null,
        sensor_megapixels: null,
        sensor_description: null,
        camera_name: null,
        camera_release_year: null,
        film_sim_name: 'Classic Negative',
        film_sim_label: 'Classic Neg.',
        film_sim_description: 'Rich colors with subdued contrast',
      };

      const result = service.transformRecipe(rawRecipe, [], [], []);

      expect(result.filmSimulation).toEqual({
        name: 'Classic Negative',
        label: 'Classic Neg.',
        description: 'Rich colors with subdued contrast',
      });
    });
  });

  describe('transformSettings', () => {
    it('should organize settings by slug', () => {
      const rawSettings: RawSettingData[] = [
        {
          setting_id: 1,
          setting_name: 'Dynamic Range',
          setting_slug: 'dynamic-range',
          category_name: 'Image Quality',
          value: 'DR400',
          min_value: null,
          max_value: null,
          notes: null,
          unit: null,
        },
        {
          setting_id: 2,
          setting_name: 'Grain Effect',
          setting_slug: 'grain-effect',
          category_name: 'Image Quality',
          value: 'Strong',
          min_value: null,
          max_value: null,
          notes: 'For vintage look',
          unit: null,
        },
      ];

      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, rawSettings, [], []);

      expect(result.settings['dynamic-range']).toEqual({
        name: 'Dynamic Range',
        category: 'Image Quality',
        value: 'DR400',
        notes: '',
      });

      expect(result.settings['grain-effect']).toEqual({
        name: 'Grain Effect',
        category: 'Image Quality',
        value: 'Strong',
        notes: 'For vintage look',
      });
    });

    it('should handle range-based settings', () => {
      const rawSettings: RawSettingData[] = [
        {
          setting_id: 1,
          setting_name: 'ISO',
          setting_slug: 'iso',
          category_name: 'Exposure',
          value: null,
          min_value: '400',
          max_value: '1600',
          notes: 'Auto ISO range',
          unit: null,
        },
      ];

      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, rawSettings, [], []);

      expect(result.settings['iso']).toEqual({
        name: 'ISO',
        category: 'Exposure',
        range: {
          min: '400',
          max: '1600',
        },
        notes: 'Auto ISO range',
      });
    });

    it('should include unit if present', () => {
      const rawSettings: RawSettingData[] = [
        {
          setting_id: 1,
          setting_name: 'White Balance',
          setting_slug: 'white-balance',
          category_name: 'Color',
          value: '5500',
          min_value: null,
          max_value: null,
          notes: null,
          unit: 'K',
        },
      ];

      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, rawSettings, [], []);

      expect(result.settings['white-balance']).toEqual({
        name: 'White Balance',
        category: 'Color',
        value: '5500',
        unit: 'K',
        notes: '',
      });
    });

    it('should handle empty settings array', () => {
      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, [], [], []);

      expect(result.settings).toEqual({});
    });
  });

  describe('transformTags', () => {
    it('should transform tags array', () => {
      const rawTags: RawTagData[] = [
        { tag_id: 1, tag_name: 'Landscape', tag_slug: 'landscape', tag_category: 'subject' },
        { tag_id: 2, tag_name: 'Moody', tag_slug: 'moody', tag_category: 'mood' },
      ];

      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, [], rawTags, []);

      expect(result.tags).toHaveLength(2);
      expect(result.tags[0]).toEqual({ name: 'Landscape', slug: 'landscape', category: 'subject' });
      expect(result.tags[1]).toEqual({ name: 'Moody', slug: 'moody', category: 'mood' });
    });

    it('should handle empty tags array', () => {
      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, [], [], []);

      expect(result.tags).toEqual([]);
    });
  });

  describe('transformImages', () => {
    it('should transform images array', () => {
      const rawImages: RawImageData[] = [
        {
          image_id: 'img-1',
          image_type: 'thumbnail',
          thumb_url: 'https://example.com/thumb1.jpg',
          full_url: 'https://example.com/full1.jpg',
          width: 400,
          height: 300,
          alt_text: 'Thumbnail',
          caption: null,
          sort_order: 1,
        },
        {
          image_id: 'img-2',
          image_type: 'sample',
          thumb_url: 'https://example.com/thumb2.jpg',
          full_url: 'https://example.com/full2.jpg',
          width: 1920,
          height: 1080,
          alt_text: 'Sample image',
          caption: 'Beautiful shot',
          sort_order: 2,
        },
      ];

      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, [], [], rawImages);

      expect(result.images).toHaveLength(2);
      expect(result.images[0]).toEqual({
        type: 'thumbnail',
        thumbUrl: 'https://example.com/thumb1.jpg',
        fullUrl: 'https://example.com/full1.jpg',
        width: 400,
        height: 300,
        altText: 'Thumbnail',
        caption: null,
        sortOrder: 1,
      });
    });

    it('should handle empty images array', () => {
      const rawRecipe = createMinimalRawRecipe();
      const result = service.transformRecipe(rawRecipe, [], [], []);

      expect(result.images).toEqual([]);
    });
  });
});

// Helper function to create minimal raw recipe data
function createMinimalRawRecipe(): RawRecipeData {
  return {
    recipe_id: 1,
    name: 'Test Recipe',
    slug: 'test-recipe',
    description: null,
    difficulty_level: null,
    source_type: null,
    source_url: null,
    publish_date: null,
    view_count: 0,
    is_featured: false,
    style_category_name: null,
    author_name: 'Test Author',
    author_slug: 'test-author',
    author_bio: null,
    author_website_url: null,
    author_social_handle: null,
    author_social_platform: null,
    author_is_verified: false,
    system_name: 'X-Series',
    system_manufacturer: 'Fujifilm',
    sensor_name: null,
    sensor_type: null,
    sensor_megapixels: null,
    sensor_description: null,
    camera_name: null,
    camera_release_year: null,
    film_sim_name: 'Provia',
    film_sim_label: 'Provia',
    film_sim_description: null,
  };
}
