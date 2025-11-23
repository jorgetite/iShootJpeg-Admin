/**
 * Setting Name and Value Transformations
 * 
 * Maps CSV setting names and values to database equivalents
 */

export class SettingTransformer {
    // Map CSV setting names to database setting names (case-insensitive keys)
    private static readonly NAME_MAP: Record<string, string> = {
        // Dynamic Range variations
        'dr': 'Dynamic Range',
        'dynamic range': 'Dynamic Range',
        'dynamic-range': 'Dynamic Range',
        'd-range': 'Dynamic Range',
        'dr100': 'Dynamic Range',
        'dr200': 'Dynamic Range',
        'dr 200': 'Dynamic Range',

        // Priority variations
        'priority': 'D Range Priority',
        'd range priority': 'D Range Priority',
        'd-range priority': 'D Range Priority',
        'drange priority': 'D Range Priority',

        // White Balance variations
        'white-balance': 'White Balance',
        'white balance': 'White Balance',
        'wb': 'White Balance',
        'wb auto/daylight': 'White Balance',

        // Tone variations - Highlight
        'highlights': 'Highlight Tone',
        'highlight': 'Highlight Tone',
        'highlight tone': 'Highlight Tone',
        'htone': 'Highlight Tone',
        'h-tone': 'Highlight Tone',
        'hightlight tone': 'Highlight Tone', // Common typo

        // Tone variations - Shadow
        'shadows': 'Shadow Tone',
        'shadow': 'Shadow Tone',
        'shadow tone': 'Shadow Tone',
        'stone': 'Shadow Tone',
        's-tone': 'Shadow Tone',

        // Noise Reduction variations
        'noise reduction': 'High ISO NR',
        'nr': 'High ISO NR',
        'noise': 'High ISO NR',
        'iso noise reduction': 'High ISO NR',
        'noise redution': 'High ISO NR', // Common typo
        'high iso nr': 'High ISO NR',
        'iso nr': 'High ISO NR',

        // Sharpness variations
        'sharpening': 'Sharpness',
        'sharpness': 'Sharpness',
        'sharp': 'Sharpness',

        // Grain variations
        'grain': 'Grain Effect',
        'grain effect': 'Grain Effect',
        'grain off': 'Grain Effect',
        'grain effect added in lightroom in post': 'Grain Effect', // Ignore this one

        // Color Chrome variations
        'colour chrome effect': 'Color Chrome Effect',
        'color chrome effect': 'Color Chrome Effect',
        'colorchrome effect': 'Color Chrome Effect',
        'colour chrome blue': 'Color Chrome FX Blue',
        'colour chrome fx blue': 'Color Chrome FX Blue',
        'color chrome blue effect': 'Color Chrome FX Blue',
        'color chrome effect blue': 'Color Chrome FX Blue',
        'color chrome fx blue': 'Color Chrome FX Blue',
        'color chrome blue': 'Color Chrome FX Blue',
        'colorchrome fx blue': 'Color Chrome FX Blue',
        'chrome fx blue': 'Color Chrome FX Blue',

        // Color variations
        'colour': 'Color',
        'color': 'Color',

        // Clarity
        'clarity': 'Clarity',
        'amount': 'Clarity', // Sometimes used for clarity

        // Exposure Compensation variations
        'exp comp': 'EV_SUGGESTION_SPECIAL',
        'exposure comp': 'EV_SUGGESTION_SPECIAL',
        'exposure compensation': 'EV_SUGGESTION_SPECIAL',
        'ev suggestion': 'EV_SUGGESTION_SPECIAL',
        'ev': 'EV_SUGGESTION_SPECIAL',

        // WB Shift variations (including WB Offset!)
        'wb shift': 'WB_SHIFT_SPECIAL',
        'shift': 'WB_SHIFT_SPECIAL',
        'wb color shift': 'WB_SHIFT_SPECIAL',
        'wb offset': 'WB_SHIFT_SPECIAL', // NEW: WB Offset = WB Shift

        // ISO
        'iso': 'ISO_RANGE_SPECIAL',

        // Tone Curve
        'tone curve': 'TONE_CURVE_SPECIAL',
    };

