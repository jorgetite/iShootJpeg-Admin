<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Camera Models</h1>
        <p class="page-subtitle">Manage camera models, sensors, and specifications</p>
      </div>
      <div class="header-actions">
        <div class="filters">
            <select v-model="selectedSystem" class="form-select">
                <option :value="undefined">All Systems</option>
                <option v-for="system in systems" :key="system.id" :value="system.id">
                    {{ system.manufacturer }} {{ system.name }}
                </option>
            </select>
            <select v-model="selectedSensor" class="form-select">
                <option :value="undefined">All Sensors</option>
                <option v-for="sensor in sensors" :key="sensor.id" :value="sensor.id">
                    {{ sensor.type }} - {{ sensor.name }}
                </option>
            </select>
        </div>
        <NuxtLink to="/camera-models/create" class="btn btn-primary">
            <span class="material-symbols-outlined">add</span>
            Add Model
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="loading-state">
      <span class="material-symbols-outlined spin">progress_activity</span>
      <p>Loading models...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <span class="material-symbols-outlined">error</span>
      <p>{{ error.message || 'Failed to load camera models' }}</p>
      <button @click="refresh" class="btn btn-secondary">Retry</button>
    </div>

    <!-- Empty State -->
    <div v-else-if="!models.length" class="empty-state">
      <span class="material-symbols-outlined">camera</span>
      <h3>No Camera Models Found</h3>
      <p v-if="selectedSystem || selectedSensor">Try adjusting your filters.</p>
      <div v-else>
          <p>Get started by adding your first camera model.</p>
          <NuxtLink to="/camera-models/create" class="btn btn-primary">
            Create Model
          </NuxtLink>
      </div>
    </div>

    <!-- Models List -->
    <div v-else class="models-grid">
      <div v-for="model in models" :key="model.id" class="model-card">
        <div class="model-header">
          <div class="model-info">
            <h3 class="model-name">{{ model.name }}</h3>
            <span class="system-badge">{{ model.system_name }}</span>
          </div>
          <div class="model-actions">
            <NuxtLink :to="`/camera-models/${model.id}`" class="btn-icon" title="Edit">
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button @click="confirmDelete(model)" class="btn-icon delete" title="Delete">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>

        <div class="model-details">
          <div class="detail-item">
            <span class="label">Sensor</span>
            <span class="value">{{ model.sensor_name || 'Unknown' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Release Year</span>
            <span class="value">{{ model.release_year || '-' }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Status</span>
            <span :class="['status-badge', model.is_active ? 'active' : 'inactive']">
              {{ model.is_active ? 'Active' : 'Inactive' }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import type { CameraModel, CameraSystem, Sensor } from '~/core/types/database';

// Extended type to include joined fields
type CameraModelWithRelations = CameraModel & { 
  system_name: string; 
  manufacturer: string; 
  sensor_name: string | null; 
};

// Filter state
const selectedSystem = ref<number | undefined>(undefined);
const selectedSensor = ref<number | undefined>(undefined);

// Fetch filter options
const { data: systems } = await useFetch<CameraSystem[]>('/api/systems');
const { data: sensors } = await useFetch<Sensor[]>('/api/sensors');

// Fetch models with reactive filters
const { data, pending, error, refresh } = await useFetch<CameraModelWithRelations[]>('/api/camera-models', {
  key: 'camera-models-list',
  query: { 
      system_id: selectedSystem,
      sensor_id: selectedSensor
  },
  watch: [selectedSystem, selectedSensor]
});

const models = computed(() => data.value || []);

const confirmDelete = async (model: CameraModelWithRelations) => {
  if (!confirm(`Are you sure you want to delete ${model.name}?`)) return;

  try {
    await $fetch(`/api/camera-models/${model.id}`, { method: 'DELETE' });
    
    // Optimistic update
    if (data.value) {
      data.value = data.value.filter(m => m.id !== model.id);
    }
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete camera model');
  }
};
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-light);
  margin: 0;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
  font-size: 0.875rem;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  text-align: center;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.models-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.model-card {
  background: var(--color-surface-dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, border-color 0.2s;
}

.model-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.2);
}

.model-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.model-name {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.system-badge {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--color-primary);
  background: rgba(242, 128, 182, 0.1);
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  margin-top: 0.25rem;
}

.model-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s, background 0.2s;
}

.btn-icon:hover {
  color: var(--color-text-light);
  background: rgba(255, 255, 255, 0.1);
}

.btn-icon.delete:hover {
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
}

.model-details {
  display: grid;
  gap: 0.75rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.label {
  color: var(--color-text-muted);
}

.value {
  color: var(--color-text-light);
  font-weight: 500;
}

.status-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(74, 222, 128, 0.1);
  color: #4ade80;
}

.status-badge.inactive {
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
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
  text-decoration: none;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background: #ff4d9e;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.filters {
    display: flex;
    gap: 0.75rem;
}

.form-select {
    padding: 0.625rem 2.5rem 0.625rem 1rem;
    background: var(--color-surface-dark);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--color-text-light);
    font-size: 0.9375rem;
    cursor: pointer;
    outline: none;
    appearance: none;
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.7rem top 50%;
    background-size: 0.65em auto;
    transition: border-color 0.2s;
    min-width: 180px;
}

.form-select:hover, .form-select:focus {
    border-color: var(--color-primary);
}
</style>
