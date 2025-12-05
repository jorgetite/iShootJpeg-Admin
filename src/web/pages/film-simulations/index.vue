<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">Film Simulations</h1>
        <p class="page-subtitle">Manage available film simulations.</p>
      </div>
      <div class="header-actions">
        <div class="filter-group">
            <select v-model="selectedSystem" class="form-select">
                <option :value="undefined">All Systems</option>
                <option v-for="system in systems" :key="system.id" :value="system.id">
                    {{ system.manufacturer }} {{ system.name }}
                </option>
            </select>
        </div>
        <NuxtLink to="/film-simulations/create" class="btn btn-primary">
            <span class="material-symbols-outlined">add</span>
            New Simulation
        </NuxtLink>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-state">
      <span class="material-symbols-outlined error-icon">error</span>
      <h3>Failed to load simulations</h3>
      <p>{{ error.message }}</p>
      <button @click="refresh" class="btn btn-secondary">Retry</button>
    </div>

    <!-- Loading State -->
    <div v-else-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading simulations...</p>
    </div>

    <!-- Empty State -->
    <div v-else-if="!simulations?.length" class="empty-state">
      <div class="empty-icon">
        <span class="material-symbols-outlined">palette</span>
      </div>
      <h3>No Simulations Found</h3>
      <p>Get started by creating your first film simulation.</p>
      <NuxtLink to="/film-simulations/create" class="btn btn-primary">Create Simulation</NuxtLink>
    </div>

    <!-- Data Grid -->
    <div v-else class="sims-grid">
      <div v-for="sim in simulations" :key="sim.id" class="sim-card">
        <div class="card-header">
          <div class="header-main">
            <h3 class="sim-name">{{ sim.name }}</h3>
            <span class="sim-label">{{ sim.system_name }} {{ sim.label }}</span>
          </div>
          <div class="actions">
            <NuxtLink :to="`/film-simulations/${sim.id}`" class="btn-icon edit" title="Edit">
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button class="btn-icon delete" title="Delete" @click="handleDelete(sim.id)">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
        
        <div class="card-body">
             <div class="status-badge" :class="{ active: sim.is_active, inactive: !sim.is_active }">
                {{ sim.is_active ? 'Active' : 'Inactive' }}
            </div>
          <p v-if="sim.description" class="description">{{ sim.description }}</p>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import type { FilmSimulation, CameraSystem } from '~/core/types/database';

const selectedSystem = ref<number | undefined>(undefined);

// Fetch systems for filter
const { data: systems } = await useFetch<CameraSystem[]>('/api/systems');

// Fetch simulations with reactive query
const { data: simulations, pending: loading, error, refresh } = await useFetch<FilmSimulation[]>('/api/film-simulations', {
    query: { system_id: selectedSystem },
    watch: [selectedSystem]
});

const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this film simulation? This action cannot be undone.')) return;

  try {
    await $fetch(`/api/film-simulations/${id}`, { method: 'DELETE' });
    
    // Optimistic update
    if (simulations.value) {
      simulations.value = simulations.value.filter(s => s.id !== id);
    }
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete simulation');
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

.header-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.form-select {
    padding: 0.625rem 2.5rem 0.625rem 1rem; /* Extra right padding for arrow */
    background: var(--color-surface-dark);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: var(--color-text-light);
    font-size: 0.9375rem;
    cursor: pointer;
    outline: none;
    appearance: none; /* Remove default arrow */
    background-image: url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23FFFFFF%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E");
    background-repeat: no-repeat;
    background-position: right 0.7rem top 50%;
    background-size: 0.65em auto;
    transition: border-color 0.2s;
    min-width: 200px;
}

.form-select:hover, .form-select:focus {
    border-color: var(--color-primary);
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

.sims-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.sim-card {
  background: var(--color-surface-dark);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1.5rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.sim-card:hover {
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
  gap: 0.25rem;
}

.sim-name {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-text-light);
  margin: 0;
}

.sim-label {
    font-size: 0.875rem;
    color: var(--color-text-muted);
    letter-spacing: 0.05em;
    text-transform: uppercase;
}

.actions {
  display: flex;
  gap: 0.25rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.sim-card:hover .actions {
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

.status-badge {
    display: inline-block;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-size: 0.75rem;
    font-weight: 600;
    margin-bottom: 0.75rem;
}

.status-badge.active {
    background: rgba(var(--color-primary-rgb), 0.15);
    color: var(--color-primary);
}

.status-badge.inactive {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text-muted);
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