    // Map CSV values to database enum values
    private static readonly VALUE_MAP: Record<string, Record<string, string>> = {
        'Dynamic Range': {
            '100': 'DR100',
            '200': 'DR200',
            '400': 'DR400',
            'DR100': 'DR100',
            'DR200': 'DR200',
            'DR400': 'DR400',
            'DR-Auto': 'Auto',
            'DRPAuto': 'Auto',
            'DRAUTO': 'Auto',
            'Auto': 'Auto',
            'auto': 'Auto',
            '100%': 'DR100',
            '200%': 'DR200',
            '400%': 'DR400',
            '400% D-Range': 'DR400',
        },
        'D Range Priority': {
            'Off': 'Off',
            'On': 'On',
            'Auto': 'Auto',
            'Strong': 'Strong',
            'Weak': 'Weak',
        },
        'Grain Effect': {
            'Off': 'Off',
            'Weak': 'Weak',
            'Strong': 'Strong',
            'Weak, Small': 'Weak',
            'Weak, Large': 'Weak',
            'Strong, Small': 'Strong',
            'Strong, Large': 'Strong',
            'None': 'Off',
            'N/A': 'Off',
            'NA': 'Off',
        },
        'Grain Effect Size': {
            'Small': 'Small',
            'Large': 'Large',
        },
        'Color Chrome Effect': {
            'Off': 'Off',
            'Weak': 'Weak',
            'Strong': 'Strong',
            'N/A': 'Off',
            'NA': 'Off',
        },
        'Color Chrome FX Blue': {
            'Off': 'Off',
            'Weak': 'Weak',
            'Strong': 'Strong',
            'N/A': 'Off',
            'NA': 'Off',
        },
        'White Balance': {
            'Auto': 'Auto',
            'Auto WB': 'Auto',
            'Auto White Priority': 'Auto White Priority',
            'Daylight': 'Daylight',
            'Daylight/Fine': 'Daylight',
            'Shade': 'Shade',
            'Fluorescent 1': 'Fluorescent 1',
            'Fluorescent 2': 'Fluorescent 2',
            'Fluorescent 3': 'Fluorescent 3',
            'Incandescent': 'Incandescent',
            'Underwater': 'Underwater',
            'Custom': 'Custom',
            'Grey card': 'Custom',
        },
    };

    /**
     * Transform a setting name from CSV format to database format (case-insensitive)
     */
    static transformName(csvName: string): string {
        const normalized = csvName.trim().toLowerCase();
        return this.NAME_MAP[normalized] || csvName.trim();
    }

    /**
     * Transform a setting value from CSV format to database format
     */
    static transformValue(settingName: string, csvValue: string): string {
        const trimmed = csvValue.trim();

        // Check if we have a value map for this setting
        const valueMap = this.VALUE_MAP[settingName];
        if (valueMap && valueMap[trimmed]) {
            return valueMap[trimmed];
        }

        // Handle numeric values with signs
        if (trimmed.match(/^[+-]?\d+(\.\d+)?$/)) {
            return trimmed;
        }

        // Handle temperature values (e.g., "5600K" → "5600")
        if (trimmed.match(/^\d+K$/i)) {
            return trimmed.replace(/K$/i, '');
        }

        return trimmed;
    }

    /**
     * Parse special settings that need to be split into multiple database settings
     * Returns array of {name, value} pairs
     */
    static parseSpecialSettings(csvName: string, csvValue: string): Array<{ name: string, value: string }> {
        const normalized = csvName.trim().toLowerCase();

        // Handle WB Shift: "R:4 B:-5" or "R+2 B-1" or "+2 Red, -1 Blue"
        if (normalized === 'shift' || normalized === 'wb shift' || normalized === 'wb color shift') {
            return this.parseWBShift(csvValue);
        }

        // Handle ISO range: "Auto, up to ISO 3200" or "400 minimum"
        if (normalized === 'iso') {
            return this.parseISORange(csvValue);
        }

        // Handle Exposure Compensation: "+1/3 to +2/3" or "0 to +1"
        if (normalized === 'exposure compensation' || normalized === 'ev suggestion') {
            return this.parseExposureComp(csvValue);
        }

        // Handle Tone Curve: "Highlights +2 Shadows -1" or "Highlight: +1 Shadow: +2"
        if (normalized === 'tone curve') {
            return this.parseToneCurve(csvValue);
        }

        // Handle Grain Effect with size: "Weak, Small"
        if (normalized === 'grain effect' && csvValue.includes(',')) {
            return this.parseGrainEffect(csvValue);
        }

        return [];
    }

