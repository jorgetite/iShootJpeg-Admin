<template>
  <form @submit.prevent="handleSubmit" class="sensor-form">
    <!-- Form Header -->
    <div class="form-header">
      <h2 class="form-title">{{ isEdit ? 'Edit Sensor' : 'Create Sensor' }}</h2>
      <div class="form-actions">
        <button type="button" class="btn btn-secondary" @click="$emit('cancel')">Cancel</button>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <span v-if="loading" class="material-symbols-outlined spin">progress_activity</span>
          {{ isEdit ? 'Save Changes' : 'Create Sensor' }}
        </button>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="error" class="alert alert-error">
      <span class="material-symbols-outlined">error</span>
      {{ error }}
    </div>

    <div class="form-grid">
      <!-- Name -->
      <div class="form-group">
        <label for="name">Sensor Name *</label>
        <input 
          id="name" 
          v-model="formData.name" 
          type="text" 
          required
          placeholder="e.g. X-Trans IV"
          class="form-control"
        />
        <small class="form-hint">The specific name of the sensor version.</small>
      </div>

      <!-- Type -->
      <div class="form-group">
        <label for="type">Sensor Type *</label>
        <div class="input-with-datalist">
          <input 
            id="type" 
            v-model="formData.type" 
            type="text" 
            list="sensor-types"
            required
            placeholder="e.g. X-Trans"
            class="form-control"
          />
          <datalist id="sensor-types">
            <option value="X-Trans"></option>
            <option value="Bayer"></option>
            <option value="Bayer CMOS"></option>
            <option value="GFX Bayer"></option>
          </datalist>
        </div>
        <small class="form-hint">The technology family (X-Trans, Bayer, etc).</small>
      </div>

      <!-- Megapixels -->
      <div class="form-group">
        <label for="megapixels">Megapixels</label>
        <input 
          id="megapixels" 
          v-model="formData.megapixels" 
          type="number" 
          step="0.1"
          min="0"
          placeholder="e.g. 26.1"
          class="form-control"
        />
      </div>

      <!-- Description -->
      <div class="form-group full-width">
        <label for="description">Description</label>
        <textarea 
          id="description" 
          v-model="formData.description" 
          rows="3"
          placeholder="Optional notes about this sensor..."
          class="form-control"
        ></textarea>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { Sensor } from '~/core/types/database';

const props = defineProps<{
  initialData?: Partial<Sensor>;
  isEdit?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const formData = reactive({
  name: '',
  type: '',
  megapixels: null as number | null,
  description: ''
});

const error = ref<string | null>(null);

onMounted(() => {
  if (props.initialData) {
    formData.name = props.initialData.name || '';
    formData.type = props.initialData.type || '';
    formData.megapixels = props.initialData.megapixels ? Number(props.initialData.megapixels) : null;
    formData.description = props.initialData.description || '';
  }
});

const handleSubmit = () => {
  if (!formData.name || !formData.type) {
    error.value = 'Name and Type are required.';
    return;
  }
  emit('submit', { ...formData });
};
</script>

<style scoped>
.sensor-form {
  background: var(--color-surface-dark);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.form-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-text-light);
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 1rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.full-width {
  grid-column: 1 / -1;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: var(--color-text-light);
  font-size: 0.9375rem;
}

.form-control {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--color-text-light);
  font-size: 1rem;
  transition: all 0.2s;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
  background: rgba(0, 0, 0, 0.3);
}

.form-hint {
  font-size: 0.8125rem;
  color: var(--color-text-muted);
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.alert {
  padding: 1rem;
  border-radius: 6px;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.alert-error {
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
