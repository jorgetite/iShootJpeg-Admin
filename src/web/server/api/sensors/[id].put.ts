import { SensorCrudService } from '../../../../core/services/sensor-crud-service';

export default defineEventHandler(async (event) => {
    const id = getRouterParam(event, 'id');
    const body = await readBody(event);

    if (!id) {
        throw createError({
            statusCode: 400,
            message: 'Sensor ID is required'
        });
    }

    const service = new SensorCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const updatedSensor = await service.updateSensor(parseInt(id), body);
        return updatedSensor;
    } catch (error: any) {
        if (error.code === '23505') {
            throw createError({
                statusCode: 409,
                message: 'A sensor with this name already exists'
            });
        }
        console.error(`Failed to update sensor ${id}:`, error);
        throw createError({
            statusCode: 500,
            message: 'Failed to update sensor'
        });
    } finally {
        await service.disconnect();
    }
});
