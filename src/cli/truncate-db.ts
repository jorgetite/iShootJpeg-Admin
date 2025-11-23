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

        console.log('Truncating all tables...');

        // Truncate in reverse order of dependencies
        await client.query('TRUNCATE TABLE recipe_setting_values CASCADE');
        await client.query('TRUNCATE TABLE recipes CASCADE');
        await client.query('TRUNCATE TABLE setting_definitions CASCADE');
        await client.query('TRUNCATE TABLE setting_categories CASCADE');
        await client.query('TRUNCATE TABLE film_simulations CASCADE');
        await client.query('TRUNCATE TABLE style_categories CASCADE');
        await client.query('TRUNCATE TABLE sensors CASCADE');
        await client.query('TRUNCATE TABLE camera_models CASCADE');
        await client.query('TRUNCATE TABLE camera_systems CASCADE');
        await client.query('TRUNCATE TABLE authors CASCADE');

        console.log('All tables truncated successfully.');
        await client.end();
    } catch (error) {
        console.error('Truncation failed:', error);
        process.exit(1);
    }
}

main();
