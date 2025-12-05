import { SensorCrudService } from '../../../../core/services/sensor-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Sensor ID is required'
        });
    }

    const service = new SensorCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        await service.deleteSensor(parseInt(id));
        return { success: true };
    } catch (error: any) {
        if (error.code === '23503') { // Foreign key violation
            throw createError({
                statusCode: 409,
                message: 'Cannot delete sensor because it is used by camera models'
            });
        }
        console.error(`Failed to delete sensor ${id}:`, error);
        throw createError({
            statusCode: 500,
            message: 'Failed to delete sensor'
        });
    } finally {
        await service.disconnect();
    }
});
