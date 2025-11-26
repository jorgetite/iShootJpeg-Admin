import { RecipeCrudService } from '../../../../../../core/services/recipe-crud-service';

/**
 * GET /api/systems/:id/settings
 * Get setting definitions for a specific system
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const id = parseInt(event.context.params?.id as string);

        if (isNaN(id)) {
            throw createError({
                statusCode: 400,
                message: 'Invalid system ID',
            });
        }

        const config = useRuntimeConfig();
        const service = new RecipeCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const definitions = await service.getSettingDefinitions(id);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'GET /api/systems/:id/settings',
            correlation_id: correlationId,
            system_id: id,
            result_count: definitions.length,
            duration_ms: Date.now() - startTime,
        }));

        return definitions;
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'GET /api/systems/:id/settings',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error && typeof error === 'object' && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch setting definitions',
        });
    }
});
