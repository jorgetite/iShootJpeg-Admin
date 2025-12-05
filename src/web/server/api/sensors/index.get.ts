import { SensorCrudService } from '../../../../core/services/sensor-crud-service';
// Force reload

export default defineEventHandler(async (event) => {
    const service = new SensorCrudService(process.env.DATABASE_URL!);
    await service.connect();

    try {
        const sensors = await service.getAllSensors();
        return sensors;
    } catch (error: any) {
        console.error('Failed to fetch sensors:', error);
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch sensors'
        });
    } finally {
        await service.disconnect();
    }
});
