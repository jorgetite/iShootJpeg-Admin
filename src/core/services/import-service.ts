import fs from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';
import pg from 'pg';
import { SettingTransformer } from './setting-transformer.js';

// ============================================================================
// Type Definitions
// ============================================================================

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

interface ImportStats {
    totalRows: number;
    successfulImports: number;
    errors: number;
    recipesCreated: number;
    recipesUpdated: number;
}

interface NewEntriesTracker {
    authors: Map<number, string>;
    systems: Map<number, string>;
    cameras: Map<number, { name: string; system: string }>;
    sensors: Map<number, string>;
    filmSimulations: Map<number, string>;
}

interface TableStats {
    table: string;
    inserts: number;
    updates: number;
}

interface ErrorRow {
    rowNumber: number;
    csvRow: RecipeRow;
    errorMessage: string;
}

interface ParsedSetting {
    definitionId: number;
    value: string;
}

interface ImportReport {
    timestamp: string;
    inputFile: string;
    logDirectory: string;
    summary: {
        totalRecipes: number;
        successful: number;
        errors: number;
    };
    recipes: {
        created: number;
        updated: number;
    };
    newEntries: {
        authors: Array<{ id: number; name: string }>;
        cameras: Array<{ id: number; name: string; system: string }>;
        sensors: Array<{ id: number; name: string }>;
        filmSimulations: Array<{ id: number; name: string }>;
    };
    tableStats: TableStats[];
    outputFiles: {
        errors: string | null;
        report: string;
    };
}

// ============================================================================
// Import Service
// ============================================================================

export class ImportService {
    private client: pg.Client;
    private dryRun: boolean;
    private logDir: string;
    private timestamp: string;
    private truncate: boolean;

    // Tracking
    private stats: ImportStats;
    private errors: ErrorRow[];
    private newEntries: NewEntriesTracker;
    private tableStats: Map<string, { inserts: number; updates: number }>;

    // Caches
    private settingDefinitionsCache: Map<string, any> | null = null;
    private styleCategoriesCache: Map<string, number> | null = null;

    constructor(connectionString: string, dryRun: boolean = false, logDir: string = 'data/logs', truncate: boolean = false) {
        this.client = new pg.Client({ connectionString });
        this.dryRun = dryRun;
        this.logDir = logDir;
        this.truncate = truncate;
        this.timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);

        this.stats = {
            totalRows: 0,
            successfulImports: 0,
            errors: 0,
            recipesCreated: 0,
            recipesUpdated: 0,
        };

        this.errors = [];

        this.newEntries = {
            authors: new Map(),
            systems: new Map(),
            cameras: new Map(),
            sensors: new Map(),
            filmSimulations: new Map(),
        };

