import { SystemCrudService } from '../../../../core/services/system-crud-service';
import type { CameraSystemUpdateInput } from '../../../../core/types/database';

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid ID'
        });
    }

    const body = await readBody<CameraSystemUpdateInput>(event);
    const service = new SystemCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const system = await service.updateSystem(id, body);
        return system;
    } catch (error: any) {
        console.error(`Failed to update system ${id}:`, error);

        if (error.message === 'System not found') {
            throw createError({
                statusCode: 404,
                message: 'System not found'
            });
        }

        if (error.message.includes('unique constraint')) {
            throw createError({
                statusCode: 409,
                message: 'System with this name already exists'
            });
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to update system'
        });
    } finally {
        await service.disconnect();
    }
});
