<template>
  <AdminLayout>
    <div class="recipes-page">
      <header class="page-header">
        <div>
          <h1>Recipes</h1>
          <p class="text-muted">Manage film simulation recipes</p>
        </div>
        <NuxtLink to="/recipes/create" class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          New Recipe
        </NuxtLink>
      </header>

      <!-- Search and Filters -->
      <div class="filters-section">
        <div class="search-bar">
          <span class="material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Search recipes..." 
            :value="searchQuery"
            @input="handleSearch"
          />
        </div>
        <div class="filter-pills">
          <button 
            class="filter-pill" 
            :class="{ active: selectedSystem === undefined }"
            @click="setSystem(undefined)"
          >
            All
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: selectedSystem === 1 }"
            @click="setSystem(1)"
          >
            Fujifilm
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: selectedSystem === 2 }"
            @click="setSystem(2)"
          >
            Nikon
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: selectedSystem === 3 }"
            @click="setSystem(3)"
          >
            Canon
          </button>
          <button 
            class="filter-pill" 
            :class="{ active: selectedSystem === 4 }"
            @click="setSystem(4)"
          >
            Sony
          </button>
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
            <NuxtLink :to="`/recipes/${recipe.id}`" class="btn-icon" title="Edit">
              <span class="material-symbols-outlined">edit</span>
            </NuxtLink>
            <button 
              class="btn-icon" 
              title="Delete"
              @click="handleDelete(recipe.id)"
            >
              <span class="material-symbols-outlined">delete</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          class="btn-icon" 
          :disabled="page === 1"
          @click="prevPage"
        >
          <span class="material-symbols-outlined">chevron_left</span>
        </button>
        <span class="page-info">Page {{ page }} of {{ totalPages }}</span>
        <button 
          class="btn-icon" 
          :disabled="page === totalPages"
          @click="nextPage"
        >
          <span class="material-symbols-outlined">chevron_right</span>
        </button>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';

// State
const searchQuery = ref('');
const selectedSystem = ref<number | undefined>(undefined);
const page = ref(1);
const limit = ref(20);

// Debounce search
const debouncedSearch = ref('');
let searchTimeout: any;

const handleSearch = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  searchQuery.value = value;
  
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    debouncedSearch.value = value;
    page.value = 1; // Reset to first page on search
  }, 300);
};

// Filter handlers
const setSystem = (id: number | undefined) => {
  selectedSystem.value = id;
  page.value = 1; // Reset to first page on filter change
};

// Fetch recipes with reactive params
const { data, pending, error, refresh } = await useFetch('/api/recipes', {
  query: {
    page,
    limit,
    search: debouncedSearch,
    system_id: selectedSystem,
  }
});

// Delete handler
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this recipe?')) return;

  try {
    await $fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    // Refresh list after delete
    refresh();
  } catch (e) {
    console.error('Failed to delete recipe:', e);
    alert('Failed to delete recipe');
  }
};

// Computed properties for template
const recipes = computed(() => data.value?.data || []);
const total = computed(() => data.value?.total || 0);
const totalPages = computed(() => data.value?.totalPages || 1);

// Pagination handlers
const nextPage = () => {
  if (page.value < totalPages.value) page.value++;
};

const prevPage = () => {
  if (page.value > 1) page.value--;
};
</script>

<style scoped>
.recipes-page {
  max-width: 1400px;
  margin: 0 auto;
}
</style>
