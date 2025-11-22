import { parseArgs } from 'node:util';

async function main() {
    const { values } = parseArgs({
        options: {
            source: {
                type: 'string',
            },
            resize: {
                type: 'string',
            },
            quality: {
                type: 'string',
                default: '85',
            },
            'dry-run': {
                type: 'boolean',
            },
        },
    });

    if (!values.source) {
        console.error('Error: --source argument is required');
        process.exit(1);
    }

    console.log(`Processing images from ${values.source}...`);
    console.log(`Resize: ${values.resize}`);
    console.log(`Quality: ${values.quality}`);
    console.log(`Dry run: ${values['dry-run']}`);

    // TODO: Implement image processing logic
}

main().catch((error) => {
    console.error('An error occurred:', error);
    process.exit(1);
});
