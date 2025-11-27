import { AuthorCrudService } from '../../../../core/services/author-crud-service';
import type { AuthorUpdateInput } from '../../../../core/types/database';

/**
 * PUT /api/authors/:id
 * Update an existing author
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const id = parseInt(event.context.params?.id || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid author ID'
        });
    }

    try {
        const body = await readBody<AuthorUpdateInput>(event);

        const config = useRuntimeConfig();
        const service = new AuthorCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const author = await service.updateAuthor(id, body);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: `PUT /api/authors/${id}`,
            correlation_id: correlationId,
            author_id: id,
            duration_ms: Date.now() - startTime,
        }));

        return { data: author };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: `PUT /api/authors/${id}`,
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to update author',
        });
    }
});
