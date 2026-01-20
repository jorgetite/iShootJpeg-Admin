/**
 * TypeScript type definitions for database entities
 * Corresponds to the PostgreSQL schema defined in src/core/db/schema.sql
 */

/**
 * Camera System (Fujifilm, Nikon, etc.)
 * Represents a manufacturer's camera system
 */
export interface CameraSystem {
    id: number;
    name: string;
    manufacturer: string;
    is_active: boolean;
    created_at: Date;
}

/**
 * Camera Model (X100VI, X-T5, etc.)
 * Specific camera models within a system
 */
export interface CameraModel {
    id: number;
    system_id: number;
    name: string;
    sensor_id: number | null;
    release_year: number | null;
    is_active: boolean;
    created_at: Date;
}

/**
 * Sensor (X-Trans III, Bayer, etc.)
 * Camera sensor specifications
 */
export interface Sensor {
    id: number;
    name: string;
    type: string; // 'X-Trans', 'Bayer', 'Stacked CMOS', etc.
    megapixels: number | null;
    description: string | null;
    created_at: Date;
}

/**
 * Film Simulation (Provia, Velvia, Classic Chrome, etc.)
 * Available film simulations per camera system
 */
export interface FilmSimulation {
    id: number;
    name: string;
    system_id: number;
    label: string;
    description: string | null;
    is_active: boolean;
    created_at: Date;
}

/**
 * Style Category (Color, B&W, Infrared)
 * Photography style classifications
 */
export interface StyleCategory {
    id: number;
    name: string;
    description: string | null;
    sort_order: number;
    is_active: boolean;
    created_at: Date;
}

/**
 * Setting Category (Image Quality, Color, etc.)
 * Organizational grouping for settings
 */
export interface SettingCategory {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    sort_order: number;
}

/**
 * Setting Definition
 * Defines all possible camera settings
 */
export interface SettingDefinition {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    data_type: 'enum' | 'integer' | 'numeric' | 'text' | 'boolean';
    unit: string | null; // e.g., "%", "K", null for enums
    description: string | null;
    is_required: boolean;
    is_active: boolean;
    sort_order: number;
    created_at: Date;
}

/**
 * Setting Enum Value
 * Valid values for enum-type settings
 */
export interface SettingEnumValue {
    id: number;
    setting_definition_id: number;
    value: string;
    display_label: string;
    sort_order: number;
    is_active: boolean;
}

/**
 * System Setting (Junction Table)
 * Links settings to specific camera systems
 */
export interface SystemSetting {
    system_id: number;
    setting_definition_id: number;
    is_supported: boolean;
    notes: string | null;
}

/**
 * Author
 * Recipe creators and contributors
 */
export interface Author {
    id: number;
    name: string;
    slug: string;
    bio: string | null;
    website_url: string | null;
    social_handle: string | null;
    social_platform: string | null;
    is_verified: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * Tag
 * Recipe categorization tags
 */
export interface Tag {
    id: number;
    name: string;
    slug: string;
    category: string | null; // 'subject', 'mood', 'technique', 'season'
    usage_count: number;
    is_active: boolean;
    created_at: Date;
}

/**
 * Recipe (Core Entity)
 * Film simulation recipe with all metadata
 */
export interface Recipe {
    id: number;
    author_id: number;
    system_id: number;
    camera_id: number | null;
    sensor_id: number | null;
    film_sim_id: number;
    style_id: number | null;

    // Core info
    name: string;
    slug: string;
    description: string | null;
    difficulty_level: 'beginner' | 'intermediate' | 'advanced' | null;

    // Attribution
    source_url: string | null;
    source_type: 'original' | 'curated' | 'community' | null;

    // Metadata
    publish_date: Date | null;
    view_count: number;
    is_featured: boolean;
    is_active: boolean;
    created_at: Date;
    updated_at: Date;
}

/**
 * Recipe Setting Value
 * Actual setting values for a recipe
 */
export interface RecipeSettingValue {
    id: number;
    recipe_id: number;
    setting_definition_id: number;
    value: string;
    notes: string | null;
    created_at: Date;
}

/**
 * Recipe Setting Range
 * Range-based settings (e.g., ISO 400-1600)
 */
export interface RecipeSettingRange {
    id: number;
    recipe_id: number;
    setting_definition_id: number;
    min_value: string | null;
    max_value: string | null;
    recommended_value: string | null;
    notes: string | null;
    created_at: Date;
}

/**
 * Image
 * Recipe images (thumbnails, samples, before/after)
 */
export interface Image {
    id: string; // UUID
    recipe_id: number;
    image_type: 'primary' | 'secondary';
    file_path: string | null;
    thumb_url: string;
    image_url: string;
    width: number | null;
    height: number | null;
    file_size_bytes: number | null;
    alt_text: string | null;
    caption: string | null;
    sort_order: number;
    created_at: Date;
}

/**
 * Recipe Tag (Junction Table)
 * Many-to-many relationship between recipes and tags
 */
export interface RecipeTag {
    recipe_id: number;
    tag_id: number;
    created_at: Date;
}

/**
 * Recipe with all relations (for detailed views)
 */
export interface RecipeWithRelations extends Recipe {
    author: Author;
    system: CameraSystem;
    camera: CameraModel | null;
    sensor: Sensor | null;
    film_simulation: FilmSimulation;
    style: StyleCategory | null;
    settings: RecipeSettingValue[];
    ranges: RecipeSettingRange[];
    tags: Tag[];
    images: Image[];
}

/**
 * Input types for creating/updating entities
 */

export type RecipeCreateInput = Omit<Recipe, 'id' | 'created_at' | 'updated_at' | 'view_count' | 'is_active'> & {
    settings?: Array<{ setting_definition_id: number; value: string; notes?: string }>;
    ranges?: Array<{ setting_definition_id: number; min_value?: string; max_value?: string; notes?: string }>;
    tag_ids?: number[];
    images?: Array<{
        image_type: 'primary' | 'secondary';
        file_path: string | null;
        thumb_url: string;
        image_url: string;
        width?: number;
        height?: number;
        file_size_bytes?: number;
        alt_text?: string;
        caption?: string;
        sort_order?: number;
    }>;
};

export type RecipeUpdateInput = Partial<RecipeCreateInput>;

export type AuthorCreateInput = Omit<Author, 'id' | 'created_at' | 'updated_at'>;
export type AuthorUpdateInput = Partial<AuthorCreateInput>;

export type TagCreateInput = Omit<Tag, 'id' | 'created_at' | 'usage_count'>;
export type TagUpdateInput = Partial<TagCreateInput>;

export type CameraSystemCreateInput = Omit<CameraSystem, 'id' | 'created_at'>;
export type CameraSystemUpdateInput = Partial<CameraSystemCreateInput>;

export type CameraModelCreateInput = Omit<CameraModel, 'id' | 'created_at'>;
export type CameraModelUpdateInput = Partial<CameraModelCreateInput>;

export type SensorCreateInput = Omit<Sensor, 'id' | 'created_at'>;
export type SensorUpdateInput = Partial<SensorCreateInput>;

export type FilmSimulationCreateInput = Omit<FilmSimulation, 'id' | 'created_at'>;
export type FilmSimulationUpdateInput = Partial<FilmSimulationCreateInput>;

export type SettingCategoryCreateInput = Omit<SettingCategory, 'id'>;
export type SettingCategoryUpdateInput = Partial<SettingCategoryCreateInput>;

export type SettingDefinitionCreateInput = Omit<SettingDefinition, 'id' | 'created_at'>;
export type SettingDefinitionUpdateInput = Partial<SettingDefinitionCreateInput>;
