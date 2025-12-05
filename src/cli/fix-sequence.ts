import { DatabaseService } from '../core/services/database-service';

async function main() {
    const db = new DatabaseService(process.env.DATABASE_URL!);
    await db.connect();
    const client = await db.getClient();

    try {
        console.log('Fixing tags_id_seq...');
        await client.query(`SELECT setval('tags_id_seq', (SELECT MAX(id) FROM tags));`);
        console.log('Sequence fixed.');
    } catch (error) {
        console.error('Error fixing sequence:', error);
    } finally {
        client.release();
        await db.disconnect();
    }
}

main();
