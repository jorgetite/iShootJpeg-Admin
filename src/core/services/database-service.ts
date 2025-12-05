import { Pool } from 'pg';
import type { PoolClient, QueryResult } from 'pg';

/**
 * Generic Database Service for CRUD Operations
 * 
 * Implements idempotent operations and structured logging as per CONSTITUTION.md.
 * Provides connection pooling and transaction support for all database operations.
 * 
 * @example
 * ```typescript
 * const db = new DatabaseService(process.env.DATABASE_URL!);
 * await db.connect();
 * 
 * const authors = await db.getAll<Author>('authors');
 * const author = await db.getById<Author>('authors', 1);
 * const newAuthor = await db.create<Author>('authors', { name: 'John Doe', slug: 'john-doe' });
 * await db.disconnect();
 * ```
 */
export class DatabaseService {
    protected pool: Pool;
    private connectionString: string;

    /**
     * Create a new DatabaseService instance
     * 
     * @param connectionString - PostgreSQL connection string from environment
     */
    constructor(connectionString: string) {
        this.connectionString = connectionString;
        this.pool = new Pool({
            connectionString,
            max: 20, // Maximum pool size
            idleTimeoutMillis: 30000,
            connectionTimeoutMillis: 2000,
        });

        // Structured logging for pool errors
        this.pool.on('error', (err) => {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                event: 'pool_error',
                error: err.message,
                stack: err.stack,
            }));
        });
    }

    /**
     * Connect to the database and verify connection
     * 
     * @throws Error if connection fails
     */
    async connect(): Promise<void> {
        const startTime = Date.now();
        try {
            const client = await this.pool.connect();
            client.release();

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'DatabaseService',
                event: 'connected',
                duration_ms: Date.now() - startTime,
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                event: 'connection_failed',
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        }
    }

    /**
     * Disconnect from the database
     */
    async disconnect(): Promise<void> {
        await this.pool.end();
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            level: 'INFO',
            service: 'DatabaseService',
            event: 'disconnected',
        }));
    }

    /**
     * Get a client from the pool for transaction support
     * 
     * @returns PoolClient for manual transaction management
     */
    async getClient(): Promise<PoolClient> {
        return await this.pool.connect();
    }

    /**
     * Fetch all records from a table with optional filtering
     * 
     * @param table - Table name
     * @param filters - Optional WHERE clause filters
     * @param orderBy - Optional ORDER BY clause (e.g., 'created_at DESC')
     * @returns Array of records
     * 
     * @example
     * ```typescript
     * const activeRecipes = await db.getAll<Recipe>('recipes', { is_active: true }, 'created_at DESC');
     * ```
     */
    async getAll<T>(
        table: string,
        filters?: Record<string, any>,
        orderBy?: string
    ): Promise<T[]> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            let query = `SELECT * FROM "${table}"`;
            const values: any[] = [];

            // Build WHERE clause if filters provided
            if (filters && Object.keys(filters).length > 0) {
                const conditions = Object.keys(filters).map((key, index) => {
                    values.push(filters[key]);
                    return `"${key}" = $${index + 1}`;
                });
                query += ` WHERE ${conditions.join(' AND ')}`;
            }

            // Add ORDER BY if provided
            if (orderBy) {
                query += ` ORDER BY ${orderBy}`;
            }

            const result: QueryResult<T> = await this.pool.query(query, values);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'DatabaseService',
                operation: 'getAll',
                correlation_id: correlationId,
                table,
                filters,
                row_count: result.rows.length,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                operation: 'getAll',
                correlation_id: correlationId,
                table,
                filters,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        }
    }

    /**
     * Fetch a single record by ID
     * 
     * @param table - Table name
     * @param id - Record ID
     * @returns Record or null if not found
     * 
     * @example
     * ```typescript
     * const author = await db.getById<Author>('authors', 1);
     * if (!author) {
     *   throw new Error('Author not found');
     * }
     * ```
     */
    async getById<T>(table: string, id: number | string): Promise<T | null> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            const query = `SELECT * FROM "${table}" WHERE id = $1`;
            const result: QueryResult<T> = await this.pool.query(query, [id]);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'DatabaseService',
                operation: 'getById',
                correlation_id: correlationId,
                table,
                id,
                found: result.rows.length > 0,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows[0] || null;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                operation: 'getById',
                correlation_id: correlationId,
                table,
                id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        }
    }

    /**
     * Create a new record (idempotent via ON CONFLICT)
     * 
     * @param table - Table name
     * @param data - Record data
     * @param conflictColumn - Column for ON CONFLICT clause (e.g., 'slug')
     * @returns Created or existing record
     * 
     * @example
     * ```typescript
     * const author = await db.create<Author>('authors', {
     *   name: 'John Doe',
     *   slug: 'john-doe'
     * }, 'slug');
     * ```
     */
    async create<T>(
        table: string,
        data: Record<string, any>,
        conflictColumn?: string
    ): Promise<T> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const placeholders = values.map((_, index) => `$${index + 1}`);

            let query = `
                INSERT INTO "${table}" (${columns.map(c => `"${c}"`).join(', ')})
                VALUES (${placeholders.join(', ')})
            `;

            // Add ON CONFLICT for idempotency
            if (conflictColumn) {
                const updateSet = columns
                    .filter(c => c !== conflictColumn && c !== 'id' && c !== 'created_at')
                    .map(c => `"${c}" = EXCLUDED."${c}"`)
                    .join(', ');

                query += `
                    ON CONFLICT ("${conflictColumn}") 
                    DO UPDATE SET ${updateSet}
                `;
            }

            query += ' RETURNING *';

            const result: QueryResult<T> = await this.pool.query(query, values);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'DatabaseService',
                operation: 'create',
                correlation_id: correlationId,
                table,
                conflict_column: conflictColumn,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                operation: 'create',
                correlation_id: correlationId,
                table,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        }
    }

    /**
     * Update an existing record
     * 
     * @param table - Table name
     * @param id - Record ID
     * @param data - Updated data
     * @returns Updated record
     * 
     * @throws Error if record not found
     * 
     * @example
     * ```typescript
     * const updated = await db.update<Author>('authors', 1, {
     *   name: 'Jane Doe'
     * });
     * ```
     */
    async update<T>(
        table: string,
        id: number | string,
        data: Record<string, any>
    ): Promise<T> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            const columns = Object.keys(data);
            const values = Object.values(data);

            const setClause = columns
                .map((col, index) => `"${col}" = $${index + 1}`)
                .join(', ');

            const query = `
                UPDATE "${table}"
                SET ${setClause}, updated_at = now()
                WHERE id = $${values.length + 1}
                RETURNING *
            `;

            const result: QueryResult<T> = await this.pool.query(query, [...values, id]);

            if (result.rows.length === 0) {
                throw new Error(`Record not found in ${table} with id ${id}`);
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'DatabaseService',
                operation: 'update',
                correlation_id: correlationId,
                table,
                id,
                duration_ms: Date.now() - startTime,
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                operation: 'update',
                correlation_id: correlationId,
                table,
                id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        }
    }

    /**
     * Delete a record (soft delete for recipes/authors via is_active)
     * 
     * @param table - Table name
     * @param id - Record ID
     * @param soft - If true, sets is_active = false instead of DELETE
     * 
     * @throws Error if record not found
     * 
     * @example
     * ```typescript
     * await db.delete('recipes', 1, true); // Soft delete
     * await db.delete('tags', 5); // Hard delete
     * ```
     */
    async delete(table: string, id: number | string, soft: boolean = false): Promise<void> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            let query: string;
            let result: QueryResult;

            if (soft) {
                query = `UPDATE "${table}" SET is_active = false WHERE id = $1 RETURNING id`;
                result = await this.pool.query(query, [id]);
            } else {
                query = `DELETE FROM "${table}" WHERE id = $1 RETURNING id`;
                result = await this.pool.query(query, [id]);
            }

            if (result.rows.length === 0) {
                throw new Error(`Record not found in ${table} with id ${id}`);
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'DatabaseService',
                operation: 'delete',
                correlation_id: correlationId,
                table,
                id,
                soft_delete: soft,
                duration_ms: Date.now() - startTime,
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                operation: 'delete',
                correlation_id: correlationId,
                table,
                id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        }
    }

    /**
     * Execute a raw SQL query
     * 
     * @param text - SQL query text
     * @param params - Query parameters
     * @returns Query result
     */
    async query<T extends any = any>(text: string, params?: any[]): Promise<QueryResult<T>> {
        const startTime = Date.now();
        const correlationId = this.generateCorrelationId();

        try {
            const result = await this.pool.query<T>(text, params);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'DatabaseService',
                operation: 'query',
                correlation_id: correlationId,
                query: text,
                row_count: result.rowCount,
                duration_ms: Date.now() - startTime,
            }));

            return result;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'DatabaseService',
                operation: 'query',
                correlation_id: correlationId,
                query: text,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime,
            }));
            throw error;
        }
    }

    /**
     * Generate a unique correlation ID for request tracing
     * 
     * @returns Correlation ID (timestamp + random)
     */
    private generateCorrelationId(): string {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
}
