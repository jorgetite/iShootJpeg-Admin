import pg from 'pg';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Raw recipe data from database with all relations
 */
export interface RawRecipeData {
    // Recipe fields
    id: number;
    name: string;
    slug: string;
    description: string | null;
    publish_date: string | null;
    view_count: number;
    is_featured: boolean;
    difficulty_level: string | null;
    source_type: string | null;
    source_url: string | null;

    // Author fields
    author_name: string;
    author_slug: string;
    author_bio: string | null;
    author_website_url: string | null;
    author_social_handle: string | null;
    author_social_platform: string | null;
    author_is_verified: boolean;

    // System fields
    system_name: string;
    system_manufacturer: string;

    // Sensor fields (nullable)
    sensor_name: string | null;
    sensor_type: string | null;
    sensor_megapixels: number | null;
    sensor_description: string | null;

    // Camera fields (nullable)
    camera_name: string | null;
    camera_release_year: number | null;

    // Film simulation fields
    film_sim_name: string;
    film_sim_label: string;
    film_sim_description: string | null;

    // Style category (nullable)
    style_category_name: string | null;
}

/**
 * Raw setting data from database
 */
export interface RawSettingData {
    setting_slug: string;
    setting_name: string;
    category_name: string;
    unit: string | null;
    value: string | null;
    min_value: string | null;
    max_value: string | null;
    notes: string | null;
}

/**
 * Raw tag data from database
 */
export interface RawTagData {
    tag_name: string;
    tag_slug: string;
    tag_category: string | null;
}

/**
 * Raw image data from database
 */
export interface RawImageData {
    image_type: string;
    thumb_url: string;
    full_url: string;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    caption: string | null;
    sort_order: number;
}

// ============================================================================
// Recipe Query Service
// ============================================================================

/**
 * Service for querying recipes from the database with all related data
 * 
 * Responsibilities:
 * - Execute optimized database queries
 * - Fetch recipes with all relations (author, system, settings, tags, images)
 * - Handle database connection lifecycle
 * 
 * Clear Boundaries:
 * - IN: Database connection, optional filters
 * - OUT: Raw database records
 * - Does NOT transform data to export format (that's the transformer's job)
 */
export class RecipeQueryService {
    private client: pg.Client;

    constructor(connectionString: string) {
        this.client = new pg.Client({ connectionString });
    }

    /**
     * Connect to the database
     */
    async connect(): Promise<void> {
        await this.client.connect();
    }

    /**
     * Disconnect from the database
     */
    async disconnect(): Promise<void> {
        await this.client.end();
    }

    /**
     * Fetch recipes with their core data and relations
     * 
     * @param options - Query options
     * @returns Array of raw recipe data from database
     */
    async fetchRecipes(options: { onlyActive?: boolean } = {}): Promise<RawRecipeData[]> {
        const { onlyActive = false } = options;

        const query = `
            SELECT
                -- Recipe fields
                r.id,
                r.name,
                r.slug,
                r.description,
                r.publish_date,
                r.view_count,
                r.is_featured,
                r.difficulty_level,
                r.source_type,
                r.source_url,

                -- Author fields
                a.name AS author_name,
                a.slug AS author_slug,
                a.bio AS author_bio,
                a.website_url AS author_website_url,
                a.social_handle AS author_social_handle,
                a.social_platform AS author_social_platform,
                a.is_verified AS author_is_verified,

                -- System fields
                cs.name AS system_name,
                cs.manufacturer AS system_manufacturer,

                -- Sensor fields (nullable)
                s.name AS sensor_name,
                s.type AS sensor_type,
                s.megapixels AS sensor_megapixels,
                s.description AS sensor_description,

                -- Camera fields (nullable)
                cm.name AS camera_name,
                cm.release_year AS camera_release_year,

                -- Film simulation fields
                fs.name AS film_sim_name,
                fs.label AS film_sim_label,
                fs.description AS film_sim_description,

                -- Style category (nullable)
                sc.name AS style_category_name

            FROM recipes r
            INNER JOIN authors a ON r.author_id = a.id
            INNER JOIN camera_systems cs ON r.system_id = cs.id
            LEFT JOIN sensors s ON r.sensor_id = s.id
            LEFT JOIN camera_models cm ON r.camera_model_id = cm.id
            INNER JOIN film_simulations fs ON r.film_simulation_id = fs.id
            LEFT JOIN style_categories sc ON r.style_category_id = sc.id
            WHERE ($1::boolean IS FALSE OR r.is_active = true)
            ORDER BY r.created_at DESC
        `;

        const result = await this.client.query<RawRecipeData>(query, [onlyActive]);
        return result.rows;
    }

