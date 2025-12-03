-- =====================================================
-- FUJIFILM DATABASE INITIALIZATION SCRIPT
-- Comprehensive data for iShootJpeg recipe platform
-- Focus: Fujifilm X, GFX, and X-Half series (2010-2025)
-- =====================================================

-- Clear existing data (if any) - Use with caution in production
TRUNCATE TABLE camera_film_simulations, recipe_setting_ranges, recipe_setting_values, 
                recipe_tags, images, recipes, system_settings, setting_enum_values, 
                setting_definitions, setting_categories, tags, style_categories, 
                film_simulations, camera_models, sensors, camera_systems, authors CASCADE;

-- =====================================================
-- 1. CAMERA SYSTEMS
-- =====================================================

INSERT INTO camera_systems (id, name, manufacturer, is_active, created_at) VALUES
(1, 'Fujifilm X-Series', 'Fujifilm', true, now()),
(2, 'Fujifilm GFX', 'Fujifilm', true, now()),
(3, 'Fujifilm X-Half', 'Fujifilm', true, now());

-- =====================================================
-- 2. SENSORS
-- =====================================================

INSERT INTO sensors (id, name, type, megapixels, description, created_at) VALUES
-- X-Trans Sensors (APS-C)
(1, 'X-Trans CMOS I', 'X-Trans', 16.3, 'First generation X-Trans sensor with unique color filter array', now()),
(2, 'X-Trans CMOS II', 'X-Trans', 16.3, 'Second generation X-Trans sensor with improved processing', now()),
(3, 'X-Trans CMOS III', 'X-Trans', 24.3, 'Third generation X-Trans sensor with 24MP resolution', now()),
(4, 'X-Trans CMOS IV', 'X-Trans', 26.1, 'Fourth generation X-Trans sensor with improved autofocus', now()),
(5, 'X-Trans CMOS 5 BSI', 'X-Trans', 26.1, 'Fifth generation X-Trans BSI sensor - 26MP variant', now()),
(6, 'X-Trans CMOS 5 HR', 'X-Trans', 40.2, 'Fifth generation X-Trans high-resolution sensor - 40MP variant', now()),

-- Bayer Sensors (APS-C - X-A series)
(7, 'Bayer CMOS APS-C', 'Bayer', 24.2, 'Standard Bayer APS-C sensor used in X-A series', now()),

-- GFX Medium Format Sensors
(8, 'Bayer MF 50', 'Bayer Medium Format', 51.4, 'Medium format 44x33mm sensor - 50MP', now()),
(9, 'Bayer MF 100', 'Bayer Medium Format', 102.0, 'Medium format 44x33mm sensor - 100MP', now()),
(10, 'Bayer MF 102', 'Bayer Medium Format', 102.0, 'Updated medium format 44x33mm sensor - 102MP', now()),

-- X-Half Sensor
(11, 'Bayer 1"', 'Bayer 1-inch', 20.0, '1-inch back-illuminated sensor for X-Half compact', now());

-- =====================================================
-- 3. CAMERA MODELS
-- =====================================================

-- X100 Series (Fixed Lens Compacts)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(1, 1, 'X100', 1, 2011, true, now()),
(2, 1, 'X100S', 2, 2013, true, now()),
(3, 1, 'X100T', 2, 2014, true, now()),
(4, 1, 'X100F', 3, 2017, true, now()),
(5, 1, 'X100V', 4, 2020, true, now()),
(6, 1, 'X100VI', 6, 2024, true, now());

-- X-Pro Series (Rangefinder Style)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(7, 1, 'X-Pro1', 1, 2012, true, now()),
(8, 1, 'X-Pro2', 3, 2016, true, now()),
(9, 1, 'X-Pro3', 4, 2019, true, now());

-- X-E Series (Compact Rangefinder)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(10, 1, 'X-E1', 1, 2012, true, now()),
(11, 1, 'X-E2', 2, 2013, true, now()),
(12, 1, 'X-E2S', 2, 2016, true, now()),
(13, 1, 'X-E3', 3, 2017, true, now()),
(14, 1, 'X-E4', 4, 2021, true, now()),
(15, 1, 'X-E5', 6, 2025, true, now());

-- X-T Series (SLR Style - Flagship)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(16, 1, 'X-T1', 2, 2014, true, now()),
(17, 1, 'X-T10', 2, 2015, true, now()),
(18, 1, 'X-T2', 3, 2016, true, now()),
(19, 1, 'X-T20', 3, 2017, true, now()),
(20, 1, 'X-T3', 4, 2018, true, now()),
(21, 1, 'X-T30', 4, 2019, true, now()),
(22, 1, 'X-T4', 4, 2020, true, now()),
(23, 1, 'X-T30 II', 4, 2021, true, now()),
(24, 1, 'X-T5', 6, 2022, true, now()),
(25, 1, 'X-T30 III', 5, 2024, true, now()),
(26, 1, 'X-T50', 6, 2024, true, now());

-- X-H Series (Hybrid/Video Focus)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(27, 1, 'X-H1', 3, 2018, true, now()),
(28, 1, 'X-H2S', 5, 2022, true, now()),
(29, 1, 'X-H2', 6, 2022, true, now());

-- X-S Series (Compact Hybrid)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(30, 1, 'X-S10', 4, 2020, true, now()),
(31, 1, 'X-S20', 5, 2023, true, now());

-- X-M Series (Compact Mirrorless)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(32, 1, 'X-M1', 1, 2013, true, now()),
(33, 1, 'X-M5', 4, 2024, true, now());

