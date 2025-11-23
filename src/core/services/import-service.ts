import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import pg from 'pg';

const { Client } = pg;

interface RecipeRow {
    Creator: string;
    Name: string;
    Type: string;
    'Color /BW': string;
    Camera: string;
    Sensor: string;
    Base: string;
    Settings: string;
    Published: string;
    URL: string;
}

export class ImportService {
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

    async importRecipes(filePath: string) {
        const absolutePath = path.resolve(filePath);
        const fileContent = await fs.readFile(absolutePath, 'utf-8');

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as RecipeRow[];

        console.log(`Found ${records.length} recipes to import.`);
        if (this.dryRun) {
            console.log('🔍 DRY RUN MODE: Changes will be rolled back');
        }

        try {
            await this.client.query('BEGIN');

            for (const row of records) {
                await this.processRow(row);
            }

            if (this.dryRun) {
                await this.client.query('ROLLBACK');
                console.log('✅ DRY RUN completed successfully.All changes rolled back.');
            } else {
                await this.client.query('COMMIT');
                console.log('Import completed successfully.');
            }
        } catch (error) {
            await this.client.query('ROLLBACK');
            console.error('Import failed: ', error);
            throw error;
        }
    }

    private async processRow(row: RecipeRow) {
        console.log(`Processing recipe: ${row.Name}`);

        // 1. Author
        const authorId = await this.getOrCreateAuthor(row.Creator);

        // 2. System
        const systemId = await this.getOrCreateSystem(row.Type);

        // 3. Sensor
        const sensorId = await this.getOrCreateSensor(row.Sensor);

        // 4. Camera Model
        const modelId = await this.getOrCreateCameraModel(row.Camera, systemId, sensorId);

        // 5. Film Simulation
        const filmSimId = await this.getOrCreateFilmSimulation(row.Base, systemId);

        // 6. Style Category
        const styleId = await this.getOrCreateStyleCategory(row['Color /BW']);

        // 7. Recipe
        const recipeId = await this.upsertRecipe({
            authorId,
            systemId,
            modelId,
            sensorId,
            filmSimId,
            styleId,
            name: row.Name,
            description: '', // Not in CSV
            sourceUrl: row.URL,
            publishDate: this.parseDate(row.Published),
        });

        // 8. Settings
        const settingsMap = this.parseSettings(row.Settings);
        await this.saveRecipeSettings(recipeId, settingsMap, systemId);
    }

