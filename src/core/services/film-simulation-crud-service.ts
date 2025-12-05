import { DatabaseService } from './database-service';
import type { FilmSimulation } from '../types/database';

export class FilmSimulationCrudService extends DatabaseService {
    /**
     * Get all film simulations
     */
    async getAllFilmSimulations(systemId?: number): Promise<FilmSimulation[]> {
        let query = 'SELECT * FROM film_simulations';
        const params: any[] = [];

        if (systemId) {
            query += ' WHERE system_id = $1';
            params.push(systemId);
        }

        query += ' ORDER BY name';

        const result = await this.pool.query(query, params);
        return result.rows;
    }

    /**
     * Get a single film simulation by ID
     */
    async getFilmSimulationById(id: number): Promise<FilmSimulation | null> {
        const result = await this.pool.query(
            'SELECT * FROM film_simulations WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Create a new film simulation
     */
    async createFilmSimulation(input: Partial<FilmSimulation>): Promise<FilmSimulation> {
        // Default system_id to 1 if not provided, assuming Fujifilm context for now
        const systemId = input.system_id || 1;

        const result = await this.pool.query(
            `INSERT INTO film_simulations (
                name, system_id, label, description, is_active
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                input.name,
                systemId,
                input.label || input.name, // Fallback label to name
                input.description || null,
                input.is_active ?? true
            ]
        );
        return result.rows[0];
    }

    /**
     * Update a film simulation
     */
    async updateFilmSimulation(id: number, input: Partial<FilmSimulation>): Promise<FilmSimulation> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (input.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(input.name);
        }
        if (input.label !== undefined) {
            updates.push(`label = $${paramIndex++}`);
            values.push(input.label);
        }
        if (input.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(input.description);
        }
        if (input.is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(input.is_active);
        }

        if (updates.length === 0) {
            const current = await this.getFilmSimulationById(id);
            if (!current) throw new Error('Film simulation not found');
            return current;
        }

        values.push(id);
        const query = `
            UPDATE film_simulations
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Delete a film simulation
     */
    async deleteFilmSimulation(id: number): Promise<void> {
        await this.pool.query('DELETE FROM film_simulations WHERE id = $1', [id]);
    }
}
