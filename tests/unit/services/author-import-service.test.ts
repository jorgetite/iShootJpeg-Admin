/**
 * Unit tests for AuthorImportService
 * Tests CSV author import functionality
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { AuthorImportService } from '#/services/author-import-service';
import { suppressConsole } from '../../utils/logger-mocks';
import fs from 'node:fs/promises';

// Mock filesystem and pg
vi.mock('node:fs/promises');
vi.mock('pg', () => {
  const mockClient = {
    connect: vi.fn().mockResolvedValue(undefined),
    end: vi.fn().mockResolvedValue(undefined),
    query: vi.fn(),
  };

  return {
    default: {
      Client: vi.fn(() => mockClient),
    },
  };
});

describe('AuthorImportService', () => {
  let service: AuthorImportService;
  let mockClient: any;
  let consoleSuppress: ReturnType<typeof suppressConsole>;

  beforeEach(() => {
    consoleSuppress = suppressConsole();
    vi.clearAllMocks();

    service = new AuthorImportService('postgres://test', false);
    // Get the mocked client instance
    mockClient = (service as any).client;
  });

  afterEach(() => {
    consoleSuppress.restore();
  });

  describe('connect/disconnect', () => {
    it('should connect to database', async () => {
      await service.connect();
      expect(mockClient.connect).toHaveBeenCalled();
    });

    it('should disconnect from database', async () => {
      await service.disconnect();
      expect(mockClient.end).toHaveBeenCalled();
    });
  });

  describe('importAuthors', () => {
    const csvContent = `Name,Site or Profile,URL,Count,First publication,Last publication
John Doe,johndoe (Instagram),https://johndoe.com,10,2024-01-01,2024-12-01
Jane Smith,janesmith (Facebook),https://janesmith.com,5,2024-02-01,2024-11-01`;

    beforeEach(() => {
      vi.mocked(fs.readFile).mockResolvedValue(csvContent);
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN') return Promise.resolve();
        if (sql === 'COMMIT') return Promise.resolve();
        if (sql === 'ROLLBACK') return Promise.resolve();
        if (sql.includes('SELECT id FROM authors')) {
          return Promise.resolve({ rows: [] }); // No existing authors
        }
        if (sql.includes('INSERT INTO authors')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });
    });

    it('should import authors from CSV file', async () => {
      await service.importAuthors('test.csv');

      expect(fs.readFile).toHaveBeenCalledWith(expect.stringContaining('test.csv'), 'utf-8');
      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('COMMIT');
    });

    it('should process each author row', async () => {
      await service.importAuthors('test.csv');

      // Should insert/upsert 2 authors (John Doe and Jane Smith)
      const insertCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCalls).toHaveLength(2);
    });

    it('should generate correct slugs for authors', async () => {
      await service.importAuthors('test.csv');

      const insertCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );

      expect(insertCalls[0][1]).toContain('john-doe');
      expect(insertCalls[1][1]).toContain('jane-smith');
    });

    it('should parse social handles correctly', async () => {
      await service.importAuthors('test.csv');

      const insertCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );

      // First author: johndoe (Instagram)
      expect(insertCalls[0][1]).toContain('johndoe');
      expect(insertCalls[0][1]).toContain('Instagram');

      // Second author: janesmith (Facebook)
      expect(insertCalls[1][1]).toContain('janesmith');
      expect(insertCalls[1][1]).toContain('Facebook');
    });

    it('should use ON CONFLICT for idempotent imports', async () => {
      await service.importAuthors('test.csv');

      const insertCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );

      insertCalls.forEach((call: any[]) => {
        expect(call[0]).toContain('ON CONFLICT (slug)');
        expect(call[0]).toContain('DO UPDATE SET');
      });
    });

    it('should handle dry-run mode', async () => {
      const dryRunService = new AuthorImportService('postgres://test', true);
      (dryRunService as any).client = mockClient;

      await dryRunService.importAuthors('test.csv');

      expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
      expect(mockClient.query).not.toHaveBeenCalledWith('COMMIT');
    });

    it('should differentiate between new and updated authors', async () => {
      // First author exists, second is new
      mockClient.query.mockImplementation((sql: string, params?: any[]) => {
        if (sql === 'BEGIN') return Promise.resolve();
        if (sql === 'COMMIT') return Promise.resolve();
        if (sql.includes('SELECT id FROM authors')) {
          const slug = params?.[0];
          if (slug === 'john-doe') {
            return Promise.resolve({ rows: [{ id: 1 }] }); // Exists
          }
          return Promise.resolve({ rows: [] }); // New
        }
        if (sql.includes('INSERT INTO authors')) {
          return Promise.resolve({ rows: [] });
        }
        return Promise.resolve({ rows: [] });
      });

      await service.importAuthors('test.csv');

      // Both should still be upserted
      const insertCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCalls).toHaveLength(2);
    });

    it('should skip rows with missing names', async () => {
      const csvWithMissing = `Name,Site or Profile,URL,Count,First publication,Last publication
,johndoe (Instagram),https://johndoe.com,10,2024-01-01,2024-12-01
Jane Smith,janesmith,https://jane.com,5,2024-02-01,2024-11-01`;

      vi.mocked(fs.readFile).mockResolvedValue(csvWithMissing);

      await service.importAuthors('test.csv');

      // Should only insert 1 author (Jane Smith)
      const insertCalls = mockClient.query.mock.calls.filter((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCalls).toHaveLength(1);
      expect(insertCalls[0][1]).toContain('Jane Smith');
    });

    it('should handle import errors and rollback', async () => {
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN') return Promise.resolve();
        if (sql.includes('INSERT INTO authors')) {
          throw new Error('Database error');
        }
        if (sql === 'ROLLBACK') return Promise.resolve();
        return Promise.resolve({ rows: [] });
      });

      await expect(service.importAuthors('test.csv')).rejects.toThrow('Database error');
      expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    });
  });

  describe('parseSocialInfo (via integration)', () => {
    beforeEach(() => {
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return Promise.resolve();
        if (sql.includes('SELECT id FROM authors')) return Promise.resolve({ rows: [] });
        if (sql.includes('INSERT INTO authors')) return Promise.resolve({ rows: [] });
        return Promise.resolve({ rows: [] });
      });
    });

    it('should parse handle with platform', async () => {
      const csv = 'Name,Site or Profile,URL\nTest,myhandle (Instagram),url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCall[1]).toContain('myhandle');
      expect(insertCall[1]).toContain('Instagram');
    });

    it('should normalize platform names', async () => {
      const csv = 'Name,Site or Profile,URL\nTest,handle (instagram),url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCall[1]).toContain('Instagram'); // Capitalized
    });

    it('should handle typo in platform name', async () => {
      const csv = 'Name,Site or Profile,URL\nTest,handle (face nook),url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCall[1]).toContain('Facebook'); // Corrected
    });

    it('should default to Instagram for handles without platform', async () => {
      const csv = 'Name,Site or Profile,URL\nTest,myhandle,url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCall[1]).toContain('myhandle');
      expect(insertCall[1]).toContain('Instagram');
    });

    it('should handle "unknown" as no social info', async () => {
      const csv = 'Name,Site or Profile,URL\nTest,unknown,url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      // Should have null for both handle and platform
      const params = insertCall[1];
      const handleIndex = 4; // social_handle is 5th param (0-indexed = 4)
      const platformIndex = 5; // social_platform is 6th param
      expect(params[handleIndex]).toBeNull();
      expect(params[platformIndex]).toBeNull();
    });
  });

  describe('generateSlug (via integration)', () => {
    beforeEach(() => {
      mockClient.query.mockImplementation((sql: string) => {
        if (sql === 'BEGIN' || sql === 'COMMIT') return Promise.resolve();
        if (sql.includes('SELECT id FROM authors')) return Promise.resolve({ rows: [] });
        if (sql.includes('INSERT INTO authors')) return Promise.resolve({ rows: [] });
        return Promise.resolve({ rows: [] });
      });
    });

    it('should generate slug from name with spaces', async () => {
      const csv = 'Name,Site or Profile,URL\nJohn Doe Smith,handle,url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCall[1]).toContain('john-doe-smith');
    });

    it('should remove special characters from slug', async () => {
      const csv = 'Name,Site or Profile,URL\nJohn!@#$%Doe,handle,url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCall[1]).toContain('john-doe');
      expect(insertCall[1][1]).not.toMatch(/[!@#$%]/);
    });

    it('should handle names with numbers', async () => {
      const csv = 'Name,Site or Profile,URL\nJohn Doe 123,handle,url';
      vi.mocked(fs.readFile).mockResolvedValue(csv);

      await service.importAuthors('test.csv');

      const insertCall = mockClient.query.mock.calls.find((call: any[]) =>
        call[0].includes('INSERT INTO authors')
      );
      expect(insertCall[1]).toContain('john-doe-123');
    });
  });
});
