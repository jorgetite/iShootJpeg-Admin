<template>
  <form @submit.prevent="handleSubmit" class="recipe-form">
    <!-- Basic Info Section -->
    <div class="form-section">
      <h3>Basic Information</h3>
      
      <div class="form-group">
        <label for="name">Recipe Name *</label>
        <input 
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="e.g. Kodachrome 64"
          @input="generateSlug"
        />
      </div>

      <div class="form-group">
        <label for="slug">Slug *</label>
        <input 
          id="slug"
          v-model="form.slug"
          type="text"
          required
          placeholder="e.g. kodachrome-64"
        />
      </div>

      <div class="form-group">
        <label for="author">Author *</label>
        <select id="author" v-model="form.author_id" required>
          <option value="" disabled>Select Author</option>
          <option v-for="author in options.authors" :key="author.id" :value="author.id">
            {{ author.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label for="description">Description</label>
        <textarea 
          id="description"
          v-model="form.description"
          rows="3"
          placeholder="Brief description of the recipe..."
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="publish_date">Publish Date</label>
          <input 
            id="publish_date"
            v-model="form.publish_date"
            type="date"
          />
        </div>

        <div class="form-group checkbox-group">
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.is_featured" />
            Featured Recipe
          </label>
          <label class="checkbox-label">
            <input type="checkbox" v-model="form.is_active" />
            Active
          </label>
        </div>
      </div>
    </div>

    <!-- Technical Details Section -->
    <div class="form-section">
      <h3>Technical Details</h3>

      <div class="form-row">
        <div class="form-group">
          <label for="system">Camera System *</label>
          <select id="system" v-model="form.system_id" required>
            <option value="" disabled>Select System</option>
            <option v-for="system in options.systems" :key="system.id" :value="system.id">
              {{ system.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="camera_model">Camera Model</label>
          <select id="camera_model" v-model="form.camera_model_id" :disabled="!form.system_id">
            <option :value="null">Any / All Models</option>
            <option v-for="model in filteredModels" :key="model.id" :value="model.id">
              {{ model.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label for="sensor">Sensor</label>
          <select id="sensor" v-model="form.sensor_id">
            <option :value="null">None / Any</option>
            <option v-for="sensor in options.sensors" :key="sensor.id" :value="sensor.id">
              {{ sensor.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label for="film_simulation">Film Simulation *</label>
          <select id="film_simulation" v-model="form.film_simulation_id" required>
            <option value="" disabled>Select Simulation</option>
            <option 
              v-for="sim in filteredSimulations" 
              :key="sim.id" 
              :value="sim.id"
            >
              {{ sim.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="form-group">
        <label for="style_category">Style Category</label>
        <select id="style_category" v-model="form.style_category_id">
          <option :value="null">None</option>
          <option v-for="style in options.styleCategories" :key="style.id" :value="style.id">
            {{ style.name }}
          </option>
        </select>
      </div>
    </div>

    <!-- Attribution Section -->
    <div class="form-section">
      <h3>Attribution</h3>
      
      <div class="form-row">
        <div class="form-group">
          <label for="source_type">Source Type</label>
          <select id="source_type" v-model="form.source_type">
            <option :value="null">None</option>
            <option value="original">Original</option>
            <option value="curated">Curated</option>
            <option value="community">Community</option>
          </select>
        </div>

        <div class="form-group">
          <label for="source_url">Source URL</label>
          <input 
            id="source_url"
            v-model="form.source_url"
            type="url"
            placeholder="https://..."
          />
        </div>
      </div>
    </div>

    <!-- Settings Editor Section -->
    <div class="form-section">
      <h3>Recipe Settings</h3>
      <RecipeSettingsEditor
        :system-id="form.system_id"
        v-model="form.settings"
      />
    </div>

    <!-- Actions -->
    <div class="form-actions">
      <button type="button" class="btn btn-secondary" @click="$emit('cancel')">
        Cancel
      </button>
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="material-symbols-outlined spin">progress_activity</span>
        {{ isEditing ? 'Update Recipe' : 'Create Recipe' }}
      </button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Author, CameraSystem, Sensor, FilmSimulation, StyleCategory, CameraModel } from '~/../core/types/database';
import RecipeSettingsEditor from './RecipeSettingsEditor.vue';

const props = defineProps<{
  initialData?: any;
  isEditing?: boolean;
  loading?: boolean;
}>();

const emit = defineEmits(['submit', 'cancel']);

// Form State
const form = ref({
  name: '',
  slug: '',
  author_id: '',
  system_id: '',
  camera_model_id: null,
  sensor_id: null,
  film_simulation_id: '',
  style_category_id: null,
  description: '',
  source_url: '',
  source_type: null,
  publish_date: new Date().toISOString().split('T')[0],
  is_featured: false,
  is_active: true,
  settings: [],
  ranges: [],
  ...props.initialData
});

// Handle date format for edit mode
if (props.initialData?.publish_date) {
  form.value.publish_date = new Date(props.initialData.publish_date).toISOString().split('T')[0];
}

// Options State
interface FormOptions {
  authors: Pick<Author, 'id' | 'name'>[];
  systems: Pick<CameraSystem, 'id' | 'name'>[];
  sensors: Pick<Sensor, 'id' | 'name'>[];
  filmSimulations: Pick<FilmSimulation, 'id' | 'name' | 'system_id'>[];
  styleCategories: Pick<StyleCategory, 'id' | 'name'>[];
  cameraModels: Pick<CameraModel, 'id' | 'name' | 'system_id'>[];
}

const options = ref<FormOptions>({
  authors: [],
  systems: [],
  sensors: [],
  filmSimulations: [],
  styleCategories: [],
  cameraModels: []
});

// Fetch Options
onMounted(async () => {
  try {
    const data = await $fetch<FormOptions>('/api/options');
    options.value = data;
  } catch (e) {
    console.error('Failed to fetch options:', e);
  }
});

// Computed
const filteredSimulations = computed(() => {
  if (!form.value.system_id) return [];
  return options.value.filmSimulations.filter(
    (s) => s.system_id === Number(form.value.system_id)
  );
});

const filteredModels = computed(() => {
  if (!form.value.system_id) return [];
  return options.value.cameraModels.filter(
    (m) => m.system_id === Number(form.value.system_id)
  );
});

// Methods
const generateSlug = () => {
  if (!props.isEditing) {
    form.value.slug = form.value.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
  }
};

const handleSubmit = () => {
  emit('submit', form.value);
};
</script>

<style scoped>
.recipe-form {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  max-width: 800px;
}

.form-section {
  background: var(--color-surface-dark);
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.form-section h3 {
  margin: 0 0 1.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-primary);
}

.form-group {
  margin-bottom: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-text-light);
}

input, select, textarea {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 0.75rem;
  color: var(--color-text-light);
  font-family: inherit;
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: var(--color-primary);
}

input:disabled, select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.checkbox-group {
  flex-direction: row;
  gap: 2rem;
  align-items: center;
  height: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
  font-size: 1.25rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
