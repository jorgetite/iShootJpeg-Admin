import { CameraModelCrudService } from '../../../../core/services/camera-model-crud-service';
import type { CameraModelCreateInput } from '../../../../core/types/database';

export default defineEventHandler(async (event) => {
    const body = await readBody<CameraModelCreateInput>(event);

    // Basic validation
    if (!body.name || !body.system_id) {
        throw createError({
            statusCode: 400,
            message: 'Name and System ID are required'
        });
    }

    const service = new CameraModelCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const newModel = await service.createCameraModel(body);
        return newModel;
    } catch (error: any) {
        console.error('Failed to create camera model:', error);

        // Handle unique constraint violations
        if (error.code === '23505') {
            throw createError({
                statusCode: 409,
                message: 'A camera model with this name already exists for this system'
            });
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to create camera model'
        });
    } finally {
        await service.disconnect();
    }
});
