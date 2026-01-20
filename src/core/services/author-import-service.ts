import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import pg from 'pg';

interface AuthorRow {
    Name: string;
    'Site or Profile': string;
    URL: string;
    Count: string;
    'First publication': string;
    'Last publication': string;
}

interface AuthorData {
    name: string;
    bio: string | null;
    websiteUrl: string | null;
    socialHandle: string | null;
    socialPlatform: string | null;
}

interface SocialInfo {
    handle: string | null;
    platform: string | null;
}

export class AuthorImportService {
    private client: pg.Client;
    private dryRun: boolean;

    constructor(connectionString: string, dryRun: boolean = false) {
        this.dryRun = dryRun;
        this.client = new pg.Client({ connectionString });
    }

    async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.end();
    }

    async importAuthors(filePath: string) {
        const absolutePath = path.resolve(filePath);
        const fileContent = await fs.readFile(absolutePath, 'utf-8');

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as AuthorRow[];

        console.log(`Found ${records.length} authors to import.`);
        if (this.dryRun) {
            console.log('🔍 DRY RUN MODE: Changes will be rolled back\n');
        }

        try {
            await this.client.query('BEGIN');

            let imported = 0;
            let updated = 0;
            let skipped = 0;

            for (const row of records) {
                const result = await this.processRow(row);
                if (result === 'imported') imported++;
                else if (result === 'updated') updated++;
                else skipped++;
            }

            if (this.dryRun) {
                await this.client.query('ROLLBACK');
                console.log('\n✅ DRY RUN completed successfully. All changes rolled back.');
            } else {
                await this.client.query('COMMIT');
                console.log('\n✅ Import completed successfully.');
            }

            console.log(`\n📊 Summary:`);
            console.log(`   Total processed: ${records.length}`);
            console.log(`   New authors:     ${imported}`);
            console.log(`   Updated:         ${updated}`);
            console.log(`   Skipped:         ${skipped}`);

        } catch (error) {
            await this.client.query('ROLLBACK');
            console.error('\n❌ Import failed:', error);
            throw error;
        }
    }

    private async processRow(row: AuthorRow): Promise<'imported' | 'updated' | 'skipped'> {
        // Skip if no name
        if (!row.Name || row.Name.trim() === '') {
            console.warn('⚠️  Skipping row with missing name');
            return 'skipped';
        }

        const name = row.Name.trim();
        const slug = this.generateSlug(name);
        const websiteUrl = row.URL?.trim() || null;

        // Parse social info from "Site or Profile" field
        const socialInfo = this.parseSocialInfo(row['Site or Profile']);

        // Use the full "Site or Profile" as bio if it doesn't look like just a handle
        const siteOrProfile = row['Site or Profile']?.trim();
        const bio = siteOrProfile && !siteOrProfile.match(/^\w+\s*\(/i) ? siteOrProfile : null;

        console.log(`Processing: ${name} (${slug})${socialInfo.handle ? ` [@${socialInfo.handle} on ${socialInfo.platform}]` : ''}`);

        const result = await this.upsertAuthor({
            name,
            bio,
            websiteUrl,
            socialHandle: socialInfo.handle,
            socialPlatform: socialInfo.platform,
        });

        return result;
    }

    private parseSocialInfo(siteOrProfile: string | undefined): SocialInfo {
        if (!siteOrProfile) {
            return { handle: null, platform: null };
        }

        const text = siteOrProfile.trim();

        // Skip if it's "unknown" or similar
        if (text.toLowerCase() === 'unkown' || text.toLowerCase() === 'unknown') {
            return { handle: null, platform: null };
        }

        // Pattern: "handle (Platform)" or "handle (platform)"
        // Examples: "fordycephotographynz (Instagram)", "visualohio (instagram)"
        const platformMatch = text.match(/^(.+?)\s*\(([^)]+)\)\s*$/i);

        if (platformMatch) {
            const handle = platformMatch[1]!.trim();
            const platform = this.normalizePlatform(platformMatch[2]!.trim());
            return { handle, platform };
        }

        // If no platform specified but looks like a handle (no spaces, starts with letter/number)
        // Default to Instagram
        if (text.match(/^[\w.-]+$/)) {
            return { handle: text, platform: 'Instagram' };
        }

        // Otherwise, it's probably a full name or description, not a handle
        return { handle: null, platform: null };
    }

    private normalizePlatform(platform: string): string {
        const lower = platform.toLowerCase();

        // Map common variations to standard names
        const platformMap: Record<string, string> = {
            'instagram': 'Instagram',
            'facebook': 'Facebook',
            'face nook': 'Facebook', // typo in CSV
            'youtube': 'YouTube',
            'twitter': 'Twitter',
            'flickr': 'Flickr',
        };

        return platformMap[lower] || platform;
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    private async upsertAuthor(data: AuthorData): Promise<'imported' | 'updated'> {
        const slug = this.generateSlug(data.name);

        // Check if author exists
        const existing = await this.client.query(
            'SELECT id FROM authors WHERE slug = $1',
            [slug]
        );

        const isUpdate = existing.rows.length > 0;

        await this.client.query(
            `INSERT INTO authors (name, slug, bio, website_url, social_handle, social_platform, created_at)
             VALUES ($1, $2, $3, $4, $5, $6, now())
             ON CONFLICT (slug) DO UPDATE SET
                name = EXCLUDED.name,
                bio = EXCLUDED.bio,
                website_url = EXCLUDED.website_url,
                social_handle = EXCLUDED.social_handle,
                social_platform = EXCLUDED.social_platform,
                updated_at = now()`,
            [data.name, slug, data.bio, data.websiteUrl, data.socialHandle, data.socialPlatform]
        );

        return isUpdate ? 'updated' : 'imported';
    }
}
