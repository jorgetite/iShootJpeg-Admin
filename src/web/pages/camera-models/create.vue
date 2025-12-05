<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumbs">
          <NuxtLink to="/camera-models" class="breadcrumb-link">Camera Models</NuxtLink>
          <span class="separator">/</span>
          <span class="current">Create</span>
        </div>
        <h1 class="page-title">Create Camera Model</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <div v-if="loadingDependencies" class="loading-state">
        <span class="material-symbols-outlined spin">progress_activity</span>
        <p>Loading form dependencies...</p>
      </div>
      
      <div v-else-if="dependencyError" class="error-state">
         <p>Failed to load form dependencies</p>
         <button @click="refreshDependencies" class="btn btn-secondary">Retry</button>
      </div>

      <CameraModelForm
        v-else
        :loading="saving"
        :systems="systems"
        :sensors="sensors"
        @submit="handleCreate"
        @cancel="navigateTo('/camera-models')"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import CameraModelForm from '~/components/camera-models/CameraModelForm.vue';
import type { CameraSystem, Sensor } from '~/core/types/database';

const router = useRouter();
const saving = ref(false);

// Fetch dependencies
const { 
  data: systems, 
  pending: loadingSystems, 
  error: systemsError,
  refresh: refreshSystems 
} = await useFetch<CameraSystem[]>('/api/systems', { key: 'systems-dropdown' });

const { 
  data: sensors, 
  pending: loadingSensors, 
  error: sensorsError,
  refresh: refreshSensors 
} = await useFetch<Sensor[]>('/api/sensors', { key: 'sensors-dropdown' });

const loadingDependencies = computed(() => loadingSystems.value || loadingSensors.value);
const dependencyError = computed(() => systemsError.value || sensorsError.value);

const refreshDependencies = () => {
  refreshSystems();
  refreshSensors();
};

const handleCreate = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch('/api/camera-models', {
      method: 'POST',
      body: formData
    });
    router.push('/camera-models');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to create camera model');
  } finally {
    saving.value = false;
  }
};
</script>

<style scoped>
.page-header {
  margin-bottom: 2rem;
}

.breadcrumbs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.breadcrumb-link {
  color: var(--color-text-muted);
  text-decoration: none;
}

.breadcrumb-link:hover {
  color: var(--color-primary);
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-text-light);
  margin: 0;
}

.content-wrapper {
  background: var(--color-surface-dark);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
  max-width: 800px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: var(--color-text-muted);
}

.spin {
  animation: spin 1s linear infinite;
  margin-bottom: 0.5rem;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-text-light);
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  margin-top: 1rem;
}
</style>
