import { AuthorCrudService } from '../../../../core/services/author-crud-service';

/**
 * DELETE /api/authors/:id
 * Delete an author
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
        const config = useRuntimeConfig();
        const service = new AuthorCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        await service.deleteAuthor(id);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: `DELETE /api/authors/${id}`,
            correlation_id: correlationId,
            author_id: id,
            duration_ms: Date.now() - startTime,
        }));

        return { success: true };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: `DELETE /api/authors/${id}`,
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error instanceof Error && error.message.includes('associated recipes')) {
            throw createError({
                statusCode: 409,
                message: 'Cannot delete author with associated recipes'
            });
        }

        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to delete author',
        });
    }
});
