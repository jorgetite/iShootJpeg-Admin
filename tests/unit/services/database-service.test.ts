/**
 * Unit tests for DatabaseService
 * Tests generic CRUD operations with mocked pg Pool
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DatabaseService } from '#/services/database-service';
import { createMockPool, createMockQueryResult, createMockPoolClient } from '../../utils/db-mocks';
import { suppressConsole } from '../../utils/logger-mocks';
import type { Author } from '#/types/database';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPool: any;
  let consoleSuppress: ReturnType<typeof suppressConsole>;

  beforeEach(() => {
    consoleSuppress = suppressConsole();
    service = new DatabaseService('postgres://test:test@localhost/test');
    mockPool = createMockPool();
    // Replace the internal pool with our mock
    (service as any).pool = mockPool;
  });

  afterEach(() => {
    consoleSuppress.restore();
  });

  describe('connect', () => {
    it('should successfully connect to database', async () => {
      const mockClient = createMockPoolClient();
      mockPool.connect.mockResolvedValueOnce(mockClient);

      await expect(service.connect()).resolves.not.toThrow();
      expect(mockPool.connect).toHaveBeenCalled();
      expect(mockClient.release).toHaveBeenCalled();
    });

    it('should throw error on connection failure', async () => {
      const error = new Error('Connection refused');
      mockPool.connect.mockRejectedValueOnce(error);

      await expect(service.connect()).rejects.toThrow('Connection refused');
    });
  });

  describe('disconnect', () => {
    it('should close pool connection', async () => {
      mockPool.end.mockResolvedValueOnce(undefined);

      await service.disconnect();

      expect(mockPool.end).toHaveBeenCalled();
    });
  });

  describe('getClient', () => {
    it('should return a pool client', async () => {
      const mockClient = createMockPoolClient();
      mockPool.connect.mockResolvedValueOnce(mockClient);

      const client = await service.getClient();

      expect(client).toBe(mockClient);
      expect(mockPool.connect).toHaveBeenCalled();
    });
  });

  describe('getAll', () => {
    it('should fetch all records from table', async () => {
      const mockAuthors: Author[] = [
        { id: 1, name: 'John Doe', slug: 'john-doe', bio: null, website_url: null, social_handle: null, social_platform: null, is_verified: false, created_at: new Date(), updated_at: new Date() },
        { id: 2, name: 'Jane Smith', slug: 'jane-smith', bio: null, website_url: null, social_handle: null, social_platform: null, is_verified: true, created_at: new Date(), updated_at: new Date() },
      ];

      mockPool.query.mockResolvedValueOnce(createMockQueryResult(mockAuthors));

      const result = await service.getAll<Author>('authors');

      expect(result).toEqual(mockAuthors);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM "authors"',
        []
      );
    });

    it('should apply filters', async () => {
      const mockAuthors: Author[] = [
        { id: 1, name: 'John Doe', slug: 'john-doe', bio: null, website_url: null, social_handle: null, social_platform: null, is_verified: true, created_at: new Date(), updated_at: new Date() },
      ];

      mockPool.query.mockResolvedValueOnce(createMockQueryResult(mockAuthors));

      const result = await service.getAll<Author>('authors', { is_verified: true });

      expect(result).toEqual(mockAuthors);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM "authors" WHERE "is_verified" = $1',
        [true]
      );
    });

    it('should apply multiple filters', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await service.getAll('authors', { is_verified: true, slug: 'john-doe' });

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE "is_verified" = $1 AND "slug" = $2'),
        [true, 'john-doe']
      );
    });

    it('should apply ORDER BY clause', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await service.getAll('authors', undefined, 'created_at DESC');

      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM "authors" ORDER BY created_at DESC',
        []
      );
    });

    it('should apply both filters and ORDER BY', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await service.getAll('authors', { is_verified: true }, 'name ASC');

      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE "is_verified" = $1 ORDER BY name ASC'),
        [true]
      );
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(service.getAll('authors')).rejects.toThrow('Query failed');
    });
  });

  describe('getById', () => {
    it('should fetch record by numeric id', async () => {
      const mockAuthor: Author = {
        id: 1,
        name: 'John Doe',
        slug: 'john-doe',
        bio: null,
        website_url: null,
        social_handle: null,
        social_platform: null,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce(createMockQueryResult([mockAuthor]));

      const result = await service.getById<Author>('authors', 1);

      expect(result).toEqual(mockAuthor);
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM "authors" WHERE id = $1',
        [1]
      );
    });

    it('should fetch record by string id', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([{ id: 'uuid-123', name: 'Test' }]));

      const result = await service.getById('images', 'uuid-123');

      expect(result).toEqual({ id: 'uuid-123', name: 'Test' });
      expect(mockPool.query).toHaveBeenCalledWith(
        'SELECT * FROM "images" WHERE id = $1',
        ['uuid-123']
      );
    });

    it('should return null when record not found', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      const result = await service.getById('authors', 999);

      expect(result).toBeNull();
    });

    it('should handle query errors', async () => {
      const error = new Error('Query failed');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(service.getById('authors', 1)).rejects.toThrow('Query failed');
    });
  });

  describe('create', () => {
    it('should create a new record', async () => {
      const newAuthor = { name: 'John Doe', slug: 'john-doe' };
      const createdAuthor: Author = {
        id: 1,
        ...newAuthor,
        bio: null,
        website_url: null,
        social_handle: null,
        social_platform: null,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce(createMockQueryResult([createdAuthor]));

      const result = await service.create<Author>('authors', newAuthor);

      expect(result).toEqual(createdAuthor);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO "authors"'),
        expect.arrayContaining(['John Doe', 'john-doe'])
      );
    });

    it('should use ON CONFLICT for idempotency', async () => {
      const newAuthor = { name: 'John Doe', slug: 'john-doe' };
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([newAuthor]));

      await service.create('authors', newAuthor, 'slug');

      const call = mockPool.query.mock.calls[0][0];
      expect(call).toContain('ON CONFLICT ("slug")');
      expect(call).toContain('DO UPDATE SET');
    });

    it('should not update id and created_at on conflict', async () => {
      const data = { name: 'Test', slug: 'test', other: 'value' };
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([data]));

      await service.create('authors', data, 'slug');

      const call = mockPool.query.mock.calls[0][0];
      expect(call).not.toContain('id" = EXCLUDED');
      expect(call).not.toContain('created_at" = EXCLUDED');
    });

    it('should handle insert errors', async () => {
      const error = new Error('Unique constraint violation');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(service.create('authors', { name: 'Test' })).rejects.toThrow();
    });
  });

  describe('update', () => {
    it('should update an existing record', async () => {
      const updatedAuthor: Author = {
        id: 1,
        name: 'Jane Doe',
        slug: 'john-doe',
        bio: 'Updated bio',
        website_url: null,
        social_handle: null,
        social_platform: null,
        is_verified: false,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockPool.query.mockResolvedValueOnce(createMockQueryResult([updatedAuthor]));

      const result = await service.update<Author>('authors', 1, { name: 'Jane Doe', bio: 'Updated bio' });

      expect(result).toEqual(updatedAuthor);
      expect(mockPool.query).toHaveBeenCalledWith(
        expect.stringContaining('UPDATE "authors"'),
        expect.arrayContaining(['Jane Doe', 'Updated bio', 1])
      );
    });

    it('should set updated_at timestamp', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([{ id: 1, name: 'Test' }]));

      await service.update('authors', 1, { name: 'Test' });

      const call = mockPool.query.mock.calls[0][0];
      expect(call).toContain('updated_at = now()');
    });

    it('should throw error if record not found', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await expect(service.update('authors', 999, { name: 'Test' })).rejects.toThrow(
        'Record not found in authors with id 999'
      );
    });

    it('should handle update errors', async () => {
      const error = new Error('Update failed');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(service.update('authors', 1, { name: 'Test' })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should perform hard delete by default', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([{ id: 1 }]));

      await service.delete('tags', 1);

      expect(mockPool.query).toHaveBeenCalledWith(
        'DELETE FROM "tags" WHERE id = $1 RETURNING id',
        [1]
      );
    });

    it('should perform soft delete when specified', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([{ id: 1 }]));

      await service.delete('recipes', 1, true);

      expect(mockPool.query).toHaveBeenCalledWith(
        'UPDATE "recipes" SET is_active = false WHERE id = $1 RETURNING id',
        [1]
      );
    });

    it('should throw error if record not found', async () => {
      mockPool.query.mockResolvedValueOnce(createMockQueryResult([]));

      await expect(service.delete('authors', 999)).rejects.toThrow(
        'Record not found in authors with id 999'
      );
    });

    it('should handle delete errors', async () => {
      const error = new Error('Delete failed');
      mockPool.query.mockRejectedValueOnce(error);

      await expect(service.delete('authors', 1)).rejects.toThrow('Delete failed');
    });
  });
});