-- X-A Series (Entry Level - Bayer Sensors)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(34, 1, 'X-A1', 7, 2013, true, now()),
(35, 1, 'X-A2', 7, 2015, true, now()),
(36, 1, 'X-A3', 7, 2016, true, now()),
(37, 1, 'X-A5', 7, 2018, true, now()),
(38, 1, 'X-A7', 7, 2019, true, now()),
(39, 1, 'X-A10', 7, 2017, true, now());

-- X-T100/200 Series (Entry Level - Bayer)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(40, 1, 'X-T100', 7, 2018, true, now()),
(41, 1, 'X-T200', 7, 2020, true, now());

-- Other X-Series
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(42, 1, 'X70', 2, 2016, true, now()),
(43, 1, 'XF10', 7, 2018, true, now());

-- GFX Series (Medium Format)
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(44, 2, 'GFX 50S', 8, 2017, true, now()),
(45, 2, 'GFX 50R', 8, 2018, true, now()),
(46, 2, 'GFX100', 9, 2019, true, now()),
(47, 2, 'GFX100 IR', 9, 2019, true, now()),
(48, 2, 'GFX100S', 10, 2021, true, now()),
(49, 2, 'GFX 50S II', 8, 2021, true, now()),
(50, 2, 'GFX100 II', 10, 2023, true, now()),
(51, 2, 'GFX100S II', 10, 2024, true, now()),
(52, 2, 'GFX100RF', 10, 2024, true, now()),
(53, 2, 'GFX ETERNA', 10, 2025, true, now());

-- X-Half Series
INSERT INTO camera_models (id, system_id, name, sensor_id, release_year, is_active, created_at) VALUES
(54, 3, 'X-Half', 11, 2025, true, now());

-- =====================================================
-- 4. FILM SIMULATIONS
-- =====================================================

-- Fujifilm X-Series Film Simulations
INSERT INTO film_simulations (id, name, system_id, label, description, is_active, created_at) VALUES
-- Core Simulations (Available on all X-Series cameras)
(1, 'PROVIA', 1, 'Provia/Standard', 'Standard color reproduction with accurate tones', true, now()),
(2, 'VELVIA', 1, 'Velvia/Vivid', 'High saturation and contrast for landscapes', true, now()),
(3, 'ASTIA', 1, 'Astia/Soft', 'Soft color and tone for portraits', true, now()),
(4, 'PRO_NEG_HI', 1, 'PRO Neg. Hi', 'Professional negative film with high contrast', true, now()),
(5, 'PRO_NEG_STD', 1, 'PRO Neg. Std', 'Professional negative film with standard contrast', true, now()),
(6, 'MONOCHROME', 1, 'Monochrome', 'Standard black and white', true, now()),
(7, 'SEPIA', 1, 'Sepia', 'Warm brown-toned monochrome', true, now()),

-- Added with X-Trans II (2013+)
(8, 'CLASSIC_CHROME', 1, 'Classic Chrome', 'Muted colors inspired by documentary photography', true, now()),

-- Added with X-Trans III (2016+)
(9, 'ACROS', 1, 'Acros', 'Premium black and white with rich tonality', true, now()),
(10, 'ACROS_YE', 1, 'Acros+Ye Filter', 'Acros with yellow filter effect', true, now()),
(11, 'ACROS_R', 1, 'Acros+R Filter', 'Acros with red filter effect', true, now()),
(12, 'ACROS_G', 1, 'Acros+G Filter', 'Acros with green filter effect', true, now()),

-- Added with X-Trans III (X-H1 first, 2018)
(13, 'ETERNA', 1, 'Eterna', 'Cinematic color and tone for video', true, now()),

-- Added with X-Trans IV (2019+)
(14, 'CLASSIC_NEG', 1, 'Classic Negative', 'Inspired by classic negative film stocks', true, now()),
(15, 'ETERNA_BLEACH_BYPASS', 1, 'Eterna Bleach Bypass', 'Desaturated cinematic look', true, now()),

-- Added with X-Trans V (2021+)
(16, 'NOSTALGIC_NEG', 1, 'Nostalgic Neg.', 'Warm vintage aesthetic inspired by American Color', true, now()),
(17, 'REALA_ACE', 1, 'Reala Ace', 'True-to-life color with enhanced tonality', true, now());

-- GFX Series Film Simulations (Same as X-Series)
INSERT INTO film_simulations (id, name, system_id, label, description, is_active, created_at) VALUES
(18, 'PROVIA', 2, 'Provia/Standard', 'Standard color reproduction with accurate tones', true, now()),
(19, 'VELVIA', 2, 'Velvia/Vivid', 'High saturation and contrast for landscapes', true, now()),
(20, 'ASTIA', 2, 'Astia/Soft', 'Soft color and tone for portraits', true, now()),
(21, 'PRO_NEG_HI', 2, 'PRO Neg. Hi', 'Professional negative film with high contrast', true, now()),
(22, 'PRO_NEG_STD', 2, 'PRO Neg. Std', 'Professional negative film with standard contrast', true, now()),
(23, 'MONOCHROME', 2, 'Monochrome', 'Standard black and white', true, now()),
(24, 'SEPIA', 2, 'Sepia', 'Warm brown-toned monochrome', true, now()),
(25, 'CLASSIC_CHROME', 2, 'Classic Chrome', 'Muted colors inspired by documentary photography', true, now()),
(26, 'ACROS', 2, 'Acros', 'Premium black and white with rich tonality', true, now()),
(27, 'ACROS_YE', 2, 'Acros+Ye Filter', 'Acros with yellow filter effect', true, now()),
(28, 'ACROS_R', 2, 'Acros+R Filter', 'Acros with red filter effect', true, now()),
(29, 'ACROS_G', 2, 'Acros+G Filter', 'Acros with green filter effect', true, now()),
(30, 'ETERNA', 2, 'Eterna', 'Cinematic color and tone for video', true, now()),
(31, 'CLASSIC_NEG', 2, 'Classic Negative', 'Inspired by classic negative film stocks', true, now()),
(32, 'ETERNA_BLEACH_BYPASS', 2, 'Eterna Bleach Bypass', 'Desaturated cinematic look', true, now()),
(33, 'NOSTALGIC_NEG', 2, 'Nostalgic Neg.', 'Warm vintage aesthetic inspired by American Color', true, now()),
(34, 'REALA_ACE', 2, 'Reala Ace', 'True-to-life color with enhanced tonality', true, now());

