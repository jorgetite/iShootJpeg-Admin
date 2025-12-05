import { CameraModelCrudService } from '../../../../../core/services/camera-model-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id || !body.filmSimulationId) {
        throw createError({
            statusCode: 400,
            message: 'Model ID and Film Simulation ID are required'
        });
    }

    const service = new CameraModelCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        await service.addFilmSimulationToModel(
            parseInt(id),
            body.filmSimulationId,
            body.addedViaFirmware || false
        );
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to add film simulation to model ${id}:`, error);
        throw createError({
            statusCode: error.statusCode || 500,
            message: error.data?.message || 'Failed to add film simulation'
        });
    } finally {
        await service.disconnect();
    }
});
