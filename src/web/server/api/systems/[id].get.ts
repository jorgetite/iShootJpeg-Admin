import { SystemCrudService } from '../../../../core/services/system-crud-service';

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid ID'
        });
    }

    const service = new SystemCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const system = await service.getSystemById(id);

        if (!system) {
            throw createError({
                statusCode: 404,
                message: 'System not found'
            });
        }

        return system;
    } catch (error: any) {
        console.error(`Failed to fetch system ${id}:`, error);

        if (error.statusCode) throw error;

        throw createError({
            statusCode: 500,
            message: 'Failed to fetch system'
        });
    } finally {
        await service.disconnect();
    }
});
