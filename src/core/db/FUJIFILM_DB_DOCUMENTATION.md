# Fujifilm Database Initialization - Documentation

## Overview

This SQL initialization script populates the iShootJpeg database with comprehensive data for the Fujifilm camera ecosystem, covering all X-Series, GFX, and X-Half cameras released from 2010 to 2025.

## Database Contents

### 1. Camera Systems (3 systems)
- **Fujifilm X-Series**: APS-C mirrorless cameras
- **Fujifilm GFX**: Medium format cameras
- **Fujifilm X-Half**: Compact 1-inch sensor camera

### 2. Sensors (11 sensor types)

#### X-Trans Sensors (APS-C)
- **X-Trans CMOS I** (16.3MP): X100, X-Pro1, X-E1, X-M1
- **X-Trans CMOS II** (16.3MP): X100S/T, X-E2/2S, X-T1/10, X70
- **X-Trans CMOS III** (24.3MP): X100F, X-Pro2, X-E3, X-T2/20, X-H1
- **X-Trans CMOS IV** (26.1MP): X100V, X-Pro3, X-E4, X-T3/30/4, X-S10, X-M5
- **X-Trans CMOS 5 BSI** (26.1MP): X-H2S, X-S20, X-T30 III
- **X-Trans CMOS 5 HR** (40.2MP): X100VI, X-E5, X-T5, X-H2, X-T50

#### Bayer Sensors
- **Bayer CMOS APS-C** (24.2MP): X-A series, X-T100/200, XF10
- **Bayer MF 50** (51.4MP): GFX 50S, 50R, 50S II
- **Bayer MF 100** (102MP): GFX100, GFX100 IR
- **Bayer MF 102** (102MP): GFX100S, GFX100 II, GFX100S II, GFX100RF, GFX ETERNA
- **Bayer 1"** (20MP): X-Half

### 3. Camera Models (54 cameras)

#### X100 Series (6 models)
- X100 (2011), X100S (2013), X100T (2014), X100F (2017), X100V (2020), X100VI (2024)

#### X-Pro Series (3 models)
- X-Pro1 (2012), X-Pro2 (2016), X-Pro3 (2019)

#### X-E Series (6 models)
- X-E1 (2012), X-E2 (2013), X-E2S (2016), X-E3 (2017), X-E4 (2021), X-E5 (2025)

#### X-T Series (11 models)
- X-T1 (2014), X-T10 (2015), X-T2 (2016), X-T20 (2017)
- X-T3 (2018), X-T30 (2019), X-T4 (2020), X-T30 II (2021)
- X-T5 (2022), X-T30 III (2024), X-T50 (2024)

#### X-H Series (3 models)
- X-H1 (2018), X-H2S (2022), X-H2 (2022)

#### X-S Series (2 models)
- X-S10 (2020), X-S20 (2023)

#### X-M Series (2 models)
- X-M1 (2013), X-M5 (2024)

#### X-A Series (6 models)
- X-A1 (2013), X-A2 (2015), X-A3 (2016), X-A5 (2018), X-A7 (2019), X-A10 (2017)

#### X-T100/200 Series (2 models)
- X-T100 (2018), X-T200 (2020)

#### Other X-Series (2 models)
- X70 (2016), XF10 (2018)

#### GFX Series (10 models)
- GFX 50S (2017), GFX 50R (2018), GFX100 (2019), GFX100 IR (2019)
- GFX100S (2021), GFX 50S II (2021), GFX100 II (2023)
- GFX100S II (2024), GFX100RF (2024), GFX ETERNA (2025)

#### X-Half Series (1 model)
- X-Half (2025)

### 4. Film Simulations (39 total: 17 X-Series + 17 GFX + 5 X-Half)

#### Core Simulations (Available on all cameras)
- Provia/Standard
- Velvia/Vivid
- Astia/Soft
- Monochrome
- Sepia

#### Added with X-Trans II (2013+)
- Classic Chrome
- PRO Neg. Hi
- PRO Neg. Std

#### Added with X-Trans III (2016+)
- Acros
- Acros+Ye Filter
- Acros+R Filter
- Acros+G Filter

#### Added with X-H1 (2018)
- Eterna

#### Added with X-Trans IV (2019+)
- Classic Negative
- Eterna Bleach Bypass

#### Added with X-Trans V (2021+)
- Nostalgic Neg.
- Reala Ace

### 5. Camera-Film Simulation Mapping

The `camera_film_sims` table maps which film simulations are available on each camera model:

