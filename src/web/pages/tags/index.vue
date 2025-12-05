<template>
  <AdminLayout>
    <div class="page-container">
      <div class="page-header">
        <div>
          <h1>Tags</h1>
          <p class="subtitle">Manage recipe tags and categories</p>
        </div>
        <NuxtLink to="/tags/create" class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          Create Tag
        </NuxtLink>
      </div>

      <!-- Search and Filter -->
      <div class="filters-bar">
        <div class="search-box">
          <span class="material-symbols-outlined">search</span>
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search tags..."
          />
        </div>
      </div>

      <!-- Tags List -->
      <div class="tags-list">
        <div v-if="pending" class="loading-state">
          <span class="material-symbols-outlined spin">progress_activity</span>
          Loading tags...
        </div>

        <div v-else-if="error" class="error-state">
          <span class="material-symbols-outlined">error</span>
          Failed to load tags
        </div>

        <div v-else-if="tags.length === 0" class="empty-state">
          <span class="material-symbols-outlined">label_off</span>
          No tags found
        </div>

        <table v-else class="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Slug</th>
              <th>Category</th>
              <th>Usage</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tag in tags" :key="tag.id">
              <td class="font-medium">{{ tag.name }}</td>
              <td class="text-muted">{{ tag.slug }}</td>
              <td>
                <span v-if="tag.category" class="badge">{{ tag.category }}</span>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ tag.usage_count }}</td>
              <td class="actions-cell">
                <NuxtLink :to="`/tags/${tag.id}`" class="btn-icon" title="Edit">
                  <span class="material-symbols-outlined">edit</span>
                </NuxtLink>
                <button @click="confirmDelete(tag)" class="btn-icon delete" title="Delete">
                  <span class="material-symbols-outlined">delete</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Pagination -->
        <div v-if="data?.totalPages > 1" class="pagination">
          <button 
            :disabled="page === 1" 
            @click="page--"
            class="btn-icon"
          >
            <span class="material-symbols-outlined">chevron_left</span>
          </button>
          <span class="page-info">Page {{ page }} of {{ data.totalPages }}</span>
          <button 
            :disabled="page === data.totalPages" 
            @click="page++"
            class="btn-icon"
          >
            <span class="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import AdminLayout from '~/components/layout/AdminLayout.vue';

const page = ref(1);
const searchQuery = ref('');
const debouncedSearch = ref('');
const limit = 20;

const { data, pending, error, refresh } = await useFetch('/api/tags', {
  key: 'tags-list',
  query: {
    page,
    limit,
    search: debouncedSearch
  }
});

watch(searchQuery, useDebounceFn((newVal) => {
  page.value = 1;
  debouncedSearch.value = newVal;
  refresh();
}, 300));

watch(page, () => {
  refresh();
});

onMounted(() => {
  refresh();
});

const tags = computed(() => data.value?.data || []);

const confirmDelete = async (tag: any) => {
  if (!confirm(`Are you sure you want to delete "${tag.name}"?`)) return;

  try {
    await $fetch(`/api/tags/${tag.id}`, { method: 'DELETE' });
    refresh();
  } catch (err) {
    alert('Failed to delete tag');
  }
};
</script>

<style scoped>
.page-container {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: var(--color-text-muted);
}

.filters-bar {
  margin-bottom: 1.5rem;
}

.search-box {
  position: relative;
  max-width: 300px;
}

.search-box .material-symbols-outlined {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-muted);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: var(--color-text-light);
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

th, td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

th {
  background: rgba(255, 255, 255, 0.05);
  font-weight: 600;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.actions-cell {
  display: flex;
  gap: 0.5rem;
}

.btn-icon {
  background: none;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: color 0.2s;
}

.btn-icon:hover {
  color: var(--color-primary);
}

.btn-icon.delete:hover {
  color: #ff4444;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  font-size: 0.75rem;
  color: var(--color-text-light);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.loading-state, .error-state, .empty-state {
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

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 500;
  transition: background 0.2s;
}

.btn-primary:hover {
  background: #ff69b4;
}
</style>
