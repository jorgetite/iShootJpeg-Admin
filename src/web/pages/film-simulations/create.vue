<template>
  <AdminLayout>
    <div class="page-header">
      <div class="header-content">
        <div class="breadcrumbs">
          <NuxtLink to="/film-simulations" class="breadcrumb-link">Film Simulations</NuxtLink>
          <span class="separator">/</span>
          <span class="current">Create</span>
        </div>
        <h1 class="page-title">Create Film Simulation</h1>
      </div>
    </div>

    <div class="content-wrapper">
      <FilmSimulationForm
        :loading="saving"
        @submit="handleCreate"
        @cancel="navigateTo('/film-simulations')"
      />
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import FilmSimulationForm from '~/components/film-simulations/FilmSimulationForm.vue';

const router = useRouter();
const saving = ref(false);

const handleCreate = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch('/api/film-simulations', {
      method: 'POST',
      body: formData
    });
    router.push('/film-simulations');
  } catch (e: any) {
    alert(e.data?.message || 'Failed to create simulation');
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
</style>
