<template>
  <div class="settings-editor">
    <div v-if="loading" class="loading-state">
      <span class="material-symbols-outlined spin">progress_activity</span>
      <p>Loading settings...</p>
    </div>

    <div v-else-if="!systemId" class="empty-state">
      <p>Please select a camera system to configure settings.</p>
    </div>

    <div v-else class="settings-grid">
      <div 
        v-for="(group, categoryName) in groupedSettings" 
        :key="categoryName" 
        class="setting-category"
      >
        <h4>{{ categoryName }}</h4>
        
        <div class="category-fields">
          <div 
            v-for="def in group" 
            :key="def.id" 
            class="setting-field"
          >
            <label :for="'setting-' + def.id">
              {{ def.name }}
              <span v-if="def.unit" class="unit">({{ def.unit }})</span>
            </label>

            <!-- Enum Input -->
            <select 
              v-if="def.data_type === 'enum' || isCustomDropdown(def.slug)"
              :id="'setting-' + def.id"
              :value="getSettingValue(def.id)"
              @change="e => updateSetting(def.id, (e.target as HTMLSelectElement).value)"
            >
              <option value="">Default / None</option>
              
              <!-- Standard Enums -->
              <template v-if="def.data_type === 'enum'">
                <option 
                  v-for="opt in def.enum_values" 
                  :key="opt.id" 
                  :value="opt.value"
                >
                  {{ opt.display_label }}
                </option>
              </template>

              <!-- Custom Dropdowns -->
              <template v-else>
                <option 
                  v-for="opt in getCustomOptions(def.slug)" 
                  :key="opt.value" 
                  :value="opt.value"
                >
                  {{ opt.label }}
                </option>
              </template>
            </select>

            <!-- Numeric/Integer Input (Fallback) -->
            <input 
              v-else-if="['integer', 'numeric'].includes(def.data_type)"
              :id="'setting-' + def.id"
              type="number"
              :step="def.data_type === 'numeric' ? '0.1' : '1'"
              :value="getSettingValue(def.id)"
              @input="e => updateSetting(def.id, (e.target as HTMLInputElement).value)"
            />

            <!-- Text Input (Fallback) -->
            <input 
              v-else
              :id="'setting-' + def.id"
              type="text"
              :value="getSettingValue(def.id)"
              @input="e => updateSetting(def.id, (e.target as HTMLInputElement).value)"
            />
            
            <small v-if="def.system_notes" class="notes">{{ def.system_notes }}</small>
          </div>        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';

const props = defineProps<{
  systemId: number | string;
  modelValue: any[]; // Array of setting values
}>();

const emit = defineEmits(['update:modelValue']);

const loading = ref(false);
const definitions = ref<any[]>([]);

// Fetch definitions when system changes
watch(() => props.systemId, async (newId) => {
  if (!newId) {
    definitions.value = [];
    return;
  }

  loading.value = true;
  try {
    definitions.value = await $fetch(`/api/systems/${newId}/settings`);
  } catch (e) {
    console.error('Failed to fetch settings:', e);
  } finally {
    loading.value = false;
  }
}, { immediate: true });

// Group definitions by category
const groupedSettings = computed(() => {
  const groups: Record<string, any[]> = {};
  
  definitions.value.forEach(def => {
    const category = def.category_name || 'Other';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(def);
  });

  return groups;
});

// Helper to get current value
const getSettingValue = (defId: number) => {
  const setting = props.modelValue?.find((s: any) => s.setting_definition_id === defId);
  return setting ? setting.value : '';
};

// Helper to update value
const updateSetting = (defId: number, value: string) => {
  const newSettings = [...(props.modelValue || [])];
  const index = newSettings.findIndex((s: any) => s.setting_definition_id === defId);

  if (value === '') {
    // Remove if empty
    if (index !== -1) {
      newSettings.splice(index, 1);
    }
  } else {
    // Update or Add
    if (index !== -1) {
      newSettings[index] = { ...newSettings[index], value };
    } else {
      newSettings.push({ setting_definition_id: defId, value });
    }
  }

  emit('update:modelValue', newSettings);
};

// Custom Dropdown Definitions
const isCustomDropdown = (slug: string) => {
  const customSlugs = [
    'high_iso_nr',
    'highlight_tone',
    'shadow_tone',
    'color',
    'sharpness',
    'clarity',
    'wb_shift_red',
    'wb_shift_blue',
    'exposure_compensation_min',
    'exposure_compensation_max'
  ];
  return customSlugs.includes(slug);
};

const getCustomOptions = (slug: string) => {
  // Integer range -4 to +4
  if (['high_iso_nr', 'color', 'sharpness'].includes(slug)) {
    return Array.from({ length: 9 }, (_, i) => {
      const val = i - 4;
      return { value: val.toString(), label: val > 0 ? `+${val}` : val.toString() };
    });
  }

  // Integer range -9 to +9
  if (['wb_shift_red', 'wb_shift_blue'].includes(slug)) {
    return Array.from({ length: 19 }, (_, i) => {
      const val = i - 9;
      return { value: val.toString(), label: val > 0 ? `+${val}` : val.toString() };
    });
  }

  // Integer range -5 to +5
  if (slug === 'clarity') {
    return Array.from({ length: 11 }, (_, i) => {
      const val = i - 5;
      return { value: val.toString(), label: val > 0 ? `+${val}` : val.toString() };
    });
  }

  // 0.5 steps from -2 to +4
  if (['highlight_tone', 'shadow_tone'].includes(slug)) {
    const options = [];
    for (let i = -2; i <= 4; i += 0.5) {
      options.push({ 
        value: i.toString(), 
        label: i > 0 ? `+${i}` : i.toString() 
      });
    }
    return options;
  }

  // Exposure Compensation (-3 to +3 in 1/3 steps)
  if (['exposure_compensation_min', 'exposure_compensation_max'].includes(slug)) {
    const options = [];
    for (let i = -9; i <= 9; i++) {
        const val = i / 3;
        // Format label nicely (e.g. -2 2/3)
        let label = '';
        const whole = Math.trunc(val);
        const remainder = Math.abs(i % 3);

        if (remainder === 0) {
            label = whole > 0 ? `+${whole}` : whole.toString();
        } else {
            const sign = i < 0 ? '-' : '+';
            const absWhole = Math.abs(whole);
            const fraction = remainder === 1 ? '1/3' : '2/3';
            label = absWhole === 0 ? `${sign}${fraction}` : `${sign}${absWhole} ${fraction}`;
        }
        
        // Value stored as decimal string
        options.push({ value: val.toFixed(2).replace(/\.00$/, ''), label });
    }
    return options.
        sort((a, b) => parseFloat(a.value) - parseFloat(b.value));
  }

  return [];
};
</script>

<style scoped>
.settings-editor {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.loading-state, .empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.settings-grid {
  display: grid;
  gap: 2rem;
}

.setting-category h4 {
  color: var(--color-primary);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0 0 1rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 0.5rem;
}

.category-fields {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.setting-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.8rem;
  color: var(--color-text-light);
  font-weight: 500;
}

.unit {
  color: var(--color-text-muted);
  font-size: 0.75rem;
}

select, input {
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  padding: 0.5rem;
  color: var(--color-text-light);
  font-size: 0.9rem;
  width: 100%;
}

select:focus, input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.notes {
  font-size: 0.7rem;
  color: var(--color-text-muted);
  font-style: italic;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
