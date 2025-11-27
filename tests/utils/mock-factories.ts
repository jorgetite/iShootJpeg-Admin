/**
 * Mock data factories for testing
 * Provides builders to generate test data for database entities
 */

import type {
  Author,
  CameraModel,
  CameraSystem,
  FilmSimulation,
  Image,
  Recipe,
  RecipeSettingRange,
  RecipeSettingValue,
  Sensor,
  SettingCategory,
  SettingDefinition,
  SettingEnumValue,
  Tag,
} from '#/types/database';
import { randomInt, randomString, createSlug } from './test-helpers';

/**
 * Create a mock CameraSystem
 */
export function createMockCameraSystem(
  overrides?: Partial<CameraSystem>
): CameraSystem {
  const name = overrides?.name || `X-Series ${randomInt(1, 100)}`;
  return {
    id: randomInt(1, 1000),
    name,
    manufacturer: 'Fujifilm',
    is_active: true,
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock Sensor
 */
export function createMockSensor(overrides?: Partial<Sensor>): Sensor {
  return {
    id: randomInt(1, 1000),
    name: `X-Trans ${randomInt(1, 10)} ${randomString(3).toUpperCase()}`,
    type: 'X-Trans',
    megapixels: randomInt(20, 60),
    description: 'High-resolution sensor',
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock CameraModel
 */
export function createMockCameraModel(
  overrides?: Partial<CameraModel>
): CameraModel {
  return {
    id: randomInt(1, 1000),
    system_id: randomInt(1, 10),
    name: `X-T${randomInt(1, 5)}`,
    sensor_id: randomInt(1, 10),
    release_year: randomInt(2015, 2025),
    is_active: true,
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock FilmSimulation
 */
export function createMockFilmSimulation(
  overrides?: Partial<FilmSimulation>
): FilmSimulation {
  const name = overrides?.name || 'Classic Chrome';
  return {
    id: randomInt(1, 1000),
    name,
    system_id: randomInt(1, 10),
    label: name,
    description: 'Film simulation description',
    is_active: true,
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock Author
 */
export function createMockAuthor(overrides?: Partial<Author>): Author {
  const name = overrides?.name || `Test Author ${randomString(5)}`;
  const slug = overrides?.slug || createSlug(name);

  return {
    id: randomInt(1, 1000),
    name,
    slug,
    bio: 'Professional photographer and recipe creator',
    website_url: `https://${slug}.com`,
    social_handle: `@${slug}`,
    social_platform: 'instagram',
    is_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock Tag
 */
export function createMockTag(overrides?: Partial<Tag>): Tag {
  const name = overrides?.name || `tag-${randomString(5)}`;
  const slug = overrides?.slug || createSlug(name);

  return {
    id: randomInt(1, 1000),
    name,
    slug,
    category: 'subject',
    usage_count: randomInt(0, 100),
    is_active: true,
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock Recipe
 */
export function createMockRecipe(overrides?: Partial<Recipe>): Recipe {
  const name = overrides?.name || `Recipe ${randomString(8)}`;
  const slug = overrides?.slug || createSlug(name);

  return {
    id: randomInt(1, 10000),
    author_id: randomInt(1, 100),
    system_id: randomInt(1, 10),
    camera_model_id: randomInt(1, 50),
    sensor_id: randomInt(1, 10),
    film_simulation_id: randomInt(1, 40),
    style_category_id: randomInt(1, 5),
    name,
    slug,
    description: 'A test recipe for photography',
    difficulty_level: 'intermediate',
    source_url: `https://example.com/recipes/${slug}`,
    source_type: 'original',
    publish_date: new Date(),
    view_count: randomInt(0, 1000),
    is_featured: false,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock SettingCategory
 */
export function createMockSettingCategory(
  overrides?: Partial<SettingCategory>
): SettingCategory {
  const name = overrides?.name || 'Image Quality';
  const slug = overrides?.slug || createSlug(name);

  return {
    id: randomInt(1, 100),
    name,
    slug,
    description: 'Settings related to image quality',
    sort_order: randomInt(1, 10),
    ...overrides,
  };
}

/**
 * Create a mock SettingDefinition
 */
export function createMockSettingDefinition(
  overrides?: Partial<SettingDefinition>
): SettingDefinition {
  const name = overrides?.name || 'ISO';
  const slug = overrides?.slug || createSlug(name);

  return {
    id: randomInt(1, 1000),
    category_id: randomInt(1, 10),
    name,
    slug,
    data_type: 'integer',
    unit: null,
    description: 'ISO sensitivity',
    is_required: false,
    is_active: true,
    sort_order: randomInt(1, 100),
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock SettingEnumValue
 */
export function createMockSettingEnumValue(
  overrides?: Partial<SettingEnumValue>
): SettingEnumValue {
  return {
    id: randomInt(1, 10000),
    setting_definition_id: randomInt(1, 100),
    value: overrides?.value || randomString(6),
    display_label: overrides?.display_label || 'Standard',
    sort_order: randomInt(1, 100),
    is_active: true,
    ...overrides,
  };
}

/**
 * Create a mock RecipeSettingValue
 */
export function createMockRecipeSettingValue(
  overrides?: Partial<RecipeSettingValue>
): RecipeSettingValue {
  return {
    id: randomInt(1, 100000),
    recipe_id: randomInt(1, 10000),
    setting_definition_id: randomInt(1, 100),
    value: overrides?.value || '0',
    notes: null,
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock RecipeSettingRange
 */
export function createMockRecipeSettingRange(
  overrides?: Partial<RecipeSettingRange>
): RecipeSettingRange {
  return {
    id: randomInt(1, 100000),
    recipe_id: randomInt(1, 10000),
    setting_definition_id: randomInt(1, 100),
    min_value: '400',
    max_value: '1600',
    recommended_value: '800',
    notes: null,
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a mock Image
 */
export function createMockImage(overrides?: Partial<Image>): Image {
  const recipeId = overrides?.recipe_id || randomInt(1, 10000);
  const filename = `${recipeId}-${randomString(8)}.jpg`;

  return {
    id: `${randomString(8)}-${randomString(4)}-${randomString(4)}-${randomString(12)}`,
    recipe_id: recipeId,
    image_type: 'sample',
    file_path: `/images/recipes/${filename}`,
    thumb_url: `https://cdn.example.com/thumbs/${filename}`,
    full_url: `https://cdn.example.com/images/${filename}`,
    width: 1920,
    height: 1080,
    file_size_bytes: randomInt(100000, 5000000),
    alt_text: 'Sample image',
    caption: null,
    sort_order: 1,
    created_at: new Date(),
    ...overrides,
  };
}

/**
 * Create a complete mock recipe with relations
 */
export function createMockRecipeWithRelations(overrides?: {
  recipe?: Partial<Recipe>;
  author?: Partial<Author>;
  system?: Partial<CameraSystem>;
  filmSimulation?: Partial<FilmSimulation>;
  settings?: Partial<RecipeSettingValue>[];
  ranges?: Partial<RecipeSettingRange>[];
  tags?: Partial<Tag>[];
  images?: Partial<Image>[];
}) {
  const system = createMockCameraSystem(overrides?.system);
  const author = createMockAuthor(overrides?.author);
  const filmSimulation = createMockFilmSimulation({
    system_id: system.id,
    ...overrides?.filmSimulation,
  });

  const recipe = createMockRecipe({
    system_id: system.id,
    author_id: author.id,
    film_simulation_id: filmSimulation.id,
    ...overrides?.recipe,
  });

  const settings =
    overrides?.settings?.map((s) =>
      createMockRecipeSettingValue({ recipe_id: recipe.id, ...s })
    ) || [];

  const ranges =
    overrides?.ranges?.map((r) =>
      createMockRecipeSettingRange({ recipe_id: recipe.id, ...r })
    ) || [];

  const tags = overrides?.tags?.map((t) => createMockTag(t)) || [];

  const images =
    overrides?.images?.map((i) => createMockImage({ recipe_id: recipe.id, ...i })) ||
    [];

  return {
    recipe,
    author,
    system,
    filmSimulation,
    settings,
    ranges,
    tags,
    images,
  };
}