    /**
     * Fetch settings for a specific recipe
     * 
     * @param recipeId - Recipe ID
     * @returns Array of raw setting data
     */
    async fetchRecipeSettings(recipeId: number): Promise<RawSettingData[]> {
        const query = `
            SELECT
                sd.slug AS setting_slug,
                sd.name AS setting_name,
                sc.name AS category_name,
                sd.unit,
                rsv.value,
                rsr.min_value,
                rsr.max_value,
                COALESCE(rsv.notes, rsr.notes, '') AS notes
            FROM setting_definitions sd
            INNER JOIN setting_categories sc ON sd.category_id = sc.id
            LEFT JOIN recipe_setting_values rsv ON rsv.setting_definition_id = sd.id AND rsv.recipe_id = $1
            LEFT JOIN recipe_setting_ranges rsr ON rsr.setting_definition_id = sd.id AND rsr.recipe_id = $1
            WHERE (rsv.recipe_id = $1 OR rsr.recipe_id = $1)
            ORDER BY sc.sort_order, sd.sort_order
        `;

        const result = await this.client.query<RawSettingData>(query, [recipeId]);
        return result.rows;
    }

    /**
     * Fetch tags for a specific recipe
     * 
     * @param recipeId - Recipe ID
     * @returns Array of raw tag data
     */
    async fetchRecipeTags(recipeId: number): Promise<RawTagData[]> {
        const query = `
            SELECT
                t.name AS tag_name,
                t.slug AS tag_slug,
                t.category AS tag_category
            FROM tags t
            INNER JOIN recipe_tags rt ON rt.tag_id = t.id
            WHERE rt.recipe_id = $1
            ORDER BY t.name
        `;

        const result = await this.client.query<RawTagData>(query, [recipeId]);
        return result.rows;
    }

    /**
     * Fetch images for a specific recipe
     * 
     * @param recipeId - Recipe ID
     * @returns Array of raw image data
     */
    async fetchRecipeImages(recipeId: number): Promise<RawImageData[]> {
        const query = `
            SELECT
                image_type,
                thumb_url,
                full_url,
                width,
                height,
                alt_text,
                caption,
                sort_order
            FROM images
            WHERE recipe_id = $1
            ORDER BY sort_order
        `;

        const result = await this.client.query<RawImageData>(query, [recipeId]);
        return result.rows;
    }

    /**
     * Fetch complete recipe data with all relations
     * 
     * @param recipeId - Recipe ID
     * @returns Complete recipe data or null if not found
     */
    async fetchRecipeById(recipeId: number): Promise<{
        recipe: RawRecipeData;
        settings: RawSettingData[];
        tags: RawTagData[];
        images: RawImageData[];
    } | null> {
        const recipes = await this.fetchRecipes();
        const recipe = recipes.find((r) => r.id === recipeId);

        if (!recipe) {
            return null;
        }

        const [settings, tags, images] = await Promise.all([
            this.fetchRecipeSettings(recipeId),
            this.fetchRecipeTags(recipeId),
            this.fetchRecipeImages(recipeId),
        ]);

        return { recipe, settings, tags, images };
    }
}
