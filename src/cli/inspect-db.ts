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

        console.log('Checking "authors" table columns:');
        const authorsRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'authors';
    `);
        console.table(authorsRes.rows);

        console.log('Checking "recipes" table columns:');
        const recipesRes = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'recipes';
    `);
        console.table(recipesRes.rows);

        await client.end();
    } catch (error) {
        console.error('Inspection failed:', error);
        process.exit(1);
    }
}

main();
