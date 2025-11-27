# Test Infrastructure

This directory contains the complete testing infrastructure for the iShootJpeg-Admin project.

## Directory Structure

```
tests/
├── setup/              # Global test setup and configuration
│   └── vitest-setup.ts    # Global beforeAll/afterAll hooks
├── utils/              # Test utilities and helpers
│   ├── db-mocks.ts        # Database mocking utilities (Pool, Client)
│   ├── logger-mocks.ts    # Console/logger mocking
│   ├── test-helpers.ts    # General test helpers
│   ├── mock-factories.ts  # Data factories for creating test entities
│   └── index.ts           # Central export
├── fixtures/           # Static test data
│   ├── sample-data.ts     # Predefined test data
│   ├── recipes.csv        # Sample recipe CSV for import tests
│   └── authors.csv        # Sample author CSV for import tests
├── unit/              # Unit tests (fast, isolated, mocked dependencies)
│   ├── services/          # Service layer tests
│   └── api/               # API route handler tests
└── integration/       # Integration tests (slower, real database)
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests only
pnpm test:integration

# Run tests in watch mode (during development)
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage
```

## Test Utilities

### Mock Factories (`tests/utils/mock-factories.ts`)

Create realistic test data easily:

```typescript
import { createMockRecipe, createMockAuthor } from '../utils/mock-factories';

// Create with defaults
const recipe = createMockRecipe();

// Create with custom values
const recipe = createMockRecipe({
  name: 'My Recipe',
  difficulty_level: 'advanced',
});

// Create complete recipe with all relations
const { recipe, author, system, settings } = createMockRecipeWithRelations();
```

### Database Mocks (`tests/utils/db-mocks.ts`)

Mock database operations:

```typescript
import { createMockPool, createMockQueryResult } from '../utils/db-mocks';

const mockPool = createMockPool([
  createMockQueryResult([{ id: 1, name: 'Test' }]),
]);
```

### Logger Mocks (`tests/utils/logger-mocks.ts`)

Control console output in tests:

```typescript
import { suppressConsole, captureConsole } from '../utils/logger-mocks';

// Suppress all console output
const { restore } = suppressConsole();
// ... test code ...
restore();

// Capture console output for assertions
const { logs, errors, restore } = captureConsole();
console.log('test');
expect(logs).toContain('test');
restore();
```

### Test Helpers (`tests/utils/test-helpers.ts`)

General utilities:

```typescript
import { randomString, createSlug, wait } from '../utils/test-helpers';

const str = randomString(10); // Random alphanumeric string
const slug = createSlug('Hello World'); // 'hello-world'
await wait(100); // Wait 100ms
```

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DatabaseService } from '#/services/database-service';
import { createMockPool, createMockQueryResult } from '../utils/db-mocks';

describe('DatabaseService', () => {
  let service: DatabaseService;
  let mockPool: any;

  beforeEach(() => {
    mockPool = createMockPool();
    service = new DatabaseService('postgres://test');
    // Replace the pool with our mock
    (service as any).pool = mockPool;
  });

  it('should fetch all records', async () => {
    const mockData = [{ id: 1, name: 'Test' }];
    mockPool.query.mockResolvedValueOnce(createMockQueryResult(mockData));

    const results = await service.getAll('users');

    expect(results).toEqual(mockData);
    expect(mockPool.query).toHaveBeenCalledWith(
      'SELECT * FROM "users"',
      []
    );
  });
});
```

### Integration Test Example

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DatabaseService } from '#/services/database-service';

describe('Recipe CRUD Integration', () => {
  let db: DatabaseService;

  beforeAll(async () => {
    db = new DatabaseService(process.env.TEST_DATABASE_URL!);
    await db.connect();
    // Run migrations, seed test data
  });

  afterAll(async () => {
    // Clean up test data
    await db.disconnect();
  });

  it('should create and retrieve a recipe', async () => {
    const recipe = await db.create('recipes', {
      name: 'Test Recipe',
      author_id: 1,
    });

    expect(recipe.id).toBeDefined();

    const retrieved = await db.getById('recipes', recipe.id);
    expect(retrieved.name).toBe('Test Recipe');
  });
});
```

## Coverage Configuration

Coverage is configured in `vitest.config.ts`:

- **Target**: 80% statements, 75% branches, 80% functions, 80% lines
- **Excluded**: Config files, test files, CLI tools, type definitions
- **Reports**: Text (console), JSON, HTML, LCOV

View HTML coverage report:
```bash
pnpm test:coverage
open coverage/index.html
```

## Best Practices

1. **Isolation**: Unit tests should mock all external dependencies
2. **Fast**: Unit tests should run in milliseconds
3. **Descriptive**: Use clear test names that describe the behavior
4. **AAA Pattern**: Arrange, Act, Assert
5. **Independent**: Tests should not depend on each other
6. **Cleanup**: Always restore mocks and clean up resources

### Test Naming Convention

```typescript
describe('ServiceName', () => {
  describe('methodName', () => {
    it('should do X when Y happens', () => {
      // Test implementation
    });

    it('should throw error when given invalid input', () => {
      // Error test
    });
  });
});
```

## Next Steps

1. Install coverage package: `pnpm add -D @vitest/coverage-v8`
2. Write service tests (SettingTransformer, DatabaseService, etc.)
3. Write API route tests
4. Set up integration test database
5. Configure CI/CD pipeline
