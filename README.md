# iShootJpeg-Admin

**iShootJpeg-Admin** is a modern set of administrator tools designed to facilitate the curation, management and publishing of film simulation recipes on the iShootJpeg website.

## Features

- **Bulk Import** - Import film simulation recipes from CSV files with validation and idempotent processing
- **Recipe Management** - Full CRUD operations with search and filtering capabilities through a modern web interface
- **Image Processing** - Automated image optimization and upload to Cloudflare R2 with batch processing support

## Technology Stack

### Core Technologies
- **Runtime:** Node.js (24.X)
- **Language:** TypeScript
- **Package Manager:** pnpm (10.X)
- **Database:** PostgreSQL (18.X)
- **Cloud Storage:** Cloudflare R2

### Web Interface
- **Framework:** Nuxt 4.2
- **Styling:** Tailwind CSS 4.2
- **UI Components:** Shoelace 2.2

### CLI Tools
- **Execution:** tsx for development, compiled TypeScript for production
- **Logging:** Structured JSON logging
- **Configuration:** Environment variable-based

## Database Design

### 1. **Full Normalization (3NF)**
- Eliminates data duplication
- Enables referential integrity
- Facilitates filtering and querying

### 2. **EAV Pattern for Settings**
- `setting_definitions`: Schema definition for all possible settings
- `setting_enum_values`: Valid values for enum-type settings
- `recipe_setting_values`: Actual values per recipe
- `recipe_setting_ranges`: Support for range-based settings (ISO, exposure bias)
- `system_settings`: Links settings to specific camera systems

**Benefits:**
- Easy to add new settings without schema changes
- Different camera systems can have different settings
- Type safety through `data_type` field
- Validation through `setting_enum_values`

### 3. **Enhanced Data Integrity**
- **Foreign key actions**: Proper CASCADE/RESTRICT rules
- **CHECK constraints**: Enforce valid values at DB level
- **NOT NULL constraints**: Required fields clearly marked
- **UNIQUE constraints**: Prevent duplicates (slugs, names)
- **Positive value checks**: Prevent negative counts/dimensions

### 4. **Performance Optimization**
- **Strategic indexes** on foreign keys and common query patterns
- **Partial indexes** for boolean flags (is_featured, is_active)
- **Descending indexes** for sorting (created_at, view_count)
- **Composite indexes** where needed

### 5. **Slug Fields for SEO**
- Added `slug` fields to recipes, authors, tags
- Supports SEO-friendly URLs
- Unique constraints prevent conflicts

### 6. **Metadata & Audit Fields**
- `created_at` / `updated_at` timestamps
- `is_active` flags for soft deletes
- `sort_order` for UI control
- `usage_count` for tags (denormalized for performance)

### 7. **Attribution & Source Tracking**
- `source_type` distinguishes original vs curated vs community
- `source_url` maintains attribution
- `is_verified` for trusted authors

### 8. **Image Management**
- UUID primary keys for distributed systems
- File metadata (dimensions, size)
- Accessibility (alt_text)
- Flexible type system (thumbnail, sample, before, after)

### 9. **Removed User Engagement Fields**
- Removed `rating` from recipes (per your Phase 3 scope)
- Kept `view_count` for internal analytics

### Sample Queries

Here are some common queries this schema enables:

**Find all recipes for Fujifilm X100VI:**
```sql
SELECT r.*, cs.name as system_name, cm.name as camera_name
FROM recipes r
JOIN camera_systems cs ON r.system_id = cs.id
LEFT JOIN camera_models cm ON r.camera_model_id = cm.id
WHERE cm.name = 'X100VI' AND r.is_active = true;
```

**Get all settings for a recipe:**
```sql
SELECT 
    sd.name as setting_name,
    sd.data_type,
    rsv.value,
    sc.name as category_name
FROM recipe_setting_values rsv
JOIN setting_definitions sd ON rsv.setting_definition_id = sd.id
JOIN setting_categories sc ON sd.category_id = sc.id
WHERE rsv.recipe_id = 'some-id'
ORDER BY sc.sort_order, sd.sort_order;
```

**Find recipes with specific film simulation:**
```sql
SELECT r.*, fs.display_name as film_sim_name
FROM recipes r
JOIN film_simulations fs ON r.film_simulation_id = fs.id
WHERE fs.name = 'Classic Chrome'
AND r.is_active = true
ORDER BY r.view_count DESC;
```

## Design System

User interfaces are designed to be modern and premium, with a dark mode experience. The application uses a custom color palette:

### Color Palette
```css
--color-primary: #F280B6;
--color-secondary-blue-1: #0597F2;
--color-secondary-blue-2: #05AFF2;
--color-highlight: #D9A796;
--color-background-dark: #0D0D0D;
--color-text-light: #F0F0F0;
--color-text-dark: #CCCCCC;
--color-surface-dark: #1A1A1A;
```

### Typography
- **Font Family:** "Inter", sans-serif
- **Font Display:** Inter with optimized loading

## Project Structure

```
ishootjpeg-admin/
├── src/
│   ├── cli/              # CLI command implementations
│   ├── web/              # Nuxt web application
│   │   ├── components/   # Vue components
│   │   ├── pages/        # Nuxt pages
│   │   ├── composables/  # Vue composables
│   │   └── server/       # Nuxt server API routes
│   ├── core/             # Shared business logic
│   │   ├── models/       # Data models and types
│   │   ├── services/     # Business logic services
│   │   ├── validators/   # Input validation
│   │   └── utils/        # Shared utilities
│   └── config/           # Configuration management
├── tests/                # Test files
│   ├── unit/            # Unit tests
│   └── integration/     # Integration tests
├── scripts/             # Build and deployment scripts
├── .env.example         # Environment variable template
├── CONSTITUTION.md      # Development principles and guidelines
└── package.json         # Project dependencies and scripts
```

