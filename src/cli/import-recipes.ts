import { parseArgs } from 'node:util';

async function main() {
    const { values } = parseArgs({
        options: {
            file: {
                type: 'string',
            },
            'batch-size': {
                type: 'string',
                default: '100',
            },
            'dry-run': {
                type: 'boolean',
            },
        },
    });

    if (!values.file) {
        console.error('Error: --file argument is required');
        process.exit(1);
    }

    console.log(`Importing recipes from ${values.file}...`);
    console.log(`Batch size: ${values['batch-size']}`);
    console.log(`Dry run: ${values['dry-run']}`);

    // TODO: Implement import logic
}

main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
});
