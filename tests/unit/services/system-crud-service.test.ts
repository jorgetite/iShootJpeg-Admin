import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SystemCrudService } from '../../../src/core/services/system-crud-service';
import { DatabaseService } from '../../../src/core/services/database-service';

// Mock DatabaseService
vi.mock('../../../src/core/services/database-service', () => {
    return {
        DatabaseService: vi.fn().mockImplementation(() => ({
            connect: vi.fn(),
            disconnect: vi.fn(),
            query: vi.fn(),
            getClient: vi.fn()
        }))
    };
});

describe('SystemCrudService', () => {
    let service: SystemCrudService;
    let mockDb: any;

    beforeEach(() => {
        service = new SystemCrudService('postgres://test:test@localhost:5432/test');
        mockDb = (service as any).db;
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    describe('createSystem', () => {
        it('should create a system successfully', async () => {
            const mockSystem = {
                id: 1,
                name: 'Fujifilm',
                manufacturer: 'Fujifilm',
                is_active: true,
                created_at: new Date()
            };

            mockDb.query.mockResolvedValueOnce({ rows: [mockSystem] });

            const result = await service.createSystem({
                name: 'Fujifilm',
                manufacturer: 'Fujifilm',
                is_active: true
            });

            expect(result).toEqual(mockSystem);
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO camera_systems'),
                ['Fujifilm', 'Fujifilm', true]
            );
        });

        it('should throw error on duplicate name', async () => {
            mockDb.query.mockRejectedValueOnce(new Error('unique constraint'));

            await expect(service.createSystem({
                name: 'Fujifilm',
                manufacturer: 'Fujifilm',
                is_active: true
            })).rejects.toThrow('unique constraint');
        });
    });

    describe('getAllSystems', () => {
        it('should return all systems', async () => {
            const mockSystems = [
                { id: 1, name: 'Fujifilm' },
                { id: 2, name: 'Nikon' }
            ];

            mockDb.query.mockResolvedValueOnce({ rows: mockSystems });

            const result = await service.getAllSystems();

            expect(result).toEqual(mockSystems);
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT * FROM camera_systems')
            );
        });
    });

    describe('getSystemById', () => {
        it('should return system when found', async () => {
            const mockSystem = { id: 1, name: 'Fujifilm' };
            mockDb.query.mockResolvedValueOnce({ rows: [mockSystem] });

            const result = await service.getSystemById(1);

            expect(result).toEqual(mockSystem);
        });

        it('should return null when not found', async () => {
            mockDb.query.mockResolvedValueOnce({ rows: [] });

            const result = await service.getSystemById(999);

            expect(result).toBeNull();
        });
    });

    describe('updateSystem', () => {
        it('should update system successfully', async () => {
            const mockSystem = { id: 1, name: 'Fujifilm Updated' };
            mockDb.query.mockResolvedValueOnce({ rows: [mockSystem] });

            const result = await service.updateSystem(1, { name: 'Fujifilm Updated' });

            expect(result).toEqual(mockSystem);
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE camera_systems'),
                [1, 'Fujifilm Updated']
            );
        });

        it('should throw error when system not found', async () => {
            mockDb.query.mockResolvedValueOnce({ rows: [] });

            await expect(service.updateSystem(999, { name: 'New Name' }))
                .rejects.toThrow('System not found');
        });
    });

    describe('deleteSystem', () => {
        it('should delete system successfully', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

            await service.deleteSystem(1);

            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM camera_systems'),
                [1]
            );
        });

        it('should throw error when system not found', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 0 });

            await expect(service.deleteSystem(999))
                .rejects.toThrow('System not found');
        });
    });

    describe('System Settings', () => {
        it('should get system settings', async () => {
            const mockSettings = [{ system_id: 1, setting_name: 'ISO' }];
            mockDb.query.mockResolvedValueOnce({ rows: mockSettings });

            const result = await service.getSystemSettings(1);

            expect(result).toEqual(mockSettings);
            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('SELECT'),
                [1]
            );
        });

        it('should add system setting', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

            await service.addSystemSetting(1, 100, true, 'Notes');

            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO system_settings'),
                [1, 100, true, 'Notes']
            );
        });

        it('should remove system setting', async () => {
            mockDb.query.mockResolvedValueOnce({ rowCount: 1 });

            await service.removeSystemSetting(1, 100);

            expect(mockDb.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM system_settings'),
                [1, 100]
            );
        });
    });
});
