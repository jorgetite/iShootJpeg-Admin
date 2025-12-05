<template>
  <form @submit.prevent="handleSubmit" class="system-form">
    <!-- Name -->
    <div class="form-group">
      <label for="name">System Name</label>
      <input 
        id="name"
        v-model="formData.name"
        type="text"
        required
        placeholder="e.g., Fujifilm X"
        class="form-control"
      />
    </div>

    <!-- Manufacturer -->
    <div class="form-group">
      <label for="manufacturer">Manufacturer</label>
      <input 
        id="manufacturer"
        v-model="formData.manufacturer"
        type="text"
        required
        placeholder="e.g., Fujifilm"
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
      <p class="help-text">Inactive systems won't be available for new recipes</p>
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
        {{ isEdit ? 'Update System' : 'Create System' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import type { CameraSystem } from '~/core/types/database';

const props = defineProps<{
  initialData?: CameraSystem;
  isEdit?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits<{
  (e: 'submit', data: any): void;
  (e: 'cancel'): void;
}>();

const formData = reactive({
  name: '',
  manufacturer: '',
  is_active: true
});

onMounted(() => {
  if (props.initialData) {
    formData.name = props.initialData.name;
    formData.manufacturer = props.initialData.manufacturer;
    formData.is_active = props.initialData.is_active;
  }
});

const handleSubmit = () => {
  emit('submit', { ...formData });
};
</script>

<style scoped>
.system-form {
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