-- X-Half Film Simulations (Limited set with unique additions)
INSERT INTO film_simulations (id, name, system_id, label, description, is_active, created_at) VALUES
(35, 'PROVIA', 3, 'Provia/Standard', 'Standard color reproduction', true, now()),
(36, 'VELVIA', 3, 'Velvia/Vivid', 'Vivid colors', true, now()),
(37, 'CLASSIC_CHROME', 3, 'Classic Chrome', 'Muted documentary style', true, now()),
(38, 'CLASSIC_NEG', 3, 'Classic Negative', 'Classic negative film look', true, now()),
(39, 'MONOCHROME', 3, 'Monochrome', 'Black and white', true, now());

-- =====================================================
-- 5. CAMERA-FILM SIMULATION MAPPING
-- =====================================================
-- This table maps which film simulations are available on each camera
-- Table definition is in schema.sql

-- X100 (X-Trans I) - Core simulations only
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 6), (1, 7);

-- X100S, X100T (X-Trans II) - Added Classic Chrome
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(2, 1), (2, 2), (2, 3), (2, 4), (2, 5), (2, 6), (2, 7), (2, 8),
(3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 6), (3, 7), (3, 8);

-- X100F (X-Trans III) - Added Acros
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(4, 1), (4, 2), (4, 3), (4, 4), (4, 5), (4, 6), (4, 7), (4, 8),
(4, 9), (4, 10), (4, 11), (4, 12);

-- X100V (X-Trans IV) - Added Classic Neg, Eterna Bleach Bypass
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(5, 1), (5, 2), (5, 3), (5, 4), (5, 5), (5, 6), (5, 7), (5, 8),
(5, 9), (5, 10), (5, 11), (5, 12), (5, 13), (5, 14), (5, 15);

-- X100VI (X-Trans V) - All 20 simulations
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(6, 1), (6, 2), (6, 3), (6, 4), (6, 5), (6, 6), (6, 7), (6, 8),
(6, 9), (6, 10), (6, 11), (6, 12), (6, 13), (6, 14), (6, 15), (6, 16), (6, 17);

-- X-Pro1 (X-Trans I)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(7, 1), (7, 2), (7, 3), (7, 6), (7, 7);

-- X-Pro2 (X-Trans III)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(8, 1), (8, 2), (8, 3), (8, 4), (8, 5), (8, 6), (8, 7), (8, 8),
(8, 9), (8, 10), (8, 11), (8, 12);

-- X-Pro3 (X-Trans IV)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(9, 1), (9, 2), (9, 3), (9, 4), (9, 5), (9, 6), (9, 7), (9, 8),
(9, 9), (9, 10), (9, 11), (9, 12), (9, 13), (9, 14), (9, 15);

-- X-E1 (X-Trans I)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(10, 1), (10, 2), (10, 3), (10, 6), (10, 7);

-- X-E2, X-E2S (X-Trans II)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(11, 1), (11, 2), (11, 3), (11, 4), (11, 5), (11, 6), (11, 7), (11, 8),
(12, 1), (12, 2), (12, 3), (12, 4), (12, 5), (12, 6), (12, 7), (12, 8);

-- X-E3 (X-Trans III)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(13, 1), (13, 2), (13, 3), (13, 4), (13, 5), (13, 6), (13, 7), (13, 8),
(13, 9), (13, 10), (13, 11), (13, 12);

-- X-E4 (X-Trans IV)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(14, 1), (14, 2), (14, 3), (14, 4), (14, 5), (14, 6), (14, 7), (14, 8),
(14, 9), (14, 10), (14, 11), (14, 12), (14, 13), (14, 14), (14, 15);

-- X-E5 (X-Trans V)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(15, 1), (15, 2), (15, 3), (15, 4), (15, 5), (15, 6), (15, 7), (15, 8),
(15, 9), (15, 10), (15, 11), (15, 12), (15, 13), (15, 14), (15, 15), (15, 16), (15, 17);

-- X-T1, X-T10 (X-Trans II)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(16, 1), (16, 2), (16, 3), (16, 4), (16, 5), (16, 6), (16, 7), (16, 8),
(17, 1), (17, 2), (17, 3), (17, 4), (17, 5), (17, 6), (17, 7), (17, 8);

-- X-T2, X-T20 (X-Trans III)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(18, 1), (18, 2), (18, 3), (18, 4), (18, 5), (18, 6), (18, 7), (18, 8),
(18, 9), (18, 10), (18, 11), (18, 12),
(19, 1), (19, 2), (19, 3), (19, 4), (19, 5), (19, 6), (19, 7), (19, 8),
(19, 9), (19, 10), (19, 11), (19, 12);

-- X-T3, X-T30 (X-Trans IV early - Eterna via firmware)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(20, 1), (20, 2), (20, 3), (20, 4), (20, 5), (20, 6), (20, 7), (20, 8),
(20, 9), (20, 10), (20, 11), (20, 12), (20, 13), (20, 14),
(21, 1), (21, 2), (21, 3), (21, 4), (21, 5), (21, 6), (21, 7), (21, 8),
(21, 9), (21, 10), (21, 11), (21, 12), (21, 13), (21, 14);

