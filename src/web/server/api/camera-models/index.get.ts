import { CameraModelCrudService } from '../../../../core/services/camera-model-crud-service';

export default defineEventHandler(async (event) => {
    const service = new CameraModelCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const query = getQuery(event);
        const systemId = query.system_id ? parseInt(query.system_id as string) : undefined;
        const sensorId = query.sensor_id ? parseInt(query.sensor_id as string) : undefined;

        const models = await service.getAllCameraModels({ systemId, sensorId });
        // Return plain array
        return models;
    } catch (error: any) {
        console.error('Failed to fetch camera models:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch camera models'
        });
    } finally {
        await service.disconnect();
    }
});
