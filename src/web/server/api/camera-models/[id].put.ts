import { CameraModelCrudService } from '../../../../core/services/camera-model-crud-service';
import type { CameraModelUpdateInput } from '../../../../core/types/database';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody<CameraModelUpdateInput>(event);

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Camera Model ID is required'
        });
    }

    const service = new CameraModelCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const updatedModel = await service.updateCameraModel(parseInt(id), body);
        return updatedModel;
    } catch (error: any) {
        console.error(`Failed to update camera model ${id}:`, error);

        if (error.code === '23505') {
            throw createError({
                statusCode: 409,
                message: 'A camera model with this name already exists for this system'
            });
        }

        throw createError({
            statusCode: error.statusCode || 500,
            message: error.data?.message || 'Failed to update camera model'
        });
    } finally {
        await service.disconnect();
    }
});
