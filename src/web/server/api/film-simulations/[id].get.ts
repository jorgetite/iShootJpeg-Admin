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
        const simulation = await service.getFilmSimulationById(parseInt(id));
        if (!simulation) {
            throw createError({
                statusCode: 404,
                message: 'Film simulation not found'
            });
        }
        return simulation;
    } catch (error: any) {
        if (error.statusCode === 404) throw error;
        console.error(`Failed to fetch film simulation ${id}:`, error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch film simulation details'
        });
    } finally {
        await service.disconnect();
    }
});
