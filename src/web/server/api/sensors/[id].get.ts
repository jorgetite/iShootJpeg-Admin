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
        const sensor = await service.getSensorById(parseInt(id));
        if (!sensor) {
            throw createError({
                statusCode: 404,
                message: 'Sensor not found'
            });
        }
        return sensor;
    } catch (error: any) {
        if (error.statusCode === 404) throw error;
        console.error(`Failed to fetch sensor ${id}:`, error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch sensor details'
        });
    } finally {
        await service.disconnect();
    }
});
