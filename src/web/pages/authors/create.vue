<template>
  <AdminLayout>
    <div class="create-author-page">
      <header class="page-header">
        <div class="header-content">
          <h1>Create Author</h1>
          <p class="subtitle">Add a new recipe creator</p>
        </div>
      </header>

      <div class="content-card">
        <AuthorForm 
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

const router = useRouter();
const saving = ref(false);

const handleSubmit = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch('/api/authors', {
      method: 'POST',
      body: formData
    });
    router.push('/authors');
  } catch (e) {
    console.error('Failed to create author:', e);
    alert('Failed to create author');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.push('/authors');
};
</script>

<style scoped>
.create-author-page {
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
</style>
