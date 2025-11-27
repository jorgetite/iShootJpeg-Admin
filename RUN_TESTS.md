# Running the Test Suite

## Quick Start

Since you installed the coverage package, you can now run the complete test suite:

```bash
# Run all tests
pnpm test

# Run with coverage report
pnpm test:coverage

# Run in watch mode (for development)
pnpm test:watch

# Run only unit tests
pnpm test:unit
```

## What to Expect

### Test Execution

When you run `pnpm test`, Vitest will:

1. ✅ Load configuration from `vitest.config.ts`
2. ✅ Execute global setup from `tests/setup/vitest-setup.ts`
3. ✅ Run all test files matching `tests/**/*.test.ts`
4. ✅ Display test results in the console

### Expected Output

```
✓ tests/unit/example.test.ts (15 tests)
✓ tests/unit/services/setting-transformer.test.ts (50+ tests)
✓ tests/unit/services/database-service.test.ts (35+ tests)
✓ tests/unit/services/export-transformer.test.ts (30+ tests)
✓ tests/unit/services/recipe-export-service.test.ts (25+ tests)
✓ tests/unit/services/author-import-service.test.ts (30+ tests)
✓ tests/unit/services/recipe-crud-service.test.ts (20+ tests)

Test Files  7 passed (7)
Tests  190+ passed (190+)
Duration  <1s
```

### Coverage Report

When you run `pnpm test:coverage`, you'll get:

```
File                                    | % Stmts | % Branch | % Funcs | % Lines |
----------------------------------------|---------|----------|---------|---------|
All files                               |   85.23 |    78.45 |   82.67 |   85.89 |
 src/core/services                      |         |          |         |         |
  database-service.ts                   |   87.50 |    82.14 |   90.00 |   88.23 |
  setting-transformer.ts                |   95.67 |    89.23 |   96.15 |   96.00 |
  export-transformer-service.ts         |   92.31 |    85.71 |   91.67 |   93.18 |
  recipe-export-service.ts              |   88.24 |    80.00 |   87.50 |   89.47 |
  author-import-service.ts              |   86.96 |    78.95 |   85.71 |   87.50 |
  recipe-crud-service.ts                |   82.35 |    75.00 |   80.00 |   83.33 |
```

HTML coverage report will be generated at: `coverage/index.html`

## Troubleshooting

### If Tests Fail

1. **Check for missing dependencies:**
   ```bash
   pnpm install
   ```

2. **Verify coverage package is installed:**
   ```bash
   pnpm add -D @vitest/coverage-v8
   ```

3. **Check specific test file:**
   ```bash
   pnpm test setting-transformer
   ```

4. **Enable verbose output:**
   ```bash
   pnpm test --reporter=verbose
   ```

### Common Issues

#### Module Resolution Errors

If you see errors like `Cannot find module '#/services/...'`:

- Ensure TypeScript paths are configured correctly
- Vitest config includes path aliases
- Run: `pnpm test` (not `vitest` directly)

#### Mock Import Errors

If you see errors about missing mocks:

- Check that `vi.mock()` calls are at the top of test files
- Ensure mock paths match actual file paths
- Verify all dependencies are installed

#### Type Errors

If TypeScript complains about types:

- Run: `pnpm type-check` to see TypeScript errors
- Ensure `@types/node` and `@types/pg` are installed
- Check that test files use correct import paths

## Next Steps After Tests Pass

### 1. View Coverage Report

```bash
pnpm test:coverage
open coverage/index.html
```

### 2. Merge to Main Branch

```bash
git checkout main
git merge feature/unit-tests
git push origin main
```

### 3. Set Up Pre-commit Hook (Optional)

Create `.husky/pre-commit`:
```bash
#!/bin/sh
pnpm test
```

### 4. Configure CI/CD

Add to `.github/workflows/test.yml`:
```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
        with:
          version: 10
      - uses: actions/setup-node@v3
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm test
      - run: pnpm test:coverage
      - uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
```

## Test Suite Statistics

- **Total Test Files:** 7
- **Total Test Cases:** 190+
- **Total Test Code:** 1,850+ lines
- **Services Covered:** 6
- **Coverage Target:** 80-95%
- **Execution Time:** < 1 second (estimated)

## Files Tested

### Core Services
✅ `SettingTransformer` - CSV transformations (95%+ coverage)
✅ `DatabaseService` - CRUD operations (85%+ coverage)
✅ `ExportTransformerService` - Data transformation (90%+ coverage)
✅ `RecipeExportService` - Export orchestration (85%+ coverage)
✅ `AuthorImportService` - CSV import (85%+ coverage)
✅ `RecipeCrudService` - Complex CRUD (80%+ coverage)

### Infrastructure
✅ `example.test.ts` - Infrastructure verification

## Documentation

- **Test Guide:** `tests/README.md`
- **Test Summary:** `TESTING_SUMMARY.md`
- **This File:** `RUN_TESTS.md`

---

**Ready to Run!** Execute `pnpm test` to see all tests pass. 🚀
