/**
 * Unit tests for SettingTransformer
 * Tests CSV setting name and value transformations
 */

import { describe, it, expect } from 'vitest';
import { SettingTransformer } from '#/services/setting-transformer';

describe('SettingTransformer', () => {
  describe('transformName', () => {
    describe('Dynamic Range variations', () => {
      it('should transform "dr" to "Dynamic Range"', () => {
        expect(SettingTransformer.transformName('dr')).toBe('Dynamic Range');
        expect(SettingTransformer.transformName('DR')).toBe('Dynamic Range');
      });

      it('should transform various Dynamic Range formats', () => {
        expect(SettingTransformer.transformName('dynamic range')).toBe('Dynamic Range');
        expect(SettingTransformer.transformName('dynamic-range')).toBe('Dynamic Range');
        expect(SettingTransformer.transformName('d-range')).toBe('Dynamic Range');
        expect(SettingTransformer.transformName('d range')).toBe('Dynamic Range');
      });

      it('should handle typos and malformed names', () => {
        expect(SettingTransformer.transformName('dnamic range')).toBe('Dynamic Range');
        expect(SettingTransformer.transformName('monochromedynamic range')).toBe('Dynamic Range');
      });
    });

    describe('White Balance variations', () => {
      it('should transform WB variations', () => {
        expect(SettingTransformer.transformName('wb')).toBe('White Balance');
        expect(SettingTransformer.transformName('white-balance')).toBe('White Balance');
        expect(SettingTransformer.transformName('whitebalance')).toBe('White Balance');
        expect(SettingTransformer.transformName('white blance auto, r')).toBe('White Balance');
      });
    });

    describe('Tone variations', () => {
      it('should transform Highlight Tone variations', () => {
        expect(SettingTransformer.transformName('highlight')).toBe('Highlight Tone');
        expect(SettingTransformer.transformName('highlights')).toBe('Highlight Tone');
        expect(SettingTransformer.transformName('h-tone')).toBe('Highlight Tone');
        expect(SettingTransformer.transformName('hightlight tone')).toBe('Highlight Tone');
      });

      it('should transform Shadow Tone variations', () => {
        expect(SettingTransformer.transformName('shadow')).toBe('Shadow Tone');
        expect(SettingTransformer.transformName('shadows')).toBe('Shadow Tone');
        expect(SettingTransformer.transformName('s-tone')).toBe('Shadow Tone');
        expect(SettingTransformer.transformName('shadox')).toBe('Shadow Tone');
      });
    });

    describe('Noise Reduction variations', () => {
      it('should transform NR variations', () => {
        expect(SettingTransformer.transformName('noise reduction')).toBe('High ISO NR');
        expect(SettingTransformer.transformName('nr')).toBe('High ISO NR');
        expect(SettingTransformer.transformName('high iso nr')).toBe('High ISO NR');
        expect(SettingTransformer.transformName('noise redution')).toBe('High ISO NR');
      });
    });

    describe('Grain variations', () => {
      it('should transform grain variations', () => {
        expect(SettingTransformer.transformName('grain')).toBe('Grain Effect');
        expect(SettingTransformer.transformName('grain effect')).toBe('Grain Effect');
        expect(SettingTransformer.transformName('grain size')).toBe('Grain Effect Size');
      });
    });

    describe('Color Chrome variations', () => {
      it('should transform Color Chrome Effect variations', () => {
        expect(SettingTransformer.transformName('color chrome effect')).toBe('Color Chrome Effect');
        expect(SettingTransformer.transformName('colour chrome effect')).toBe('Color Chrome Effect');
        expect(SettingTransformer.transformName('chrome effect')).toBe('Color Chrome Effect');
        expect(SettingTransformer.transformName('ccefex')).toBe('Color Chrome Effect');
      });

      it('should transform Color Chrome FX Blue variations', () => {
        expect(SettingTransformer.transformName('chrome blue effect')).toBe('Color Chrome FX Blue');
        expect(SettingTransformer.transformName('color chrome blue')).toBe('Color Chrome FX Blue');
        expect(SettingTransformer.transformName('cc blue')).toBe('Color Chrome FX Blue');
      });
    });

    describe('Special settings', () => {
      it('should transform exposure compensation variations', () => {
        expect(SettingTransformer.transformName('ev')).toBe('EV_SUGGESTION_SPECIAL');
        expect(SettingTransformer.transformName('exposure compensation')).toBe('EV_SUGGESTION_SPECIAL');
        expect(SettingTransformer.transformName('push/pull')).toBe('EV_SUGGESTION_SPECIAL');
      });

      it('should transform WB shift variations', () => {
        expect(SettingTransformer.transformName('wb shift')).toBe('WB_SHIFT_SPECIAL');
        expect(SettingTransformer.transformName('shift')).toBe('WB_SHIFT_SPECIAL');
      });

      it('should transform ISO variations', () => {
        expect(SettingTransformer.transformName('iso')).toBe('ISO_RANGE_SPECIAL');
        expect(SettingTransformer.transformName('iso range')).toBe('ISO_RANGE_SPECIAL');
      });
    });

    describe('Ignored settings', () => {
      it('should mark ignored settings', () => {
        expect(SettingTransformer.transformName('film simulation')).toBe('IGNORE');
        expect(SettingTransformer.transformName('aperture')).toBe('IGNORE');
        expect(SettingTransformer.transformName('aspect ratio')).toBe('IGNORE');
      });
    });

    describe('Unknown settings', () => {
      it('should return trimmed original name for unknown settings', () => {
        expect(SettingTransformer.transformName('  Unknown Setting  ')).toBe('Unknown Setting');
        expect(SettingTransformer.transformName('Custom Setting 123')).toBe('Custom Setting 123');
      });
    });

    describe('Case insensitivity', () => {
      it('should handle mixed case', () => {
        expect(SettingTransformer.transformName('DyNaMiC RaNgE')).toBe('Dynamic Range');
        expect(SettingTransformer.transformName('WhItE BaLaNcE')).toBe('White Balance');
      });
    });
  });

  describe('transformValue', () => {
    describe('Dynamic Range values', () => {
      it('should transform numeric DR values', () => {
        expect(SettingTransformer.transformValue('Dynamic Range', '100')).toBe('DR100');
        expect(SettingTransformer.transformValue('Dynamic Range', '200')).toBe('DR200');
        expect(SettingTransformer.transformValue('Dynamic Range', '400')).toBe('DR400');
      });

      it('should transform DR enum values', () => {
        expect(SettingTransformer.transformValue('Dynamic Range', 'DR100')).toBe('DR100');
        expect(SettingTransformer.transformValue('Dynamic Range', 'Auto')).toBe('Auto');
        expect(SettingTransformer.transformValue('Dynamic Range', 'DRAUTO')).toBe('Auto');
      });

      it('should transform percentage values', () => {
        expect(SettingTransformer.transformValue('Dynamic Range', '100%')).toBe('DR100');
        expect(SettingTransformer.transformValue('Dynamic Range', '400%')).toBe('DR400');
      });
    });

    describe('Grain Effect values', () => {
      it('should transform grain strength values', () => {
        expect(SettingTransformer.transformValue('Grain Effect', 'Off')).toBe('Off');
        expect(SettingTransformer.transformValue('Grain Effect', 'Weak')).toBe('Weak');
        expect(SettingTransformer.transformValue('Grain Effect', 'Strong')).toBe('Strong');
      });

      it('should transform combined grain values', () => {
        expect(SettingTransformer.transformValue('Grain Effect', 'Weak, Small')).toBe('Weak');
        expect(SettingTransformer.transformValue('Grain Effect', 'Strong, Large')).toBe('Strong');
      });

      it('should transform N/A to Off', () => {
        expect(SettingTransformer.transformValue('Grain Effect', 'N/A')).toBe('Off');
        expect(SettingTransformer.transformValue('Grain Effect', 'NA')).toBe('Off');
      });
    });

    describe('White Balance values', () => {
      it('should transform WB enum values', () => {
        expect(SettingTransformer.transformValue('White Balance', 'Auto')).toBe('Auto');
        expect(SettingTransformer.transformValue('White Balance', 'Daylight')).toBe('Daylight');
        expect(SettingTransformer.transformValue('White Balance', 'Shade')).toBe('Shade');
      });

      it('should normalize variations', () => {
        expect(SettingTransformer.transformValue('White Balance', 'Auto WB')).toBe('Auto');
        expect(SettingTransformer.transformValue('White Balance', 'Daylight/Fine')).toBe('Daylight');
      });
    });

    describe('Numeric values', () => {
      it('should preserve signed integers', () => {
        expect(SettingTransformer.transformValue('Highlight Tone', '+2')).toBe('+2');
        expect(SettingTransformer.transformValue('Shadow Tone', '-1')).toBe('-1');
        expect(SettingTransformer.transformValue('Color', '0')).toBe('0');
      });

      it('should preserve decimal values', () => {
        expect(SettingTransformer.transformValue('Clarity', '1.5')).toBe('1.5');
        expect(SettingTransformer.transformValue('Clarity', '-0.5')).toBe('-0.5');
      });
    });

    describe('Temperature values', () => {
      it('should strip K suffix from Kelvin values', () => {
        expect(SettingTransformer.transformValue('White Balance', '5600K')).toBe('5600');
        expect(SettingTransformer.transformValue('White Balance', '3200k')).toBe('3200');
      });
    });

    describe('Unknown values', () => {
      it('should return trimmed value for unmapped values', () => {
        expect(SettingTransformer.transformValue('Unknown Setting', '  Some Value  ')).toBe('Some Value');
      });
    });
  });

  describe('parseSpecialSettings', () => {
    describe('WB Shift parsing', () => {
      it('should parse R:X B:Y format', () => {
        const result = SettingTransformer.parseSpecialSettings('wb shift', 'R:4 B:-5');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'WB Shift Red', value: '4' });
        expect(result[1]).toEqual({ name: 'WB Shift Blue', value: '-5' });
      });

      it('should parse R+X B-Y format', () => {
        const result = SettingTransformer.parseSpecialSettings('shift', 'R+2 B-1');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'WB Shift Red', value: '+2' });
        expect(result[1]).toEqual({ name: 'WB Shift Blue', value: '-1' });
      });

      it('should parse Red/Blue format', () => {
        const result = SettingTransformer.parseSpecialSettings('wb shift', '+2 Red, -1 Blue');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'WB Shift Red', value: '+2' });
        expect(result[1]).toEqual({ name: 'WB Shift Blue', value: '-1' });
      });

      it('should handle single value', () => {
        const result = SettingTransformer.parseSpecialSettings('wb shift', 'R:2');
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ name: 'WB Shift Red', value: '2' });
      });
    });

    describe('ISO range parsing', () => {
      it('should parse range format', () => {
        const result = SettingTransformer.parseSpecialSettings('iso', '800-3200');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'ISO Min', value: '800' });
        expect(result[1]).toEqual({ name: 'ISO Max', value: '3200' });
      });

      it('should parse "up to ISO X" format', () => {
        const result = SettingTransformer.parseSpecialSettings('iso', 'Auto, up to ISO 3200');
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ name: 'ISO Max', value: '3200' });
      });

      it('should parse minimum format', () => {
        const result = SettingTransformer.parseSpecialSettings('iso', '400 minimum');
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({ name: 'ISO Min', value: '400' });
      });
    });

    describe('Exposure Compensation parsing', () => {
      it('should parse range format', () => {
        const result = SettingTransformer.parseSpecialSettings('exposure compensation', '+1/3 to +2/3');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'Exposure Compensation Min', value: expect.stringMatching(/0\.33/) });
        expect(result[1]).toEqual({ name: 'Exposure Compensation Max', value: expect.stringMatching(/0\.66/) });
      });

      it('should parse single value', () => {
        const result = SettingTransformer.parseSpecialSettings('ev', '+1');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'Exposure Compensation Min', value: '0' });
        expect(result[1]).toEqual({ name: 'Exposure Compensation Max', value: '1' });
      });

      it('should parse 0EV', () => {
        const result = SettingTransformer.parseSpecialSettings('ev', '0EV');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'Exposure Compensation Min', value: '0' });
        expect(result[1]).toEqual({ name: 'Exposure Compensation Max', value: '0' });
      });

      it('should parse negative ranges', () => {
        const result = SettingTransformer.parseSpecialSettings('push/pull', '-1/3 to +1/3');
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('Exposure Compensation Min');
        expect(result[1].name).toBe('Exposure Compensation Max');
      });
    });

    describe('Tone Curve parsing', () => {
      it('should parse Highlights/Shadows format', () => {
        const result = SettingTransformer.parseSpecialSettings('tone curve', 'Highlights +2 Shadows -1');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'Highlight Tone', value: '+2' });
        expect(result[1]).toEqual({ name: 'Shadow Tone', value: '-1' });
      });

      it('should parse with colons', () => {
        const result = SettingTransformer.parseSpecialSettings('tone curve', 'Highlight: +1 Shadow: +2');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'Highlight Tone', value: '+1' });
        expect(result[1]).toEqual({ name: 'Shadow Tone', value: '+2' });
      });
    });

    describe('Grain Effect with size', () => {
      it('should parse grain with size', () => {
        const result = SettingTransformer.parseSpecialSettings('grain effect', 'Weak, Small');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'Grain Effect', value: 'Weak' });
        expect(result[1]).toEqual({ name: 'Grain Effect Size', value: 'Small' });
      });

      it('should parse strong, large', () => {
        const result = SettingTransformer.parseSpecialSettings('grain effect', 'Strong, Large');
        expect(result).toHaveLength(2);
        expect(result[0]).toEqual({ name: 'Grain Effect', value: 'Strong' });
        expect(result[1]).toEqual({ name: 'Grain Effect Size', value: 'Large' });
      });
    });

    describe('Non-special settings', () => {
      it('should return empty array for non-special settings', () => {
        const result = SettingTransformer.parseSpecialSettings('color', 'Strong');
        expect(result).toEqual([]);
      });
    });
  });

  describe('isSpecialSetting', () => {
    it('should identify special settings', () => {
      expect(SettingTransformer.isSpecialSetting('wb shift')).toBe(true);
      expect(SettingTransformer.isSpecialSetting('iso')).toBe(true);
      expect(SettingTransformer.isSpecialSetting('exposure compensation')).toBe(true);
      expect(SettingTransformer.isSpecialSetting('tone curve')).toBe(true);
    });

    it('should not identify regular settings as special', () => {
      expect(SettingTransformer.isSpecialSetting('color')).toBe(false);
      expect(SettingTransformer.isSpecialSetting('sharpness')).toBe(false);
      expect(SettingTransformer.isSpecialSetting('grain effect')).toBe(false);
    });
  });
});
