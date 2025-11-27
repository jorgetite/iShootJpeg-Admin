import { AuthorCrudService } from '../../../../core/services/author-crud-service';

/**
 * GET /api/authors/:id
 * Get a single author by ID
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

        const author = await service.getAuthorById(id);

        await service.disconnect();

        if (!author) {
            throw createError({
                statusCode: 404,
                message: 'Author not found'
            });
        }

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: `GET /api/authors/${id}`,
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
            endpoint: `GET /api/authors/${id}`,
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch author',
        });
    }
});
