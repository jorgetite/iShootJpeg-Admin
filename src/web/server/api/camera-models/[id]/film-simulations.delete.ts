import { CameraModelCrudService } from '../../../../../core/services/camera-model-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const query = getQuery(event);
    const filmSimulationId = query.filmSimulationId;

    if (!id || !filmSimulationId) {
        throw createError({
            statusCode: 400,
            message: 'Model ID and Film Simulation ID (query param) are required'
        });
    }

    const service = new CameraModelCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        await service.removeFilmSimulationFromModel(parseInt(id), Number(filmSimulationId));
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to remove film simulation from model ${id}:`, error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.data?.message || 'Failed to remove film simulation'
        });
    } finally {
        await service.disconnect();
    }
});
