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

        // Build filters
        const filters: Record<string, any> = { is_active: true };

        if (query.system_id) {
            filters.system_id = parseInt(query.system_id as string);
        }

        if (query.author_id) {
            filters.author_id = parseInt(query.author_id as string);
        }

        // TODO: Implement search functionality
        // For now, just get all with filters

        const recipes = await service['db'].getAll('recipes', filters, 'created_at DESC');

        // Apply pagination
        const total = recipes.length;
        const paginatedRecipes = recipes.slice(offset, offset + limit);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'GET /api/recipes',
            correlation_id: correlationId,
            page,
            limit,
            total,
            duration_ms: Date.now() - startTime,
        }));

        return {
            data: paginatedRecipes,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
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
