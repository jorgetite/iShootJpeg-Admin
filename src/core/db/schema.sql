-- =====================================================
-- REFERENCE TABLES (Normalized Categorical Data)
-- =====================================================

-- Camera Systems (Fujifilm, Nikon, Lumix, OM System)
CREATE TABLE IF NOT EXISTS "systems" (
    "id" serial PRIMARY KEY,
    "name" varchar(50) NOT NULL,
    "manufacturer" varchar(100) NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "systems_name_unique" UNIQUE("name")
);

-- Sensors (X-Trans III, X-Trans IV, X-Trans V, Bayer, etc.)
-- NOTE: Must vary before cameras table
CREATE TABLE IF NOT EXISTS "sensors" (
    "id" serial PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "type" varchar(50) NOT NULL, -- 'X-Trans', 'Bayer', 'Stacked CMOS', etc.
    "megapixels" numeric(5,1),
    "description" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "sensors_name_unique" UNIQUE("name")
);

-- Camera Models (X100VI, X-T5, Zf, etc.)
CREATE TABLE IF NOT EXISTS cameras (
    id SERIAL PRIMARY KEY,
    system_id INTEGER NOT NULL REFERENCES systems(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL UNIQUE,
    sensor_id INTEGER REFERENCES sensors(id),
    release_year INTEGER,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cameras_sensor FOREIGN KEY (sensor_id) REFERENCES sensors(id),
    CONSTRAINT cameras_release_year_check CHECK (release_year >= 2000 AND release_year <= 2100)
);

COMMENT ON TABLE cameras IS 'Specific camera bodies (e.g., X-T5, X100VI)';

-- Film Simulations (Provia, Velvia, Classic Chrome, etc.)
CREATE TABLE IF NOT EXISTS "film_sims" (
    "id" serial PRIMARY KEY,
    "name" varchar(60) NOT NULL,
    "system_id" integer NOT NULL, -- Links to systems
    "label" varchar(120) NOT NULL, -- e.g., "Classic Chrome" vs "Classic Neg"
    "description" text,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "film_sims_system_name_unique" UNIQUE("system_id", "name")
);

-- Camera-Film Simulation Mapping (Many-to-Many)
-- Maps which film simulations are available on each camera model
CREATE TABLE IF NOT EXISTS "camera_film_sims" (
    "camera_id" integer NOT NULL,
    "film_sim_id" integer NOT NULL,
    "added_via_firmware" boolean DEFAULT false,
    "notes" text,
    CONSTRAINT "camera_film_sims_pk" PRIMARY KEY("camera_id", "film_sim_id")
);

-- Style Categories (Color, B/W, IR)
CREATE TABLE IF NOT EXISTS "styles" (
    "id" serial PRIMARY KEY,
    "name" varchar(30) NOT NULL,
    "description" text,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "styles_name_unique" UNIQUE("name")
);

-- =====================================================
-- SETTING DEFINITIONS (EAV Pattern - Schema)
-- =====================================================

-- Setting Categories for organization
CREATE TABLE IF NOT EXISTS "setting_categories" (
    "id" serial PRIMARY KEY,
    "name" varchar(100) NOT NULL,
    "slug" varchar(100) NOT NULL,
    "description" text,
    "sort_order" integer DEFAULT 0 NOT NULL,
    CONSTRAINT "setting_categories_slug_unique" UNIQUE("slug")
);

-- Define all possible settings
CREATE TABLE IF NOT EXISTS "setting_definitions" (
    "id" serial PRIMARY KEY,
    "category_id" integer NOT NULL,
    "name" varchar(100) NOT NULL, -- e.g., "Dynamic Range", "Grain Effect"
    "slug" varchar(100) NOT NULL, -- e.g., "dynamic_range", "grain_effect"
    "data_type" varchar(20) NOT NULL, -- 'enum', 'integer', 'numeric', 'text'
    "unit" varchar(20), -- e.g., "%", "K" (for color temp), null for enums
    "description" text,
    "is_required" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "setting_definitions_slug_unique" UNIQUE("slug"),
    CONSTRAINT "setting_definitions_data_type_check" 
        CHECK ("data_type" IN ('enum', 'integer', 'numeric', 'text', 'boolean'))
);

-- Valid values for enum-type settings
CREATE TABLE IF NOT EXISTS "setting_enum_values" (
    "id" serial PRIMARY KEY,
    "setting_definition_id" integer NOT NULL,
    "value" varchar(100) NOT NULL,
    "display_label" varchar(100) NOT NULL,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    CONSTRAINT "setting_enum_values_setting_value_unique" 
        UNIQUE("setting_definition_id", "value")
);

-- Link settings to specific camera systems (some settings only available on certain systems)
CREATE TABLE IF NOT EXISTS "system_settings" (
    "system_id" integer NOT NULL,
    "setting_definition_id" integer NOT NULL,
    "is_supported" boolean DEFAULT true NOT NULL,
    "notes" text,
    CONSTRAINT "system_settings_pk" PRIMARY KEY("system_id", "setting_definition_id")
);

-- =====================================================
-- AUTHORS
-- =====================================================

CREATE TABLE IF NOT EXISTS "authors" (
    "id" serial PRIMARY KEY,
    "name" varchar(255) NOT NULL,
    "slug" varchar(255) NOT NULL,
    "bio" text,
    "website_url" varchar(500),
    "social_handle" varchar(60),
    "social_platform" varchar(30),
    "is_verified" boolean DEFAULT false NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "authors_slug_unique" UNIQUE("slug"),
    CONSTRAINT "authors_name_not_empty" CHECK (length(trim("name")) > 0)
);

-- =====================================================
-- TAGS
-- =====================================================

CREATE TABLE IF NOT EXISTS "tags" (
    "id" serial PRIMARY KEY,
    "name" varchar(50) NOT NULL,
    "slug" varchar(50) NOT NULL,
    "category" varchar(50), -- 'subject', 'mood', 'technique', 'season', etc.
    "usage_count" integer DEFAULT 0 NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "tags_slug_unique" UNIQUE("slug"),
    CONSTRAINT "tags_name_not_empty" CHECK (length(trim("name")) > 0)
);

-- =====================================================
-- RECIPES (Core Entity)
-- =====================================================

CREATE TABLE IF NOT EXISTS "recipes" (
    "id" serial PRIMARY KEY,
    "author_id" integer NOT NULL,
    "system_id" integer NOT NULL,
    "camera_id" integer, -- Nullable if recipe works across models
    "sensor_id" integer,
    "film_sim_id" integer NOT NULL,
    "style_id" integer,
    
    -- Core Info
    "name" varchar(255) NOT NULL,
    "slug" varchar(255) NOT NULL,
    "description" text,
    "difficulty_level" varchar(20), -- 'beginner', 'intermediate', 'advanced'
    
    -- Attribution
    "source_url" varchar(500),
    "source_type" varchar(50), -- 'original', 'curated', 'community'
    
    -- Metadata
    "publish_date" date,
    "view_count" integer DEFAULT 0 NOT NULL,
    "is_featured" boolean DEFAULT false NOT NULL,
    "is_active" boolean DEFAULT true NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL,
    
    CONSTRAINT "recipes_slug_unique" UNIQUE("slug"),
    CONSTRAINT "recipes_name_not_empty" CHECK (length(trim("name")) > 0),
    CONSTRAINT "recipes_difficulty_check" 
        CHECK ("difficulty_level" IN ('beginner', 'intermediate', 'advanced')),
    CONSTRAINT "recipes_source_type_check"
        CHECK ("source_type" IN ('original', 'curated', 'community')),
    CONSTRAINT "recipes_view_count_positive" CHECK ("view_count" >= 0)
);

-- =====================================================
-- RECIPE SETTINGS (EAV Pattern - Values)
-- =====================================================

CREATE TABLE IF NOT EXISTS "recipe_setting_values" (
    "id" serial PRIMARY KEY,
    "recipe_id" integer NOT NULL,
    "setting_definition_id" integer NOT NULL,
    "value" text NOT NULL, -- Changed from varchar(100) to text to handle long values
    "notes" text, -- Optional context for this specific setting
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "recipe_setting_values_recipe_setting_unique" 
        UNIQUE("recipe_id", "setting_definition_id")
);

-- Optional: For settings with ranges (e.g., "ISO: 400-1600")
CREATE TABLE IF NOT EXISTS "recipe_setting_ranges" (
    "id" serial PRIMARY KEY,
    "recipe_id" integer NOT NULL,
    "setting_definition_id" integer NOT NULL,
    "min_value" varchar(50),
    "max_value" varchar(50),
    "recommended_value" varchar(50),
    "notes" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "recipe_setting_ranges_recipe_setting_unique" 
        UNIQUE("recipe_id", "setting_definition_id")
);

-- =====================================================
-- IMAGES
-- =====================================================

CREATE TABLE IF NOT EXISTS "images" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "recipe_id" integer NOT NULL,
    "image_type" varchar(20) NOT NULL, -- 'primary', 'secondary'
    "file_path" varchar(500), -- Path in storage system
    "thumb_url" varchar(500) NOT NULL,
    "image_url" varchar(500) NOT NULL,
    "width" integer,
    "height" integer,
    "file_size_bytes" integer,
    "alt_text" text,
    "caption" text,
    "sort_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "images_type_check" 
        CHECK ("image_type" IN ('primary', 'secondary')),
    CONSTRAINT "images_dimensions_positive" 
        CHECK ("width" > 0 AND "height" > 0)
);

