import { CameraModelCrudService } from '../../../../../core/services/camera-model-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const query = getQuery(event);
    const modelId = query.modelId;

    if (!id || !modelId) {
        throw createError({
            statusCode: 400,
            message: 'System ID and Model ID (query param) are required'
        });
    }

    const service = new CameraModelCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const simulations = await service.getAvailableFilmSimulationsForSystem(parseInt(id), Number(modelId));
        return simulations;
    } catch (error: any) {
        console.error(`Failed to fetch available simulations for system ${id}:`, error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.data?.message || 'Failed to fetch available simulations'
        });
    } finally {
        await service.disconnect();
    }
});
