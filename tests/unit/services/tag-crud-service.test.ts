/**
 * Unit tests for TagCrudService
 * Tests tag CRUD operations
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TagCrudService } from '#/services/tag-crud-service';
import { createMockPoolClient } from '../../utils/db-mocks';
import { suppressConsole } from '../../utils/logger-mocks';

// Mock DatabaseService
vi.mock('#/services/database-service', () => {
    return {
        DatabaseService: vi.fn().mockImplementation(() => ({
            connect: vi.fn().mockResolvedValue(undefined),
            disconnect: vi.fn().mockResolvedValue(undefined),
            getClient: vi.fn(),
            getAll: vi.fn(),
            getById: vi.fn(),
            delete: vi.fn(),
        })),
    };
});

describe('TagCrudService', () => {
    let service: TagCrudService;
    let mockDb: any;
    let mockClient: any;
    let consoleSuppress: ReturnType<typeof suppressConsole>;

    beforeEach(() => {
        consoleSuppress = suppressConsole();
        vi.clearAllMocks();

        service = new TagCrudService('postgres://test');
        mockDb = (service as any).db;

        // Create mock client
        mockClient = createMockPoolClient();
        mockDb.getClient.mockResolvedValue(mockClient);

        // Default query implementations
        mockClient.query.mockImplementation((sql: string | { text: string }, params?: any[]) => {
            return Promise.resolve({ rows: [] });
        });
    });

    afterEach(() => {
        consoleSuppress.restore();
    });

    describe('createTag', () => {
        const tagInput = {
            name: 'Test Tag',
            slug: 'test-tag',
            category: 'subject',
        };

        it('should create a tag with basic fields', async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    ...tagInput,
                    usage_count: 0,
                    is_active: true,
                    created_at: new Date(),
                }],
            });

            const tag = await service.createTag(tagInput);

            expect(tag).toBeDefined();
            expect(tag.id).toBe(1);
            expect(tag.name).toBe('Test Tag');
            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO tags'),
                expect.arrayContaining(['Test Tag', 'test-tag', 'subject'])
            );
        });

        it('should generate slug if not provided', async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    name: 'Test Tag',
                    slug: 'test-tag',
                    category: null,
                    usage_count: 0,
                    is_active: true,
                    created_at: new Date(),
                }],
            });

            await service.createTag({ name: 'Test Tag' });

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('INSERT INTO tags'),
                expect.arrayContaining(['test-tag'])
            );
        });

        it('should handle duplicate slug errors', async () => {
            mockClient.query.mockRejectedValueOnce(new Error('unique constraint "tags_slug_unique"'));

            await expect(service.createTag(tagInput)).rejects.toThrow('unique constraint');
        });
    });

    describe('updateTag', () => {
        const updateInput = {
            name: 'Updated Tag',
            category: 'mood',
        };

        it('should update tag fields', async () => {
            mockClient.query.mockResolvedValueOnce({
                rows: [{
                    id: 1,
                    name: 'Updated Tag',
                    slug: 'test-tag',
                    category: 'mood',
                    usage_count: 0,
                    is_active: true,
                    created_at: new Date(),
                }],
            });

            const tag = await service.updateTag(1, updateInput);

            expect(tag).toBeDefined();
            expect(tag.name).toBe('Updated Tag');
            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('UPDATE tags'),
                expect.arrayContaining(['Updated Tag', 'mood', 1])
            );
        });

        it('should throw error if tag not found', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            await expect(service.updateTag(999, updateInput)).rejects.toThrow('Tag not found');
        });
    });

    describe('deleteTag', () => {
        it('should delete tag', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [{ id: 1 }] });

            await service.deleteTag(1);

            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('DELETE FROM tags'),
                expect.arrayContaining([1])
            );
        });

        it('should throw error if tag not found', async () => {
            mockClient.query.mockResolvedValueOnce({ rows: [] });

            await expect(service.deleteTag(999)).rejects.toThrow('Tag not found');
        });
    });

    describe('getAllTags', () => {
        it('should return all tags', async () => {
            const mockTags = [{ id: 1, name: 'Tag 1' }, { id: 2, name: 'Tag 2' }];
            mockDb.getAll.mockResolvedValue(mockTags);

            const tags = await service.getAllTags();

            expect(tags).toEqual(mockTags);
            expect(mockDb.getAll).toHaveBeenCalledWith('tags', {}, 'name ASC');
        });
    });

    describe('getTagById', () => {
        it('should return tag by id', async () => {
            const mockTag = { id: 1, name: 'Tag 1' };
            mockDb.getById.mockResolvedValue(mockTag);

            const tag = await service.getTagById(1);

            expect(tag).toEqual(mockTag);
            expect(mockDb.getById).toHaveBeenCalledWith('tags', 1);
        });
    });

    describe('searchTags', () => {
        it('should search tags by name', async () => {
            mockClient.query
                .mockResolvedValueOnce({ rows: [{ count: '1' }] }) // Count query
                .mockResolvedValueOnce({ rows: [{ id: 1, name: 'Search Result' }] }); // Data query

            const result = await service.searchTags({ search: 'Search' });

            expect(result.tags).toHaveLength(1);
            expect(result.total).toBe(1);
            expect(mockClient.query).toHaveBeenCalledWith(
                expect.stringContaining('name ILIKE $1'),
                expect.arrayContaining(['%Search%'])
            );
        });
    });
});
