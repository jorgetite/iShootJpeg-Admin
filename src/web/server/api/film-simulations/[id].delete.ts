import { FilmSimulationCrudService } from '../../../../core/services/film-simulation-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID is required'
        });
    }

    const service = new FilmSimulationCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        await service.deleteFilmSimulation(parseInt(id));
        return { success: true };
    } catch (error: any) {
        if (error.code === '23503') { // Foreign key violation
            throw createError({
                statusCode: 409,
                message: 'Cannot delete film simulation because it is associated with camera models or recipes'
            });
        }
        console.error(`Failed to delete film simulation ${id}:`, error);
        throw createError({
            statusCode: 500,
            message: 'Failed to delete film simulation'
        });
    } finally {
        await service.disconnect();
    }
});
