import { TagCrudService } from '../../../../core/services/tag-crud-service';

/**
 * GET /api/tags
 * List all tags with pagination and search
 * 
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20, max: 100)
 * - search: string (optional)
 */
export default defineEventHandler(async (event) => {
    const startTime = Date.now();
    const correlationId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    try {
        const query = getQuery(event);
        const page = parseInt(query.page as string) || 1;
        const limit = Math.min(parseInt(query.limit as string) || 20, 100);
        const offset = (page - 1) * limit;

        const config = useRuntimeConfig();
        const service = new TagCrudService(config.DATABASE_URL || process.env.DATABASE_URL!);
        await service.connect();

        const { tags, total } = await service.searchTags({
            search: query.search as string,
            limit,
            offset
        });

        await service.disconnect();

        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'API',
            endpoint: 'GET /api/tags',
            correlation_id: correlationId,
            params: { page, limit, search: query.search },
            result_count: tags.length,
            total,
            duration_ms: Date.now() - startTime,
        }));

        return {
            data: tags,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'ERROR',
            service: 'API',
            endpoint: 'GET /api/tags',
            correlation_id: correlationId,
            error: error instanceof Error ? error.message : 'Unknown error',
            duration_ms: Date.now() - startTime,
        }));

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch tags',
        });
    }
});
