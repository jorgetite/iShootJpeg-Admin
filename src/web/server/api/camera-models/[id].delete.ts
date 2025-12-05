import { CameraModelCrudService } from '../../../../core/services/camera-model-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Camera Model ID is required'
        });
    }

    const service = new CameraModelCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        await service.deleteCameraModel(parseInt(id));
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to delete camera model ${id}:`, error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.data?.message || 'Failed to delete camera model'
        });
    } finally {
        await service.disconnect();
    }
});
