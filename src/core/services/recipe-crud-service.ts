import type { PoolClient } from 'pg';
import { DatabaseService } from './database-service';
import type {
    Recipe,
    RecipeWithRelations,
    RecipeCreateInput,
    RecipeUpdateInput,
    RecipeSettingValue,
    RecipeSettingRange,
    Tag,
    Author,
    CameraSystem,
    CameraModel,
    Sensor,
    FilmSimulation,
    StyleCategory,
} from '../types/database';

/**
 * Specialized CRUD Service for Recipes
 * 
 * Handles complex recipe operations with settings, tags, and images.
 * All operations are transactional and idempotent as per CONSTITUTION.md.
 * 
 * @example
 * ```typescript
 * const service = new RecipeCrudService(process.env.DATABASE_URL!);
 * await service.connect();
 * 
 * const recipe = await service.createRecipe({
 *   name: 'Classic Chrome+',
 *   slug: 'classic-chrome-plus',
 *   author_id: 1,
 *   system_id: 1,
 *   film_simulation_id: 14,
 *   settings: [{ setting_definition_id: 10, value: '+2' }],
 *   tag_ids: [1, 2, 3]
 * });
 * ```
 */
export class RecipeCrudService {
    private db: DatabaseService;

    constructor(connectionString: string) {
        this.db = new DatabaseService(connectionString);
    }

    async connect(): Promise<void> {
        await this.db.connect();
    }

    async disconnect(): Promise<void> {
        await this.db.disconnect();
    }

