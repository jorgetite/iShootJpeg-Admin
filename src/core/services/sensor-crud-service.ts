import { DatabaseService } from './database-service';
import type { Sensor } from '../types/database';

export class SensorCrudService extends DatabaseService {
    /**
     * Get all sensors
     */
    async getAllSensors(): Promise<Sensor[]> {
        const result = await this.pool.query(
            'SELECT * FROM sensors ORDER BY type, name'
        );
        return result.rows;
    }

    /**
     * Get a single sensor by ID
     */
    async getSensorById(id: number): Promise<Sensor | null> {
        const result = await this.pool.query(
            'SELECT * FROM sensors WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Create a new sensor
     */
    async createSensor(input: Partial<Sensor>): Promise<Sensor> {
        const result = await this.pool.query(
            `INSERT INTO sensors (
                name, type, megapixels, description
            ) VALUES ($1, $2, $3, $4)
            RETURNING *`,
            [
                input.name,
                input.type,
                input.megapixels || null,
                input.description || null
            ]
        );
        return result.rows[0];
    }

    /**
     * Update a sensor
     */
    async updateSensor(id: number, input: Partial<Sensor>): Promise<Sensor> {
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (input.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(input.name);
        }
        if (input.type !== undefined) {
            updates.push(`type = $${paramIndex++}`);
            values.push(input.type);
        }
        if (input.megapixels !== undefined) {
            updates.push(`megapixels = $${paramIndex++}`);
            values.push(input.megapixels);
        }
        if (input.description !== undefined) {
            updates.push(`description = $${paramIndex++}`);
            values.push(input.description);
        }

        if (updates.length === 0) {
            const current = await this.getSensorById(id);
            if (!current) throw new Error('Sensor not found');
            return current;
        }

        values.push(id);
        const query = `
            UPDATE sensors
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Delete a sensor
     */
    async deleteSensor(id: number): Promise<void> {
        await this.pool.query('DELETE FROM sensors WHERE id = $1', [id]);
    }
}
