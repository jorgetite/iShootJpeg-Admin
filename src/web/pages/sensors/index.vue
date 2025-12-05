<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Sensors</h1>
        <p class="page-subtitle">Manage camera sensors and their specifications.</p>
      </div>
      <NuxtLink to="/sensors/create" class="btn btn-primary">
        <span class="material-symbols-outlined">add</span>
        New Sensor
      </NuxtLink>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <span class="material-symbols-outlined error-icon">error</span>
      <h3>Failed to load sensors</h3>
      <p>{{ error.message }}</p>
      <button @click="refresh" class="btn btn-secondary">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading sensors...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!sensors?.length" class="empty-state">
      <div class="empty-icon">
        <span class="material-symbols-outlined">grid_on</span>
      </div>
      <h3>No Sensors Found</h3>
      <p>Get started by creating your first camera sensor definition.</p>
      <NuxtLink to="/sensors/create" class="btn btn-primary">Create Sensor</NuxtLink>
    </div>

    <!-- Data Grid -->
    <div v-else class="sensors-grid">
      <div v-for="sensor in sensors" :key="sensor.id" class="sensor-card">
        <div class="card-header">
          <div class="header-main">
            <h3 class="sensor-name">{{ sensor.name }}</h3>
            <span class="sensor-type-badge">{{ sensor.type }}</span>
          </div>
          <div class="actions">
            <NuxtLink :to="`/sensors/${sensor.id}`" class="btn-icon edit" title="Edit">
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button class="btn-icon delete" title="Delete" @click="handleDelete(sensor.id)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
        
        <div class="card-body">
          <div class="spec-item" v-if="sensor.megapixels">
            <span class="label">Resolution</span>
            <span class="value">{{ sensor.megapixels }} MP</span>
          </div>
          <p v-if="sensor.description" class="description">{{ sensor.description }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import type { Sensor } from '~/core/types/database';

const { data: sensors, pending: loading, error, refresh } = await useFetch<Sensor[]>('/api/sensors');

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this sensor? This action cannot be undone.')) return;

  try {
    await $fetch(`/api/sensors/${id}`, { method: 'DELETE' });
    
    // Optimistic update
    if (sensors.value) {
      sensors.value = sensors.value.filter(s => s.id !== id);
    }
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete sensor');
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
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-light);
  margin: 0;
}

.page-subtitle {
  color: var(--color-text-muted);
  margin: 0.5rem 0 0;
}

.sensors-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.sensor-card {
  background: var(--color-surface-dark);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.sensor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.header-main {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.sensor-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-light);
  margin: 0;
}

.sensor-type-badge {
  display: inline-block;
  font-size: 0.75rem;
  padding: 0.125rem 0.625rem;
  border-radius: 12px;
  background: rgba(var(--color-primary-rgb), 0.15);
  color: var(--color-primary);
  border: 1px solid rgba(var(--color-primary-rgb), 0.25);
  align-self: flex-start;
}

.actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.sensor-card:hover .actions {
  opacity: 1;
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
}

.btn-icon.delete:hover {
  background: rgba(255, 77, 77, 0.1);
  color: #ff4d4d;
}

.spec-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9375rem;
  color: var(--color-text-light);
  margin-bottom: 0.75rem;
}

.label {
  color: var(--color-text-muted);
  font-weight: 500;
}

.description {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Common States */
.loading-state, .error-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  background: var(--color-surface-dark);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.btn {
  padding: 0.625rem 1.25rem;
  border-radius: 8px;
  font-weight: 500;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  filter: brightness(1.1);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
}

.spinner {
  width: 2rem;
  height: 2rem;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
</style>