-- X-T4, X-T30 II (X-Trans IV late)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(22, 1), (22, 2), (22, 3), (22, 4), (22, 5), (22, 6), (22, 7), (22, 8),
(22, 9), (22, 10), (22, 11), (22, 12), (22, 13), (22, 14), (22, 15),
(23, 1), (23, 2), (23, 3), (23, 4), (23, 5), (23, 6), (23, 7), (23, 8),
(23, 9), (23, 10), (23, 11), (23, 12), (23, 13), (23, 14), (23, 15);

-- X-T5, X-T50 (X-Trans V HR)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(24, 1), (24, 2), (24, 3), (24, 4), (24, 5), (24, 6), (24, 7), (24, 8),
(24, 9), (24, 10), (24, 11), (24, 12), (24, 13), (24, 14), (24, 15), (24, 16), (24, 17),
(26, 1), (26, 2), (26, 3), (26, 4), (26, 5), (26, 6), (26, 7), (26, 8),
(26, 9), (26, 10), (26, 11), (26, 12), (26, 13), (26, 14), (26, 15), (26, 16), (26, 17);

-- X-T30 III (X-Trans V BSI)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(25, 1), (25, 2), (25, 3), (25, 4), (25, 5), (25, 6), (25, 7), (25, 8),
(25, 9), (25, 10), (25, 11), (25, 12), (25, 13), (25, 14), (25, 15), (25, 16), (25, 17);

-- X-H1 (X-Trans III - Has Eterna)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(27, 1), (27, 2), (27, 3), (27, 4), (27, 5), (27, 6), (27, 7), (27, 8),
(27, 9), (27, 10), (27, 11), (27, 12), (27, 13);

-- X-H2S, X-H2 (X-Trans V)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(28, 1), (28, 2), (28, 3), (28, 4), (28, 5), (28, 6), (28, 7), (28, 8),
(28, 9), (28, 10), (28, 11), (28, 12), (28, 13), (28, 14), (28, 15), (28, 16), (28, 17),
(29, 1), (29, 2), (29, 3), (29, 4), (29, 5), (29, 6), (29, 7), (29, 8),
(29, 9), (29, 10), (29, 11), (29, 12), (29, 13), (29, 14), (29, 15), (29, 16), (29, 17);

-- X-S10 (X-Trans IV)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(30, 1), (30, 2), (30, 3), (30, 4), (30, 5), (30, 6), (30, 7), (30, 8),
(30, 9), (30, 10), (30, 11), (30, 12), (30, 13), (30, 14), (30, 15);

-- X-S20 (X-Trans V BSI)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(31, 1), (31, 2), (31, 3), (31, 4), (31, 5), (31, 6), (31, 7), (31, 8),
(31, 9), (31, 10), (31, 11), (31, 12), (31, 13), (31, 14), (31, 15), (31, 16), (31, 17);

-- X-M1 (X-Trans I)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(32, 1), (32, 2), (32, 3), (32, 6), (32, 7);

-- X-M5 (X-Trans IV)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(33, 1), (33, 2), (33, 3), (33, 4), (33, 5), (33, 6), (33, 7), (33, 8),
(33, 9), (33, 10), (33, 11), (33, 12), (33, 13), (33, 14), (33, 15);

-- X-A Series (Bayer - Limited simulations)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(34, 1), (34, 2), (34, 3), (34, 6), (34, 7), (34, 8),
(35, 1), (35, 2), (35, 3), (35, 6), (35, 7), (35, 8),
(36, 1), (36, 2), (36, 3), (36, 6), (36, 7), (36, 8),
(37, 1), (37, 2), (37, 3), (37, 6), (37, 7), (37, 8),
(38, 1), (38, 2), (38, 3), (38, 6), (38, 7), (38, 8),
(39, 1), (39, 2), (39, 3), (39, 6), (39, 7), (39, 8);

-- X-T100, X-T200 (Bayer)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(40, 1), (40, 2), (40, 3), (40, 6), (40, 7), (40, 8),
(41, 1), (41, 2), (41, 3), (41, 6), (41, 7), (41, 8);

-- X70 (X-Trans II)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(42, 1), (42, 2), (42, 3), (42, 4), (42, 5), (42, 6), (42, 7), (42, 8);

-- XF10 (Bayer)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(43, 1), (43, 2), (43, 3), (43, 6), (43, 7), (43, 8);

-- GFX Series (All get same progression as X-Series)
-- GFX 50S, 50R (Early - up to Acros)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(44, 18), (44, 19), (44, 20), (44, 21), (44, 22), (44, 23), (44, 24), (44, 25),
(44, 26), (44, 27), (44, 28), (44, 29),
(45, 18), (45, 19), (45, 20), (45, 21), (45, 22), (45, 23), (45, 24), (45, 25),
(45, 26), (45, 27), (45, 28), (45, 29);

-- GFX100, GFX100 IR (Added Eterna, Classic Neg)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(46, 18), (46, 19), (46, 20), (46, 21), (46, 22), (46, 23), (46, 24), (46, 25),
(46, 26), (46, 27), (46, 28), (46, 29), (46, 30), (46, 31),
(47, 18), (47, 19), (47, 20), (47, 21), (47, 22), (47, 23), (47, 24), (47, 25),
(47, 26), (47, 27), (47, 28), (47, 29), (47, 30), (47, 31);

-- GFX100S, 50S II (Added Bleach Bypass)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(48, 18), (48, 19), (48, 20), (48, 21), (48, 22), (48, 23), (48, 24), (48, 25),
(48, 26), (48, 27), (48, 28), (48, 29), (48, 30), (48, 31), (48, 32), (48, 33),
(49, 18), (49, 19), (49, 20), (49, 21), (49, 22), (49, 23), (49, 24), (49, 25),
(49, 26), (49, 27), (49, 28), (49, 29), (49, 30), (49, 31), (49, 32);

