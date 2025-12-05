<template>
  <AdminLayout>
    <div class="page-container">
      <div class="page-header">
        <h1>Create Tag</h1>
      </div>

      <div class="content-card">
        <TagForm 
          :loading="loading"
          @submit="handleCreate"
          @cancel="navigateTo('/tags')"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import TagForm from '~/components/tags/TagForm.vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';

const loading = ref(false);

const router = useRouter();

const handleCreate = async (formData: any) => {
  loading.value = true;
  try {
    await $fetch('/api/tags', {
      method: 'POST',
      body: formData
    });
    await router.push('/tags');
  } catch (error: any) {
    alert(error.data?.message || 'Failed to create tag');
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
}

.content-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
}
</style>
