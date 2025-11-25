import type {
    RecipeExport,
    AuthorInfo,
    SystemInfo,
    SensorInfo,
    CameraInfo,
    FilmSimulationInfo,
    Settings,
    Setting,
    Tag,
    RecipeImage,
} from '../types/recipe-export.js';
import type {
    RawRecipeData,
    RawSettingData,
    RawTagData,
    RawImageData,
} from './recipe-query-service.js';

// ============================================================================
// Export Transformer Service
// ============================================================================

/**
 * Service for transforming raw database records into export JSON schema
 * 
 * Responsibilities:
 * - Transform database records to export format
 * - Map database field names to JSON schema field names
 * - Handle null values and data type conversions
 * - Organize settings by slug for direct property access
 * 
 * Clear Boundaries:
 * - IN: Raw database records (from RecipeQueryService)
 * - OUT: Structured JSON objects matching export schema
 * - Does NOT query database (that's the query service's job)
 * - Does NOT write files (that's the file writer's job)
 */
export class ExportTransformerService {
    /**
     * Transform raw recipe data to export format
     * 
     * @param rawRecipe - Raw recipe data from database
     * @param rawSettings - Raw settings data from database
     * @param rawTags - Raw tags data from database
     * @param rawImages - Raw images data from database
     * @returns Transformed recipe in export format
     */
    transformRecipe(
        rawRecipe: RawRecipeData,
        rawSettings: RawSettingData[],
        rawTags: RawTagData[],
        rawImages: RawImageData[]
    ): RecipeExport {
        return {
            // Core recipe fields
            name: rawRecipe.name,
            slug: rawRecipe.slug,
            description: rawRecipe.description,
            publishDate: rawRecipe.publish_date,
            viewCount: rawRecipe.view_count,
            isFeatured: rawRecipe.is_featured,
            difficultyLevel: rawRecipe.difficulty_level as any,
            sourceType: rawRecipe.source_type as any,
            sourceUrl: rawRecipe.source_url,
            styleCategory: rawRecipe.style_category_name,

            // Nested objects
            filmSimulation: this.transformFilmSimulation(rawRecipe),
            author: this.transformAuthor(rawRecipe),
            system: this.transformSystem(rawRecipe),
            settings: this.transformSettings(rawSettings),
            tags: this.transformTags(rawTags),
            images: this.transformImages(rawImages),
        };
    }

    /**
     * Transform author data
     */
    private transformAuthor(rawRecipe: RawRecipeData): AuthorInfo {
        return {
            name: rawRecipe.author_name,
            slug: rawRecipe.author_slug,
            bio: rawRecipe.author_bio,
            websiteUrl: rawRecipe.author_website_url,
            socialHandle: rawRecipe.author_social_handle,
            socialPlatform: rawRecipe.author_social_platform,
            isVerified: rawRecipe.author_is_verified,
        };
    }

    /**
     * Transform system data (including sensor and camera)
     */
    private transformSystem(rawRecipe: RawRecipeData): SystemInfo {
        const sensor: SensorInfo | null = rawRecipe.sensor_name
            ? {
                name: rawRecipe.sensor_name,
                type: rawRecipe.sensor_type!,
                megapixels: rawRecipe.sensor_megapixels,
                description: rawRecipe.sensor_description,
            }
            : null;

        const camera: CameraInfo | null = rawRecipe.camera_name
            ? {
                name: rawRecipe.camera_name,
                releaseYear: rawRecipe.camera_release_year,
            }
            : null;

        return {
            name: rawRecipe.system_name,
            manufacturer: rawRecipe.system_manufacturer,
            sensor,
            camera,
        };
    }

    /**
     * Transform film simulation data
     */
    private transformFilmSimulation(rawRecipe: RawRecipeData): FilmSimulationInfo {
        return {
            name: rawRecipe.film_sim_name,
            label: rawRecipe.film_sim_label,
            description: rawRecipe.film_sim_description,
        };
    }

    /**
     * Transform settings data to key-value structure
     * 
     * Settings are organized by slug for direct property access:
     * settings.dynamic_range, settings.iso, etc.
     */
    private transformSettings(rawSettings: RawSettingData[]): Settings {
        const settings: Settings = {};

        for (const raw of rawSettings) {
            const setting: Setting = this.transformSetting(raw);
            settings[raw.setting_slug] = setting;
        }

        return settings;
    }

    /**
     * Transform a single setting
     * 
     * Determines whether to use 'value' or 'range' based on database data
     */
    private transformSetting(raw: RawSettingData): Setting {
        const base = {
            name: raw.setting_name,
            category: raw.category_name,
            notes: raw.notes || '',
            ...(raw.unit && { unit: raw.unit }),
        };

        // If we have min/max values, use range
        if (raw.min_value !== null && raw.max_value !== null) {
            return {
                ...base,
                range: {
                    min: raw.min_value,
                    max: raw.max_value,
                },
            } as Setting;
        }

        // Otherwise use single value
        return {
            ...base,
            value: raw.value || '',
        } as Setting;
    }

    /**
     * Transform tags data
     */
    private transformTags(rawTags: RawTagData[]): Tag[] {
        return rawTags.map((raw) => ({
            name: raw.tag_name,
            slug: raw.tag_slug,
            category: raw.tag_category as any,
        }));
    }

    /**
     * Transform images data
     */
    private transformImages(rawImages: RawImageData[]): RecipeImage[] {
        return rawImages.map((raw) => ({
            type: raw.image_type as any,
            thumbUrl: raw.thumb_url,
            fullUrl: raw.full_url,
            width: raw.width,
            height: raw.height,
            altText: raw.alt_text,
            caption: raw.caption,
            sortOrder: raw.sort_order,
        }));
    }
}
