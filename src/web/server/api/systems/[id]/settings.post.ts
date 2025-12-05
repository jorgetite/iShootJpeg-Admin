import { SystemCrudService } from '../../../../../core/services/system-crud-service';

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid ID'
        });
    }

    const body = await readBody(event);
    const { setting_definition_id, is_supported, notes } = body;

    if (!setting_definition_id) {
        throw createError({
            statusCode: 400,
            message: 'setting_definition_id is required'
        });
    }

    const service = new SystemCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        await service.addSystemSetting(id, setting_definition_id, is_supported, notes);
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to add setting to system ${id}:`, error);
        throw createError({
            statusCode: 500,
            message: 'Failed to add system setting'
        });
    } finally {
        await service.disconnect();
    }
});
