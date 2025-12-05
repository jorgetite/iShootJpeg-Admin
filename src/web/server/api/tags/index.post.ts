import { TagCrudService } from '../../../../core/services/tag-crud-service';
import type { TagCreateInput } from '../../../../core/types/database';

/**
 * POST /api/tags
 * Create a new tag
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const body = await readBody<TagCreateInput>(event);

        // Basic validation
        if (!body.name) {
            throw createError({
                statusCode: 400,
                message: 'Name is required',
            });
        }

        const config = useRuntimeConfig();
        const service = new TagCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const tag = await service.createTag(body);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'POST /api/tags',
            correlation_id: correlationId,
            tag_name: tag.name,
            duration_ms: Date.now() - startTime,
        }));

        return tag;
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'POST /api/tags',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error instanceof Error && error.message.includes('unique constraint')) {
            throw createError({
                statusCode: 409,
                message: 'Tag with this slug already exists',
            });
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to create tag',
        });
    }
});
