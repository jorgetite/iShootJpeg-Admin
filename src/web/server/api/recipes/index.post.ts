import { RecipeCrudService } from '../../../../core/services/recipe-crud-service';
import type { RecipeCreateInput } from '../../../../core/types/database';

/**
 * POST /api/recipes
 * Create new recipe
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const body = await readBody(event);

        // Fail-fast validation
        if (!body.name || !body.slug || !body.author_id || !body.film_simulation_id) {
            throw createError({
                statusCode: 400,
                message: 'Missing required fields: name, slug, author_id, film_simulation_id',
            });
        }

        const config = useRuntimeConfig();
        const service = new RecipeCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const recipeData: RecipeCreateInput = {
            name: body.name,
            slug: body.slug,
            author_id: body.author_id,
            system_id: body.system_id,
            camera_model_id: body.camera_model_id,
            sensor_id: body.sensor_id,
            film_simulation_id: body.film_simulation_id,
            style_category_id: body.style_category_id,
            description: body.description,
            difficulty_level: body.difficulty_level,
            source_url: body.source_url,
            source_type: body.source_type,
            publish_date: body.publish_date,
            settings: body.settings,
            ranges: body.ranges,
            tag_ids: body.tag_ids,
        };

        const recipe = await service.createRecipe(recipeData);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'POST /api/recipes',
            correlation_id: correlationId,
            recipe_id: recipe.id,
            recipe_name: recipe.name,
            duration_ms: Date.now() - startTime,
        }));

        return {
            data: recipe,
            message: 'Recipe created successfully',
        };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'POST /api/recipes',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to create recipe',
        });
    }
});
