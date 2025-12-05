<template>
  <AdminLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Camera Systems</h1>
          <p class="subtitle">Manage camera manufacturers and systems</p>
        </div>
        <NuxtLink to="/systems/create" class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          Create System
        </NuxtLink>
      </div>

      <!-- Systems List -->
      <div class="systems-list">
        <div v-if="pending" class="loading-state">
          <span class="material-symbols-outlined spin">progress_activity</span>
          Loading systems...
        </div>

        <div v-else-if="error" class="error-state">
          <span class="material-symbols-outlined">error</span>
          Failed to load systems
        </div>

        <div v-else-if="systems.length === 0" class="empty-state">
          <span class="material-symbols-outlined">photo_camera</span>
          No systems found
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Manufacturer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="system in systems" :key="system.id">
              <td class="font-medium">{{ system.name }}</td>
              <td>{{ system.manufacturer }}</td>
              <td>
                <span :class="['status-badge', system.is_active ? 'active' : 'inactive']">
                  {{ system.is_active ? 'Active' : 'Inactive' }}
                </span>
              </td>
              <td class="actions-cell">
                <NuxtLink :to="`/systems/${system.id}`" class="btn-icon" title="Edit">
                  <span class="material-symbols-outlined">edit</span>
                </NuxtLink>
                <button @click="confirmDelete(system)" class="btn-icon delete" title="Delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import type { CameraSystem } from '~/core/types/database';

const { data: systems, pending, error, refresh } = await useFetch<CameraSystem[]>('/api/systems', {
  key: 'systems-list'
});

const confirmDelete = async (system: CameraSystem) => {
  if (!confirm(`Are you sure you want to delete ${system.name}?`)) return;

  try {
    await $fetch(`/api/systems/${system.id}`, { method: 'DELETE' });
    if (systems.value) {
      systems.value = systems.value.filter((s: CameraSystem) => s.id !== system.id);
    }
  } catch (e: any) {
    alert(e.data?.message || 'Failed to delete system');
  }
};
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-light);
}

.subtitle {
  margin: 0;
  color: var(--color-text-muted);
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: background-color 0.2s;
}

.btn-primary:hover {
  background: #ff4d9e;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.data-table th,
.data-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.data-table th {
  background: rgba(0, 0, 0, 0.3);
  font-weight: 600;
  color: var(--color-text-muted);
  text-transform: uppercase;
  font-size: 0.75rem;
  letter-spacing: 0.05em;
}

.data-table td {
  color: var(--color-text-light);
}

.font-medium {
  font-weight: 500;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-badge.active {
  background: rgba(46, 204, 113, 0.15);
  color: #2ecc71;
}

.status-badge.inactive {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-muted);
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: transparent;
  color: var(--color-text-muted);
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
}

.btn-icon.delete:hover {
  background: rgba(231, 76, 60, 0.15);
  border-color: #e74c3c;
  color: #e74c3c;
}

.loading-state, .error-state, .empty-state {
  padding: 4rem;
  text-align: center;
  color: var(--color-text-muted);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
  font-size: 32px;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
