/**
 * Sample test data fixtures
 * Reusable test data for various test scenarios
 */

import type {
  Author,
  CameraSystem,
  FilmSimulation,
  Recipe,
  RecipeSettingValue,
  Sensor,
  SettingDefinition,
} from '#/types/database';

/**
 * Sample Camera Systems
 */
export const SAMPLE_CAMERA_SYSTEMS: CameraSystem[] = [
  {
    id: 1,
    name: 'X-Series',
    manufacturer: 'Fujifilm',
    is_active: true,
    created_at: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'GFX',
    manufacturer: 'Fujifilm',
    is_active: true,
    created_at: new Date('2024-01-01'),
  },
];

/**
 * Sample Sensors
 */
export const SAMPLE_SENSORS: Sensor[] = [
  {
    id: 1,
    name: 'X-Trans V HR',
    type: 'X-Trans',
    megapixels: 40,
    description: '40.2MP X-Trans CMOS 5 HR sensor',
    created_at: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'X-Trans IV',
    type: 'X-Trans',
    megapixels: 26,
    description: '26.1MP X-Trans CMOS 4 sensor',
    created_at: new Date('2024-01-01'),
  },
];

/**
 * Sample Film Simulations
 */
export const SAMPLE_FILM_SIMULATIONS: FilmSimulation[] = [
  {
    id: 1,
    name: 'Classic Chrome',
    system_id: 1,
    label: 'Classic Chrome',
    description: 'Soft tones with deep colors',
    is_active: true,
    created_at: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Velvia',
    system_id: 1,
    label: 'Velvia',
    description: 'Vivid colors for landscapes',
    is_active: true,
    created_at: new Date('2024-01-01'),
  },
  {
    id: 3,
    name: 'Acros',
    system_id: 1,
    label: 'Acros',
    description: 'Fine-grain black and white',
    is_active: true,
    created_at: new Date('2024-01-01'),
  },
];

/**
 * Sample Authors
 */
export const SAMPLE_AUTHORS: Author[] = [
  {
    id: 1,
    name: 'John Doe',
    slug: 'john-doe',
    bio: 'Professional landscape photographer',
    website_url: 'https://johndoe.com',
    social_handle: '@johndoe',
    social_platform: 'instagram',
    is_verified: true,
    created_at: new Date('2024-01-01'),
    updated_at: new Date('2024-01-01'),
  },
  {
    id: 2,
    name: 'Jane Smith',
    slug: 'jane-smith',
    bio: 'Street photographer and film simulation enthusiast',
    website_url: 'https://janesmith.photography',
    social_handle: '@janesmith',
    social_platform: 'instagram',
    is_verified: false,
    created_at: new Date('2024-01-02'),
    updated_at: new Date('2024-01-02'),
  },
];

/**
 * Sample Setting Definitions
 */
export const SAMPLE_SETTING_DEFINITIONS: SettingDefinition[] = [
  {
    id: 1,
    category_id: 1,
    name: 'Grain Effect',
    slug: 'grain-effect',
    data_type: 'enum',
    unit: null,
    description: 'Film grain simulation strength',
    is_required: false,
    is_active: true,
    sort_order: 10,
    created_at: new Date('2024-01-01'),
  },
  {
    id: 2,
    category_id: 1,
    name: 'Grain Size',
    slug: 'grain-size',
    data_type: 'enum',
    unit: null,
    description: 'Film grain size',
    is_required: false,
    is_active: true,
    sort_order: 11,
    created_at: new Date('2024-01-01'),
  },
  {
    id: 3,
    category_id: 2,
    name: 'Highlight Tone',
    slug: 'highlight-tone',
    data_type: 'integer',
    unit: null,
    description: 'Highlight tone adjustment',
    is_required: false,
    is_active: true,
    sort_order: 20,
    created_at: new Date('2024-01-01'),
  },
  {
    id: 4,
    category_id: 2,
    name: 'Shadow Tone',
    slug: 'shadow-tone',
    data_type: 'integer',
    unit: null,
    description: 'Shadow tone adjustment',
    is_required: false,
    is_active: true,
    sort_order: 21,
    created_at: new Date('2024-01-01'),
  },
  {
    id: 5,
    category_id: 3,
    name: 'White Balance',
    slug: 'white-balance',
    data_type: 'integer',
    unit: 'K',
    description: 'Color temperature in Kelvin',
    is_required: false,
    is_active: true,
    sort_order: 30,
    created_at: new Date('2024-01-01'),
  },
];

