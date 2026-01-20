import { DatabaseService } from '../../../core/services/database-service';

/**
 * GET /api/stats
 * Returns aggregate statistics for the dashboard
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = crypto.randomUUID();

    console.log(JSON.stringify({
        timestamp: new Date().toISOString(),
        level: 'INFO',
        service: 'api/stats',
        event: 'stats_request_start',
        correlation_id: correlationId,
    }));

    try {
        const config = useRuntimeConfig();
        const dbService = new DatabaseService(config.DATABASE_URL);

        // Get a client to run raw SQL queries
        const client = await dbService.getClient();

        try {
            // Fetch counts for all entities
            // Note: authors table does not have is_active column
            const [recipes, authors, tags, cameraSystems] = await Promise.all([
                client.query('SELECT COUNT(*) as count FROM recipes WHERE is_active = true'),
                client.query('SELECT COUNT(*) as count FROM authors'),
                client.query('SELECT COUNT(*) as count FROM tags WHERE is_active = true'),
                client.query('SELECT COUNT(*) as count FROM systems WHERE is_active = true'),
            ]);

            const stats = {
                recipes: parseInt(recipes.rows[0]?.count || '0'),
                authors: parseInt(authors.rows[0]?.count || '0'),
                tags: parseInt(tags.rows[0]?.count || '0'),
                cameraSystems: parseInt(cameraSystems.rows[0]?.count || '0'),
            };

            const duration = Date.now() - startTime;

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'api/stats',
                event: 'stats_request_success',
                correlation_id: correlationId,
                duration_ms: duration,
                stats,
            }));

            return stats;
        } finally {
            client.release();
        }
    } catch (error) {
        const duration = Date.now() - startTime;

        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'api/stats',
            event: 'stats_request_error',
            correlation_id: correlationId,
            duration_ms: duration,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
        }));

        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to fetch statistics',
        });
    }
});