-- GFX100 II, GFX100S II, GFX100RF, GFX ETERNA (All 20 simulations)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(50, 18), (50, 19), (50, 20), (50, 21), (50, 22), (50, 23), (50, 24), (50, 25),
(50, 26), (50, 27), (50, 28), (50, 29), (50, 30), (50, 31), (50, 32), (50, 33), (50, 34),
(51, 18), (51, 19), (51, 20), (51, 21), (51, 22), (51, 23), (51, 24), (51, 25),
(51, 26), (51, 27), (51, 28), (51, 29), (51, 30), (51, 31), (51, 32), (51, 33), (51, 34),
(52, 18), (52, 19), (52, 20), (52, 21), (52, 22), (52, 23), (52, 24), (52, 25),
(52, 26), (52, 27), (52, 28), (52, 29), (52, 30), (52, 31), (52, 32), (52, 33), (52, 34),
(53, 18), (53, 19), (53, 20), (53, 21), (53, 22), (53, 23), (53, 24), (53, 25),
(53, 26), (53, 27), (53, 28), (53, 29), (53, 30), (53, 31), (53, 32), (53, 33), (53, 34);

-- X-Half (Limited set)
INSERT INTO camera_film_simulations (camera_model_id, film_simulation_id) VALUES
(54, 35), (54, 36), (54, 37), (54, 38), (54, 39);

-- =====================================================
-- 6. STYLE CATEGORIES
-- =====================================================

INSERT INTO style_categories (id, name, description, sort_order, is_active, created_at) VALUES
(1, 'Color', 'Color photography recipes', 1, true, now()),
(2, 'Black & White', 'Monochrome and black & white recipes', 2, true, now()),
(3, 'Infrared', 'Infrared photography recipes (for IR-converted cameras)', 3, true, now());

-- =====================================================
-- 7. SETTING CATEGORIES
-- =====================================================

INSERT INTO setting_categories (id, name, slug, description, sort_order) VALUES
(1, 'Image Quality', 'image-quality', 'Settings affecting image quality and processing', 1),
(2, 'Color & Tone', 'color-tone', 'Color and tonal adjustments', 2),
(3, 'Film Simulation', 'film-simulation', 'Film simulation base and effects', 3),
(4, 'Grain & Texture', 'grain-texture', 'Grain and texture effects', 4),
(5, 'White Balance', 'white-balance', 'White balance settings', 5),
(6, 'Exposure', 'exposure', 'Exposure-related settings', 6);

-- =====================================================
-- 8. SETTING DEFINITIONS
-- =====================================================

INSERT INTO setting_definitions (id, category_id, name, slug, data_type, unit, description, is_required, is_active, sort_order, created_at) VALUES
-- Film Simulation Category
(1, 3, 'Monochromatic Color WC', 'monochromatic_color_wc', 'integer', null, 'Warm-Cool adjustment for B&W (-9 to +9)', false, true, 2, now()),
(2, 3, 'Monochromatic Color MG', 'monochromatic_color_mg', 'integer', null, 'Magenta-Green adjustment for B&W (-9 to +9)', false, true, 3, now()),

-- Grain & Texture Category
(3, 4, 'Grain Effect', 'grain_effect', 'enum', null, 'Grain effect roughness', false, true, 1, now()),
(4, 4, 'Grain Effect Size', 'grain_effect_size', 'enum', null, 'Grain effect size', false, true, 3, now()),

-- Color & Tone Category  
(5, 2, 'Color Chrome Effect', 'color_chrome_effect', 'enum', null, 'Enhanced color depth in highlights', false, true, 1, now()),
(6, 2, 'Color Chrome FX Blue', 'color_chrome_fx_blue', 'enum', null, 'Blue color chrome effect', false, true, 2, now()),
(7, 2, 'Smooth Skin Effect', 'smooth_skin_effect', 'enum', null, 'Skin smoothing for portraits', false, true, 3, now()),
(8, 2, 'Highlight Tone', 'highlight_tone', 'numeric', null, 'Highlight tone adjustment (-2 to +4 in 0.5 steps)', false, true, 4, now()),
(9, 2, 'Shadow Tone', 'shadow_tone', 'numeric', null, 'Shadow tone adjustment (-2 to +4 in 0.5 steps)', false, true, 5, now()),
(10, 2, 'Color', 'color', 'integer', null, 'Color saturation (-4 to +4)', false, true, 6, now()),
(11, 2, 'Sharpness', 'sharpness', 'integer', null, 'Image sharpness (-4 to +4)', false, true, 7, now()),
(12, 2, 'Clarity', 'clarity', 'integer', null, 'Mid-tone contrast (-5 to +5)', false, true, 8, now()),

-- White Balance Category
(13, 5, 'White Balance', 'white_balance', 'enum', null, 'White balance mode', false, true, 1, now()),
(14, 5, 'Color Temperature', 'wb_temperature', 'integer', null, 'WB color temperature (Kelvin)', false, true, 1, now()),
(15, 5, 'WB Shift Red', 'wb_shift_red', 'integer', null, 'White balance red shift (-9 to +9)', false, true, 2, now()),
(16, 5, 'WB Shift Blue', 'wb_shift_blue', 'integer', null, 'White balance blue shift (-9 to +9)', false, true, 3, now()),

-- Image Quality Category
(17, 1, 'Dynamic Range', 'dynamic_range', 'enum', null, 'Dynamic range setting', false, true, 1, now()),
(18, 1, 'D Range Priority', 'd_range_priority', 'enum', null, 'Dynamic range priority mode', false, true, 2, now()),
(19, 1, 'High ISO NR', 'high_iso_nr', 'integer', null, 'High ISO noise reduction (-4 to +4)', false, true, 3, now()),
(20, 1, 'Long Exposure NR', 'long_exposure_nr', 'enum', null, 'Long exposure noise reduction', false, true, 4, now()),
(21, 1, 'Color Space', 'color_space', 'enum', null, 'Color space selection', false, true, 5, now()),

