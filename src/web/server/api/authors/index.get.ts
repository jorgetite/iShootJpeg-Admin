import { DatabaseService } from '../../../../core/services/database-service';
import type { Author } from '../../../../core/types/database';

/**
 * GET /api/authors
 * List all authors
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const config = useRuntimeConfig();
        const db = new DatabaseService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await db.connect();

        const authors = await db.getAll<Author>('authors', {}, 'name ASC');

        await db.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'GET /api/authors',
            correlation_id: correlationId,
            count: authors.length,
            duration_ms: Date.now() - startTime,
        }));

        return { data: authors };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'GET /api/authors',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch authors',
        });
    }
});
