import { RecipeCrudService } from '../../../../core/services/recipe-crud-service';
import type { RecipeUpdateInput } from '../../../../core/types/database';

/**
 * PUT /api/recipes/:id
 * Update existing recipe
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const id = parseInt(event.context.params?.id as string);

        if (isNaN(id)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid recipe ID',
            });
        }

        const body = await readBody(event);

        const config = useRuntimeConfig();
        const service = new RecipeCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const updateData: RecipeUpdateInput = {
            name: body.name,
            description: body.description,
            difficulty_level: body.difficulty_level,
            source_url: body.source_url,
            source_type: body.source_type,
            publish_date: body.publish_date,
            is_featured: body.is_featured,
            system_id: body.system_id,
            camera_model_id: body.camera_model_id,
            sensor_id: body.sensor_id,
            film_simulation_id: body.film_simulation_id,
            style_category_id: body.style_category_id,
            settings: body.settings,
            ranges: body.ranges,
            tag_ids: body.tag_ids,
        };

        const recipe = await service.updateRecipe(id, updateData);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'PUT /api/recipes/:id',
            correlation_id: correlationId,
            recipe_id: id,
            duration_ms: Date.now() - startTime,
        }));

        return {
            data: recipe,
            message: 'Recipe updated successfully',
        };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'PUT /api/recipes/:id',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to update recipe',
        });
    }
});
