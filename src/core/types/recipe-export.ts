/**
 * TypeScript type definitions for Recipe Export JSON Schema
 * 
 * These types define the structure for exporting film simulation recipes
 * to JSON format for website publishing and end-user consumption.
 */

/**
 * Difficulty level for a recipe
 */
export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

/**
 * Source type indicating recipe origin
 */
export type SourceType = 'original' | 'curated' | 'community';

/**
 * Image types for recipe images
 */
export type ImageType = 'primary' | 'secondary';

/**
 * Tag categories for organization
 */
export type TagCategory = 'subject' | 'mood' | 'technique' | 'season';

/**
 * Author/creator information
 */
export interface AuthorInfo {
    name: string;
    slug: string;
    bio: string;
    websiteUrl: string;
    socialHandle: string;
    socialPlatform: string;
    isVerified: boolean;
}

/**
 * Camera sensor information
 */
export interface SensorInfo {
    name: string;
    type: string;
    megapixels: number | null;
    description: string;
}

/**
 * Camera model information
 */
export interface CameraInfo {
    name: string;
    releaseYear: number | null;
}

/**
 * Camera system information including sensor and camera
 */
export interface SystemInfo {
    name: string;
    manufacturer: string;
    sensor: SensorInfo | null;
    camera: CameraInfo | null;
}

/**
 * Film simulation information
 */
export interface FilmSimulationInfo {
    name: string; // Internal name/slug
    label: string; // Display label
    description: string;
}

/**
 * Setting value range (min and max only)
 * Used when a setting has an actual range of values
 */
export interface SettingRange {
    min: string;
    max: string;
}

/**
 * Base setting properties shared by all settings
 */
interface SettingBase {
    name: string;
    category: string;
    unit?: string; // Optional unit (e.g., "EV", "%", "K")
    notes: string; // Empty string if no notes
}

/**
 * Setting with a single value
 */
interface SettingWithValue extends SettingBase {
    value: string;
    range?: never; // Explicitly exclude range when value is present
}

/**
 * Setting with a range of values
 */
interface SettingWithRange extends SettingBase {
    range: SettingRange;
    value?: never; // Explicitly exclude value when range is present
}

/**
 * Individual setting with metadata
 * Either has a single value OR a range, but not both
 */
export type Setting = SettingWithValue | SettingWithRange;

/**
 * Settings organized by slug for direct property access
 * Example: settings.dynamic_range, settings.iso, etc.
 */
export interface Settings {
    [slug: string]: Setting;
}

/**
 * Tag information
 */
export interface Tag {
    name: string;
    slug: string;
    category: TagCategory | null;
}

/**
 * Recipe image information
 */
export interface RecipeImage {
    type: ImageType;
    thumbUrl: string;
    fullUrl: string;
    width: number | null;
    height: number | null;
    altText: string;
    caption: string;
    sortOrder: number;
}

/**
 * Complete recipe export structure (single recipe)
 * Flattened structure with all properties at top level
 */
export interface RecipeExport {
    // Core recipe information
    name: string;
    slug: string;
    description: string;
    publishDate: string | null; // ISO 8601 date format (YYYY-MM-DD)
    viewCount: number;
    isFeatured: boolean;
    difficultyLevel: DifficultyLevel | null;
    sourceType: SourceType | null;
    sourceUrl: string;
    styleCategory: string; // Style category name (simplified from object)

    // Nested objects
    filmSimulation: FilmSimulationInfo;
    author: AuthorInfo;
    system: SystemInfo;
    settings: Settings;
    tags: Tag[];
    images: RecipeImage[];
}

/**
 * Metadata for batch exports
 */
export interface ExportMetadata {
    version: string; // Schema version (e.g., "1.0")
    exportDate: string; // ISO 8601 datetime with timezone
    totalRecipes: number;
}

/**
 * Batch export structure (multiple recipes)
 */
export interface BatchRecipeExport {
    metadata: ExportMetadata;
    recipes: RecipeExport[];
}

/**
 * Helper type for settings grouped by category
 * Useful for UI rendering
 */
export interface SettingsByCategory {
    [category: string]: {
        [slug: string]: Setting;
    };
}
