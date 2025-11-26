<template>
  <AdminLayout>
    <div class="recipes-page">
      <header class="page-header">
        <div>
          <h1>Recipes</h1>
          <p class="text-muted">Manage film simulation recipes</p>
        </div>
        <button class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          New Recipe
        </button>
      </header>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-bar">
          <span class="material-symbols-outlined">search</span>
          <input type="text" placeholder="Search recipes..." />
        </div>
        <div class="filter-pills">
          <button class="filter-pill active">All</button>
          <button class="filter-pill">Fujifilm</button>
          <button class="filter-pill">Nikon</button>
          <button class="filter-pill">Canon</button>
          <button class="filter-pill">Sony</button>
        </div>
      </div>

      <!-- Recipes Grid -->
      <div v-if="pending" class="loading">
        <span class="material-symbols-outlined">progress_activity</span>
        <p>Loading recipes...</p>
      </div>

      <div v-else-if="error" class="error">
        <span class="material-symbols-outlined">error</span>
        <p>Failed to load recipes</p>
      </div>

      <div v-else-if="!recipes || recipes.length === 0" class="empty-state">
        <span class="material-symbols-outlined">restaurant</span>
        <h3>No recipes yet</h3>
        <p>Get started by creating your first recipe</p>
        <button class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          Create Recipe
        </button>
      </div>

      <div v-else class="recipes-grid">
        <div v-for="recipe in recipes" :key="recipe.id" class="recipe-card card pink-glow-hover">
          <div class="recipe-image">
            <span class="material-symbols-outlined">image</span>
          </div>
          <div class="recipe-content">
            <h3 class="recipe-name">{{ recipe.name }}</h3>
            <p class="recipe-meta">
              <span class="material-symbols-outlined">person</span>
              By {{ recipe.author_id }}
            </p>
            <p class="recipe-meta">
              <span class="material-symbols-outlined">photo_camera</span>
              {{ recipe.system_id }}
            </p>
          </div>
          <div class="recipe-actions">
            <button class="btn-icon" title="Edit">
              <span class="material-symbols-outlined">edit</span>
            </button>
            <button class="btn-icon" title="Delete">
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '~/components/layout/AdminLayout.vue';

// Fetch recipes from API
const { data: recipes, pending, error } = await useFetch('/api/recipes');
</script>

<style scoped>
.recipes-page {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}

.filters-section {
  margin-bottom: 2rem;
  display: flex;
  gap: 1.5rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  max-width: 500px;
}

.filter-pills {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.recipes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
}

.recipe-card {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 0;
}

.recipe-image {
  width: 100%;
  aspect-ratio: 16 / 9;
  background: linear-gradient(135deg, rgba(242, 128, 182, 0.1), rgba(5, 151, 242, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
}

.recipe-image .material-symbols-outlined {
  font-size: 64px;
  color: var(--color-text-dark);
}

.recipe-content {
  padding: 1.25rem;
  flex: 1;
}

.recipe-name {
  margin: 0 0 0.75rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-light);
}

.recipe-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-text-dark);
  margin: 0.5rem 0 0;
}

.recipe-meta .material-symbols-outlined {
  font-size: 16px;
}

.recipe-actions {
  display: flex;
  gap: 0.5rem;
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1rem;
}

.loading,
.error,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading .material-symbols-outlined,
.error .material-symbols-outlined,
.empty-state .material-symbols-outlined {
  font-size: 64px;
  color: var(--color-primary);
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  font-size: 1.5rem;
}

.empty-state p {
  margin: 0 0 1.5rem;
  color: var(--color-text-dark);
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loading .material-symbols-outlined {
  animation: spin 1s linear infinite;
}
</style>
