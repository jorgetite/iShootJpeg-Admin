import { FilmSimulationCrudService } from '../../../../core/services/film-simulation-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'ID is required'
        });
    }

    const service = new FilmSimulationCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const updatedSimulation = await service.updateFilmSimulation(parseInt(id), body);
        return updatedSimulation;
    } catch (error: any) {
        if (error.code === '23505') {
            throw createError({
                statusCode: 409,
                message: 'A film simulation with this name already exists'
            });
        }
        console.error(`Failed to update film simulation ${id}:`, error);
        throw createError({
            statusCode: 500,
            message: 'Failed to update film simulation'
        });
    } finally {
        await service.disconnect();
    }
});
