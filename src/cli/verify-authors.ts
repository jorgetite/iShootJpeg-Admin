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

        // Sample authors with social info
        const result = await client.query(`
            SELECT name, slug, social_handle, social_platform, website_url
            FROM authors
            WHERE social_handle IS NOT NULL
            ORDER BY name
            LIMIT 10
        `);

        console.log('Sample Authors with Social Info:');
        console.log('='.repeat(80));
        for (const row of result.rows) {
            console.log(`${row.name} (@${row.social_handle} on ${row.social_platform})`);
        }

        // Count by platform
        const platformCounts = await client.query(`
            SELECT social_platform, COUNT(*) as count
            FROM authors
            WHERE social_platform IS NOT NULL
            GROUP BY social_platform
            ORDER BY count DESC
        `);

        console.log('\n\nAuthors by Social Platform:');
        console.log('='.repeat(80));
        for (const row of platformCounts.rows) {
            console.log(`${row.social_platform}: ${row.count}`);
        }

        await client.end();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

main();
