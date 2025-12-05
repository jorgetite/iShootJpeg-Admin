import { DatabaseService } from './database-service';
import type { Tag, TagCreateInput, TagUpdateInput } from '../types/database';

export class TagCrudService {
    private db: DatabaseService;

    constructor(connectionString: string) {
        this.db = new DatabaseService(connectionString);
    }

    async connect() {
        await this.db.connect();
    }

    async disconnect() {
        await this.db.disconnect();
    }

    private generateCorrelationId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Get all tags with optional sorting
     */
    async getAllTags(orderBy: string = 'name ASC'): Promise<Tag[]> {
        return this.db.getAll<Tag>('tags', {}, orderBy);
    }

    /**
     * Get tag by ID
     */
    async getTagById(id: number): Promise<Tag | null> {
        return this.db.getById<Tag>('tags', id);
    }

    /**
     * Create a new tag
     */
    async createTag(data: TagCreateInput): Promise<Tag> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            // Generate slug from name if not provided
            const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const query = `
                INSERT INTO tags (
                    name, slug, category, usage_count, is_active, created_at
                )
                VALUES ($1, $2, $3, $4, $5, NOW())
                RETURNING *
            `;

            const values = [
                data.name,
                slug,
                data.category || null,
                0, // usage_count starts at 0
                true // is_active defaults to true
            ];

            const result = await client.query(query, values);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'TagCrudService',
                operation: 'createTag',
                correlation_id: correlationId,
                tag_name: data.name,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'TagCrudService',
                operation: 'createTag',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Update an existing tag
     */
    async updateTag(id: number, data: TagUpdateInput): Promise<Tag> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            const updateFields = ['name', 'slug', 'category', 'is_active'];

            for (const field of updateFields) {
                if (data[field as keyof TagUpdateInput] !== undefined) {
                    updates.push(`"${field}" = $${paramIndex}`);
                    values.push(data[field as keyof TagUpdateInput]);
                    paramIndex++;
                }
            }

            if (updates.length === 0) {
                throw new Error('No fields to update');
            }

            values.push(id);

            const query = `
                UPDATE tags
                SET ${updates.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);

            if (result.rows.length === 0) {
                throw new Error(`Tag not found with id ${id}`);
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'TagCrudService',
                operation: 'updateTag',
                correlation_id: correlationId,
                tag_id: id,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'TagCrudService',
                operation: 'updateTag',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Delete a tag
     */
    async deleteTag(id: number): Promise<void> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            const query = 'DELETE FROM tags WHERE id = $1 RETURNING id';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error(`Tag not found with id ${id}`);
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'TagCrudService',
                operation: 'deleteTag',
                correlation_id: correlationId,
                tag_id: id,
                duration_ms: Date.now() - startTime,
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'TagCrudService',
                operation: 'deleteTag',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        } finally {
            client.release();
        }
    }

    /**
     * Search tags with pagination
     */
    async searchTags(params: {
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ tags: Tag[]; total: number }> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            const conditions: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (params.search) {
                conditions.push(`(name ILIKE $${paramIndex} OR slug ILIKE $${paramIndex})`);
                values.push(`%${params.search}%`);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // Get total count
            const countResult = await client.query(
                `SELECT COUNT(*) as count FROM tags ${whereClause}`,
                values
            );
            const total = parseInt(countResult.rows[0].count);

            // Get paginated results
            const limit = params.limit || 20;
            const offset = params.offset || 0;

            const query = `
                SELECT * FROM tags
                ${whereClause}
                ORDER BY name ASC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const result = await client.query(query, [...values, limit, offset]);

            return {
                tags: result.rows,
                total
            };
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'TagCrudService',
                operation: 'searchTags',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        } finally {
            client.release();
        }
    }
}
