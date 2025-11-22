import pg from 'pg';
import { parseArgs } from 'node:util';

const { Client } = pg;

async function main() {
    console.log('Testing database connection...');

    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
    });

    try {
        await client.connect();
        console.log('Successfully connected to the database!');
        const res = await client.query('SELECT NOW()');
        console.log('Current database time:', res.rows[0].now);
        await client.end();
    } catch (error) {
        console.error('Failed to connect to the database:', error);
        process.exit(1);
    }
}

main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
});
