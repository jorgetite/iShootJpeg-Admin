import fs from 'node:fs/promises';
import path from 'node:path';
import type { RecipeExport, BatchRecipeExport, ExportMetadata } from '../types/recipe-export.js';
import { RecipeQueryService } from './recipe-query-service.js';
import { ExportTransformerService } from './export-transformer-service.js';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Export options for customizing the export process
 */
export interface ExportOptions {
    /** Output file path */
    outputPath: string;
    /** Pretty print JSON (default: true) */
    prettyPrint?: boolean;
    /** Include metadata in batch export (default: true) */
    includeMetadata?: boolean;
    /** Filter to export only active recipes (default: false) */
    activeOnly?: boolean;
    /** Dry run mode - skip writing to disk (default: false) */
    dryRun?: boolean;
}

/**
 * Export statistics
 */
export interface ExportStats {
    totalRecipes: number;
    exportedRecipes: number;
    errors: number;
    outputFile: string;
}

// ============================================================================
// Recipe Export Service
// ============================================================================

/**
 * Main service for exporting recipes to JSON
 * 
 * Responsibilities:
 * - Orchestrate the export process
 * - Coordinate query and transformer services
 * - Write JSON files to disk
 * - Generate export statistics
 * 
 * Clear Boundaries:
 * - IN: Database connection string, export options
 * - OUT: JSON files on disk, export statistics
 * - Uses RecipeQueryService for database queries
 * - Uses ExportTransformerService for data transformation
 */
export class RecipeExportService {
    private queryService: RecipeQueryService;
    private transformer: ExportTransformerService;

    constructor(connectionString: string) {
        this.queryService = new RecipeQueryService(connectionString);
        this.transformer = new ExportTransformerService();
    }

    /**
     * Connect to the database
     */
    async connect(): Promise<void> {
        await this.queryService.connect();
    }

    /**
     * Disconnect from the database
     */
    async disconnect(): Promise<void> {
        await this.queryService.disconnect();
    }

    /**
     * Export all recipes to a JSON file
     * 
     * @param options - Export options
     * @returns Export statistics
     */
    async exportRecipes(options: ExportOptions): Promise<ExportStats> {
        const startTime = Date.now();
        const stats: ExportStats = {
            totalRecipes: 0,
            exportedRecipes: 0,
            errors: 0,
            outputFile: options.outputPath,
        };

        try {
            console.log('🔍 Fetching recipes from database...');
            const rawRecipes = await this.queryService.fetchRecipes({ onlyActive: options.activeOnly });
            stats.totalRecipes = rawRecipes.length;

            console.log(`📦 Found ${rawRecipes.length} recipes`);
            console.log('🔄 Transforming recipes...');

            const recipes: RecipeExport[] = [];

            for (const rawRecipe of rawRecipes) {
                try {
                    // Fetch related data for this recipe
                    const [settings, tags, images] = await Promise.all([
                        this.queryService.fetchRecipeSettings(rawRecipe.id),
                        this.queryService.fetchRecipeTags(rawRecipe.id),
                        this.queryService.fetchRecipeImages(rawRecipe.id),
                    ]);

                    // Transform to export format
                    const recipe = this.transformer.transformRecipe(
                        rawRecipe,
                        settings,
                        tags,
                        images
                    );

                    recipes.push(recipe);
                    stats.exportedRecipes++;

                    // Progress indicator
                    if (stats.exportedRecipes % 10 === 0) {
                        console.log(`  ✓ Processed ${stats.exportedRecipes}/${stats.totalRecipes} recipes`);
                    }
                } catch (error) {
                    stats.errors++;
                    console.error(`  ✗ Error processing recipe "${rawRecipe.name}":`, error);
                }
            }

            console.log(`✅ Transformed ${stats.exportedRecipes} recipes`);
            console.log('💾 Writing JSON file...');

            // Create batch export with metadata
            const batchExport = this.createBatchExport(recipes, options);

            // Write to file
            if (options.dryRun) {
                console.log(`🔍 Dry run: would write to ${options.outputPath}`);
            } else {
                await this.writeJsonFile(options.outputPath, batchExport, options.prettyPrint ?? true);
            }

            const duration = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`\n✨ Export complete in ${duration}s`);
            console.log(`📄 Output: ${options.outputPath}`);
            console.log(`📊 Exported: ${stats.exportedRecipes}/${stats.totalRecipes} recipes`);

            if (stats.errors > 0) {
                console.log(`⚠️  Errors: ${stats.errors}`);
            }

            return stats;
        } catch (error) {
            console.error('❌ Export failed:', error);
            throw error;
        }
    }

    /**
     * Export a single recipe by ID
     * 
     * @param recipeId - Recipe ID
     * @param options - Export options
     * @returns Export statistics
     */
    async exportRecipeById(recipeId: number, options: ExportOptions): Promise<ExportStats> {
        const stats: ExportStats = {
            totalRecipes: 1,
            exportedRecipes: 0,
            errors: 0,
            outputFile: options.outputPath,
        };

        try {
            console.log(`🔍 Fetching recipe ID ${recipeId}...`);

            const data = await this.queryService.fetchRecipeById(recipeId);

            if (!data) {
                throw new Error(`Recipe with ID ${recipeId} not found`);
            }

            console.log('🔄 Transforming recipe...');

            const recipe = this.transformer.transformRecipe(
                data.recipe,
                data.settings,
                data.tags,
                data.images
            );

            stats.exportedRecipes = 1;

            console.log('💾 Writing JSON file...');

            // Write single recipe (no metadata wrapper)
            if (options.dryRun) {
                console.log(`🔍 Dry run: would write to ${options.outputPath}`);
            } else {
                await this.writeJsonFile(options.outputPath, recipe, options.prettyPrint ?? true);
            }

            console.log(`\n✨ Export complete`);
            console.log(`📄 Output: ${options.outputPath}`);

            return stats;
        } catch (error) {
            stats.errors = 1;
            console.error('❌ Export failed:', error);
            throw error;
        }
    }

    /**
     * Create batch export with metadata
     */
    private createBatchExport(
        recipes: RecipeExport[],
        options: ExportOptions
    ): BatchRecipeExport {
        const metadata: ExportMetadata = {
            version: '1.0',
            exportDate: new Date().toISOString(),
            totalRecipes: recipes.length,
        };

        return {
            metadata,
            recipes,
        };
    }

    /**
     * Write JSON data to file
     */
    private async writeJsonFile(
        filePath: string,
        data: any,
        prettyPrint: boolean
    ): Promise<void> {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await fs.mkdir(dir, { recursive: true });

        // Write JSON file
        const json = prettyPrint ? JSON.stringify(data, null, 2) : JSON.stringify(data);
        await fs.writeFile(filePath, json, 'utf-8');
    }
}
