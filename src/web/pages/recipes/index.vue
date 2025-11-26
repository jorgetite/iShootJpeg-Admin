<template>
  <AdminLayout>
    <div class="recipes-page">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <h1>Recipes</h1>
          <p class="subtitle">Manage film simulation recipes</p>
        </div>
        <NuxtLink to="/recipes/create" class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          New Recipe
        </NuxtLink>
      </header>

      <!-- Search and Filters -->
      <div class="filters-container">
        <div class="search-bar">
          <span class="material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Search recipes..." 
            :value="searchQuery"
            @input="handleSearch"
          />
        </div>

        <div class="filters-row">
          <!-- System Filter -->
          <div class="filter-group">
            <label>System</label>
            <select v-model="selectedSystem" @change="resetPage">
              <option :value="undefined">All Systems</option>
              <option v-for="system in systems" :key="system.id" :value="system.id">
                {{ system.name }}
              </option>
            </select>
          </div>

          <!-- Author Filter -->
          <div class="filter-group">
            <label>Author</label>
            <select v-model="selectedAuthor" @change="resetPage">
              <option :value="undefined">All Authors</option>
              <option v-for="author in authors" :key="author.id" :value="author.id">
                {{ author.name }}
              </option>
            </select>
          </div>

          <!-- Sensor Filter -->
          <div class="filter-group">
            <label>Sensor</label>
            <select v-model="selectedSensor" @change="resetPage">
              <option :value="undefined">All Sensors</option>
              <option v-for="sensor in sensors" :key="sensor.id" :value="sensor.id">
                {{ sensor.name }}
              </option>
            </select>
          </div>

          <!-- Film Simulation Filter -->
          <div class="filter-group">
            <label>Film Simulation</label>
            <select v-model="selectedFilmSimulation" @change="resetPage">
              <option :value="undefined">All Simulations</option>
              <option v-for="sim in filmSimulations" :key="sim.id" :value="sim.id">
                {{ sim.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Recipes Table -->
      <div v-if="pending" class="loading">
        <span class="material-symbols-outlined spin">progress_activity</span>
        <p>Loading recipes...</p>
      </div>

      <div v-else-if="error" class="error">
        <span class="material-symbols-outlined">error</span>
        <p>Failed to load recipes</p>
      </div>

      <div v-else-if="!recipes || recipes.length === 0" class="empty-state">
        <span class="material-symbols-outlined">restaurant</span>
        <h3>No recipes found</h3>
        <p>Try adjusting your filters or create a new recipe</p>
        <NuxtLink to="/recipes/create" class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          Create Recipe
        </NuxtLink>
      </div>

      <div v-else class="table-container">
        <table class="recipes-table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Name</th>
              <th>Author</th>
              <th>Film Simulation</th>
              <th>Sensor</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="recipe in recipes" :key="recipe.id">
              <td class="thumbnail-cell">
                <div class="thumbnail">
                  <span class="material-symbols-outlined">image</span>
                </div>
              </td>
              <td class="name-cell">
                <NuxtLink :to="`/recipes/${recipe.id}`" class="recipe-link">
                  {{ recipe.name }}
                </NuxtLink>
              </td>
              <td>{{ recipe.author_name || 'Unknown' }}</td>
              <td>{{ recipe.film_simulation_name || 'N/A' }}</td>
              <td>{{ recipe.sensor_name || 'Any' }}</td>
              <td class="actions-cell">
                <div class="action-buttons">
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
                  <button 
                    class="btn-icon toggle-btn" 
                    :class="{ active: recipe.is_active, inactive: !recipe.is_active }"
                    :title="recipe.is_active ? 'Active - Click to deactivate' : 'Inactive - Click to activate'"
                    @click="toggleActive(recipe.id, recipe.is_active)"
                  >
                    <span class="material-symbols-outlined">
                      {{ recipe.is_active ? 'check_circle' : 'cancel' }}
                    </span>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
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
import { ref, computed } from 'vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';

// State
const searchQuery = ref('');
const selectedSystem = ref<number | undefined>(undefined);
const selectedAuthor = ref<number | undefined>(undefined);
const selectedSensor = ref<number | undefined>(undefined);
const selectedFilmSimulation = ref<number | undefined>(undefined);
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
    page.value = 1;
  }, 300);
};

