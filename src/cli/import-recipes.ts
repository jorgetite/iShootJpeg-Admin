import { parseArgs } from 'node:util';
import { ImportService } from '../core/services/import-service.js';

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2).filter((arg) => arg !== '--'),
        options: {
            file: { type: 'string', short: 'f' },
            'dry-run': { type: 'boolean' },
            'log-dir': { type: 'string' },
            truncate: { type: 'boolean' },
            help: { type: 'boolean', short: 'h' },
        },
    });

    if (values.help) {
        console.log(`
Usage: pnpm run cli:import -- --file <path-to-csv> [options]

Options:
  -f, --file <path>     Path to the CSV file to import (required)
      --truncate        Truncate recipes table before importing
      --dry-run         Test import without persisting data (rolls back transaction)
      --log-dir <path>  Directory for log files (default: data/logs)
  -h, --help            Show this help message

Examples:
  # Import recipes with default settings
  pnpm run cli:import -- --file tests/fixtures/recipes.csv

  # Truncate existing recipes before import
  pnpm run cli:import -- --file tests/fixtures/recipes.csv --truncate

  # Dry-run to test without persisting
  pnpm run cli:import -- --file tests/fixtures/recipes.csv --dry-run

  # Specify custom log directory
  pnpm run cli:import -- --file data/imports/recipes.csv --log-dir /custom/logs
  `);
        process.exit(0);
    }

    if (!values.file) {
        console.error('Error: --file argument is required.');
        console.error('Run with --help for usage information.');
        process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const dryRun = values['dry-run'] ?? false;
    const logDir = values['log-dir'] ?? 'data/logs';
    const truncate = values['truncate'] ?? false;

    const importService = new ImportService(
        process.env.DATABASE_URL,
        dryRun,
        logDir,
        truncate
    );

    try {
        await importService.connect();
        const report = await importService.importRecipes(values.file);

        // Exit with error code if there were errors
        if (report.summary.errors > 0 && !dryRun) {
            process.exit(1);
        }
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