-- =====================================================
-- RECIPE TAGS (Many-to-Many Junction)
-- =====================================================

CREATE TABLE IF NOT EXISTS "recipe_tags" (
    "recipe_id" integer NOT NULL,
    "tag_id" integer NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    CONSTRAINT "recipe_tags_pk" PRIMARY KEY("recipe_id", "tag_id")
);

-- =====================================================
-- FOREIGN KEY CONSTRAINTS
-- =====================================================

-- Helper procedure to safely add FKs
DO $$
BEGIN
    -- Camera Models
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'cameras_system_id_fk') THEN
        ALTER TABLE "cameras" ADD CONSTRAINT "cameras_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'cameras_sensor_id_fk') THEN
        ALTER TABLE "cameras" ADD CONSTRAINT "cameras_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Film Simulations
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'film_sims_system_id_fk') THEN
        ALTER TABLE "film_sims" ADD CONSTRAINT "film_sims_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Camera-Film Simulation Mapping
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'camera_film_sims_camera_fk') THEN
        ALTER TABLE "camera_film_sims" ADD CONSTRAINT "camera_film_sims_camera_fk" FOREIGN KEY ("camera_id") REFERENCES "cameras"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'camera_film_sims_film_sim_fk') THEN
        ALTER TABLE "camera_film_sims" ADD CONSTRAINT "camera_film_sims_film_sim_fk" FOREIGN KEY ("film_sim_id") REFERENCES "film_sims"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Setting Definitions
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'setting_definitions_category_id_fk') THEN
        ALTER TABLE "setting_definitions" ADD CONSTRAINT "setting_definitions_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "setting_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Setting Enum Values
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'setting_enum_values_setting_definition_id_fk') THEN
        ALTER TABLE "setting_enum_values" ADD CONSTRAINT "setting_enum_values_setting_definition_id_fk" FOREIGN KEY ("setting_definition_id") REFERENCES "setting_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- System Settings
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'system_settings_system_id_fk') THEN
        ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'system_settings_setting_definition_id_fk') THEN
        ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_setting_definition_id_fk" FOREIGN KEY ("setting_definition_id") REFERENCES "setting_definitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Recipes
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipes_author_id_fk') THEN
        ALTER TABLE "recipes" ADD CONSTRAINT "recipes_author_id_fk" FOREIGN KEY ("author_id") REFERENCES "authors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipes_system_id_fk') THEN
        ALTER TABLE "recipes" ADD CONSTRAINT "recipes_system_id_fk" FOREIGN KEY ("system_id") REFERENCES "systems"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipes_camera_id_fk') THEN
        ALTER TABLE "recipes" ADD CONSTRAINT "recipes_camera_id_fk" FOREIGN KEY ("camera_id") REFERENCES "cameras"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipes_sensor_id_fk') THEN
        ALTER TABLE "recipes" ADD CONSTRAINT "recipes_sensor_id_fk" FOREIGN KEY ("sensor_id") REFERENCES "sensors"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipes_film_sim_id_fk') THEN
        ALTER TABLE "recipes" ADD CONSTRAINT "recipes_film_sim_id_fk" FOREIGN KEY ("film_sim_id") REFERENCES "film_sims"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipes_style_id_fk') THEN
        ALTER TABLE "recipes" ADD CONSTRAINT "recipes_style_id_fk" FOREIGN KEY ("style_id") REFERENCES "styles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    -- Recipe Setting Values
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipe_setting_values_recipe_id_fk') THEN
        ALTER TABLE "recipe_setting_values" ADD CONSTRAINT "recipe_setting_values_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipe_setting_values_setting_definition_id_fk') THEN
        ALTER TABLE "recipe_setting_values" ADD CONSTRAINT "recipe_setting_values_setting_definition_id_fk" FOREIGN KEY ("setting_definition_id") REFERENCES "setting_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Recipe Setting Ranges
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipe_setting_ranges_recipe_id_fk') THEN
        ALTER TABLE "recipe_setting_ranges" ADD CONSTRAINT "recipe_setting_ranges_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipe_setting_ranges_setting_definition_id_fk') THEN
        ALTER TABLE "recipe_setting_ranges" ADD CONSTRAINT "recipe_setting_ranges_setting_definition_id_fk" FOREIGN KEY ("setting_definition_id") REFERENCES "setting_definitions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    -- Images
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'images_recipe_id_fk') THEN
        ALTER TABLE "images" ADD CONSTRAINT "images_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    -- Recipe Tags
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipe_tags_recipe_id_fk') THEN
        ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_recipe_id_fk" FOREIGN KEY ("recipe_id") REFERENCES "recipes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'recipe_tags_tag_id_fk') THEN
        ALTER TABLE "recipe_tags" ADD CONSTRAINT "recipe_tags_tag_id_fk" FOREIGN KEY ("tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Recipes - Common query patterns
CREATE INDEX IF NOT EXISTS "idx_recipes_system_id" ON "recipes"("system_id");
CREATE INDEX IF NOT EXISTS "idx_recipes_camera_id" ON "recipes"("camera_id");
CREATE INDEX IF NOT EXISTS "idx_recipes_film_sim_id" ON "recipes"("film_sim_id");
CREATE INDEX IF NOT EXISTS "idx_recipes_style_id" ON "recipes"("style_id");
CREATE INDEX IF NOT EXISTS "idx_recipes_author_id" ON "recipes"("author_id");
CREATE INDEX IF NOT EXISTS "idx_recipes_is_featured" ON "recipes"("is_featured") WHERE "is_featured" = true;
CREATE INDEX IF NOT EXISTS "idx_recipes_is_active" ON "recipes"("is_active") WHERE "is_active" = true;
CREATE INDEX IF NOT EXISTS "idx_recipes_created_at" ON "recipes"("created_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_recipes_view_count" ON "recipes"("view_count" DESC);

-- Recipe Setting Values - EAV query optimization
CREATE INDEX IF NOT EXISTS "idx_recipe_setting_values_recipe_id" ON "recipe_setting_values"("recipe_id");
CREATE INDEX IF NOT EXISTS "idx_recipe_setting_values_setting_definition_id" ON "recipe_setting_values"("setting_definition_id");
CREATE INDEX IF NOT EXISTS "idx_recipe_setting_values_value" ON "recipe_setting_values"("value");

-- Images
CREATE INDEX IF NOT EXISTS "idx_images_recipe_id" ON "images"("recipe_id");
CREATE INDEX IF NOT EXISTS "idx_images_type" ON "images"("image_type");

-- Recipe Tags
CREATE INDEX IF NOT EXISTS "idx_recipe_tags_tag_id" ON "recipe_tags"("tag_id");

-- Tags
CREATE INDEX IF NOT EXISTS "idx_tags_slug" ON "tags"("slug");
CREATE INDEX IF NOT EXISTS "idx_tags_category" ON "tags"("category");
CREATE INDEX IF NOT EXISTS "idx_tags_usage_count" ON "tags"("usage_count" DESC);

-- Camera Models
CREATE INDEX IF NOT EXISTS "idx_cameras_system_id" ON "cameras"("system_id");

-- Film Simulations
CREATE INDEX IF NOT EXISTS "idx_film_sims_system_id" ON "film_sims"("system_id");

-- Camera-Film Simulation Mapping
CREATE INDEX IF NOT EXISTS "idx_camera_film_sims_camera" ON "camera_film_sims"("camera_id");
CREATE INDEX IF NOT EXISTS "idx_camera_film_sims_film_sim" ON "camera_film_sims"("film_sim_id");

-- Setting Definitions
CREATE INDEX IF NOT EXISTS "idx_setting_definitions_category_id" ON "setting_definitions"("category_id");

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Schema Updates (Idempotent)
DO $$
BEGIN
    -- Ensure recipe_setting_values.value is text
    BEGIN
        ALTER TABLE "recipe_setting_values" ALTER COLUMN "value" TYPE text;
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE 'Could not alter column value to text: %', SQLERRM;
    END;
END $$;

-- Triggers for updated_at
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_recipes_updated_at') THEN
        CREATE TRIGGER update_recipes_updated_at BEFORE UPDATE ON "recipes"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_authors_updated_at') THEN
        CREATE TRIGGER update_authors_updated_at BEFORE UPDATE ON "authors"
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE "systems" IS 'Normalized table for camera system manufacturers (Fujifilm, Nikon, etc.)';
COMMENT ON TABLE "cameras" IS 'Specific camera models linked to their systems and sensors';
COMMENT ON TABLE "sensors" IS 'Camera sensor types (X-Trans, Bayer, etc.) that affect recipe compatibility';
COMMENT ON TABLE "film_sims" IS 'Available film simulations per camera system';
COMMENT ON TABLE "styles" IS 'Photography style categories for recipe classification';
COMMENT ON TABLE "setting_definitions" IS 'EAV schema - defines all possible camera settings';
COMMENT ON TABLE "setting_enum_values" IS 'Valid enum values for settings that have constrained options';
COMMENT ON TABLE "recipe_setting_values" IS 'EAV values - actual setting values for each recipe';
COMMENT ON TABLE "recipe_setting_ranges" IS 'For settings that have recommended ranges (e.g., ISO 400-1600)';
COMMENT ON TABLE "recipes" IS 'Core recipe entity with normalized foreign keys to reference tables';
COMMENT ON TABLE "images" IS 'Recipe images with support for thumbnails, samples, and before/after comparisons';