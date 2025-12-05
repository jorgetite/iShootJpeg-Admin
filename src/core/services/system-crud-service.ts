import { DatabaseService } from './database-service';
import type {
    CameraSystem,
    CameraSystemCreateInput,
    CameraSystemUpdateInput,
    SystemSetting
} from '../types/database';

export class SystemCrudService {
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

    async getAllSystems(orderBy: string = 'name ASC'): Promise<CameraSystem[]> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = `SELECT * FROM camera_systems ORDER BY ${orderBy}`;
            const result = await this.db.query<CameraSystem>(query);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'getAllSystems',
                correlation_id: correlationId,
                duration_ms: Date.now() - startTime,
                count: result.rows.length
            }));

            return result.rows;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'getAllSystems',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }

    async getSystemById(id: number): Promise<CameraSystem | null> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = 'SELECT * FROM camera_systems WHERE id = $1';
            const result = await this.db.query<CameraSystem>(query, [id]);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'getSystemById',
                correlation_id: correlationId,
                system_id: id,
                found: result.rows.length > 0,
                duration_ms: Date.now() - startTime
            }));

            return result.rows[0] || null;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'getSystemById',
                correlation_id: correlationId,
                system_id: id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }

    async createSystem(data: CameraSystemCreateInput): Promise<CameraSystem> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = `
                INSERT INTO camera_systems (name, manufacturer, is_active)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const values = [
                data.name,
                data.manufacturer,
                data.is_active ?? true
            ];

            const result = await this.db.query<CameraSystem>(query, values);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'createSystem',
                correlation_id: correlationId,
                system_name: data.name,
                duration_ms: Date.now() - startTime
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'createSystem',
                correlation_id: correlationId,
                system_name: data.name,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }

    async updateSystem(id: number, data: CameraSystemUpdateInput): Promise<CameraSystem> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const setClause = Object.keys(data)
                .map((key, index) => `${key} = $${index + 2}`)
                .join(', ');

            if (!setClause) {
                throw new Error('No data provided for update');
            }

            const query = `
                UPDATE camera_systems 
                SET ${setClause}
                WHERE id = $1
                RETURNING *
            `;

            const values = [id, ...Object.values(data)];
            const result = await this.db.query<CameraSystem>(query, values);

            if (result.rows.length === 0) {
                throw new Error('System not found');
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'updateSystem',
                correlation_id: correlationId,
                system_id: id,
                duration_ms: Date.now() - startTime
            }));

            return result.rows[0];
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'updateSystem',
                correlation_id: correlationId,
                system_id: id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }

    async deleteSystem(id: number): Promise<void> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = 'DELETE FROM camera_systems WHERE id = $1';
            const result = await this.db.query(query, [id]);

            if (result.rowCount === 0) {
                throw new Error('System not found');
            }

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'deleteSystem',
                correlation_id: correlationId,
                system_id: id,
                duration_ms: Date.now() - startTime
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'deleteSystem',
                correlation_id: correlationId,
                system_id: id,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }

    // System Settings Management

    async getSystemSettings(systemId: number): Promise<any[]> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = `
                SELECT 
                    ss.system_id,
                    ss.setting_definition_id,
                    ss.is_supported,
                    ss.notes,
                    sd.name as setting_name,
                    sd.slug as setting_slug,
                    sd.data_type,
                    sd.category_id,
                    sc.name as category_name
                FROM system_settings ss
                JOIN setting_definitions sd ON ss.setting_definition_id = sd.id
                JOIN setting_categories sc ON sd.category_id = sc.id
                WHERE ss.system_id = $1
                ORDER BY sc.sort_order, sd.sort_order
            `;
            const result = await this.db.query(query, [systemId]);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'getSystemSettings',
                correlation_id: correlationId,
                system_id: systemId,
                count: result.rows.length,
                duration_ms: Date.now() - startTime
            }));

            return result.rows;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'getSystemSettings',
                correlation_id: correlationId,
                system_id: systemId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }

    async addSystemSetting(systemId: number, settingDefinitionId: number, isSupported: boolean = true, notes?: string): Promise<void> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = `
                INSERT INTO system_settings (system_id, setting_definition_id, is_supported, notes)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (system_id, setting_definition_id) 
                DO UPDATE SET is_supported = $3, notes = $4
            `;
            await this.db.query(query, [systemId, settingDefinitionId, isSupported, notes]);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'addSystemSetting',
                correlation_id: correlationId,
                system_id: systemId,
                setting_id: settingDefinitionId,
                duration_ms: Date.now() - startTime
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'addSystemSetting',
                correlation_id: correlationId,
                system_id: systemId,
                setting_id: settingDefinitionId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }

    async removeSystemSetting(systemId: number, settingDefinitionId: number): Promise<void> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = 'DELETE FROM system_settings WHERE system_id = $1 AND setting_definition_id = $2';
            await this.db.query(query, [systemId, settingDefinitionId]);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'removeSystemSetting',
                correlation_id: correlationId,
                system_id: systemId,
                setting_id: settingDefinitionId,
                duration_ms: Date.now() - startTime
            }));
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'removeSystemSetting',
                correlation_id: correlationId,
                system_id: systemId,
                setting_id: settingDefinitionId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }
    async getAllSettingDefinitions(): Promise<any[]> {
        const correlationId = this.generateCorrelationId();
        const startTime = Date.now();

        try {
            const query = `
                SELECT 
                    sd.id,
                    sd.name,
                    sd.slug,
                    sd.category_id,
                    sc.name as category_name
                FROM setting_definitions sd
                JOIN setting_categories sc ON sd.category_id = sc.id
                ORDER BY sc.sort_order, sd.sort_order
            `;
            const result = await this.db.query(query);

            console.log(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'INFO',
                service: 'SystemCrudService',
                method: 'getAllSettingDefinitions',
                correlation_id: correlationId,
                count: result.rows.length,
                duration_ms: Date.now() - startTime
            }));

            return result.rows;
        } catch (error) {
            console.error(JSON.stringify({
                timestamp: new Date().toISOString(),
                level: 'ERROR',
                service: 'SystemCrudService',
                method: 'getAllSettingDefinitions',
                correlation_id: correlationId,
                error: error instanceof Error ? error.message : 'Unknown error',
                duration_ms: Date.now() - startTime
            }));
            throw error;
        }
    }
}