    /**
     * Create a new recipe with settings, tags, and images
     * 
     * @param data - Recipe creation data
     * @returns Created recipe
     * 
     * @throws Error if validation fails or database operation fails
     */
    async createRecipe(data: RecipeCreateInput): Promise<Recipe> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            await client.query('BEGIN');

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'createRecipe',
                correlation_id: correlationId,
                recipe_name: data.name,
            }));

            // Ensure unique slug
            const slug = await this.ensureUniqueSlug(client, data.slug, data.author_id);

            // Insert recipe
            const recipeData = {
                name: data.name,
                slug: slug,
                author_id: data.author_id,
                system_id: data.system_id,
                camera_id: data.camera_id || null,
                sensor_id: data.sensor_id || null,
                film_sim_id: data.film_sim_id,
                style_id: data.style_id || null,
                description: data.description || null,
                difficulty_level: data.difficulty_level || 'intermediate',
                source_url: data.source_url || null,
                source_type: data.source_type || 'curated',
                publish_date: data.publish_date || null,
                view_count: 0,
                is_featured: false,
                is_active: true,
            };

            const recipeResult = await client.query(
                `INSERT INTO recipes (
                    name, slug, author_id, system_id, camera_id, sensor_id,
                    film_sim_id, style_id, description, difficulty_level,
                    source_url, source_type, publish_date, view_count, is_featured, is_active
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
                RETURNING *`,
                [
                    recipeData.name,
                    recipeData.slug,
                    recipeData.author_id,
                    recipeData.system_id,
                    recipeData.camera_id,
                    recipeData.sensor_id,
                    recipeData.film_sim_id,
                    recipeData.style_id,
                    recipeData.description,
                    recipeData.difficulty_level,
                    recipeData.source_url,
                    recipeData.source_type,
                    recipeData.publish_date,
                    recipeData.view_count,
                    recipeData.is_featured,
                    recipeData.is_active,
                ]
            );

            const recipe: Recipe = recipeResult.rows[0];

            // Insert settings
            if (data.settings && data.settings.length > 0) {
                await this.insertSettings(client, recipe.id, data.settings);
            }

            // Insert ranges
            if (data.ranges && data.ranges.length > 0) {
                await this.insertRanges(client, recipe.id, data.ranges);
            }

            // Insert tags
            if (data.tag_ids && data.tag_ids.length > 0) {
                await this.insertTags(client, recipe.id, data.tag_ids);
            }

            // Insert images
            if (data.images && data.images.length > 0) {
                await this.insertImages(client, recipe.id, data.images);
            }

            await client.query('COMMIT');

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'createRecipe',
                correlation_id: correlationId,
                recipe_id: recipe.id,
                recipe_name: recipe.name,
                duration_ms: Date.now() - startTime,
            }));

            return recipe;
        } catch (error) {
            await client.query('ROLLBACK');

            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'RecipeCrudService',
                operation: 'createRecipe',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));

            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Update an existing recipe
     * 
     * @param id - Recipe ID
     * @param data - Updated recipe data
     * @returns Updated recipe
     * 
     * @throws Error if recipe not found or validation fails
     */
    async updateRecipe(id: number, data: RecipeUpdateInput): Promise<Recipe> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            await client.query('BEGIN');

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'updateRecipe',
                correlation_id: correlationId,
                recipe_id: id,
            }));

            // Build update query dynamically
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            const updateFields = [
                'name', 'description', 'difficulty_level', 'source_url', 'source_type',
                'publish_date', 'is_featured', 'is_active', 'system_id', 'camera_id', 'sensor_id',
                'film_sim_id', 'style_id'
            ];

            for (const field of updateFields) {
                if (data[field as keyof RecipeUpdateInput] !== undefined) {
                    updates.push(`"${field}" = $${paramIndex}`);
                    values.push(data[field as keyof RecipeUpdateInput]);
                    paramIndex++;
                }
            }

            if (updates.length > 0) {
                updates.push(`updated_at = now()`);
                values.push(id);

                const query = `
                    UPDATE recipes
                    SET ${updates.join(', ')}
                    WHERE id = $${paramIndex}
                    RETURNING *
                `;

                const result = await client.query(query, values);

                if (result.rows.length === 0) {
                    throw new Error(`Recipe not found with id ${id}`);
                }
            }

            // Update settings if provided
            if (data.settings !== undefined) {
                await client.query('DELETE FROM recipe_setting_values WHERE recipe_id = $1', [id]);
                if (data.settings.length > 0) {
                    await this.insertSettings(client, id, data.settings);
                }
            }

            // Update ranges if provided
            if (data.ranges !== undefined) {
                await client.query('DELETE FROM recipe_setting_ranges WHERE recipe_id = $1', [id]);
                if (data.ranges.length > 0) {
                    await this.insertRanges(client, id, data.ranges);
                }
            }

            // Update tags if provided
            if (data.tag_ids !== undefined) {
                await client.query('DELETE FROM recipe_tags WHERE recipe_id = $1', [id]);
                if (data.tag_ids.length > 0) {
                    await this.insertTags(client, id, data.tag_ids);
                }
            }

            // Update images if provided
            if (data.images !== undefined) {
                await client.query('DELETE FROM images WHERE recipe_id = $1', [id]);
                if (data.images.length > 0) {
                    await this.insertImages(client, id, data.images);
                }
            }

            // Fetch updated recipe
            const recipeResult = await client.query('SELECT * FROM recipes WHERE id = $1', [id]);
            const recipe: Recipe = recipeResult.rows[0];

            await client.query('COMMIT');

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'updateRecipe',
                correlation_id: correlationId,
                recipe_id: id,
                duration_ms: Date.now() - startTime,
            }));

            return recipe;
        } catch (error) {
            await client.query('ROLLBACK');

            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'RecipeCrudService',
                operation: 'updateRecipe',
                correlation_id: correlationId,
                recipe_id: id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));

            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Delete a recipe (cascades to settings, tags, images)
     * 
     * @param id - Recipe ID
     * 
     * @throws Error if recipe not found
     */
    async deleteRecipe(id: number): Promise<void> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'deleteRecipe',
                correlation_id: correlationId,
                recipe_id: id,
            }));

            // Soft delete (set is_active = false)
            await this.db.delete('recipes', id, true);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'deleteRecipe',
                correlation_id: correlationId,
                recipe_id: id,
                duration_ms: Date.now() - startTime,
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'RecipeCrudService',
                operation: 'deleteRecipe',
                correlation_id: correlationId,
                recipe_id: id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));

            throw error;
        }
    }

    /**
     * Get recipe with all relations
     * 
     * @param id - Recipe ID
     * @returns Recipe with all relations or null if not found
     */
    async getRecipeById(id: number): Promise<RecipeWithRelations | null> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            const recipe = await this.db.getById<Recipe>('recipes', id);

            if (!recipe) {
                return null;
            }

            // Fetch all relations in parallel
            const [author, system, camera, sensor, film_sim, style, settings, ranges, tags, images] =
                await Promise.all([
                    this.db.getById<Author>('authors', recipe.author_id),
                    this.db.getById<CameraSystem>('systems', recipe.system_id),
                    recipe.camera_id ? this.db.getById<CameraModel>('cameras', recipe.camera_id) : Promise.resolve(null),
                    recipe.sensor_id ? this.db.getById<Sensor>('sensors', recipe.sensor_id) : Promise.resolve(null),
                    this.db.getById<FilmSimulation>('film_sims', recipe.film_sim_id),
                    recipe.style_id ? this.db.getById<StyleCategory>('styles', recipe.style_id) : Promise.resolve(null),
                    this.db.getAll<RecipeSettingValue>('recipe_setting_values', { recipe_id: id }),
                    this.db.getAll<RecipeSettingRange>('recipe_setting_ranges', { recipe_id: id }),
                    this.getRecipeTags(id),
                    this.getRecipeImages(id),
                ]);

            const recipeWithRelations: RecipeWithRelations = {
                ...recipe,
                author: author!,
                system: system!,
                camera: camera,
                sensor: sensor,
                film_simulation: film_sim!,
                style: style,
                settings,
                ranges,
                tags,
                images,
            };

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'getRecipeById',
                correlation_id: correlationId,
                recipe_id: id,
                duration_ms: Date.now() - startTime,
            }));

            return recipeWithRelations;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'RecipeCrudService',
                operation: 'getRecipeById',
                correlation_id: correlationId,
                recipe_id: id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));

            throw error;
        }
    }

    /**
     * Ensure slug is unique by appending counter if needed
     * 
     * @param client - Database client
     * @param baseSlug - Base slug
     * @param authorId - Author ID
     * @returns Unique slug
     */
    private async ensureUniqueSlug(client: PoolClient, baseSlug: string, authorId: number): Promise<string> {
        let slug = baseSlug;
        let counter = 1;

        while (true) {
            const existing = await client.query(
                'SELECT id, author_id FROM recipes WHERE slug = $1',
                [slug]
            );

            if (existing.rows.length === 0) {
                return slug;
            }

            // If same author, allow update (idempotent)
            if (existing.rows[0].author_id === authorId) {
                return slug;
            }

            // Generate new slug with counter
            slug = `${baseSlug}-${counter}`;
            counter++;
        }
    }

    /**
     * Insert recipe settings
     */
    private async insertSettings(
        client: PoolClient,
        recipeId: number,
        settings: Array<{ setting_definition_id: number; value: string; notes?: string }>
    ): Promise<void> {
        for (const setting of settings) {
            await client.query(
                `INSERT INTO recipe_setting_values (recipe_id, setting_definition_id, value, notes)
                 VALUES ($1, $2, $3, $4)`,
                [recipeId, setting.setting_definition_id, setting.value, setting.notes || null]
            );
        }
    }

    /**
     * Insert recipe setting ranges
     */
    private async insertRanges(
        client: PoolClient,
        recipeId: number,
        ranges: Array<{ setting_definition_id: number; min_value?: string; max_value?: string; notes?: string }>
    ): Promise<void> {
        for (const range of ranges) {
            await client.query(
                `INSERT INTO recipe_setting_ranges (recipe_id, setting_definition_id, min_value, max_value, notes)
                 VALUES ($1, $2, $3, $4, $5)`,
                [recipeId, range.setting_definition_id, range.min_value || null, range.max_value || null, range.notes || null]
            );
        }
    }

    /**
     * Insert recipe tags
     */
    private async insertTags(client: PoolClient, recipeId: number, tagIds: number[]): Promise<void> {
        for (const tagId of tagIds) {
            await client.query(
                `INSERT INTO recipe_tags (recipe_id, tag_id) VALUES ($1, $2)`,
                [recipeId, tagId]
            );
        }
    }

    /**
     * Get tags for a recipe
     */
    private async getRecipeTags(recipeId: number): Promise<Tag[]> {
        const client = await this.db.getClient();
        try {
            const result = await client.query(
                `SELECT t.* FROM tags t
                 INNER JOIN recipe_tags rt ON rt.tag_id = t.id
                 WHERE rt.recipe_id = $1
                 ORDER BY t.name`,
                [recipeId]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Insert recipe images
     */
    private async insertImages(
        client: PoolClient,
        recipeId: number,
        images: Array<{
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
        }>
    ): Promise<void> {
        for (const image of images) {
            await client.query(
                `INSERT INTO images (
                    recipe_id, image_type, file_path, thumb_url, image_url,
                    width, height, file_size_bytes, alt_text, caption, sort_order
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
                [
                    recipeId,
                    image.image_type,
                    image.file_path || null,
                    image.thumb_url,
                    image.image_url,
                    image.width || null,
                    image.height || null,
                    image.file_size_bytes || null,
                    image.alt_text || null,
                    image.caption || null,
                    image.sort_order || 0
                ]
            );
        }
    }

    /**
     * Get images for a recipe
     */
    private async getRecipeImages(recipeId: number): Promise<any[]> {
        const client = await this.db.getClient();
        try {
            const result = await client.query(
                `SELECT * FROM images WHERE recipe_id = $1 ORDER BY sort_order ASC`,
                [recipeId]
            );
            return result.rows;
        } finally {
            client.release();
        }
    }

    /**
     * Search recipes with filters and pagination
     * 
     * @param params - Search parameters
     * @returns Paginated recipes and total count
     */
    async searchRecipes(params: {
        search?: string;
        system_id?: number;
        author_id?: number;
        sensor_id?: number;
        limit?: number;
        offset?: number;
    }): Promise<{ recipes: Recipe[]; total: number }> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'searchRecipes',
                correlation_id: correlationId,
                params,
            }));

            const conditions: string[] = ['is_active = true'];
            const values: any[] = [];
            let paramIndex = 1;

            if (params.search) {
                conditions.push(`(name ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`);
                values.push(`%${params.search}%`);
                paramIndex++;
            }

            if (params.system_id) {
                conditions.push(`system_id = $${paramIndex}`);
                values.push(params.system_id);
                paramIndex++;
            }

            if (params.author_id) {
                conditions.push(`author_id = $${paramIndex}`);
                values.push(params.author_id);
                paramIndex++;
            }

            if (params.sensor_id) {
                conditions.push(`sensor_id = $${paramIndex}`);
                values.push(params.sensor_id);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // Get total count
            const countResult = await client.query(
                `SELECT COUNT(*) as count FROM recipes ${whereClause}`,
                values
            );
            const total = parseInt(countResult.rows[0].count);

            // Get paginated results
            const limit = params.limit || 20;
            const offset = params.offset || 0;

            const query = `
                SELECT * FROM recipes
                ${whereClause}
                ORDER BY created_at DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const recipesResult = await client.query(query, [...values, limit, offset]);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'searchRecipes',
                correlation_id: correlationId,
                result_count: recipesResult.rows.length,
                total_count: total,
                duration_ms: Date.now() - startTime,
            }));

            return {
                recipes: recipesResult.rows,
                total,
            };
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'RecipeCrudService',
                operation: 'searchRecipes',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));

            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Search recipes with full details (author names, system names, etc.)
     * 
     * @param params - Search parameters
     * @returns Paginated recipes with details and total count
     */
    async searchRecipesWithDetails(params: {
        search?: string;
        system_id?: number;
        author_id?: number;
        sensor_id?: number;
        film_sim_id?: number;
        limit?: number;
        offset?: number;
    }): Promise<{ recipes: any[]; total: number }> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'searchRecipesWithDetails',
                correlation_id: correlationId,
                params,
            }));

            const conditions: string[] = ['r.is_active = true'];
            const values: any[] = [];
            let paramIndex = 1;

            if (params.search) {
                conditions.push(`(r.name ILIKE $${paramIndex} OR r.description ILIKE $${paramIndex})`);
                values.push(`%${params.search}%`);
                paramIndex++;
            }

            if (params.system_id) {
                conditions.push(`r.system_id = $${paramIndex}`);
                values.push(params.system_id);
                paramIndex++;
            }

            if (params.author_id) {
                conditions.push(`r.author_id = $${paramIndex}`);
                values.push(params.author_id);
                paramIndex++;
            }

            if (params.sensor_id) {
                conditions.push(`r.sensor_id = $${paramIndex}`);
                values.push(params.sensor_id);
                paramIndex++;
            }

            if (params.film_sim_id) {
                conditions.push(`r.film_sim_id = $${paramIndex}`);
                values.push(params.film_sim_id);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // Get total count
            const countResult = await client.query(
                `SELECT COUNT(*) as count FROM recipes r ${whereClause}`,
                values
            );
            const total = parseInt(countResult.rows[0].count);

            // Get paginated results with JOINs
            const limit = params.limit || 20;
            const offset = params.offset || 0;

            const query = `
                SELECT 
                    r.*,
                    a.name as author_name,
                    cs.name as system_name,
                    cm.name as camera_name,
                    s.name as sensor_name,
                    fs.name as film_simulation_name,
                    fs.label as film_simulation_label,
                    sc.name as style_name
                FROM recipes r
                LEFT JOIN authors a ON r.author_id = a.id
                LEFT JOIN systems cs ON r.system_id = cs.id
                LEFT JOIN cameras cm ON r.camera_id = cm.id
                LEFT JOIN sensors s ON r.sensor_id = s.id
                LEFT JOIN film_sims fs ON r.film_sim_id = fs.id
                LEFT JOIN styles sc ON r.style_id = sc.id
                ${whereClause}
                ORDER BY r.created_at DESC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const recipesResult = await client.query(query, [...values, limit, offset]);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'RecipeCrudService',
                operation: 'searchRecipesWithDetails',
                correlation_id: correlationId,
                result_count: recipesResult.rows.length,
                total_count: total,
                duration_ms: Date.now() - startTime,
            }));

            return {
                recipes: recipesResult.rows,
                total,
            };
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'RecipeCrudService',
                operation: 'searchRecipesWithDetails',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));

            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Get all options for recipe form dropdowns
     */
    async getFormOptions() {
        const client = await this.db.getClient();
        try {
            const [authors, systems, sensors, filmSimulations, styleCategories, cameraModels] = await Promise.all([
                client.query('SELECT id, name FROM authors ORDER BY name ASC'),
                client.query('SELECT id, name FROM systems WHERE is_active = true ORDER BY name ASC'),
                client.query('SELECT id, name FROM sensors ORDER BY name ASC'),
                client.query('SELECT id, name, system_id FROM film_sims WHERE is_active = true ORDER BY name ASC'),
                client.query('SELECT id, name FROM styles WHERE is_active = true ORDER BY sort_order ASC'),
                client.query('SELECT id, name, system_id FROM cameras WHERE is_active = true ORDER BY name ASC')
            ]);

            return {
                authors: authors.rows,
                systems: systems.rows,
                sensors: sensors.rows,
                filmSimulations: filmSimulations.rows,
                styleCategories: styleCategories.rows,
                cameraModels: cameraModels.rows
            };
        } finally {
            client.release();
        }
    }

    /**
     * Get setting definitions for a specific system
     */
    async getSettingDefinitions(systemId: number) {
        const client = await this.db.getClient();
        try {
            // Fetch definitions supported by the system
            const definitionsResult = await client.query(
                `SELECT 
                    sd.*,
                    sc.name as category_name,
                    sc.sort_order as category_sort_order,
                    ss.notes as system_notes
                 FROM setting_definitions sd
                 JOIN system_settings ss ON ss.setting_definition_id = sd.id
                 LEFT JOIN setting_categories sc ON sc.id = sd.category_id
                 WHERE ss.system_id = $1 AND ss.is_supported = true AND sd.is_active = true
                 ORDER BY sc.sort_order ASC, sd.sort_order ASC`,
                [systemId]
            );

            const definitions = definitionsResult.rows;

            // Fetch enum values for enum-type settings
            const enumIds = definitions
                .filter(d => d.data_type === 'enum')
                .map(d => d.id);

            let enumValues: any[] = [];
            if (enumIds.length > 0) {
                const enumResult = await client.query(
                    `SELECT * FROM setting_enum_values 
                     WHERE setting_definition_id = ANY($1) AND is_active = true
                     ORDER BY sort_order ASC`,
                    [enumIds]
                );
                enumValues = enumResult.rows;
            }

            // Group enum values by definition id
            const enumMap = enumValues.reduce((acc, curr) => {
                if (!acc[curr.setting_definition_id]) {
                    acc[curr.setting_definition_id] = [];
                }
                acc[curr.setting_definition_id].push(curr);
                return acc;
            }, {} as Record<number, any[]>);

            // Attach enum values to definitions
            return definitions.map(def => ({
                ...def,
                enum_values: enumMap[def.id] || []
            }));
        } finally {
            client.release();
        }
    }

    /**
     * Generate correlation ID for request tracing
     */
    private generateCorrelationId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
