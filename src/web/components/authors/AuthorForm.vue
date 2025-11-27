<template>
  <form @submit.prevent="handleSubmit" class="author-form">
    <!-- Name -->
    <div class="form-group">
      <label for="name">Name *</label>
      <input 
        id="name" 
        v-model="form.name" 
        type="text" 
        required 
        placeholder="Enter author name"
      />
    </div>

    <!-- Slug (Auto-generated but editable) -->
    <div class="form-group">
      <label for="slug">Slug</label>
      <input 
        id="slug" 
        v-model="form.slug" 
        type="text" 
        placeholder="author-name-slug"
      />
      <small class="help-text">Leave empty to auto-generate from name</small>
    </div>

    <!-- Bio -->
    <div class="form-group">
      <label for="bio">Bio</label>
      <textarea 
        id="bio" 
        v-model="form.bio" 
        rows="4" 
        placeholder="Short biography..."
      ></textarea>
    </div>

    <!-- Website URL -->
    <div class="form-group">
      <label for="website_url">Website URL</label>
      <input 
        id="website_url" 
        v-model="form.website_url" 
        type="url" 
        placeholder="https://example.com"
      />
    </div>

    <!-- Social Media -->
    <div class="form-row">
      <div class="form-group">
        <label for="social_platform">Social Platform</label>
        <select id="social_platform" v-model="form.social_platform">
          <option value="">Select Platform</option>
          <option value="instagram">Instagram</option>
          <option value="twitter">Twitter / X</option>
          <option value="youtube">YouTube</option>
          <option value="facebook">Facebook</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div class="form-group">
        <label for="social_handle">Social Handle</label>
        <input 
          id="social_handle" 
          v-model="form.social_handle" 
          type="text" 
          placeholder="@username"
        />
      </div>
    </div>

    <!-- Verified Status -->
    <div class="form-group checkbox-group">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          v-model="form.is_verified" 
        />
        <span class="checkbox-text">Verified Author</span>
      </label>
      <small class="help-text">Mark as verified if this is a trusted contributor</small>
    </div>

    <!-- Form Actions -->
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="material-symbols-outlined spin">progress_activity</span>
        <span v-else class="material-symbols-outlined">save</span>
        {{ isEdit ? 'Update Author' : 'Create Author' }}
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
  bio: '',
  website_url: '',
  social_platform: '',
  social_handle: '',
  is_verified: false,
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
.author-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-width: 800px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
}

input, textarea, select {
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text-light);
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

input:focus, textarea:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
}

.help-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-text {
  font-size: 0.9375rem;
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
