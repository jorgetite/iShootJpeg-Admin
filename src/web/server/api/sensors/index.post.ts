import { SensorCrudService } from '../../../../core/services/sensor-crud-service';
// Force reload

export default defineEventHandler(async (event) => {
    const body = await readBody(event);

    if (!body.name || !body.type) {
        throw createError({
            statusCode: 400,
            message: 'Name and Type are required'
        });
    }

    const service = new SensorCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const newSensor = await service.createSensor(body);
        return newSensor;
    } catch (error: any) {
        if (error.code === '23505') { // Unique constraint violation
            throw createError({
                statusCode: 409,
                message: 'A sensor with this name already exists'
            });
        }
        console.error('Failed to create sensor:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to create sensor'
        });
    } finally {
        await service.disconnect();
    }
});
