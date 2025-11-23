import pg from 'pg';

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const client = new pg.Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database.\n');

        // Reset all sequences to match current max IDs
        const tables = [
            'authors',
            'camera_systems',
            'camera_models',
            'sensors',
            'film_simulations',
            'style_categories',
            'recipes',
            'setting_categories',
            'setting_definitions',
            'tags',
        ];

        console.log('Resetting sequences...\n');

        for (const table of tables) {
            const result = await client.query(`SELECT MAX(id) as max_id FROM ${table}`);
            const maxId = result.rows[0].max_id || 0;

            await client.query(`SELECT setval('${table}_id_seq', ${maxId}, true)`);
            console.log(`✅ ${table}_id_seq reset to ${maxId}`);
        }

        console.log('\n✨ All sequences reset successfully!');
        await client.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
