import { parseArgs } from 'node:util';
import { AuthorImportService } from '../core/services/author-import-service.js';

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2).filter((arg) => arg !== '--'),
        options: {
            file: { type: 'string', short: 'f' },
            'dry-run': { type: 'boolean' },
            help: { type: 'boolean', short: 'h' },
        },
    });

    if (values.help) {
        console.log(`
Usage: pnpm run cli:import-authors -- --file <path-to-csv> [--dry-run]

Options:
  -f, --file <path>  Path to the authors CSV file to import
      --dry-run      Test import without persisting data (rolls back transaction)
  -h, --help         Show this help message
  `);
        process.exit(0);
    }

    if (!values.file) {
        console.error('Error: --file argument is required.');
        process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const dryRun = values['dry-run'] ?? false;
    const importService = new AuthorImportService(process.env.DATABASE_URL, dryRun);

    try {
        await importService.connect();
        await importService.importAuthors(values.file);
    } catch (error) {
        console.error('Import failed:', error);
        process.exit(1);
    } finally {
        await importService.disconnect();
    }
}

main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
});
