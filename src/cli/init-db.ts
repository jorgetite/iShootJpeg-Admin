import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
        console.log('✅ Connected to database.\n');

        // Read the initialization SQL file
        const sqlPath = path.join(__dirname, '../core/db/fujifilm_db_init.sql');
        console.log(`📄 Reading initialization script from: ${sqlPath}`);

        const initSql = await fs.readFile(sqlPath, 'utf-8');
        console.log(`✅ Loaded SQL script (${initSql.length} characters)\n`);

        console.log('🚀 Executing initialization script...');
        console.log('   This will populate:');
        console.log('   - Camera systems (Fujifilm X-Series, GFX, X-Half)');
        console.log('   - 54 camera models');
        console.log('   - 11 sensor types');
        console.log('   - 39 film simulations');
        console.log('   - 26 setting definitions');
        console.log('   - Camera-film simulation mappings');
        console.log('   - Tags and reference data\n');

        // Execute the SQL script
        await client.query(initSql);

        console.log('✅ Initialization script executed successfully!\n');

        // Verify the data was loaded
        console.log('🔍 Verifying data...');
        const result = await client.query(`
            SELECT 
                (SELECT COUNT(*) FROM camera_systems) as systems,
                (SELECT COUNT(*) FROM camera_models) as cameras,
                (SELECT COUNT(*) FROM sensors) as sensors,
                (SELECT COUNT(*) FROM film_simulations) as film_sims,
                (SELECT COUNT(*) FROM setting_definitions) as settings,
                (SELECT COUNT(*) FROM tags) as tags
        `);

        const counts = result.rows[0];
        console.log('\n📊 Database populated with:');
        console.log(`   Camera Systems:      ${counts.systems}`);
        console.log(`   Camera Models:       ${counts.cameras}`);
        console.log(`   Sensors:             ${counts.sensors}`);
        console.log(`   Film Simulations:    ${counts.film_sims}`);
        console.log(`   Setting Definitions: ${counts.settings}`);
        console.log(`   Tags:                ${counts.tags}`);

        console.log('\n✨ Database initialization complete!');

        await client.end();
    } catch (error) {
        console.error('\n❌ Initialization failed:', error);
        await client.end();
        process.exit(1);
    }
}

main();
