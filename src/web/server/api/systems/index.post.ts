import { SystemCrudService } from '../../../../core/services/system-crud-service';
import type { CameraSystemCreateInput } from '../../../../core/types/database';

export default defineEventHandler(async (event) => {
    const body = await readBody<CameraSystemCreateInput>(event);

    // Basic validation
    if (!body.name || !body.manufacturer) {
        throw createError({
            statusCode: 400,
            message: 'Name and Manufacturer are required'
        });
    }

    const service = new SystemCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const system = await service.createSystem(body);
        return system;
    } catch (error: any) {
        console.error('Failed to create system:', error);

        if (error.message.includes('unique constraint')) {
            throw createError({
                statusCode: 409,
                message: 'System with this name already exists'
            });
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to create system'
        });
    } finally {
        await service.disconnect();
    }
});