## Prerequisites

- **Node.js** - Latest LTS version
- **pnpm** - Latest version
- **PostgreSQL Database** - Access to a local or cloud-hosted PostgreSQL instance
- **Cloudflare R2** - Account and bucket configured for image storage

## Getting Started

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ishootjpeg-admin
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/ishootjpeg

# Cloudflare R2 Configuration
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=your_bucket_name

# Application Configuration
NODE_ENV=development
LOG_LEVEL=info

# Web Server Configuration (for Nuxt)
NUXT_PORT=3000
NUXT_HOST=localhost

# Resource Limits
MAX_CSV_ROWS=10000
MAX_CONCURRENT_UPLOADS=5
MAX_IMAGE_SIZE_MB=10
UPLOAD_TIMEOUT_MS=30000
```

### 4. Initialize Database

Run database migrations to set up the schema:

```bash
pnpm run db:migrate
```

### 5. Start Development

**Web Interface:**
```bash
pnpm run dev
```

**CLI Commands:**
See [CLI Usage](#cli-usage) section below.

## Environment Variables

See `.env.example` for a complete list of required environment variables. All configuration MUST be provided through environment variables—no defaults exist for sensitive values.

### Required Variables
- `DATABASE_URL` - PostgreSQL connection string
- `R2_ACCOUNT_ID` - Cloudflare R2 account identifier
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `R2_BUCKET_NAME` - R2 bucket name for image storage

### Optional Variables
- `LOG_LEVEL` - Logging verbosity (default: `info`)
- `MAX_CSV_ROWS` - Maximum rows per import (default: `10000`)
- `MAX_CONCURRENT_UPLOADS` - Concurrent R2 uploads (default: `5`)

## CLI Usage

All CLI commands are executed via npm scripts. Commands are idempotent and can be safely retried.

### Import Recipes from CSV

```bash
pnpm run cli:import -- --file=/path/to/recipes.csv
```

**Options:**
- `--file` - Path to CSV file (required)
- `--batch-size` - Records to process per batch (default: 100)
- `--dry-run` - Validate without importing

**Example:**
```bash
pnpm run cli:import -- --file=./data/recipes-2024.csv --batch-size=50
```

### Process and Upload Images

```bash
pnpm run cli:process-images -- --source=/path/to/images
```

**Options:**
- `--source` - Directory containing images (required)
- `--resize` - Target dimensions (e.g., `1920x1080`)
- `--quality` - JPEG quality 1-100 (default: 85)
- `--dry-run` - Process without uploading

**Example:**
```bash
pnpm run cli:process-images -- --source=./images --resize=1920x1080 --quality=90
```

### View Logs

All CLI operations produce structured JSON logs. View logs with:

```bash
pnpm run logs
```

## Development

### Running Tests

```bash
# Run all tests
pnpm test

# Run unit tests only
pnpm test:unit

# Run integration tests
pnpm test:integration

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

### Code Quality

```bash
# Lint code
pnpm run lint

# Fix linting issues
pnpm run lint:fix

# Type checking
pnpm run type-check

# Format code
pnpm run format
```

### Building for Production

```bash
# Build web application
pnpm run build

# Build CLI tools
pnpm run build:cli

# Build everything
pnpm run build:all
```

## Development Principles

This project follows a strict set of development principles to ensure code quality, maintainability, and successful AI-assisted collaboration. 

**Before contributing or making changes, you MUST read [CONSTITUTION.md](./CONSTITUTION.md).**

Key principles include:
- **Spec-Driven Development** - All features implemented from documented specifications
- **Test-Driven Development** - Tests written before implementation
- **Clean Architecture** - High cohesion, low coupling, clear boundaries
- **Idempotent Operations** - All operations safely repeatable
- **Structured Logging** - Comprehensive operational visibility

## Project Scripts

```json
{
  "dev": "nuxt dev",
  "build": "nuxt build",
  "build:cli": "tsc --project tsconfig.cli.json",
  "build:all": "pnpm run build && pnpm run build:cli",
  "preview": "nuxt preview",
  "cli:import": "tsx src/cli/import-recipes.ts",
  "cli:process-images": "tsx src/cli/process-images.ts",
  "db:migrate": "tsx src/cli/db-migrate.ts",
  "test": "vitest run",
  "test:unit": "vitest run --dir tests/unit",
  "test:integration": "vitest run --dir tests/integration",
  "test:watch": "vitest watch",
  "test:coverage": "vitest run --coverage",
  "lint": "eslint .",
  "lint:fix": "eslint . --fix",
  "type-check": "nuxt typecheck",
  "format": "prettier --write .",
  "logs": "tail -f logs/application.log"
}
```

## Troubleshooting

### Database Connection Issues

Verify your `DATABASE_URL` is correct and the database is accessible:
```bash
pnpm run db:test-connection
```

### Import Failures

Check logs for detailed error information:
```bash
pnpm run logs | grep ERROR
```

Common issues:
- CSV format doesn't match expected schema
- Validation failures on specific rows
- Database constraints violated

### Image Processing Issues

Ensure:
- Images are in supported formats (JPEG, PNG, WebP)
- File sizes are within `MAX_IMAGE_SIZE_MB` limit
- R2 credentials are correctly configured

## Contributing

1. Read [CONSTITUTION.md](./CONSTITUTION.md) thoroughly
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Write tests first, then implement
4. Ensure all tests pass: `pnpm test`
5. Verify code quality: `pnpm run lint && pnpm run type-check`
6. Commit with clear messages: `git commit -m "feat: add recipe search"`
7. Push and create a pull request

---

**Built with ❤️ for the film photography community**