- **X-Trans I cameras**: 5 simulations (core set)
- **X-Trans II cameras**: 8 simulations (+ Classic Chrome, PRO Neg)
- **X-Trans III cameras**: 12 simulations (+ Acros variants)
- **X-Trans III (X-H1)**: 13 simulations (+ Eterna)
- **X-Trans IV early (X-T3/30)**: 14 simulations
- **X-Trans IV late (X100V/Pro3/T4)**: 15 simulations (+ Bleach Bypass)
- **X-Trans V cameras**: 17 simulations (+ Nostalgic Neg, Reala Ace)
- **Bayer cameras**: 6-8 simulations (limited set)
- **GFX cameras**: Follow same progression as X-Series
- **X-Half**: 5 simulations

### 6. Style Categories (3 categories)
- **Color**: Color photography recipes
- **Black & White**: Monochrome recipes
- **Infrared**: IR photography recipes

### 7. Setting Categories (6 categories)
- Image Quality
- Color & Tone
- Film Simulation
- Grain & Texture
- White Balance
- Exposure

### 8. Setting Definitions (26 settings)

#### Film Simulation (3 settings)
- Film Simulation (base)
- Monochromatic Color WC (-9 to +9)
- Monochromatic Color MG (-9 to +9)

#### Grain & Texture (3 settings)
- Grain Effect (Off/Weak/Strong)
- Grain Effect Roughness (Off/Weak/Strong)
- Grain Effect Size (Small/Large)

#### Color & Tone (8 settings)
- Color Chrome Effect (Off/Weak/Strong)
- Color Chrome FX Blue (Off/Weak/Strong)
- Smooth Skin Effect (Off/Weak/Strong)
- Highlight Tone (-2 to +4 in 0.5 steps)
- Shadow Tone (-2 to +4 in 0.5 steps)
- Color (-4 to +4)
- Sharpness (-4 to +4)
- Clarity (-5 to +5)

#### White Balance (3 settings)
- White Balance (11 modes)
- WB Shift Red (-9 to +9)
- WB Shift Blue (-9 to +9)

#### Image Quality (5 settings)
- Dynamic Range (Auto/DR100/DR200/DR400)
- D Range Priority (Auto/Strong/Weak/Off)
- High ISO NR (-4 to +4)
- Long Exposure NR (On/Off)
- Color Space (sRGB/Adobe RGB)

#### Exposure (4 settings)
- ISO Min (80-64000)
- ISO Max (80-64000)
- Exposure Compensation Min (-5.0 to +5.0 EV)
- Exposure Compensation Max (-5.0 to +5.0 EV)

### 9. Setting Enum Values

All enum-type settings have their valid values defined in the `setting_enum_values` table:

- **Grain settings**: Off, Weak, Strong
- **Size settings**: Small, Large
- **White Balance**: 11 modes (Auto White Priority, Auto, Daylight, Shade, etc.)
- **Dynamic Range**: Auto, DR100, DR200, DR400
- **D Range Priority**: Auto, Strong, Weak, Off
- **ISO values**: 30 steps from 80 to 64000
- **Color Space**: sRGB, Adobe RGB

### 10. System Settings

All 26 setting definitions are linked to the Fujifilm X-Series system in the `system_settings` table, with notes indicating camera compatibility:

- Settings available on all cameras
- Settings specific to X-Trans generations
- Settings specific to certain models

### 11. Tags (45 tags in 5 categories)

#### Subject Tags (16)
Architecture, Landscape, Portrait, Street, Nature, Wildlife, Urban, Travel, Food, Product, Sports, Macro, Astrophotography, Documentary, Fashion, Wedding

#### Mood Tags (12)
Vintage, Cinematic, Moody, Bright, Warm, Cool, Muted, Vibrant, Nostalgic, Dramatic, Soft, High Contrast

#### Technique Tags (7)
Long Exposure, Low Light, Shallow DOF, High ISO, Golden Hour, Blue Hour, Backlit

#### Season Tags (4)
Spring, Summer, Autumn, Winter

#### Film Stock Inspired Tags (6)
Kodak, Fuji Film, Ilford, Portra, Tri-X, Ektar

## Key Design Decisions

### 1. EAV Pattern for Settings
The database uses an Entity-Attribute-Value (EAV) pattern for recipe settings to accommodate:
- Different settings across camera systems
- Future expansion without schema changes
- Validation through `setting_enum_values`
- Type safety through `data_type` field

### 2. Film Simulation Mapping
The `camera_film_sims` junction table enables:
- Historical accuracy (which simulations were available when)
- Firmware update tracking
- Recipe compatibility checking
- Filter recipes by camera capabilities

