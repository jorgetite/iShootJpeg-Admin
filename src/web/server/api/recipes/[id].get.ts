import { RecipeCrudService } from '../../../../core/services/recipe-crud-service';

/**
 * GET /api/recipes/:id
 * Get single recipe with all relations
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

        const config = useRuntimeConfig();
        const service = new RecipeCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const recipe = await service.getRecipeById(id);

        await service.disconnect();

        if (!recipe) {
            throw createError({
                statusCode: 404,
                message: `Recipe not found with id ${id}`,
            });
        }

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'GET /api/recipes/:id',
            correlation_id: correlationId,
            recipe_id: id,
            duration_ms: Date.now() - startTime,
        }));

        return recipe;
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'GET /api/recipes/:id',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch recipe',
        });
    }
});
