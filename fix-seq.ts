import { DatabaseService } from './src/core/services/database-service';

async function run() {
    const db = new DatabaseService(process.env.DATABASE_URL!);
    await db.connect();
    try {
        console.log('Fixing sensors_id_seq...');
        await db.pool.query(`SELECT setval('sensors_id_seq', (SELECT MAX(id) FROM sensors))`);

        console.log('Fixing film_simulations_id_seq...');
        await db.pool.query(`SELECT setval('film_simulations_id_seq', (SELECT MAX(id) FROM film_simulations))`);

        console.log('Done.');
    } catch (e) {
        console.error(e);
    } finally {
        await db.disconnect();
    }
}

run();
