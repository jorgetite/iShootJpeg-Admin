import { AuthorCrudService } from '../../../../core/services/author-crud-service';
import type { AuthorCreateInput } from '../../../../core/types/database';

/**
 * POST /api/authors
 * Create a new author
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const body = await readBody<AuthorCreateInput>(event);

        if (!body.name) {
            throw createError({
                statusCode: 400,
                message: 'Name is required'
            });
        }

        const config = useRuntimeConfig();
        const service = new AuthorCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const author = await service.createAuthor(body);

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'POST /api/authors',
            correlation_id: correlationId,
            author_id: author.id,
            duration_ms: Date.now() - startTime,
        }));

        return { data: author };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'POST /api/authors',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        if (error instanceof Error && 'statusCode' in error) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to create author',
        });
    }
});