/**
 * Sample Recipes
 */
export const SAMPLE_RECIPES: Recipe[] = [
  {
    id: 1,
    author_id: 1,
    system_id: 1,
    camera_model_id: 1,
    sensor_id: 1,
    film_simulation_id: 1,
    style_category_id: 1,
    name: 'Moody Street Photography',
    slug: 'moody-street-photography',
    description: 'Perfect for urban scenes with dramatic lighting',
    difficulty_level: 'intermediate',
    source_url: 'https://example.com/recipes/moody',
    source_type: 'original',
    publish_date: new Date('2024-02-15'),
    view_count: 1250,
    is_featured: true,
    is_active: true,
    created_at: new Date('2024-02-01'),
    updated_at: new Date('2024-02-15'),
  },
  {
    id: 2,
    author_id: 2,
    system_id: 1,
    camera_model_id: 2,
    sensor_id: 2,
    film_simulation_id: 2,
    style_category_id: 2,
    name: 'Vibrant Landscapes',
    slug: 'vibrant-landscapes',
    description: 'Enhanced colors for landscape photography',
    difficulty_level: 'beginner',
    source_url: null,
    source_type: 'community',
    publish_date: new Date('2024-03-01'),
    view_count: 850,
    is_featured: false,
    is_active: true,
    created_at: new Date('2024-03-01'),
    updated_at: new Date('2024-03-01'),
  },
];

/**
 * Sample Recipe Settings
 */
export const SAMPLE_RECIPE_SETTINGS: RecipeSettingValue[] = [
  {
    id: 1,
    recipe_id: 1,
    setting_definition_id: 1,
    value: 'Strong',
    notes: null,
    created_at: new Date('2024-02-01'),
  },
  {
    id: 2,
    recipe_id: 1,
    setting_definition_id: 2,
    value: 'Large',
    notes: null,
    created_at: new Date('2024-02-01'),
  },
  {
    id: 3,
    recipe_id: 1,
    setting_definition_id: 3,
    value: '-2',
    notes: 'Preserve highlights in bright areas',
    created_at: new Date('2024-02-01'),
  },
  {
    id: 4,
    recipe_id: 1,
    setting_definition_id: 4,
    value: '+2',
    notes: 'Lift shadows for detail',
    created_at: new Date('2024-02-01'),
  },
  {
    id: 5,
    recipe_id: 2,
    setting_definition_id: 5,
    value: '5500',
    notes: 'Daylight white balance',
    created_at: new Date('2024-03-01'),
  },
];

/**
 * Sample CSV import rows
 */
export const SAMPLE_CSV_ROWS = [
  {
    'Recipe Name': 'Test Recipe 1',
    Author: 'John Doe',
    Camera: 'X-T5',
    'Film Simulation': 'Classic Chrome',
    'Dynamic Range': 'DR400',
    'Grain Effect': 'Strong',
    'Grain Size': 'Large',
    'Highlight Tone': '-2',
    'Shadow Tone': '+2',
  },
  {
    'Recipe Name': 'Test Recipe 2',
    Author: 'Jane Smith',
    Camera: 'X100VI',
    'Film Simulation': 'Velvia',
    ISO: '400-1600',
    'White Balance': '5500K',
  },
];

/**
 * Invalid test data for error testing
 */
export const INVALID_RECIPE_DATA = {
  missing_name: {
    name: '',
    author_id: 1,
    system_id: 1,
    film_simulation_id: 1,
  },
  missing_author: {
    name: 'Test Recipe',
    author_id: null,
    system_id: 1,
    film_simulation_id: 1,
  },
  invalid_difficulty: {
    name: 'Test Recipe',
    author_id: 1,
    system_id: 1,
    film_simulation_id: 1,
    difficulty_level: 'expert', // Not a valid enum value
  },
};