-- Exposure Category
(22, 6, 'ISO Min', 'iso_min', 'enum', null, 'Minimum ISO value', false, true, 1, now()),
(23, 6, 'ISO Max', 'iso_max', 'enum', null, 'Maximum ISO value', false, true, 2, now()),
(24, 6, 'Exposure Compensation Min', 'exposure_compensation_min', 'numeric', 'EV', 'Minimum exposure compensation', false, true, 3, now()),
(25, 6, 'Exposure Compensation Max', 'exposure_compensation_max', 'numeric', 'EV', 'Maximum exposure compensation', false, true, 4, now());

-- =====================================================
-- 9. SETTING ENUM VALUES
-- =====================================================

-- Grain Effect (setting_definition_id = 3)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(3, 'OFF', 'Off', 1, true),
(3, 'WEAK', 'Weak', 2, true),
(3, 'STRONG', 'Strong', 3, true);

-- Grain Effect Size (setting_definition_id = 4)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(4, 'SMALL', 'Small', 1, true),
(4, 'LARGE', 'Large', 2, true);

-- Color Chrome Effect (setting_definition_id = 5)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(5, 'OFF', 'Off', 1, true),
(5, 'WEAK', 'Weak', 2, true),
(5, 'STRONG', 'Strong', 3, true);

-- Color Chrome FX Blue (setting_definition_id = 6)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(6, 'OFF', 'Off', 1, true),
(6, 'WEAK', 'Weak', 2, true),
(6, 'STRONG', 'Strong', 3, true);

-- Smooth Skin Effect (setting_definition_id = 7)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(7, 'OFF', 'Off', 1, true),
(7, 'WEAK', 'Weak', 2, true),
(7, 'STRONG', 'Strong', 3, true);

-- White Balance (setting_definition_id = 13)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(13, 'AUTO_WHITE_PRIORITY', 'Auto White Priority', 1, true),
(13, 'AUTO', 'Auto', 2, true),
(13, 'AUTO_AMBIENCE_PRIORITY', 'Auto Ambience Priority', 3, true),
(13, 'COLOR_TEMPERATURE', 'Color Temperature', 4, true),
(13, 'DAYLIGHT', 'Daylight', 5, true),
(13, 'SHADE', 'Shade', 6, true),
(13, 'FLUORESCENT_1', 'Fluorescent Light-1', 7, true),
(13, 'FLUORESCENT_2', 'Fluorescent Light-2', 8, true),
(13, 'FLUORESCENT_3', 'Fluorescent Light-3', 9, true),
(13, 'INCANDESCENT', 'Incandescent', 10, true),
(13, 'UNDERWATER', 'Underwater', 11, true);

-- Dynamic Range (setting_definition_id = 17)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(17, 'AUTO', 'Auto', 1, true),
(17, 'DR100', 'DR100', 2, true),
(17, 'DR200', 'DR200', 3, true),
(17, 'DR400', 'DR400', 4, true);

-- D Range Priority (setting_definition_id = 18)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(18, 'AUTO', 'Auto', 1, true),
(18, 'STRONG', 'Strong', 2, true),
(18, 'WEAK', 'Weak', 3, true),
(18, 'OFF', 'Off', 4, true);

-- Long Exposure NR (setting_definition_id = 20)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(20, 'ON', 'On', 1, true),
(20, 'OFF', 'Off', 2, true);

-- Color Space (setting_definition_id = 21)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(21, 'SRGB', 'sRGB', 1, true),
(21, 'ADOBE_RGB', 'Adobe RGB', 2, true);

-- ISO Min and Max (setting_definition_id = 22, 23)
-- ISO values from 80 to 64000
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(22, '80', 'ISO 80', 1, true),
(22, '100', 'ISO 100', 2, true),
(22, '125', 'ISO 125', 3, true),
(22, '160', 'ISO 160', 4, true),
(22, '200', 'ISO 200', 5, true),
(22, '250', 'ISO 250', 6, true),
(22, '320', 'ISO 320', 7, true),
(22, '400', 'ISO 400', 8, true),
(22, '500', 'ISO 500', 9, true),
(22, '640', 'ISO 640', 10, true),
(22, '800', 'ISO 800', 11, true),
(22, '1000', 'ISO 1000', 12, true),
(22, '1250', 'ISO 1250', 13, true),
(22, '1600', 'ISO 1600', 14, true),
(22, '2000', 'ISO 2000', 15, true),
(22, '2500', 'ISO 2500', 16, true),
(22, '3200', 'ISO 3200', 17, true),
(22, '4000', 'ISO 4000', 18, true),
(22, '5000', 'ISO 5000', 19, true),
(22, '6400', 'ISO 6400', 20, true),
(22, '8000', 'ISO 8000', 21, true),
(22, '10000', 'ISO 10000', 22, true),
(22, '12800', 'ISO 12800', 23, true),
(22, '16000', 'ISO 16000', 24, true),
(22, '20000', 'ISO 20000', 25, true),
(22, '25600', 'ISO 25600', 26, true),
(22, '32000', 'ISO 32000', 27, true),
(22, '40000', 'ISO 40000', 28, true),
(22, '51200', 'ISO 51200', 29, true),
(22, '64000', 'ISO 64000', 30, true),
(22, 'AUTO', 'Auto', 0, true);

