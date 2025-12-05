<template>
  <form @submit.prevent="handleSubmit" class="model-form">
    <!-- Name -->
    <div class="form-group">
      <label for="name">Model Name</label>
      <input
        id="name"
        v-model="formData.name"
        type="text"
        required
        placeholder="e.g., X100VI"
        class="form-control"
      />
    </div>

    <!-- System -->
    <div class="form-group">
      <label for="system">Camera System</label>
      <select
        id="system"
        v-model="formData.system_id"
        required
        class="form-control"
      >
        <option value="" disabled>Select a system</option>
        <option v-for="system in systems" :key="system.id" :value="system.id">
          {{ system.name }} ({{ system.manufacturer }})
        </option>
      </select>
    </div>

    <!-- Sensor -->
    <div class="form-group">
      <label for="sensor">Sensor</label>
      <select
        id="sensor"
        v-model="formData.sensor_id"
        class="form-control"
      >
        <option :value="null">None / Unknown</option>
        <option v-for="sensor in sensors" :key="sensor.id" :value="sensor.id">
          {{ sensor.name }} ({{ sensor.type }})
        </option>
      </select>
    </div>

    <!-- Release Year -->
    <div class="form-group">
      <label for="release_year">Release Year</label>
      <input
        id="release_year"
        v-model.number="formData.release_year"
        type="number"
        min="2000"
        max="2100"
        placeholder="e.g., 2024"
        class="form-control"
      />
    </div>

    <!-- Active Status -->
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input
          type="checkbox"
          v-model="formData.is_active"
        />
        <span class="checkbox-text">Active</span>
      </label>
      <p class="help-text">Inactive models won't be available for new recipes</p>
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button
        type="button"
        class="btn btn-secondary"
        @click="$emit('cancel')"
      >
        Cancel
      </button>
      <button
        type="submit"
        class="btn btn-primary"
        :disabled="loading"
      >
        <span v-if="loading" class="material-symbols-outlined spin">progress_activity</span>
        {{ isEdit ? 'Update Model' : 'Create Model' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { CameraModel, CameraSystem, Sensor } from '~/core/types/database';

const props = defineProps<{
  initialData?: CameraModel;
  isEdit?: boolean;
  loading?: boolean;
  systems: CameraSystem[];
  sensors: Sensor[];
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const formData = reactive({
  name: '',
  system_id: '' as number | '',
  sensor_id: null as number | null,
  release_year: null as number | null,
  is_active: true
});

onMounted(() => {
  if (props.initialData) {
    formData.name = props.initialData.name;
    formData.system_id = props.initialData.system_id;
    formData.sensor_id = props.initialData.sensor_id;
    formData.release_year = props.initialData.release_year;
    formData.is_active = props.initialData.is_active;
  }
});

const handleSubmit = () => {
  emit('submit', { ...formData });
};
</script>

<style scoped>
.model-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 600px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-weight: 500;
  color: var(--color-text-light);
}

.form-control {
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--color-text-light);
  font-size: 1rem;
}

.form-control:focus {
  outline: none;
  border-color: var(--color-primary);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.help-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.btn {
  padding: 0.75rem 1.5rem;
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
  background: #ff4d9e;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.spin {
  animation: spin 1s linear infinite;
  font-size: 20px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
