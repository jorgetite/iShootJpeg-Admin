import { DatabaseService } from './database-service';
import type { CameraModel, CameraModelCreateInput, CameraModelUpdateInput, Sensor } from '../types/database';

export class CameraModelCrudService extends DatabaseService {
    /**
     * Get all camera models with their related system and sensor names
     */
    async getAllCameraModels(filters?: { systemId?: number; sensorId?: number }): Promise<(CameraModel & { system_name: string; manufacturer: string; sensor_name: string | null })[]> {
        let query = `
            SELECT 
                cm.*,
                cs.name as system_name,
                cs.manufacturer,
                s.name as sensor_name
            FROM cameras cm
            JOIN systems cs ON cm.system_id = cs.id
            LEFT JOIN sensors s ON cm.sensor_id = s.id
        `;

        const conditions: string[] = [];
        const params: any[] = [];
        let paramIndex = 1;

        if (filters?.systemId) {
            conditions.push(`cm.system_id = $${paramIndex++}`);
            params.push(filters.systemId);
        }

        if (filters?.sensorId) {
            conditions.push(`cm.sensor_id = $${paramIndex++}`);
            params.push(filters.sensorId);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += ` ORDER BY cs.name, cm.name`;

        const result = await this.pool.query(query, params);
        return result.rows;
    }

    /**
     * Get a single camera model by ID
     */
    async getCameraModelById(id: number): Promise<CameraModel | null> {
        const result = await this.pool.query(
            'SELECT * FROM cameras WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    /**
     * Create a new camera model
     */
    async createCameraModel(input: CameraModelCreateInput): Promise<CameraModel> {
        const result = await this.pool.query(
            `INSERT INTO cameras (
                system_id, name, sensor_id, release_year, is_active
            ) VALUES ($1, $2, $3, $4, $5)
            RETURNING *`,
            [
                input.system_id,
                input.name,
                input.sensor_id || null, // Ensure explicit null if undefined/null
                input.release_year || null,
                input.is_active ?? true
            ]
        );
        return result.rows[0];
    }

    /**
     * Update a camera model
     */
    async updateCameraModel(id: number, input: CameraModelUpdateInput): Promise<CameraModel> {
        // Build dynamic update query
        const updates: string[] = [];
        const values: any[] = [];
        let paramIndex = 1;

        if (input.system_id !== undefined) {
            updates.push(`system_id = $${paramIndex++}`);
            values.push(input.system_id);
        }
        if (input.name !== undefined) {
            updates.push(`name = $${paramIndex++}`);
            values.push(input.name);
        }
        if (input.sensor_id !== undefined) {
            updates.push(`sensor_id = $${paramIndex++}`);
            values.push(input.sensor_id);
        }
        if (input.release_year !== undefined) {
            updates.push(`release_year = $${paramIndex++}`);
            values.push(input.release_year);
        }
        if (input.is_active !== undefined) {
            updates.push(`is_active = $${paramIndex++}`);
            values.push(input.is_active);
        }

        if (updates.length === 0) {
            const current = await this.getCameraModelById(id);
            if (!current) throw new Error('Camera Mode not found');
            return current;
        }

        values.push(id);
        const query = `
            UPDATE cameras
            SET ${updates.join(', ')}
            WHERE id = $${paramIndex}
            RETURNING *
        `;

        const result = await this.pool.query(query, values);
        return result.rows[0];
    }

    /**
     * Delete a camera model
     */
    async deleteCameraModel(id: number): Promise<void> {
        await this.pool.query('DELETE FROM cameras WHERE id = $1', [id]);
    }

    /**
     * Get all sensors (for dropdowns)
     */
    async getAllSensors(): Promise<Sensor[]> {
        const result = await this.pool.query(
            'SELECT * FROM sensors ORDER BY type, name'
        );
        return result.rows;
    }

    /**
     * Get film simulations associated with a camera model
     */
    async getFilmSimulationsForModel(modelId: number): Promise<any[]> {
        const query = `
            SELECT 
                fs.*,
                cfs.added_via_firmware,
                cfs.notes as compatibility_notes
            FROM film_sims fs
            JOIN camera_film_sims cfs ON fs.id = cfs.film_simulation_id
            WHERE cfs.camera_model_id = $1
            ORDER BY fs.name
        `;
        const result = await this.pool.query(query, [modelId]);
        return result.rows;
    }

    /**
     * Get available film simulations for a system that can be added to a model
     * (Excludes ones already added to the specific model)
     */
    async getAvailableFilmSimulationsForSystem(systemId: number, modelId: number): Promise<any[]> {
        const query = `
            SELECT fs.* 
            FROM film_sims fs
            WHERE fs.system_id = $1
            AND fs.id NOT IN (
                SELECT film_simulation_id 
                FROM camera_film_sims 
                WHERE camera_model_id = $2
            )
            ORDER BY fs.name
        `;
        const result = await this.pool.query(query, [systemId, modelId]);
        return result.rows;
    }

    /**
     * Add a film simulation to a camera model
     */
    async addFilmSimulationToModel(modelId: number, filmSimulationId: number, addedViaFirmware: boolean = false): Promise<void> {
        await this.pool.query(
            `INSERT INTO camera_film_sims (camera_model_id, film_sim_id, added_via_firmware)
             VALUES ($1, $2, $3)
             ON CONFLICT (camera_model_id, film_sim_id) DO UPDATE 
             SET added_via_firmware = EXCLUDED.added_via_firmware`,
            [modelId, filmSimulationId, addedViaFirmware]
        );
    }

    /**
     * Remove a film simulation from a camera model
     */
    async removeFilmSimulationFromModel(modelId: number, filmSimulationId: number): Promise<void> {
        await this.pool.query(
            'DELETE FROM camera_film_sims WHERE camera_model_id = $1 AND film_sim_id = $2',
            [modelId, filmSimulationId]
        );
    }
}
