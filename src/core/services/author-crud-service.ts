import { DatabaseService } from './database-service';
import type { Author, AuthorCreateInput, AuthorUpdateInput } from '../types/database';

export class AuthorCrudService {
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
     * Get all authors with optional sorting
     */
    async getAllAuthors(orderBy: string = 'name ASC'): Promise<Author[]> {
        return this.db.getAll<Author>('authors', {}, orderBy);
    }

    /**
     * Get author by ID
     */
    async getAuthorById(id: number): Promise<Author | null> {
        return this.db.getById<Author>('authors', id);
    }

    /**
     * Create a new author
     */
    async createAuthor(data: AuthorCreateInput): Promise<Author> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            // Generate slug from name if not provided
            const slug = data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

            const query = `
                INSERT INTO authors (
                    name, slug, bio, website_url, social_handle, 
                    social_platform, is_verified, created_at, updated_at
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
                RETURNING *
            `;

            const values = [
                data.name,
                slug,
                data.bio || null,
                data.website_url || null,
                data.social_handle || null,
                data.social_platform || null,
                data.is_verified || false
            ];

            const result = await client.query(query, values);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'AuthorCrudService',
                operation: 'createAuthor',
                correlation_id: correlationId,
                author_name: data.name,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'AuthorCrudService',
                operation: 'createAuthor',
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
     * Update an existing author
     */
    async updateAuthor(id: number, data: AuthorUpdateInput): Promise<Author> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            const updates: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            const updateFields = [
                'name', 'slug', 'bio', 'website_url',
                'social_handle', 'social_platform', 'is_verified'
            ];

            for (const field of updateFields) {
                if (data[field as keyof AuthorUpdateInput] !== undefined) {
                    updates.push(`"${field}" = $${paramIndex}`);
                    values.push(data[field as keyof AuthorUpdateInput]);
                    paramIndex++;
                }
            }

            if (updates.length === 0) {
                throw new Error('No fields to update');
            }

            updates.push(`updated_at = NOW()`);
            values.push(id);

            const query = `
                UPDATE authors
                SET ${updates.join(', ')}
                WHERE id = $${paramIndex}
                RETURNING *
            `;

            const result = await client.query(query, values);

            if (result.rows.length === 0) {
                throw new Error(`Author not found with id ${id}`);
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'AuthorCrudService',
                operation: 'updateAuthor',
                correlation_id: correlationId,
                author_id: id,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'AuthorCrudService',
                operation: 'updateAuthor',
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
     * Delete an author
     */
    async deleteAuthor(id: number): Promise<void> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            // Check for dependent recipes
            const checkQuery = 'SELECT COUNT(*) as count FROM recipes WHERE author_id = $1';
            const checkResult = await client.query(checkQuery, [id]);

            if (parseInt(checkResult.rows[0].count) > 0) {
                throw new Error('Cannot delete author with associated recipes');
            }

            const query = 'DELETE FROM authors WHERE id = $1 RETURNING id';
            const result = await client.query(query, [id]);

            if (result.rows.length === 0) {
                throw new Error(`Author not found with id ${id}`);
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'AuthorCrudService',
                operation: 'deleteAuthor',
                correlation_id: correlationId,
                author_id: id,
                duration_ms: Date.now() - startTime,
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'AuthorCrudService',
                operation: 'deleteAuthor',
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
     * Search authors with pagination
     */
    async searchAuthors(params: {
        search?: string;
        limit?: number;
        offset?: number;
    }): Promise<{ authors: Author[]; total: number }> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();
        const client = await this.db.getClient();

        try {
            const conditions: string[] = [];
            const values: any[] = [];
            let paramIndex = 1;

            if (params.search) {
                conditions.push(`(name ILIKE $${paramIndex} OR bio ILIKE $${paramIndex})`);
                values.push(`%${params.search}%`);
                paramIndex++;
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // Get total count
            const countResult = await client.query(
                `SELECT COUNT(*) as count FROM authors ${whereClause}`,
                values
            );
            const total = parseInt(countResult.rows[0].count);

            // Get paginated results
            const limit = params.limit || 20;
            const offset = params.offset || 0;

            const query = `
                SELECT * FROM authors
                ${whereClause}
                ORDER BY name ASC
                LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
            `;

            const result = await client.query(query, [...values, limit, offset]);

            return {
                authors: result.rows,
                total
            };
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'AuthorCrudService',
                operation: 'searchAuthors',
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
