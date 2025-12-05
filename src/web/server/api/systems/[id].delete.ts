import { SystemCrudService } from '../../../../core/services/system-crud-service';

export default defineEventHandler(async (event) => {
    const id = parseInt(event.context.params?.id || '');

    if (isNaN(id)) {
        throw createError({
            statusCode: 400,
            message: 'Invalid ID'
        });
    }

    const service = new SystemCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        await service.deleteSystem(id);
        return { success: true };
    } catch (error: any) {
        console.error(`Failed to delete system ${id}:`, error);
        console.error(`Failed to delete system ${id}:`, error);

        if (error.message === 'System not found') {
            throw createError({
                statusCode: 404,
                message: 'System not found'
            });
        }

        if (error.code === '23503') { // Foreign key violation
            throw createError({
                statusCode: 409,
                message: 'Cannot delete system because it has associated records (models, recipes, etc.)'
            });
        }

        throw createError({
            statusCode: 500,
            message: 'Failed to delete system'
        });
    } finally {
        await service.disconnect();
    }
});
