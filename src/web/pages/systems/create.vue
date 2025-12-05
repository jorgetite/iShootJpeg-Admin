<template>
  <AdminLayout>
    <div class="page-container">
      <div class="page-header">
        <h1>Create System</h1>
      </div>

      <div class="content-card">
        <SystemForm 
          :loading="loading"
          @submit="handleCreate"
          @cancel="router.push('/systems')"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import SystemForm from '~/components/systems/SystemForm.vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';

const router = useRouter();
const loading = ref(false);

const handleCreate = async (formData: any) => {
  loading.value = true;
  try {
    await $fetch('/api/systems', {
      method: 'POST',
      body: formData
    });
    router.push('/systems');
  } catch (error: any) {
    alert(error.data?.message || 'Failed to create system');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-light);
}

.content-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
}
</style>
