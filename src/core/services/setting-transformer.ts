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
        'd range': 'Dynamic Range',
        'dynamic range (dr)': 'Dynamic Range',
        'dynamic': 'Dynamic Range',
        'dnamic range': 'Dynamic Range', // Typo
        'monochromedynamic range': 'Dynamic Range', // Concatenated typo
        '44740"dynamic range': 'Dynamic Range', // Handle garbage prefix

        // Priority variations
        'priority': 'D Range Priority',
        'd range priority': 'D Range Priority',
        'd-range priority': 'D Range Priority',
        'drange priority': 'D Range Priority',
        'dynamic range priority': 'D Range Priority',
        'dr priority': 'D Range Priority',
        'dr-p': 'D Range Priority',

        // White Balance variations
        'white-balance': 'White Balance',
        'white balance': 'White Balance',
        'wb': 'White Balance',
        'wb auto/daylight': 'White Balance',
        'whitebalance': 'White Balance',
        'white': 'White Balance',
        'white balance (wb)': 'White Balance',
        'auto white balance (awb)': 'White Balance',
        'wb for daylight / interior': 'White Balance',
        'wb for night': 'White Balance',
        'autowb': 'White Balance',
        'white blance auto, r': 'White Balance', // Typo in CSV

        // Tone variations - Highlight
        'highlights': 'Highlight Tone',
        'highlight': 'Highlight Tone',
        'highlight tone': 'Highlight Tone',
        'htone': 'Highlight Tone',
        'h-tone': 'Highlight Tone',
        'h tone': 'Highlight Tone',
        'h': 'Highlight Tone',
        'ch': 'Highlight Tone', // Typo for H
        'tone lights': 'Highlight Tone',
        'hightlight tone': 'Highlight Tone', // Common typo
        'highligth': 'Highlight Tone', // Another typo
        'highlight tone (h-tone)': 'Highlight Tone',

        // Tone variations - Shadow
        'shadows': 'Shadow Tone',
        'shadow': 'Shadow Tone',
        'shadow tone': 'Shadow Tone',
        'stone': 'Shadow Tone',
        's-tone': 'Shadow Tone',
        's tone': 'Shadow Tone',
        'shading tone': 'Shadow Tone',
        'shadow tone (s-tone)': 'Shadow Tone',
        's': 'Shadow Tone',
        'shadox': 'Shadow Tone', // Typo
        'shading. tone': 'Shadow Tone', // Typo with period
        'ch blue': 'Shadow Tone', // Typo for S Blue or Shadow

        // Noise Reduction variations
        'noise reduction': 'High ISO NR',
        'nr': 'High ISO NR',
        'noise': 'High ISO NR',
        'iso noise reduction': 'High ISO NR',
        'noise red': 'High ISO NR',
        'high iso noise reduction': 'High ISO NR',
        'iso noise reduction (iso-nr)': 'High ISO NR',
        'noise redution': 'High ISO NR', // Common typo
        'noise réduction': 'High ISO NR', // French accent
        'high iso nr': 'High ISO NR',
        'iso nr': 'High ISO NR',
        'iso-nr': 'High ISO NR',
        'noise-reduction': 'High ISO NR',

        // Sharpness variations
        'sharpening': 'Sharpness',
        'sharpness': 'Sharpness',
        'sharpeness': 'Sharpness', // Typo
        'shrapening': 'Sharpness', // Typo
        'sharpness (sharp)': 'Sharpness',
        'sharp': 'Sharpness',

        // Grain variations
        'grain': 'Grain Effect',
        'grain effect': 'Grain Effect',
        'grain off': 'Grain Effect',
        'grain size': 'Grain Effect Size',
        'grain effect added in lightroom in post': 'Grain Effect', // Ignore this one

        // Color Chrome variations
        'colour chrome effect': 'Color Chrome Effect',
        'color chrome effect': 'Color Chrome Effect',
        'colorchrome effect': 'Color Chrome Effect',
        'chrome color effect': 'Color Chrome Effect',
        'chrome color fx': 'Color Chrome Effect',
        'color chrome fx': 'Color Chrome Effect',
        'color chrome- effect': 'Color Chrome Effect',
        'colour chrome': 'Color Chrome Effect',
        'chrome fx': 'Color Chrome Effect',
        'color chrome': 'Color Chrome Effect',
        'color chrome effects': 'Color Chrome Effect',
        'chrome effect': 'Color Chrome Effect',
        'chrome blue effect': 'Color Chrome FX Blue',
        'colour chrome blue': 'Color Chrome FX Blue',
        'colour chrome fx blue': 'Color Chrome FX Blue',
        'colour chome fx': 'Color Chrome FX Blue',
        'color chrome blue effect': 'Color Chrome FX Blue',
        'color chrome effect blue': 'Color Chrome FX Blue',
        'color chrome effect blue (ccb)': 'Color Chrome FX Blue',
        'color chrome effect (ccb)': 'Color Chrome FX Blue',
        'cc fx blue': 'Color Chrome FX Blue',
        'colour chrome effect blue': 'Color Chrome FX Blue',
        'color chrome fx blue': 'Color Chrome FX Blue',
        'cc blue': 'Color Chrome FX Blue',
        'blue fx': 'Color Chrome FX Blue',
        'color chrome blue': 'Color Chrome FX Blue',
        'color chrome effect (ccr)': 'Color Chrome Effect',
        'cc effect': 'Color Chrome Effect',
        'ccefex': 'Color Chrome Effect', // Typo
        'ccefex blue': 'Color Chrome FX Blue', // Typo
        'color fx': 'Color Chrome Effect',
        'colorchrome fx blue': 'Color Chrome FX Blue',
        'chrome fx blue': 'Color Chrome FX Blue',
        'color chrome fx & fx blue': 'CCR_CCB_SPECIAL', // Handle combined setting
        'color chrome effect & color chrome effect blue': 'CCR_CCB_SPECIAL', // Handle combined setting
        'color chrome effect/blue': 'CCR_CCB_SPECIAL', // Handle combined setting

        // Color variations
        'colour': 'Color',
        'color': 'Color',
        'saturation': 'Color',

        // Clarity
        'clarity': 'Clarity',
        'amount': 'Clarity', // Sometimes used for clarity
        'clarity (xpro3/xt4)': 'Clarity',

        // Exposure Compensation variations
        'exp comp': 'EV_SUGGESTION_SPECIAL',
        'exposure comp': 'EV_SUGGESTION_SPECIAL',
        'exposure compensation': 'EV_SUGGESTION_SPECIAL',
        'ev compensation': 'EV_SUGGESTION_SPECIAL',
        'ev suggestion': 'EV_SUGGESTION_SPECIAL',
        'ev': 'EV_SUGGESTION_SPECIAL',
        'push/pull (exposure)': 'EV_SUGGESTION_SPECIAL',
        'push/pull': 'EV_SUGGESTION_SPECIAL',
        'push/pull process': 'EV_SUGGESTION_SPECIAL',
        'push pull process': 'EV_SUGGESTION_SPECIAL',
        'exp. comp.': 'EV_SUGGESTION_SPECIAL',
        'exposure': 'EV_SUGGESTION_SPECIAL',
        'ev. compensation': 'EV_SUGGESTION_SPECIAL',

        // WB Shift variations (including WB Offset!)
        'wb shift': 'WB_SHIFT_SPECIAL',
        'shift': 'WB_SHIFT_SPECIAL',
        'wb color shift': 'WB_SHIFT_SPECIAL',
        'wb offset': 'WB_SHIFT_SPECIAL',
        'white balance shift': 'WB_SHIFT_SPECIAL',
        'auto-wb shift': 'WB_SHIFT_SPECIAL',
        'wb shift r': 'WB_SHIFT_SPECIAL', // Handle split lines
        'wb shift b': 'WB_SHIFT_SPECIAL',
        'whilebalance shift': 'WB_SHIFT_SPECIAL', // Typo

        // Monochromatic Color variations
        'mono shift': 'MONO_COLOR_SPECIAL',
        'mono wc': 'MONO_COLOR_SPECIAL',
        'monochromatic color': 'MONO_COLOR_SPECIAL',
        'toning': 'MONO_COLOR_SPECIAL',
        'b&w toning': 'MONO_COLOR_SPECIAL',
        'wc': 'MONO_COLOR_SPECIAL',

        // CCr/CCb (splits into two settings)
        'ccr/ccb': 'CCR_CCB_SPECIAL',

        // ISO
        'iso': 'ISO_RANGE_SPECIAL',
        'iso range': 'ISO_RANGE_SPECIAL',

        // Tone Curve
        'tone curve': 'TONE_CURVE_SPECIAL',
        'tone curve h': 'Highlight Tone', // Tone Curve H is just Highlight Tone
        'h curve': 'Highlight Tone', // H Curve is Highlight Tone
        'highlight & shadow': 'TONE_CURVE_SPECIAL', // Combined setting
        'curve': 'TONE_CURVE_SPECIAL',

        // Ignore these settings
        'simulation': 'IGNORE',
        'film simulation': 'IGNORE',
        'image quality': 'IGNORE',
        'aperture': 'IGNORE',
        'filter': 'IGNORE',
        'aspect ratio': 'IGNORE',
        'photometry': 'IGNORE',
        'base': 'IGNORE',
        'base film simulation': 'IGNORE',
        'softer development': 'IGNORE',
        'harder development': 'IGNORE',
        'image size': 'IGNORE',
        'flash': 'IGNORE',
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

        // Handle Monochromatic Color: "WC+4 MG-4" or "WC 1, MG 0" or "Toning WC -2 MG -1"
        if (normalized === 'mono shift' || normalized === 'mono wc' || normalized === 'monochromatic color' ||
            (normalized === 'colour' && csvValue.toLowerCase().includes('toning'))) {
            return this.parseMonochromaticColor(csvValue);
        }

        // Handle CCr/CCb: "strong" or "weak/off"
        if (normalized === 'ccr/ccb') {
            return this.parseCCrCCb(csvValue);
        }

        // Handle WB Shift: "R:4 B:-5" or "R+2 B-1" or "R5 B3"
        if (normalized === 'shift' || normalized === 'wb shift' || normalized === 'wb color shift' ||
            normalized === 'wb offset' || normalized === 'white balance shift') {
            return this.parseWBShift(csvValue);
        }

        // Handle ISO range: "Auto, up to ISO 3200" or "800-3200" or "400 minimum"
        if (normalized === 'iso' || normalized === 'iso range') {
            return this.parseISORange(csvValue);
        }

        // Handle Exposure Compensation: "+1/3 to +2/3" or "0EV" or "+1/3"
        if (normalized === 'exposure compensation' || normalized === 'ev suggestion' ||
            normalized === 'ev compensation' || normalized === 'exp comp' ||
            normalized === 'push/pull (exposure)' || normalized === 'push/pull' ||
            normalized === 'ev') {
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
        const redMatch = value.match(/(?:R:?|Red:?)\s*([+-]?\d+)|([+-]?\d+)\s*Red/i);
        const blueMatch = value.match(/(?:B:?|Blue:?)\s*([+-]?\d+)|([+-]?\d+)\s*Blue/i);

        if (redMatch) {
            result.push({ name: 'WB Shift Red', value: (redMatch[1] || redMatch[2])! });
        }
        if (blueMatch) {
            result.push({ name: 'WB Shift Blue', value: (blueMatch[1] || blueMatch[2])! });
        }

        return result;
    }

    private static parseISORange(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "800-3200" or "Auto, up to ISO 3200" or "400 minimum" or "200 up to ISO 6400"
        const dashMatch = value.match(/(\d+)\s*-\s*(\d+)/);
        if (dashMatch) {
            result.push({ name: 'ISO Min', value: dashMatch[1]! });
            result.push({ name: 'ISO Max', value: dashMatch[2]! });
            return result;
        }

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
        value = value.trim();

        // Handle "0EV" or "0 EV" format
        if (value.match(/^\s*0\s*EV?\s*$/i)) {
            result.push({ name: 'Exposure Compensation Min', value: '0' });
            result.push({ name: 'Exposure Compensation Max', value: '0' });
            return result;
        }

        // Pattern: "+1/3 to +2/3" or "0 to +1" or "-1/3 to +1/3"
        const rangeMatch = value.match(/([+-]?\d+(?:\/\d+)?)\s*to\s*([+-]?\d+(?:\/\d+)?)/i);

        if (rangeMatch) {
            const min = this.parseFraction(rangeMatch[1]!);
            const max = this.parseFraction(rangeMatch[2]!);
            result.push({ name: 'Exposure Compensation Min', value: min.toString() });
            result.push({ name: 'Exposure Compensation Max', value: max.toString() });
        } else {
            // Single value: assume min=0, max=value
            // Matches: "+1", "0", "0EV", "+1/3"
            const singleMatch = value.match(/([+-]?\d+(?:\/\d+)?)(?:EV)?/i);
            if (singleMatch) {
                const val = this.parseFraction(singleMatch[1]!);
                result.push({ name: 'Exposure Compensation Min', value: '0' });
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
            result.push({ name: 'Highlight Tone', value: highlightMatch[1]! });
        }
        if (shadowMatch) {
            result.push({ name: 'Shadow Tone', value: shadowMatch[1]! });
        }

        return result;
    }

    private static parseGrainEffect(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "Weak, Small" or "Strong, Large"
        const parts = value.split(',').map(p => p.trim());

        if (parts.length >= 1) {
            const strength = parts[0]!; // Weak, Strong, Off
            result.push({ name: 'Grain Effect', value: this.transformValue('Grain Effect', strength) });
        }

        if (parts.length >= 2) {
            const size = parts[1]!; // Small, Large
            result.push({ name: 'Grain Effect Size', value: size });
        }

        return result;
    }

    private static parseFraction(str: string): number {
        const match = str.match(/([+-]?\d+)(?:\/(\d+))?/);
        if (!match) return 0;

        const numerator = parseInt(match[1]!);
        const denominator = match[2] ? parseInt(match[2]) : 1;

        return numerator / denominator;
    }

    private static parseMonochromaticColor(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "WC+4 MG-4" or "WC 1, MG 0" or "Toning WC -2 MG -1"
        const wcMatch = value.match(/WC\s*([+-]?\d+)/i);
        const mgMatch = value.match(/MG\s*([+-]?\d+)/i);

        if (wcMatch) {
            result.push({ name: 'Monochromatic Color WC', value: wcMatch[1]! });
        }
        if (mgMatch) {
            result.push({ name: 'Monochromatic Color MG', value: mgMatch[1]! });
        }

        return result;
    }

    private static parseCCrCCb(value: string): Array<{ name: string, value: string }> {
        const result: Array<{ name: string, value: string }> = [];

        // Pattern: "strong" or "weak/off" - applies same value to both settings
        const trimmed = value.trim();
        const normalized = trimmed.charAt(0).toUpperCase() + trimmed.slice(1).toLowerCase();

        result.push({ name: 'Color Chrome Effect', value: normalized });
        result.push({ name: 'Color Chrome FX Blue', value: normalized });

        return result;
    }

    /**
     * Check if a setting name requires special handling
     */
    static isSpecialSetting(csvName: string): boolean {
        const transformed = this.transformName(csvName);
        return transformed.endsWith('_SPECIAL');
    }
}