-- Same for ISO Max (setting_definition_id = 23)
INSERT INTO setting_enum_values (setting_definition_id, value, display_label, sort_order, is_active) VALUES
(23, '80', 'ISO 80', 1, true),
(23, '100', 'ISO 100', 2, true),
(23, '125', 'ISO 125', 3, true),
(23, '160', 'ISO 160', 4, true),
(23, '200', 'ISO 200', 5, true),
(23, '250', 'ISO 250', 6, true),
(23, '320', 'ISO 320', 7, true),
(23, '400', 'ISO 400', 8, true),
(23, '500', 'ISO 500', 9, true),
(23, '640', 'ISO 640', 10, true),
(23, '800', 'ISO 800', 11, true),
(23, '1000', 'ISO 1000', 12, true),
(23, '1250', 'ISO 1250', 13, true),
(23, '1600', 'ISO 1600', 14, true),
(23, '2000', 'ISO 2000', 15, true),
(23, '2500', 'ISO 2500', 16, true),
(23, '3200', 'ISO 3200', 17, true),
(23, '4000', 'ISO 4000', 18, true),
(23, '5000', 'ISO 5000', 19, true),
(23, '6400', 'ISO 6400', 20, true),
(23, '8000', 'ISO 8000', 21, true),
(23, '10000', 'ISO 10000', 22, true),
(23, '12800', 'ISO 12800', 23, true),
(23, '16000', 'ISO 16000', 24, true),
(23, '20000', 'ISO 20000', 25, true),
(23, '25600', 'ISO 25600', 26, true),
(23, '32000', 'ISO 32000', 27, true),
(23, '40000', 'ISO 40000', 28, true),
(23, '51200', 'ISO 51200', 29, true),
(23, '64000', 'ISO 64000', 30, true),
(23, 'AUTO', 'Auto', 0, true);

-- =====================================================
-- 10. SYSTEM SETTINGS (Fujifilm X-Series)
-- =====================================================

-- Links all setting definitions to Fujifilm X-Series system (id = 1)
INSERT INTO system_settings (system_id, setting_definition_id, is_supported, notes) VALUES
(1, 1, true, 'B&W toning - X-Trans IV and later'),
(1, 2, true, 'B&W toning - X-Trans IV and later'),
(1, 3, true, 'Available on most X-Series cameras'),
(1, 4, true, 'X-Trans IV and later'),
(1, 5, true, 'X-Trans III and later'),
(1, 6, true, 'X-Trans IV late models and X-Trans V'),
(1, 7, true, 'Available on select models'),
(1, 8, true, 'All X-Series cameras'),
(1, 9, true, 'All X-Series cameras'),
(1, 10, true, 'All X-Series cameras'),
(1, 11, true, 'All X-Series cameras'),
(1, 12, true, 'X-Trans IV and later'),
(1, 13, true, 'All X-Series cameras'),
(1, 14, true, 'All X-Series cameras'),
(1, 15, true, 'All X-Series cameras'),
(1, 16, true, 'All X-Series cameras'),
(1, 17, true, 'All X-Series cameras'),
(1, 18, true, 'X-Trans II and later'),
(1, 19, true, 'All X-Series cameras'),
(1, 20, true, 'All X-Series cameras'),
(1, 21, true, 'All X-Series cameras'),
(1, 22, true, 'All X-Series cameras'),
(1, 23, true, 'All X-Series cameras'),
(1, 24, true, 'All X-Series cameras'),
(1, 25, true, 'All X-Series cameras');

-- Links all setting definitions to Fujifilm GFX-Series system (id = 2)
INSERT INTO system_settings (system_id, setting_definition_id, is_supported, notes) VALUES
(2, 1, true, 'B&W toning - X-Trans IV and later'),
(2, 2, true, 'B&W toning - X-Trans IV and later'),
(2, 3, true, 'Available on most X-Series cameras'),
(2, 4, true, 'X-Trans IV and later'),
(2, 5, true, 'X-Trans III and later'),
(2, 6, true, 'X-Trans IV late models and X-Trans V'),
(2, 7, true, 'Available on select models'),
(2, 8, true, 'All X-Series cameras'),
(2, 9, true, 'All X-Series cameras'),
(2, 10, true, 'All X-Series cameras'),
(2, 11, true, 'All X-Series cameras'),
(2, 12, true, 'X-Trans IV and later'),
(2, 13, true, 'All X-Series cameras'),
(2, 14, true, 'All X-Series cameras'),
(2, 15, true, 'All X-Series cameras'),
(2, 16, true, 'All X-Series cameras'),
(2, 17, true, 'All X-Series cameras'),
(2, 18, true, 'X-Trans II and later'),
(2, 19, true, 'All X-Series cameras'),
(2, 20, true, 'All X-Series cameras'),
(2, 21, true, 'All X-Series cameras'),
(2, 22, true, 'All X-Series cameras'),
(2, 23, true, 'All X-Series cameras'),
(2, 24, true, 'All X-Series cameras'),
(2, 25, true, 'All X-Series cameras');

-- Links all setting definitions to Fujifilm X-Half system (id = 3)
INSERT INTO system_settings (system_id, setting_definition_id, is_supported, notes) VALUES
(3, 1, true, 'B&W toning - X-Trans IV and later'),
(3, 2, true, 'B&W toning - X-Trans IV and later'),
(3, 3, true, 'Available on most X-Series cameras'),
(3, 4, true, 'X-Trans IV and later'),
(3, 5, true, 'X-Trans III and later'),
(3, 6, true, 'X-Trans IV late models and X-Trans V'),
(3, 7, true, 'Available on select models'),
(3, 8, true, 'All X-Series cameras'),
(3, 9, true, 'All X-Series cameras'),
(3, 10, true, 'All X-Series cameras'),
(3, 11, true, 'All X-Series cameras'),
(3, 12, true, 'X-Trans IV and later'),
(3, 13, true, 'All X-Series cameras'),
(3, 14, true, 'All X-Series cameras'),
(3, 15, true, 'All X-Series cameras'),
(3, 16, true, 'All X-Series cameras'),
(3, 17, true, 'All X-Series cameras'),
(3, 18, true, 'X-Trans II and later'),
(3, 19, true, 'All X-Series cameras'),
(3, 20, true, 'All X-Series cameras'),
(3, 21, true, 'All X-Series cameras'),
(3, 22, true, 'All X-Series cameras'),
(3, 23, true, 'All X-Series cameras'),
(3, 24, true, 'All X-Series cameras'),
(3, 25, true, 'All X-Series cameras');


