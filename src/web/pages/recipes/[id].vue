<template>
  <AdminLayout>
    <div class="edit-recipe-page">
      <header class="page-header">
        <h1>Edit Recipe</h1>
      </header>

      <div v-if="pending" class="loading">
        <span class="material-symbols-outlined spin">progress_activity</span>
        <p>Loading recipe...</p>
      </div>

      <div v-else-if="error" class="error">
        <span class="material-symbols-outlined">error</span>
        <p>Failed to load recipe</p>
        <button class="btn btn-secondary" @click="router.back()">Go Back</button>
      </div>

      <div v-else class="content-wrapper">
        <RecipeForm 
          :initial-data="recipe"
          :is-editing="true"
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
import { useRoute, useRouter } from 'vue-router';
import AdminLayout from '~/components/layout/AdminLayout.vue';
import RecipeForm from '~/components/recipes/RecipeForm.vue';

const route = useRoute();
const router = useRouter();
const recipeId = route.params.id;
const saving = ref(false);

// Fetch recipe data
const { data: recipe, pending, error } = await useFetch(`/api/recipes/${recipeId}`);

const handleSubmit = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch(`/api/recipes/${recipeId}`, {
      method: 'PUT',
      body: formData
    });
    router.push('/recipes');
  } catch (e) {
    console.error('Failed to update recipe:', e);
    alert('Failed to update recipe');
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped>
.edit-recipe-page {
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

.loading, .error {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  text-align: center;
}

.loading .material-symbols-outlined,
.error .material-symbols-outlined {
  font-size: 48px;
  margin-bottom: 1rem;
}

.error .material-symbols-outlined {
  color: var(--color-danger);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
