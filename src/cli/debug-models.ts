import { SystemCrudService } from '../core/services/system-crud-service';
import { CameraModelCrudService } from '../core/services/camera-model-crud-service';

async function main() {
    const dbUrl = process.env.DATABASE_URL || 'postgresql://localhost/ishootjpeg_admin';
    console.log('Connecting to:', dbUrl);

    const systemService = new SystemCrudService(dbUrl);
    const modelService = new CameraModelCrudService(dbUrl);

    try {
        await systemService.connect();
        await modelService.connect();

        console.log('\n--- Systems ---');
        const systems = await systemService.getAllSystems();
        console.table(systems);

        console.log('\n--- Checking specific model name ---');
        const models = await modelService.getAllCameraModels();
        const conflictModel = models.find(m => m.name.includes('UniqueTestModel') || m.name.includes('SuperUnique'));
        console.log('Conflict candidate found:', conflictModel);

        console.log('\n--- All Models (First 10) ---');
        console.table(models.slice(0, 10));

    } catch (err) {
        console.error('Error:', err);
    } finally {
        await systemService.disconnect();
        await modelService.disconnect();
    }
}

main();