// Reset page on filter change
const resetPage = () => {
  page.value = 1;
};

// Fetch filter options
const { data: filterOptions } = await useFetch('/api/options');
const systems = computed(() => filterOptions.value?.systems || []);
const authors = computed(() => filterOptions.value?.authors || []);
const sensors = computed(() => filterOptions.value?.sensors || []);
const filmSimulations = computed(() => filterOptions.value?.filmSimulations || []);

// Fetch recipes with reactive params
const { data, pending, error, refresh } = await useFetch('/api/recipes', {
  query: {
    page,
    limit,
    search: debouncedSearch,
    system_id: selectedSystem,
    author_id: selectedAuthor,
    sensor_id: selectedSensor,
    film_simulation_id: selectedFilmSimulation,
  }
});

// Delete handler
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this recipe?')) return;

  try {
    await $fetch(`/api/recipes/${id}`, { method: 'DELETE' });
    refresh();
  } catch (e) {
    console.error('Failed to delete recipe:', e);
    alert('Failed to delete recipe');
  }
};

// Toggle active status
const toggleActive = async (id: number, currentStatus: boolean) => {
  try {
    await $fetch(`/api/recipes/${id}`, {
      method: 'PUT',
      body: { is_active: !currentStatus }
    });
    refresh();
  } catch (e) {
    console.error('Failed to toggle recipe status:', e);
    alert('Failed to update recipe status');
  }
};

// Computed properties
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

/* Page Header */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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

/* Filters */
.filters-container {
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.search-bar {
  position: relative;
  max-width: 500px;
}

.search-bar .material-symbols-outlined {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
  font-size: 20px;
  pointer-events: none;
}

.search-bar input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 3rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text-light);
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--color-primary);
}

.filters-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--color-text-light);
  margin-bottom: 0.5rem;
}

.filter-group select {
  width: 100%;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--color-text-light);
  font-size: 0.9375rem;
  transition: border-color 0.2s;
}

.filter-group select:focus {
  outline: none;
  border-color: var(--color-primary);
}

/* Table */
.table-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
}

.recipes-table {
  width: 100%;
  border-collapse: collapse;
}

.recipes-table thead {
  background: rgba(0, 0, 0, 0.3);
}

.recipes-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.recipes-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s;
}

.recipes-table tbody tr:hover {
  background: rgba(242, 128, 182, 0.05);
}

.recipes-table td {
  padding: 1rem 1.5rem;
  color: var(--color-text-light);
  font-size: 0.9375rem;
}

.thumbnail-cell {
  width: 60px;
}

.thumbnail {
  width: 48px;
  height: 48px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.thumbnail .material-symbols-outlined {
  color: var(--color-text-muted);
  font-size: 24px;
}

.name-cell {
  font-weight: 500;
}

.recipe-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
}

.recipe-link:hover {
  color: #ff69b4;
}

.actions-cell {
  width: 140px;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--color-text-light);
  cursor: pointer;
  transition: all 0.2s;
}

.btn-icon:hover:not(:disabled) {
  background: rgba(242, 128, 182, 0.15);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.btn-icon:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.btn-icon.toggle-btn.active {
  background: rgba(46, 204, 113, 0.15);
  border-color: rgba(46, 204, 113, 0.4);
  color: #2ecc71;
}

.btn-icon.toggle-btn.inactive {
  background: rgba(231, 76, 60, 0.15);
  border-color: rgba(231, 76, 60, 0.4);
  color: #e74c3c;
}

.btn-icon.toggle-btn.active:hover {
  background: rgba(46, 204, 113, 0.25);
  border-color: rgba(46, 204, 113, 0.6);
}

.btn-icon.toggle-btn.inactive:hover {
  background: rgba(231, 76, 60, 0.25);
  border-color: rgba(231, 76, 60, 0.6);
}

.btn-icon .material-symbols-outlined {
  font-size: 20px;
}

/* States */
.loading, .error, .empty-state {
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

.empty-state .material-symbols-outlined {
  font-size: 64px;
  color: var(--color-text-muted);
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-light);
}

.empty-state p {
  color: var(--color-text-muted);
  margin: 0 0 1.5rem 0;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.page-info {
  color: var(--color-text-light);
  font-size: 0.9375rem;
  min-width: 120px;
  text-align: center;
}
</style>
