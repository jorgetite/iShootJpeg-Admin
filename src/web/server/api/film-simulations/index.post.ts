import { FilmSimulationCrudService } from '../../../../core/services/film-simulation-crud-service';

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.name) {
        throw createError({
            statusCode: 400,
            message: 'Name is required'
        });
    }

    const service = new FilmSimulationCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const newSimulation = await service.createFilmSimulation(body);
        return newSimulation;
    } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
            throw createError({
                statusCode: 409,
                message: 'A film simulation with this name already exists'
            });
        }
        console.error('Failed to create film simulation:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to create film simulation'
        });
    } finally {
        await service.disconnect();
    }
});
