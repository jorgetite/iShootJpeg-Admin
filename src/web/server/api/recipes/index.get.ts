import { RecipeCrudService } from '../../../../core/services/recipe-crud-service';

/**
 * GET /api/recipes
 * List all recipes with pagination and filtering
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - system_id: number (optional)
 * - author_id: number (optional)
 * - sensor_id: number (optional)
 * - film_simulation_id: number (optional)
 * - search: string (optional)
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const query = getQuery(event);
        const page = parseInt(query.page as string) || 1;
        const limit = Math.min(parseInt(query.limit as string) || 20, 100);
        const offset = (page - 1) * limit;

        const config = useRuntimeConfig();
        const service = new RecipeCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        // Build search params
        const searchParams = {
            search: query.search as string,
            system_id: query.system_id ? parseInt(query.system_id as string) : undefined,
            author_id: query.author_id ? parseInt(query.author_id as string) : undefined,
            sensor_id: query.sensor_id ? parseInt(query.sensor_id as string) : undefined,
            film_simulation_id: query.film_simulation_id ? parseInt(query.film_simulation_id as string) : undefined,
            limit,
            offset,
        };

        const result = await service.searchRecipesWithDetails(searchParams);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'GET /api/recipes',
            correlation_id: correlationId,
            params: searchParams,
            result_count: result.recipes.length,
            total: result.total,
            duration_ms: Date.now() - startTime,
        }));

        return {
            data: result.recipes,
            total: result.total,
            page,
            limit,
            totalPages: Math.ceil(result.total / limit),
        };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'GET /api/recipes',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch recipes',
        });
    }
});