    private parseSettings(settingsStr: string): Record<string, string> {
        const settings: Record<string, string> = {};
        if (!settingsStr) return settings;

        const lines = settingsStr.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const colonIndex = trimmed.indexOf(':');
            if (colonIndex === -1) continue;

            const key = trimmed.substring(0, colonIndex).trim();
            const value = trimmed.substring(colonIndex + 1).trim();

            if (key && value) {
                settings[key] = value;
            }
        }
        return settings;
    }

    private parseDate(dateStr: string): string | null {
        if (!dateStr) return null;
        // Assume format might need adjustment, but for now try direct parsing
        // If CSV has "DD/MM/YYYY" or similar, might need specific logic.
        // JS Date constructor handles many formats.
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
    }

    private generateSlug(name: string): string {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    // --- Database Helpers ---

    private async getOrCreateAuthor(name: string): Promise<number> {
        const slug = this.generateSlug(name);
        const res = await this.client.query(
            `INSERT INTO authors (name, slug) VALUES ($1, $2) 
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
            [name, slug]
        );
        return res.rows[0].id;
    }

    private async getOrCreateSystem(name: string): Promise<number> {
        // Manufacturer is required, assume name for now if unknown
        const res = await this.client.query(
            `INSERT INTO camera_systems (name, manufacturer) VALUES ($1, $1) 
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
            [name]
        );
        return res.rows[0].id;
    }

    private async getOrCreateSensor(name: string): Promise<number> {
        // Type is required, assume 'Unknown' or derive
        const res = await this.client.query(
            `INSERT INTO sensors (name, type) VALUES ($1, 'Unknown') 
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
            [name]
        );
        return res.rows[0].id;
    }

    private async getOrCreateCameraModel(name: string, systemId: number, sensorId: number): Promise<number> {
        const res = await this.client.query(
            `INSERT INTO camera_models (name, system_id, sensor_id) VALUES ($1, $2, $3) 
       ON CONFLICT (system_id, name) DO UPDATE SET sensor_id = EXCLUDED.sensor_id 
       RETURNING id`,
            [name, systemId, sensorId]
        );
        return res.rows[0].id;
    }

    private async getOrCreateFilmSimulation(name: string, systemId: number): Promise<number> {
        const res = await this.client.query(
            `INSERT INTO film_simulations (name, system_id, label) VALUES ($1, $2, $1) 
       ON CONFLICT (system_id, name) DO NOTHING 
       RETURNING id`,
            [name, systemId]
        );

        if (res.rows.length > 0) return res.rows[0].id;

        // If conflict and DO NOTHING, fetch existing
        const existing = await this.client.query(
            `SELECT id FROM film_simulations WHERE system_id = $1 AND name = $2`,
            [systemId, name]
        );
        return existing.rows[0].id;
    }

    private async getOrCreateStyleCategory(name: string): Promise<number> {
        // Map "Color" -> "Color", "BW" -> "B&W" if needed, or just use raw
        const normalized = name === 'BW' ? 'B&W' : name;
        const res = await this.client.query(
            `INSERT INTO style_categories (name) VALUES ($1) 
       ON CONFLICT (name) DO NOTHING 
       RETURNING id`,
            [normalized]
        );

        if (res.rows.length > 0) return res.rows[0].id;

        const existing = await this.client.query(
            `SELECT id FROM style_categories WHERE name = $1`,
            [normalized]
        );
        return existing.rows[0].id;
    }

    private async upsertRecipe(data: {
        authorId: number;
        systemId: number;
        modelId: number;
        sensorId: number;
        filmSimId: number;
        styleId: number;
        name: string;
        description: string;
        sourceUrl: string;
        publishDate: string | null;
    }): Promise<number> {
        const slug = this.generateSlug(data.name);

        const res = await this.client.query(
            `INSERT INTO recipes (
        author_id, system_id, camera_model_id, sensor_id, film_simulation_id, style_category_id,
        name, slug, description, source_url, publish_date, source_type
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, 'community')
       ON CONFLICT (slug) DO UPDATE SET
        author_id = EXCLUDED.author_id,
        system_id = EXCLUDED.system_id,
        camera_model_id = EXCLUDED.camera_model_id,
        sensor_id = EXCLUDED.sensor_id,
        film_simulation_id = EXCLUDED.film_simulation_id,
        style_category_id = EXCLUDED.style_category_id,
        source_url = EXCLUDED.source_url,
        publish_date = EXCLUDED.publish_date
       RETURNING id`,
            [
                data.authorId, data.systemId, data.modelId, data.sensorId, data.filmSimId, data.styleId,
                data.name, slug, data.description, data.sourceUrl, data.publishDate
            ]
        );
        return res.rows[0].id;
    }

    private async saveRecipeSettings(recipeId: number, settings: Record<string, string>, systemId: number) {
        // Clear existing settings for this recipe to ensure full sync
        await this.client.query('DELETE FROM recipe_setting_values WHERE recipe_id = $1', [recipeId]);

        for (const [key, value] of Object.entries(settings)) {
            // 1. Get or Create Setting Definition
            const settingDefId = await this.getOrCreateSettingDefinition(key);

            // 2. Link to System (if not exists)
            await this.client.query(
                `INSERT INTO system_settings (system_id, setting_definition_id) VALUES ($1, $2)
         ON CONFLICT DO NOTHING`,
                [systemId, settingDefId]
            );

            // 3. Insert Value
            try {
                await this.client.query(
                    `INSERT INTO recipe_setting_values (recipe_id, setting_definition_id, value)
           VALUES ($1, $2, $3)`,
                    [recipeId, settingDefId, value]
                );
            } catch (error: any) {
                if (error.code === '22001') {
                    console.error(`Value too long for setting '${key}': "${value}" (Length: ${value.length})`);
                }
                throw error;
            }
        }
    }

    private async getOrCreateSettingDefinition(name: string): Promise<number> {
        const slug = this.generateSlug(name);

        // Ensure a default category exists
        const categoryId = await this.getOrCreateSettingCategory('General');

        const res = await this.client.query(
            `INSERT INTO setting_definitions (category_id, name, slug, data_type) 
       VALUES ($1, $2, $3, 'text')
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
            [categoryId, name, slug]
        );

        if (res.rows.length > 0) return res.rows[0].id;

        const existing = await this.client.query(
            `SELECT id FROM setting_definitions WHERE slug = $1`,
            [slug]
        );
        return existing.rows[0].id;
    }

    private async getOrCreateSettingCategory(name: string): Promise<number> {
        const slug = this.generateSlug(name);
        const res = await this.client.query(
            `INSERT INTO setting_categories (name, slug) VALUES ($1, $2)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
            [name, slug]
        );

        if (res.rows.length > 0) return res.rows[0].id;

        const existing = await this.client.query(
            `SELECT id FROM setting_categories WHERE slug = $1`,
            [slug]
        );
        return existing.rows[0].id;
    }
}