-- =====================================================
-- 11. TAGS
-- =====================================================

INSERT INTO tags (id, name, slug, category, usage_count, is_active, created_at) VALUES
-- Subject-based tags
(1, 'Architecture', 'architecture', 'subject', 0, true, now()),
(2, 'Landscape', 'landscape', 'subject', 0, true, now()),
(3, 'Portrait', 'portrait', 'subject', 0, true, now()),
(4, 'Street', 'street', 'subject', 0, true, now()),
(5, 'Nature', 'nature', 'subject', 0, true, now()),
(6, 'Wildlife', 'wildlife', 'subject', 0, true, now()),
(7, 'Urban', 'urban', 'subject', 0, true, now()),
(8, 'Travel', 'travel', 'subject', 0, true, now()),
(9, 'Food', 'food', 'subject', 0, true, now()),
(10, 'Product', 'product', 'subject', 0, true, now()),
(11, 'Sports', 'sports', 'subject', 0, true, now()),
(12, 'Macro', 'macro', 'subject', 0, true, now()),
(13, 'Astrophotography', 'astrophotography', 'subject', 0, true, now()),
(14, 'Documentary', 'documentary', 'subject', 0, true, now()),
(15, 'Fashion', 'fashion', 'subject', 0, true, now()),
(16, 'Wedding', 'wedding', 'subject', 0, true, now()),

-- Mood-based tags
(17, 'Vintage', 'vintage', 'mood', 0, true, now()),
(18, 'Cinematic', 'cinematic', 'mood', 0, true, now()),
(19, 'Moody', 'moody', 'mood', 0, true, now()),
(20, 'Bright', 'bright', 'mood', 0, true, now()),
(21, 'Warm', 'warm', 'mood', 0, true, now()),
(22, 'Cool', 'cool', 'mood', 0, true, now()),
(23, 'Muted', 'muted', 'mood', 0, true, now()),
(24, 'Vibrant', 'vibrant', 'mood', 0, true, now()),
(25, 'Nostalgic', 'nostalgic', 'mood', 0, true, now()),
(26, 'Dramatic', 'dramatic', 'mood', 0, true, now()),
(27, 'Soft', 'soft', 'mood', 0, true, now()),
(28, 'High Contrast', 'high-contrast', 'mood', 0, true, now()),

-- Technique-based tags
(29, 'Long Exposure', 'long-exposure', 'technique', 0, true, now()),
(30, 'Low Light', 'low-light', 'technique', 0, true, now()),
(31, 'Shallow DOF', 'shallow-dof', 'technique', 0, true, now()),
(32, 'High ISO', 'high-iso', 'technique', 0, true, now()),
(33, 'Golden Hour', 'golden-hour', 'technique', 0, true, now()),
(34, 'Blue Hour', 'blue-hour', 'technique', 0, true, now()),
(35, 'Backlit', 'backlit', 'technique', 0, true, now()),

-- Season-based tags
(36, 'Spring', 'spring', 'season', 0, true, now()),
(37, 'Summer', 'summer', 'season', 0, true, now()),
(38, 'Autumn', 'autumn', 'season', 0, true, now()),
(39, 'Winter', 'winter', 'season', 0, true, now()),

-- Film Stock Inspired tags
(40, 'Kodak', 'kodak', 'film-stock', 0, true, now()),
(41, 'Fuji Film', 'fuji-film', 'film-stock', 0, true, now()),
(42, 'Ilford', 'ilford', 'film-stock', 0, true, now()),
(43, 'Portra', 'portra', 'film-stock', 0, true, now()),
(44, 'Tri-X', 'tri-x', 'film-stock', 0, true, now()),
(45, 'Ektar', 'ektar', 'film-stock', 0, true, now());

-- =====================================================
-- SUMMARY STATISTICS
-- =====================================================

DO $$
DECLARE
    total_cameras INTEGER;
    total_x_series INTEGER;
    total_gfx INTEGER;
    total_film_sims INTEGER;
    total_settings INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_cameras FROM camera_models;
    SELECT COUNT(*) INTO total_x_series FROM camera_models WHERE system_id = 1;
    SELECT COUNT(*) INTO total_gfx FROM camera_models WHERE system_id = 2;
    SELECT COUNT(*) INTO total_film_sims FROM film_simulations;
    SELECT COUNT(*) INTO total_settings FROM setting_definitions;
    
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'FUJIFILM DATABASE INITIALIZATION COMPLETE';
    RAISE NOTICE '==============================================';
    RAISE NOTICE 'Camera Systems: 3 (X-Series, GFX, X-Half)';
    RAISE NOTICE 'Total Cameras: %', total_cameras;
    RAISE NOTICE '  - X-Series: %', total_x_series;
    RAISE NOTICE '  - GFX Series: %', total_gfx;
    RAISE NOTICE '  - X-Half: 1';
    RAISE NOTICE 'Sensors: 11';
    RAISE NOTICE 'Film Simulations: %', total_film_sims;
    RAISE NOTICE 'Setting Definitions: %', total_settings;
    RAISE NOTICE 'Tags: 45';
    RAISE NOTICE '==============================================';
END $$;
