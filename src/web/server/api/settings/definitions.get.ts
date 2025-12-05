import { SystemCrudService } from '../../../../core/services/system-crud-service';

export default defineEventHandler(async (event) => {
    const service = new SystemCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const definitions = await service.getAllSettingDefinitions();
        return definitions;
    } catch (error: any) {
        console.error('Failed to fetch setting definitions:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch setting definitions'
        });
    } finally {
        await service.disconnect();
    }
});
