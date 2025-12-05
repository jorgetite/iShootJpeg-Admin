import { TagCrudService } from '../../../../core/services/tag-crud-service';

/**
 * DELETE /api/tags/[id]
 * Delete a tag
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const id = parseInt(event.context.params?.id || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid ID',
        });
    }

    try {
        const config = useRuntimeConfig();
        const service = new TagCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        await service.deleteTag(id);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: `DELETE /api/tags/${id}`,
            correlation_id: correlationId,
            tag_id: id,
            duration_ms: Date.now() - startTime,
        }));

        return { success: true };
    } catch (error: any) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: `DELETE /api/tags/${id}`,
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error.message.includes('Tag not found')) {
            throw createError({
                statusCode: 404,
                message: 'Tag not found',
            });
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to delete tag',
        });
    }
});
