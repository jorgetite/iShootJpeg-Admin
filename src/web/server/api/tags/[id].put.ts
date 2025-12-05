import { TagCrudService } from '../../../../core/services/tag-crud-service';
import type { TagUpdateInput } from '../../../../core/types/database';

/**
 * PUT /api/tags/[id]
 * Update a tag
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
        const body = await readBody<TagUpdateInput>(event);

        const config = useRuntimeConfig();
        const service = new TagCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const tag = await service.updateTag(id, body);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: `PUT /api/tags/${id}`,
            correlation_id: correlationId,
            tag_id: id,
            duration_ms: Date.now() - startTime,
        }));

        return tag;
    } catch (error: any) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: `PUT /api/tags/${id}`,
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

        if (error.message.includes('unique constraint')) {
            throw createError({
                statusCode: 409,
                message: 'Tag with this slug already exists',
            });
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to update tag',
        });
    }
});