    private static parseWBShift(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "R:4 B:-5" or "R+2 B-1" or "+2 Red, -1 Blue" or "0 Red, -4 Blue"
        const redMatch = value.match(/(?:R:?|Red:?)\s*([+-]?\d+)/i);
        const blueMatch = value.match(/(?:B:?|Blue:?)\s*([+-]?\d+)/i);

        if (redMatch) {
            result.push({ name: 'WB Shift Red', value: redMatch[1] });
        }
        if (blueMatch) {
            result.push({ name: 'WB Shift Blue', value: blueMatch[1] });
        }

        return result;
    }

    private static parseISORange(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "Auto, up to ISO 3200" or "400 minimum" or "200 up to ISO 6400"
        const maxMatch = value.match(/(?:up to )?ISO\s*(\d+)/i);
        const minMatch = value.match(/(\d+)\s*(?:minimum|min)/i);

        if (maxMatch) {
            result.push({ name: 'ISO Max', value: `${maxMatch[1]}` });
        }
        if (minMatch) {
            result.push({ name: 'ISO Min', value: `${minMatch[1]}` });
        }

        return result;
    }

    private static parseExposureComp(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "+1/3 to +2/3" or "0 to +1" or "-1/3 to +1/3"
        const rangeMatch = value.match(/([+-]?\d+(?:\/\d+)?)\s*to\s*([+-]?\d+(?:\/\d+)?)/i);

        if (rangeMatch) {
            const min = this.parseFraction(rangeMatch[1]);
            const max = this.parseFraction(rangeMatch[2]);
            result.push({ name: 'Exposure Compensation Min', value: min.toString() });
            result.push({ name: 'Exposure Compensation Max', value: max.toString() });
        } else {
            // Single value
            const singleMatch = value.match(/([+-]?\d+(?:\/\d+)?)/);
            if (singleMatch) {
                const val = this.parseFraction(singleMatch[1]);
                result.push({ name: 'Exposure Compensation Max', value: val.toString() });
            }
        }

        return result;
    }

    private static parseToneCurve(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "Highlights +2 Shadows -1" or "Highlight: +1 Shadow: +2"
        const highlightMatch = value.match(/Highlights?:?\s*([+-]?\d+(?:\.\d+)?)/i);
        const shadowMatch = value.match(/Shadows?:?\s*([+-]?\d+(?:\.\d+)?)/i);

        if (highlightMatch) {
            result.push({ name: 'Highlight Tone', value: highlightMatch[1] });
        }
        if (shadowMatch) {
            result.push({ name: 'Shadow Tone', value: shadowMatch[1] });
        }

        return result;
    }

    private static parseGrainEffect(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "Weak, Small" or "Strong, Large"
        const parts = value.split(',').map(p => p.trim());

        if (parts.length >= 1) {
            const strength = parts[0]; // Weak, Strong, Off
            result.push({ name: 'Grain Effect', value: this.transformValue('Grain Effect', strength) });
        }

        if (parts.length >= 2) {
            const size = parts[1]; // Small, Large
            result.push({ name: 'Grain Effect Size', value: size });
        }

        return result;
    }

    private static parseFraction(str: string): number {
        const match = str.match(/([+-]?\d+)(?:\/(\d+))?/);
        if (!match) return 0;

        const numerator = parseInt(match[1]);
        const denominator = match[2] ? parseInt(match[2]) : 1;

        return numerator / denominator;
    }

    /**
     * Check if a setting name requires special handling
     */
    static isSpecialSetting(csvName: string): boolean {
        const transformed = this.transformName(csvName);
        return transformed.endsWith('_SPECIAL');
    }
}
