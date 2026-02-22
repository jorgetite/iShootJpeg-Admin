# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

iShootJpeg-Admin is an admin toolset for curating and publishing film simulation recipes for the iShootJpeg website. It has two interfaces: a Nuxt 4 web app for manual management and CLI tools for batch operations (CSV import/export, image processing, database migrations).

## Tech Stack

- **Runtime**: Node.js 20+, TypeScript 5.7 (strict), ESM (`"type": "module"`)
- **Package Manager**: pnpm
- **Web**: Nuxt 4.2, Vue 3.5 (Composition API with `<script setup>`)
- **Styling**: Tailwind CSS 4 (v4 `@theme` syntax), Shoelace web components (`sl-*` prefix)
- **Database**: PostgreSQL via `pg` driver (no ORM)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Testing**: Vitest 2.1 (globals enabled — no need to import `describe`/`it`/`expect`)

## Commands

```bash
pnpm run dev              # Nuxt dev server
pnpm run build            # Build web app
pnpm run build:cli        # Build CLI tools (tsc → dist/cli/)
pnpm test                 # Run all tests (vitest run)
pnpm test:unit            # Unit tests only
pnpm test:watch           # Watch mode
pnpm test:coverage        # Coverage report (80% threshold)
pnpm run lint             # ESLint
pnpm run lint:fix         # ESLint autofix
pnpm run type-check       # nuxt typecheck
pnpm run format           # Prettier
```

CLI tools (require `.env` with DATABASE_URL):
```bash
pnpm run cli:import       # Import recipes from CSV
pnpm run cli:export       # Export recipes to JSON
pnpm run db:migrate       # Run migrations
pnpm run db:init          # Initialize Fujifilm reference data
```

## Architecture

### Directory Layout

```
src/
├── core/           # Framework-agnostic business logic (shared by web + CLI)
│   ├── db/         # SQL schema, migrations, Fujifilm init data
│   ├── services/   # All business logic services
│   └── types/      # TypeScript type definitions
├── web/            # Nuxt application (srcDir in nuxt.config.ts)
│   ├── server/api/ # API routes (file-based, RESTful CRUD)
│   ├── pages/      # File-based routing
│   ├── components/ # Vue components
│   └── assets/css/ # Tailwind + custom styles
└── cli/            # CLI commands (run via tsx --env-file=.env)
```

### Path Aliases (tsconfig.json)

- `#/*` → `./src/core/*` (business logic imports)
- `~/*` or `@/*` → `./src/web/*` (web layer imports)

### Key Architectural Decisions

1. **Clean Architecture**: `src/core/` contains all business logic with zero framework dependencies. Web and CLI are thin adapter layers. The same service classes are used by both Nuxt API routes and CLI commands.

2. **Service Layer**: Each entity has a CRUD service in `src/core/services/` (e.g., `recipe-crud-service.ts`, `author-crud-service.ts`). Services manage their own database connections via `pg.Pool`.

3. **EAV Settings System**: Recipe settings use an Entity-Attribute-Value pattern. `setting_definitions` defines all possible settings; `recipe_setting_values` stores actual values. This allows adding new camera settings without schema changes.

4. **API Route Pattern**: Nuxt server routes in `src/web/server/api/` instantiate a service, call it, and return. Each handler creates its own service instance with `DATABASE_URL` from `useRuntimeConfig()`.

5. **Shoelace Web Components**: Form elements use Shoelace (`sl-input`, `sl-select`, `sl-button`, etc.). Vue is configured with `isCustomElement: tag => tag.startsWith('sl-')` in nuxt.config.ts.

### Database Schema

The PostgreSQL schema (`src/core/db/schema.sql`) uses full normalization:
- **Reference tables**: `systems`, `sensors`, `cameras`, `film_sims`, `styles`
- **EAV settings**: `setting_categories`, `setting_definitions`, `setting_enum_values`, `system_settings`
- **Content**: `recipes`, `authors`, `tags`, `images` with junction tables
- All data operations use `ON CONFLICT` for idempotency

## Development Principles (CONSTITUTION.md)

This project follows strict principles documented in CONSTITUTION.md. Key points:
- **Spec-driven**: Don't add features without specifications; ask for clarification when ambiguous
- **Test-first**: Write tests before implementation
- **Fail-fast validation**: Validate inputs at system boundaries
- **Interface-agnostic core**: Business logic in `src/core/` must never import web/CLI frameworks
- **Idempotent operations**: All data operations must be safely repeatable
- **Structured logging**: JSON logs with correlation IDs, timestamps, severity
- **Environment-based config**: All configuration via environment variables, validated at startup
