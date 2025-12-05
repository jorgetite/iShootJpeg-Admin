<template>
  <AdminLayout>
    <div class="page-container">
      <div class="page-header">
        <h1>Edit Tag</h1>
      </div>

      <div v-if="pending" class="loading-state">
        <span class="material-symbols-outlined spin">progress_activity</span>
        Loading tag...
      </div>

      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined">error</span>
        Failed to load tag
        <button class="btn btn-secondary" @click="navigateTo('/tags')">
          Back to List
        </button>
      </div>

      <div v-else class="content-card">
        <TagForm 
          :initial-data="tag"
          :is-edit="true"
          :loading="saving"
          @submit="handleUpdate"
          @cancel="navigateTo('/tags')"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import TagForm from '~/components/tags/TagForm.vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';

const route = useRoute();
const id = route.params.id;
const saving = ref(false);

const { data: tag, pending, error } = await useFetch(`/api/tags/${id}`);

const handleUpdate = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch(`/api/tags/${id}`, {
      method: 'PUT',
      body: formData
    });
    navigateTo('/tags');
  } catch (error: any) {
    alert(error.data?.message || 'Failed to update tag');
  } finally {
    saving.value = false;
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
}

.content-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
}

.loading-state, .error-state {
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
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: var(--color-text-light);
  cursor: pointer;
}
</style>
