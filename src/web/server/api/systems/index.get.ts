import { SystemCrudService } from '../../../../core/services/system-crud-service';

export default defineEventHandler(async (event) => {
    const service = new SystemCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const systems = await service.getAllSystems();
        return systems;
    } catch (error: any) {
        console.error('Failed to fetch systems:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch systems'
        });
    } finally {
        await service.disconnect();
    }
});
