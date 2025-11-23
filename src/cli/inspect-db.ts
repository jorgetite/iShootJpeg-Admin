import pg from 'pg';

const { Client } = pg;

async function main() {
    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Connected to database.');

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
            'recipe_setting_values',
        ];

        console.log('Table Counts:');
        for (const table of tables) {
            const res = await client.query(`SELECT count(*) FROM "${table}"`);
            console.log(`${table}: ${res.rows[0].count}`);
        }

        await client.end();
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

main();
