import { RecipeCrudService } from '../../../../core/services/recipe-crud-service';

/**
 * GET /api/options
 * Get all options for recipe form dropdowns
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const config = useRuntimeConfig();
        const service = new RecipeCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const options = await service.getFormOptions();

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'GET /api/options',
            correlation_id: correlationId,
            duration_ms: Date.now() - startTime,
        }));

        return options;
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'GET /api/options',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch form options',
        });
    }
});
