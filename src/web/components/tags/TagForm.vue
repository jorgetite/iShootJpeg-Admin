<template>
  <form @submit.prevent="handleSubmit" class="tag-form">
    <!-- Name -->
    <div class="form-group">
      <label for="name">Name *</label>
      <input 
        id="name" 
        v-model="form.name" 
        type="text" 
        required 
        placeholder="Enter tag name"
      />
    </div>

    <!-- Slug (Auto-generated but editable) -->
    <div class="form-group">
      <label for="slug">Slug</label>
      <input 
        id="slug" 
        v-model="form.slug" 
        type="text" 
        placeholder="tag-name-slug"
      />
      <small class="help-text">Leave empty to auto-generate from name</small>
    </div>

    <!-- Category -->
    <div class="form-group">
      <label for="category">Category</label>
      <select id="category" v-model="form.category">
        <option value="">Select Category</option>
        <option value="subject">Subject</option>
        <option value="mood">Mood</option>
        <option value="technique">Technique</option>
        <option value="season">Season</option>
        <option value="other">Other</option>
      </select>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="material-symbols-outlined spin">progress_activity</span>
        <span v-else class="material-symbols-outlined">save</span>
        {{ isEdit ? 'Update Tag' : 'Create Tag' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{
  initialData?: any;
  isEdit?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

const form = ref({
  name: '',
  slug: '',
  category: '',
  ...props.initialData
});

// Auto-generate slug from name if empty
watch(() => form.value.name, (newName) => {
  if (!props.isEdit && !form.value.slug && newName) {
    form.value.slug = newName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }
});

const handleSubmit = () => {
  emit('submit', form.value);
};
</script>

<style scoped>
.tag-form {
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
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
}

input, select {
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text-light);
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.help-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
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
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #ff69b4;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
