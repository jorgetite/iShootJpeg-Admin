<template>
  <AdminLayout>
    <div class="edit-author-page">
      <header class="page-header">
        <div class="header-content">
          <h1>Edit Author</h1>
          <p class="subtitle">Update author details</p>
        </div>
      </header>

      <div v-if="pending" class="loading">
        <span class="material-symbols-outlined spin">progress_activity</span>
        <p>Loading author...</p>
      </div>

      <div v-else-if="error" class="error">
        <span class="material-symbols-outlined">error</span>
        <p>Failed to load author</p>
        <button class="btn btn-secondary" @click="router.push('/authors')">
          Back to Authors
        </button>
      </div>

      <div v-else class="content-card">
        <AuthorForm 
          :initial-data="author"
          :is-edit="true"
          :loading="saving" 
          @submit="handleSubmit" 
          @cancel="handleCancel" 
        />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import AuthorForm from '~/components/authors/AuthorForm.vue';

const route = useRoute();
const router = useRouter();
const authorId = route.params.id;
const saving = ref(false);

// Fetch author data
const { data: authorData, pending, error } = await useFetch(`/api/authors/${authorId}`);
const author = computed(() => authorData.value?.data);

const handleSubmit = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch(`/api/authors/${authorId}`, {
      method: 'PUT',
      body: formData
    });
    router.push('/authors');
  } catch (e) {
    console.error('Failed to update author:', e);
    alert('Failed to update author');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push('/authors');
};
</script>

<style scoped>
.edit-author-page {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-light);
}

.subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.9375rem;
}

.content-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 2rem;
}

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading .material-symbols-outlined {
  font-size: 48px;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.error .material-symbols-outlined {
  font-size: 48px;
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-secondary {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 8px;
  color: var(--color-text-light);
  cursor: pointer;
}
</style>
