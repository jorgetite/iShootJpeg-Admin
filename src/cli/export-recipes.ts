import { parseArgs } from 'node:util';
import { RecipeExportService } from '../core/services/recipe-export-service.js';

async function main() {
    const { values } = parseArgs({
        args: process.argv.slice(2).filter((arg) => arg !== '--'),
        options: {
            output: { type: 'string', short: 'o' },
            'recipe-id': { type: 'string' },
            'pretty': { type: 'boolean', default: true },
            'active-only': { type: 'boolean' },
            'featured-only': { type: 'boolean' }, // Added featured-only flag
            'dry-run': { type: 'boolean' },
            help: { type: 'boolean', short: 'h' },
        },
    });

    if (values.help) {
        console.log(`
Usage: pnpm run cli:export -- --output < path - to - json > [options]

Options:
-o, --output < path > Path to output JSON file(required)
--recipe - id < id > Export a single recipe by ID(optional)
--active - only       Export only active recipes(default: false)
--featured - only     Export only featured recipes(default: false)
--dry - run           Dry run mode - preview stats without writing file
--pretty            Pretty print JSON output(default: true)
    - h, --help              Show this help message

Examples:
  # Export all recipes
  pnpm run cli:export -- --output data / exports / recipes.json

  # Export a single recipe by ID
  pnpm run cli:export -- --output data / exports / recipe - 123.json--recipe - id 123

  # Export without pretty printing(compact JSON)
  pnpm run cli:export -- --output data / exports / recipes.json--pretty = false

  # Export only active recipes
  pnpm run cli:export -- --output data / exports / active - recipes.json--active - only

  # Export only featured recipes
  pnpm run cli:export -- --output data / exports / featured - recipes.json--featured - only

  # Dry run to preview stats
  pnpm run cli:export -- --dry - run
    `);
        process.exit(0);
    }

    if (!values.output && !values['dry-run']) {
        console.error('Error: --output argument is required (unless --dry-run is used).');
        console.error('Run with --help for usage information.');
        process.exit(1);
    }

    if (!process.env.DATABASE_URL) {
        console.error('Error: DATABASE_URL environment variable is not set.');
        process.exit(1);
    }

    const outputPath = values.output || 'dry-run-output.json';
    const recipeId = values['recipe-id'] ? parseInt(values['recipe-id'], 10) : null;
    const prettyPrint = values.pretty ?? true;
    const activeOnly = values['active-only'] ?? false;
    const featuredOnly = values['featured-only'] ?? false; // Extracted featuredOnly value
    const dryRun = values['dry-run'] ?? false;

    const exportService = new RecipeExportService(process.env.DATABASE_URL);

    try {
        await exportService.connect();

        const stats = recipeId
            ? await exportService.exportRecipeById(recipeId, { outputPath, prettyPrint, dryRun })
            : await exportService.exportRecipes({ outputPath, prettyPrint, activeOnly, featuredOnly, dryRun }); // Added featuredOnly to export options

        // Exit with error code if there were errors
        if (stats.errors > 0) {
            process.exit(1);
        }
    } catch (error) {
        console.error('Export failed:', error);
        process.exit(1);
    } finally {
        await exportService.disconnect();
    }
}

main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
});
