<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumbs">
          <NuxtLink to="/camera-models" class="breadcrumb-link">Camera Models</NuxtLink>
          <span class="separator">/</span>
          <span class="current">Edit</span>
        </div>
        <h1 class="page-title">Edit Camera Model</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <div v-if="loading" class="loading-state">
        <span class="material-symbols-outlined spin">progress_activity</span>
        <p>Loading model details...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
         <p>Failed to load data</p>
         <button @click="refreshAll" class="btn btn-secondary">Retry</button>
      </div>

      <div v-else class="form-section">
        <CameraModelForm
          :initial-data="model"
          :is-edit="true"
          :loading="saving"
          :systems="systems || []"
          :sensors="sensors || []"
          @submit="handleUpdate"
          @cancel="navigateTo('/camera-models')"
        />
      </div>

      <div v-if="model && model.id" class="form-section settings-section">
        <div class="divider"></div>
        <CameraModelFilmSimulations
          :model-id="model.id"
          :system-id="model.system_id"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import CameraModelForm from '~/components/camera-models/CameraModelForm.vue';
import CameraModelFilmSimulations from '~/components/camera-models/CameraModelFilmSimulations.vue';
import type { CameraModel, CameraSystem, Sensor } from '~/core/types/database';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const saving = ref(false);

// Fetch all necessary data
const { 
  data: model, 
  pending: loadingModel, 
  error: modelError,
  refresh: refreshModel 
} = await useFetch<CameraModel>(`/api/camera-models/${id}`);

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

const loading = computed(() => loadingModel.value || loadingSystems.value || loadingSensors.value);
const error = computed(() => modelError.value || systemsError.value || sensorsError.value);

const refreshAll = () => {
  refreshModel();
  refreshSystems();
  refreshSensors();
};

const handleUpdate = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch(`/api/camera-models/${id}`, {
      method: 'PUT',
      body: formData
    });
    router.push('/camera-models');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to update camera model');
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

.divider {
  height: 1px;
  background: rgba(255, 255, 255, 0.1);
  margin: 2rem 0;
}
</style>
