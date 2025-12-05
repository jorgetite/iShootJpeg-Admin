import { FilmSimulationCrudService } from '../../../../core/services/film-simulation-crud-service';

export default defineEventHandler(async (event) => {
    const service = new FilmSimulationCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const query = getQuery(event);
        const systemId = query.system_id ? parseInt(query.system_id as string) : undefined;
        const simulations = await service.getAllFilmSimulations(systemId);
        return simulations;
    } catch (error: any) {
        console.error('Failed to fetch film simulations:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch film simulations'
        });
    } finally {
        await service.disconnect();
    }
});
