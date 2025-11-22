import pg from 'pg';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Client } = pg;

async function main() {
    console.log('Running database migrations...');

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

        // Read schema file
        const __dirname = path.dirname(fileURLToPath(import.meta.url));
        // Navigate from src/cli to src/core/db
        const schemaPath = path.resolve(__dirname, '../core/db/schema.sql');

        console.log(`Reading schema from ${schemaPath}...`);
        const schemaSql = await fs.readFile(schemaPath, 'utf-8');

        // Execute in transaction
        console.log('Starting transaction...');
        await client.query('BEGIN');

        console.log('Executing schema...');
        await client.query(schemaSql);

        await client.query('COMMIT');
        console.log('Migration completed successfully.');

        await client.end();
    } catch (error) {
        console.error('Migration failed:', error);
        if (client) {
            try {
                await client.query('ROLLBACK');
                console.log('Transaction rolled back.');
            } catch (rollbackError) {
                console.error('Error rolling back transaction:', rollbackError);
            }
            await client.end();
        }
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
});
