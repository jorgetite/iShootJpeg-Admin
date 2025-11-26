<template>
  <AdminLayout>
    <div class="create-recipe-page">
      <header class="page-header">
        <h1>Create New Recipe</h1>
      </header>

      <div class="content-wrapper">
        <RecipeForm 
          :loading="loading"
          @submit="handleSubmit"
          @cancel="handleCancel"
        />
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import RecipeForm from '~/components/recipes/RecipeForm.vue';

const router = useRouter();
const loading = ref(false);

const handleSubmit = async (formData: any) => {
  loading.value = true;
  try {
    await $fetch('/api/recipes', {
      method: 'POST',
      body: formData
    });
    router.push('/recipes');
  } catch (e) {
    console.error('Failed to create recipe:', e);
    alert('Failed to create recipe');
  } finally {
    loading.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.create-recipe-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}
</style>