        this.tableStats = new Map();
    }

    async connect() {
        await this.client.connect();
    }

    async disconnect() {
        await this.client.end();
    }

    // ========================================================================
    // Main Import Method
    // ========================================================================

    private async loadCaches(): Promise<void> {
        await this.loadSettingDefinitionsCache();
    }

    async importRecipes(filePath: string): Promise<ImportReport> {
        const absolutePath = path.resolve(filePath);
        const fileContent = await fs.readFile(absolutePath, 'utf-8');

        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        }) as RecipeRow[];

        await this.loadCaches();

        if (this.truncate) {
            if (this.dryRun) {
                console.log('⚠️  Skipping truncation in dry-run mode');
            } else {
                console.log('🗑️  Truncating recipes tables...');
                await this.client.query('TRUNCATE TABLE recipes RESTART IDENTITY CASCADE');
                console.log('✅ Tables truncated and ID sequences reset.\n');
            }
        }

        this.stats.totalRows = records.length;
        console.log(`\n📦 Found ${records.length} recipes to import.`);

        if (this.dryRun) {
            console.log('🔍 DRY RUN MODE: Changes will be rolled back\n');
        }

        // Process each row with its own transaction
        for (let i = 0; i < records.length; i++) {
            try {
                // Start transaction for this recipe
                await this.client.query('BEGIN');

                await this.processRow(records[i], i);

                // Commit if successful (or rollback if dry-run)
                if (this.dryRun) {
                    await this.client.query('ROLLBACK');
                } else {
                    await this.client.query('COMMIT');
                }

                this.stats.successfulImports++;

                // Progress indicator every 100 rows
                if ((i + 1) % 100 === 0) {
                    console.log(`  Processed ${i + 1}/${records.length} recipes...`);
                }
            } catch (error: any) {
                // Rollback this recipe's transaction
                await this.client.query('ROLLBACK');

                this.stats.errors++;

                // Log first error for debugging
                if (this.errors.length === 0) {
                    console.error(`\n⚠️  First error at row ${i + 2}:`, error.message);
                    console.error(`   Recipe: ${records[i].Name} by ${records[i].Creator}`);
                }

                this.errors.push({
                    rowNumber: i + 2, // +2 for header and 0-index
                    csvRow: records[i],
                    errorMessage: error.message || 'Unknown error',
                });
            }
        }

        console.log('\n✅ Import completed successfully.');

        // Write error file if there are errors
        let errorFilePath: string | null = null;
        if (this.errors.length > 0 && !this.dryRun) {
            errorFilePath = await this.writeErrorsCSV();
        }

        // Generate report
        const report = await this.generateReport(absolutePath, errorFilePath);

        // Write report JSON
        if (!this.dryRun) {
            await this.writeReportJSON(report);
        }

        // Display report
        this.displayReport(report);

        return report;
    }

    // ========================================================================
    // Row Processing
    // ========================================================================

    private async processRow(row: RecipeRow, index: number): Promise<void> {
        // Validate required fields
        if (!row.Creator || !row.Name || !row.Base) {
            throw new Error('Missing required field: Creator, Name, or Base');
        }

        // 1. Lookup author (strict matching, no auto-creation)
        const authorId = await this.lookupAuthor(row.Creator.trim());

        // 2. Lookup sensor (strict matching, no auto-creation)
        const sensorId = await this.lookupSensor(row.Sensor.trim());

        // 3. Lookup camera (strict matching, no auto-creation)
        const cameraId = await this.lookupCamera(row.Camera.trim());

        // 4. Get system from camera
        const systemId = await this.getSystemFromCamera(cameraId);

        // 5. Lookup film simulation (strict matching, no auto-creation)
        const filmSimId = await this.lookupFilmSimulation(row.Base.trim(), systemId);

        // 6. Lookup style category (no creation)
        const styleCategoryId = await this.lookupStyleCategory(row['Color /BW'].trim());
        if (!styleCategoryId) {
            throw new Error(`Style category not found: ${row['Color /BW']}`);
        }

        // 7. Parse and validate settings
        const parsedSettings = await this.parseAndValidateSettings(row.Settings);

        // 8. Parse publish date
        const publishDate = this.parseDate(row.Published);

        // 7. Insert or update recipe
        const recipeId = await this.insertRecipe({
            name: row.Name.trim(),
            authorId,
            sensorId,
            cameraId,
            filmSimId,
            styleCategoryId: styleCategoryId!,
            publishDate: this.parseDate(row.Published),
            sourceUrl: row.URL?.trim() || null,
        });

        // 10. Insert recipe settings
        if (parsedSettings.length > 0) {
            await this.insertRecipeSettings(recipeId, parsedSettings);
        }
    }

    // ========================================================================
    // Categorical Data Lookup/Creation
    // ========================================================================

    private async lookupAuthor(name: string): Promise<number> {
        const trimmed = name.trim();

        // Strategy 1: Exact match by name
        let result = await this.client.query(
            'SELECT id FROM authors WHERE name = $1',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 2: Case-insensitive match by name
        result = await this.client.query(
            'SELECT id FROM authors WHERE LOWER(name) = LOWER($1)',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 3: Match by slug
        const slug = this.generateSlug(trimmed);
        result = await this.client.query(
            'SELECT id FROM authors WHERE slug = $1',
            [slug]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 4: Fuzzy match - remove spaces, hyphens, special chars from name
        const normalized = trimmed.toLowerCase().replace(/[\s\-_\.]/g, '');
        result = await this.client.query(
            `SELECT id FROM authors 
             WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(name, ' ', ''), '-', ''), '_', ''), '.', '')) = $1`,
            [normalized]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // No match found
        throw new Error(`Author not found: ${name}`);
    }

    // Map CSV sensor names to Database sensor names
    private static readonly SENSOR_MAP: Record<string, string> = {
        'X-Trans V HR': 'X-Trans CMOS 5 HR',
        'X-Trans V HS': 'X-Trans CMOS 5 BSI',
        'X-Trans V BSI Stkd': 'X-Trans CMOS 5 BSI',
        'X-Trans IV': 'X-Trans CMOS IV',
        'X-Trans III': 'X-Trans CMOS III',
        'X-Trans II': 'X-Trans CMOS II',
        'X-Trans II 2/3': 'X-Trans CMOS II', // Assuming mapping to II
        'X-Trans I': 'X-Trans CMOS I',
        'Bayer': 'Bayer CMOS APS-C',
        'BAYER (type unknown)': 'Bayer CMOS APS-C',
        'BAYER MF 50MP': 'Bayer MF 50',
        'BAYER MF 100MP': 'Bayer MF 100',
    };

    // Map CSV film simulation names to Database names
    private static readonly FILM_SIM_MAP: Record<string, string> = {
        'Pro Neg. High': 'Pro Neg. Hi',
        'Pro Neg. Std': 'Pro Neg. Std', // Ensure this exists
        'Nostalgic Negative': 'Nostalgic Neg.',
        'Monochrome': 'Acros', // Often used interchangeably or as base
        'B&W': 'Monochrome',
    };

    private async lookupSensor(name: string): Promise<number> {
        let trimmed = name.trim();

        // Apply mapping if exists
        if (ImportService.SENSOR_MAP[trimmed]) {
            trimmed = ImportService.SENSOR_MAP[trimmed];
        }

        // Strategy 1: Exact match (case-sensitive)
        let result = await this.client.query(
            'SELECT id FROM sensors WHERE name = $1',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 2: Case-insensitive match
        result = await this.client.query(
            'SELECT id FROM sensors WHERE LOWER(name) = LOWER($1)',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 3: Fuzzy match - remove spaces, hyphens, special chars
        const normalized = trimmed.toLowerCase().replace(/[\s\-_]/g, '');
        result = await this.client.query(
            `SELECT id, name FROM sensors WHERE LOWER(REPLACE(REPLACE(REPLACE(name, ' ', ''), '-', ''), '_', '')) = $1`,
            [normalized]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // No match found
        throw new Error(`Sensor not found: ${name}`);
    }

    private inferSensorType(sensorName: string): string {
        const name = sensorName.toLowerCase();

        if (name.includes('x-trans')) {
            return 'X-Trans';
        } else if (name.includes('bayer')) {
            return 'Bayer';
        } else if (name.includes('stacked')) {
            return 'Stacked CMOS';
        } else if (name.includes('mf') || name.includes('medium format')) {
            return 'Medium Format';
        }

        // Default to Bayer for unknown types
        return 'Bayer';
    }

    private async lookupCamera(name: string): Promise<number> {
        const trimmed = name.trim();

        // Strategy 1: Exact match (case-sensitive)
        let result = await this.client.query(
            'SELECT id FROM camera_models WHERE name = $1',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 2: Case-insensitive match
        result = await this.client.query(
            'SELECT id FROM camera_models WHERE LOWER(name) = LOWER($1)',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 3: Fuzzy match - remove spaces, hyphens, special chars
        // XPRO3 -> X-Pro3, X100v -> X100V, X-H2s -> X-H2S
        const normalized = trimmed.toLowerCase().replace(/[\s\-_]/g, '');
        result = await this.client.query(
            `SELECT id, name FROM camera_models 
             WHERE LOWER(REPLACE(REPLACE(REPLACE(name, ' ', ''), '-', ''), '_', '')) = $1`,
            [normalized]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // No match found
        throw new Error(`Camera not found: ${name}`);
    }

    private async inferSystemFromCameraName(cameraName: string): Promise<number> {
        // Check for GFX cameras
        if (cameraName.toUpperCase().includes('GFX')) {
            const gfx = await this.client.query(
                "SELECT id FROM camera_systems WHERE name LIKE '%GFX%'"
            );
            if (gfx.rows.length > 0) return gfx.rows[0].id;
        }

        // Check for X-Half
        if (cameraName.toUpperCase().includes('XQ')) {
            const xhalf = await this.client.query(
                "SELECT id FROM camera_systems WHERE name LIKE '%Half%'"
            );
            if (xhalf.rows.length > 0) return xhalf.rows[0].id;
        }

        // Default to Fujifilm X-Series (system_id = 1)
        return 1;
    }

    private async getSystemFromCamera(cameraId: number): Promise<number> {
        const result = await this.client.query(
            'SELECT system_id FROM camera_models WHERE id = $1',
            [cameraId]
        );
        return result.rows[0].system_id;
    }

    private async getSystemName(systemId: number): Promise<string> {
        const result = await this.client.query(
            'SELECT name FROM camera_systems WHERE id = $1',
            [systemId]
        );
        return result.rows[0].name;
    }

    private async lookupFilmSimulation(label: string, systemId: number): Promise<number> {
        let trimmed = label.trim();

        // Apply mapping if exists
        if (ImportService.FILM_SIM_MAP[trimmed]) {
            trimmed = ImportService.FILM_SIM_MAP[trimmed];
        }

        // Strategy 1: Exact match on label and system
        let result = await this.client.query(
            'SELECT id FROM film_simulations WHERE label = $1 AND system_id = $2',
            [trimmed, systemId]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 2: Case-insensitive match on label and system
        result = await this.client.query(
            'SELECT id FROM film_simulations WHERE LOWER(label) = LOWER($1) AND system_id = $2',
            [trimmed, systemId]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 3: Match by generated name (slug) and system
        const name = this.generateSlug(trimmed).toUpperCase().replace(/-/g, '_');
        result = await this.client.query(
            'SELECT id FROM film_simulations WHERE name = $1 AND system_id = $2',
            [name, systemId]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 4: Cross-system compatibility - exact label match
        result = await this.client.query(
            'SELECT id FROM film_simulations WHERE label = $1 LIMIT 1',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 5: Cross-system compatibility - case-insensitive label match
        result = await this.client.query(
            'SELECT id FROM film_simulations WHERE LOWER(label) = LOWER($1) LIMIT 1',
            [trimmed]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 6: Fuzzy match - remove spaces, hyphens, dots
        // "Pro Neg. High" -> "proneghigh"
        const normalized = trimmed.toLowerCase().replace(/[\s\-_.]/g, '');
        result = await this.client.query(
            `SELECT id FROM film_simulations 
             WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(label, ' ', ''), '-', ''), '_', ''), '.', '')) = $1 
             AND system_id = $2`,
            [normalized, systemId]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // Strategy 7: Fuzzy match cross-system
        result = await this.client.query(
            `SELECT id FROM film_simulations 
             WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(label, ' ', ''), '-', ''), '_', ''), '.', '')) = $1 
             LIMIT 1`,
            [normalized]
        );
        if (result.rows.length > 0) return result.rows[0].id;

        // No match found
        throw new Error(`Film simulation not found: ${label}`);
    }

    private async lookupStyleCategory(name: string): Promise<number | null> {
        // Load cache if not loaded
        if (!this.styleCategoriesCache) {
            const result = await this.client.query('SELECT id, name FROM style_categories');
            this.styleCategoriesCache = new Map();
            for (const row of result.rows) {
                this.styleCategoriesCache.set(row.name.toLowerCase(), row.id);
            }
        }

        // Normalize variations
        let normalized = name.trim().toLowerCase();

        // Handle B&W variations
        if (normalized === 'bw' || normalized === 'b&w' || normalized === 'b & w' ||
            normalized === 'black and white' || normalized === 'black & white' ||
            normalized === 'monochrome') {
            normalized = 'black & white';
        }

        // Handle Color variations
        if (normalized === 'colour') {
            normalized = 'color';
        }

        return this.styleCategoriesCache.get(normalized) || null;
    }

    // ========================================================================
    // Settings Parsing and Validation
    // ========================================================================

    private async parseAndValidateSettings(settingsStr: string): Promise<ParsedSetting[]> {
        if (!settingsStr || settingsStr.trim() === '') {
            return [];
        }

        // Load setting definitions cache if not loaded
        if (!this.settingDefinitionsCache) {
            await this.loadSettingDefinitionsCache();
        }

        const parsed: ParsedSetting[] = [];
        const lines = settingsStr.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            const colonIndex = trimmed.indexOf(':');
            if (colonIndex === -1) continue;

            const csvKey = trimmed.substring(0, colonIndex).trim();
            const csvValue = trimmed.substring(colonIndex + 1).trim();

            // Check if this is a special setting that needs to be split
            if (SettingTransformer.isSpecialSetting(csvKey)) {
                const specialSettings = SettingTransformer.parseSpecialSettings(csvKey, csvValue);
                for (const { name, value } of specialSettings) {
                    const setting = this.settingDefinitionsCache!.get(name.toLowerCase());
                    if (setting) {
                        parsed.push({
                            definitionId: setting.id,
                            value: value,
                        });
                    }
                }
                continue;
            }

            // Transform the setting name
            const dbKey = SettingTransformer.transformName(csvKey);

            // Skip settings marked as IGNORE
            if (dbKey === 'IGNORE') {
                continue;
            }

            // Lookup setting definition
            const setting = this.settingDefinitionsCache!.get(dbKey.toLowerCase());

            if (!setting) {
                throw new Error(`Setting not found: ${csvKey}`);
            }

            // Transform the value
            const dbValue = SettingTransformer.transformValue(dbKey, csvValue);

            // For enum types, validate value exists
            // TODO: Re-enable once setting_enum_values are populated
            /*
            if (setting.data_type === 'enum') {
                const validValue = await this.validateEnumValue(setting.id, dbValue);
                if (!validValue) {
                    throw new Error(`Invalid value "${dbValue}" for setting "${dbKey}"`);
                }
            }
            */

            parsed.push({
                definitionId: setting.id,
                value: dbValue,
            });
        }

        return parsed;
    }

    private async loadSettingDefinitionsCache(): Promise<void> {
        const result = await this.client.query(
            'SELECT id, name, data_type FROM setting_definitions'
        );

        this.settingDefinitionsCache = new Map();
        for (const row of result.rows) {
            this.settingDefinitionsCache.set(row.name.toLowerCase(), row);
        }
    }

    private async validateEnumValue(settingId: number, value: string): Promise<boolean> {
        const result = await this.client.query(
            'SELECT COUNT(*) as count FROM setting_enum_values WHERE setting_definition_id = $1 AND value = $2',
            [settingId, value]
        );

        return result.rows[0].count > 0;
    }

    // ========================================================================
    // Recipe Insertion
    // ========================================================================

    private async insertRecipe(data: {
        name: string;
        authorId: number;
        sensorId: number;
        cameraId: number;
        filmSimId: number;
        styleCategoryId: number;
        publishDate: Date | null;
        sourceUrl: string | null;
    }): Promise<number> {
        let slug = this.generateSlug(data.name);
        let counter = 1;

        while (true) {
            // Check if slug exists
            const existingSlug = await this.client.query(
                'SELECT id, author_id FROM recipes WHERE slug = $1',
                [slug]
            );

            if (existingSlug.rows.length === 0) {
                // Slug is free, proceed to insert
                break;
            }

            const existingRecipe = existingSlug.rows[0];

            if (existingRecipe.author_id === data.authorId) {
                // Recipe exists for THIS author, proceed to update
                break;
            }

            // Slug exists for DIFFERENT author, append suffix and try again
            slug = `${this.generateSlug(data.name)}-${counter}`;
            counter++;
        }

        // Get system_id from camera
        const systemId = await this.getSystemFromCamera(data.cameraId);

        // Check if recipe exists (by slug and author) - using the resolved slug
        const existing = await this.client.query(
            'SELECT id FROM recipes WHERE slug = $1 AND author_id = $2',
            [slug, data.authorId]
        );

        if (existing.rows.length > 0) {
            // Update existing recipe
            await this.client.query(
                `UPDATE recipes SET
                    name = $1,
                    system_id = $2,
                    sensor_id = $3,
                    camera_model_id = $4,
                    film_simulation_id = $5,
                    style_category_id = $6,
                    publish_date = $7,
                    source_url = $8,
                    updated_at = now()
                 WHERE id = $9`,
                [data.name, systemId, data.sensorId, data.cameraId, data.filmSimId, data.styleCategoryId,
                data.publishDate, data.sourceUrl, existing.rows[0].id]
            );

            this.stats.recipesUpdated++;
            this.trackTableStat('recipes', 'update');
            return existing.rows[0].id;
        }

        // Insert new recipe
        const result = await this.client.query(
            `INSERT INTO recipes (
                name, slug, author_id, system_id, sensor_id, camera_model_id, film_simulation_id,
                style_category_id, difficulty_level, source_type, publish_date,
                source_url, created_at
             ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, now())
             RETURNING id`,
            [data.name, slug, data.authorId, systemId, data.sensorId, data.cameraId, data.filmSimId,
            data.styleCategoryId, 'intermediate', 'curated', data.publishDate, data.sourceUrl]
        );

        this.stats.recipesCreated++;
        this.trackTableStat('recipes', 'insert');
        return result.rows[0].id;
    }

    private async insertRecipeSettings(recipeId: number, settings: ParsedSetting[]): Promise<void> {
        // Delete existing settings for this recipe (in case of update)
        await this.client.query(
            'DELETE FROM recipe_setting_values WHERE recipe_id = $1',
            [recipeId]
        );

        // Deduplicate settings (last one wins)
        const uniqueSettings = new Map<number, string>();
        for (const setting of settings) {
            uniqueSettings.set(setting.definitionId, setting.value);
        }

        // Insert new settings
        for (const [definitionId, value] of uniqueSettings) {
            await this.client.query(
                `INSERT INTO recipe_setting_values (recipe_id, setting_definition_id, value)
                 VALUES ($1, $2, $3)`,
                [recipeId, definitionId, value]
            );
            this.trackTableStat('recipe_setting_values', 'insert');
        }
    }

    // ========================================================================
    // Utility Methods
    // ========================================================================

    private generateSlug(text: string): string {
        return text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    }

    private parseDate(dateStr: string): Date | null {
        if (!dateStr || dateStr.trim() === '') return null;

        try {
            // Try ISO format first
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return date;
            }

            // Try MM/DD/YYYY format
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
            }

            return null;
        } catch {
            return null;
        }
    }

    private trackTableStat(table: string, operation: 'insert' | 'update'): void {
        if (!this.tableStats.has(table)) {
            this.tableStats.set(table, { inserts: 0, updates: 0 });
        }
        const stats = this.tableStats.get(table)!;
        if (operation === 'insert') {
            stats.inserts++;
        } else {
            stats.updates++;
        }
    }

    // ========================================================================
    // Error and Report Generation
    // ========================================================================

    private async writeErrorsCSV(): Promise<string> {
        const errorFilePath = path.join(this.logDir, `errors-${this.timestamp}.csv`);

        const csvData = this.errors.map(error => ({
            Row: error.rowNumber,
            Creator: error.csvRow.Creator,
            Name: error.csvRow.Name,
            Type: error.csvRow.Type,
            'Color /BW': error.csvRow['Color /BW'],
            Camera: error.csvRow.Camera,
            Sensor: error.csvRow.Sensor,
            Base: error.csvRow.Base,
            Settings: error.csvRow.Settings,
            Published: error.csvRow.Published,
            URL: error.csvRow.URL,
            Error: error.errorMessage,
        }));

        const csv = stringify(csvData, { header: true });
        await fs.writeFile(errorFilePath, csv, 'utf-8');

        return errorFilePath;
    }

    private async generateReport(inputFile: string, errorFile: string | null): Promise<ImportReport> {
        return {
            timestamp: new Date().toISOString(),
            inputFile,
            logDirectory: this.logDir,
            summary: {
                totalRecipes: this.stats.totalRows,
                successful: this.stats.successfulImports,
                errors: this.stats.errors,
            },
            recipes: {
                created: this.stats.recipesCreated,
                updated: this.stats.recipesUpdated,
            },
            newEntries: {
                authors: Array.from(this.newEntries.authors.entries()).map(([id, name]) => ({ id, name })),
                cameras: Array.from(this.newEntries.cameras.entries()).map(([id, data]) => ({
                    id,
                    name: data.name,
                    system: data.system
                })),
                sensors: Array.from(this.newEntries.sensors.entries()).map(([id, name]) => ({ id, name })),
                filmSimulations: Array.from(this.newEntries.filmSimulations.entries()).map(([id, name]) => ({ id, name })),
            },
            tableStats: Array.from(this.tableStats.entries()).map(([table, stats]) => ({
                table,
                inserts: stats.inserts,
                updates: stats.updates,
            })),
            outputFiles: {
                errors: errorFile,
                report: path.join(this.logDir, `import-report-${this.timestamp}.json`),
            },
        };
    }

    private async writeReportJSON(report: ImportReport): Promise<void> {
        const reportPath = report.outputFiles.report;
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
    }

    private displayReport(report: ImportReport): void {
        console.log('\n' + '='.repeat(80));
        console.log('RECIPE IMPORT REPORT');
        console.log('='.repeat(80));

        console.log('\nSUMMARY');
        console.log('-------');
        console.log(`Total recipes in CSV:        ${report.summary.totalRecipes.toLocaleString()}`);
        console.log(`Successfully imported:       ${report.summary.successful.toLocaleString()}`);
        console.log(`Errors (skipped):            ${report.summary.errors.toLocaleString()}`);

        console.log('\nRECIPES');
        console.log('-------');
        console.log(`New recipes created:         ${report.recipes.created.toLocaleString()}`);
        console.log(`Existing recipes updated:    ${report.recipes.updated.toLocaleString()}`);

        if (report.newEntries.authors.length > 0 ||
            report.newEntries.cameras.length > 0 ||
            report.newEntries.sensors.length > 0 ||
            report.newEntries.filmSimulations.length > 0) {

            console.log('\nNEW CATEGORICAL ENTRIES');
            console.log('-----------------------');

            if (report.newEntries.authors.length > 0) {
                console.log(`Authors:`);
                report.newEntries.authors.slice(0, 5).forEach(a => {
                    console.log(`  - ID ${a.id}: ${a.name}`);
                });
                if (report.newEntries.authors.length > 5) {
                    console.log(`  ... (${report.newEntries.authors.length} total)`);
                }
            }

            if (report.newEntries.cameras.length > 0) {
                console.log(`\nCameras:`);
                report.newEntries.cameras.slice(0, 5).forEach(c => {
                    console.log(`  - ID ${c.id}: ${c.name} (system: ${c.system})`);
                });
                if (report.newEntries.cameras.length > 5) {
                    console.log(`  ... (${report.newEntries.cameras.length} total)`);
                }
            }

            if (report.newEntries.sensors.length > 0) {
                console.log(`\nSensors:`);
                report.newEntries.sensors.slice(0, 5).forEach(s => {
                    console.log(`  - ID ${s.id}: ${s.name}`);
                });
                if (report.newEntries.sensors.length > 5) {
                    console.log(`  ... (${report.newEntries.sensors.length} total)`);
                }
            }

            if (report.newEntries.filmSimulations.length > 0) {
                console.log(`\nFilm Simulations:`);
                report.newEntries.filmSimulations.slice(0, 5).forEach(f => {
                    console.log(`  - ID ${f.id}: ${f.name}`);
                });
                if (report.newEntries.filmSimulations.length > 5) {
                    console.log(`  ... (${report.newEntries.filmSimulations.length} total)`);
                }
            }
        }

        console.log('\nTABLE STATISTICS');
        console.log('----------------');
        report.tableStats.forEach(stat => {
            const inserts = stat.inserts.toString().padStart(5);
            const updates = stat.updates.toString().padStart(5);
            console.log(`${stat.table.padEnd(25)} ${inserts} inserts, ${updates} updates`);
        });

        if (!this.dryRun) {
            console.log('\nOUTPUT FILES');
            console.log('------------');
            if (report.outputFiles.errors) {
                console.log(`Error log:   ${report.outputFiles.errors} (${report.summary.errors} rows)`);
            }
            console.log(`Report JSON: ${report.outputFiles.report}`);
        }

        if (report.summary.errors > 0) {
            console.log('\nERRORS');
            console.log('------');
            console.log(`${report.summary.errors} rows had errors`);

            // Count error types and specific missing values
            const errorTypes = new Map<string, number>();
            const missingValues = new Map<string, Map<string, number>>();

            this.errors.forEach(e => {
                const parts = e.errorMessage.split(':');
                const type = parts[0].trim();
                const value = parts.slice(1).join(':').trim();

                errorTypes.set(type, (errorTypes.get(type) || 0) + 1);

                if (value && (type.includes('not found') || type.includes('Invalid'))) {
                    if (!missingValues.has(type)) {
                        missingValues.set(type, new Map());
                    }
                    const valuesMap = missingValues.get(type)!;
                    valuesMap.set(value, (valuesMap.get(value) || 0) + 1);
                }
            });

            if (errorTypes.size > 0) {
                console.log('\nCommon errors:');
                Array.from(errorTypes.entries())
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
                    .forEach(([type, count]) => {
                        console.log(`  - ${type}: ${count} occurrences`);

                        // Show top missing values for this type
                        if (missingValues.has(type)) {
                            const topValues = Array.from(missingValues.get(type)!.entries())
                                .sort((a, b) => b[1] - a[1])
                                .slice(0, 5);

                            topValues.forEach(([val, c]) => {
                                console.log(`    • "${val}": ${c}`);
                            });
                        }
                    });
            }
        }

        console.log('\n' + '='.repeat(80) + '\n');
    }
}
