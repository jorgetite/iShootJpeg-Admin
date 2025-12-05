<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumbs">
          <NuxtLink to="/sensors" class="breadcrumb-link">Sensors</NuxtLink>
          <span class="separator">/</span>
          <span class="current">Edit</span>
        </div>
        <h1 class="page-title">Edit Sensor</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading sensor details...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
         <p>Failed to load data</p>
         <button @click="refresh" class="btn btn-secondary">Retry</button>
      </div>

      <SensorForm
        v-else
        :initial-data="sensor"
        :is-edit="true"
        :loading="saving"
        @submit="handleUpdate"
        @cancel="navigateTo('/sensors')"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import SensorForm from '~/components/sensors/SensorForm.vue';
import type { Sensor } from '~/core/types/database';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;
const saving = ref(false);

const { 
  data: sensor, 
  pending: loading, 
  error,
  refresh 
} = await useFetch<Sensor>(`/api/sensors/${id}`);

const handleUpdate = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch(`/api/sensors/${id}`, {
      method: 'PUT',
      body: formData
    });
    router.push('/sensors');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to update sensor');
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
  max-width: 800px;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem;
  color: var(--color-text-muted);
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