### 3. Normalization Strategy
All categorical data is fully normalized:
- Camera systems, models, sensors in separate tables
- Film simulations linked to systems
- Settings defined once, reused across recipes
- Eliminates data duplication
- Enables referential integrity

### 4. Future-Proofing
The schema supports future expansion:
- New camera systems (Nikon, Lumix, etc.)
- New sensors and camera models
- New film simulations
- New setting definitions
- User engagement features (ratings, comments, etc.)

## Usage Instructions

### 1. Running the Initialization Script

```bash
# Using psql
psql -U username -d ishootjpeg -f fujifilm_db_init.sql

# Or within psql
\i fujifilm_db_init.sql
```

### 2. Verifying Installation

```sql
-- Check camera counts
SELECT 
    cs.name as system,
    COUNT(cm.id) as camera_count
FROM systems cs
LEFT JOIN models cm ON cs.id = cm.system_id
GROUP BY cs.id, cs.name;

-- Check film simulation distribution
SELECT 
    cm.name as camera,
    COUNT(cfs.film_simulation_id) as sim_count
FROM models cm
LEFT JOIN camera_film_sims cfs ON cm.id = cfs.camera_model_id
WHERE cm.system_id = 1
GROUP BY cm.id, cm.name
ORDER BY cm.release_year DESC
LIMIT 10;

-- Check setting definitions
SELECT 
    sc.name as category,
    COUNT(sd.id) as setting_count
FROM setting_categories sc
LEFT JOIN setting_definitions sd ON sc.id = sd.category_id
GROUP BY sc.id, sc.name
ORDER BY sc.sort_order;
```

### 3. Common Queries

#### Find all cameras supporting a specific film simulation
```sql
SELECT 
    cm.name,
    cm.release_year,
    s.name as sensor
FROM models cm
JOIN camera_film_sims cfs ON cm.id = cfs.camera_id
JOIN film_sims fs ON cfs.film_sim_id = fs.id
JOIN sensors s ON cm.sensor_id = s.id
WHERE fs.name = 'CLASSIC_CHROME'
ORDER BY cm.release_year;
```

#### Get all film simulations for a specific camera
```sql
SELECT 
    fs.display_name,
    fs.description
FROM film_sims fs
JOIN camera_film_sims cfs ON fs.id = cfs.film_simulation_id
JOIN cameras cm ON cfs.camera_model_id = cm.id
WHERE cm.name = 'X100VI'
ORDER BY fs.display_name;
```

#### List all setting enum values for a specific setting
```sql
SELECT 
    sd.name as setting,
    sev.display_label,
    sev.value
FROM setting_definitions sd
JOIN setting_enum_values sev ON sd.id = sev.setting_definition_id
WHERE sd.slug = 'white_balance'
ORDER BY sev.sort_order;
```

## Data Sources

This initialization script is based on comprehensive research from:
- Fujifilm official documentation and press releases
- Wikipedia's Fujifilm X and GFX series articles
- DPReview camera reviews and specifications
- PetaPixel and TechRadar camera coverage
- Fuji X Weekly film simulation guides
- Camera manufacturer specifications

All data was verified against multiple sources to ensure accuracy.

## Maintenance Notes

### Adding New Cameras
1. Add sensor to `sensors` table (if new)
2. Add camera to `models` table
3. Map film simulations in `camera_film_sims`
4. Update sequence numbers if needed

### Adding New Film Simulations
1. Add to `film_sims` for each system
2. Map to supporting cameras in `camera_film_sims`
3. Consider backward compatibility

### Adding New Settings
1. Add to appropriate `setting_categories`
2. Define in `setting_definitions`
3. Add enum values to `setting_enum_values` (if enum type)
4. Link to systems in `system_settings`

## Schema Compliance

This initialization script complies with the normalized schema design:
- 3rd Normal Form (3NF)
- Foreign key constraints enforced
- No data duplication
- Referential integrity maintained
- Appropriate indexes for performance
- Check constraints for data validation

## License & Attribution

This data compilation is intended for use with the iShootJpeg platform. Film simulation names and camera model names are trademarks of Fujifilm Corporation.

## Version History

**Version 1.0** (November 22, 2025)
- Initial comprehensive dataset
- 54 Fujifilm cameras (2010-2025)
- 39 film simulations across all systems
- 26 setting definitions
- Complete camera-simulation mapping
- 45 categorized tags

---

For questions or issues, please refer to the main PRD and strategic planning documents.
