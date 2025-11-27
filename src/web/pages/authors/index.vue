<template>
  <AdminLayout>
    <div class="authors-page">
      <!-- Page Header -->
      <header class="page-header">
        <div class="header-content">
          <h1>Authors</h1>
          <p class="subtitle">Manage recipe creators and contributors</p>
        </div>
        <NuxtLink to="/authors/create" class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          New Author
        </NuxtLink>
      </header>

      <!-- Search -->
      <div class="filters-container">
        <div class="search-bar">
          <span class="material-symbols-outlined">search</span>
          <input 
            type="text" 
            placeholder="Search authors..." 
            :value="searchQuery"
            @input="handleSearch"
          />
        </div>
      </div>

      <!-- Authors Table -->
      <div v-if="pending" class="loading">
        <span class="material-symbols-outlined spin">progress_activity</span>
        <p>Loading authors...</p>
      </div>

      <div v-else-if="error" class="error">
        <span class="material-symbols-outlined">error</span>
        <p>Failed to load authors</p>
      </div>

      <div v-else-if="!authors || authors.length === 0" class="empty-state">
        <span class="material-symbols-outlined">person</span>
        <h3>No authors found</h3>
        <p>Try adjusting your search or create a new author</p>
        <NuxtLink to="/authors/create" class="btn btn-primary">
          <span class="material-symbols-outlined">add</span>
          Create Author
        </NuxtLink>
      </div>

      <div v-else class="table-container">
        <table class="authors-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Bio</th>
              <th>Social</th>
              <th>Verified</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="author in authors" :key="author.id">
              <td class="name-cell">
                <NuxtLink :to="`/authors/${author.id}`" class="author-link">
                  {{ author.name }}
                </NuxtLink>
                <div class="slug-text">{{ author.slug }}</div>
              </td>
              <td class="bio-cell">
                <div class="truncate-text" :title="author.bio">{{ author.bio || '-' }}</div>
              </td>
              <td>
                <div v-if="author.social_handle" class="social-info">
                  <span class="platform-badge">{{ author.social_platform || 'Social' }}</span>
                  <a 
                    v-if="author.website_url" 
                    :href="author.website_url" 
                    target="_blank" 
                    class="website-link"
                    title="Visit Website"
                  >
                    <span class="material-symbols-outlined">link</span>
                  </a>
                  <span>{{ author.social_handle }}</span>
                </div>
                <span v-else>-</span>
              </td>
              <td>
                <span v-if="author.is_verified" class="verified-badge" title="Verified Author">
                  <span class="material-symbols-outlined">verified</span>
                </span>
              </td>
              <td class="actions-cell">
                <div class="action-buttons">
                  <NuxtLink :to="`/authors/${author.id}`" class="btn-icon" title="Edit">
                    <span class="material-symbols-outlined">edit</span>
                  </NuxtLink>
                  <button 
                    class="btn-icon" 
                    title="Delete"
                    @click="handleDelete(author.id)"
                  >
                    <span class="material-symbols-outlined">delete</span>
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

// Fetch authors with reactive params
const { data, pending, error, refresh } = await useFetch('/api/authors', {
  query: {
    page,
    limit,
    search: debouncedSearch,
  }
});

// Delete handler
const handleDelete = async (id: number) => {
  if (!confirm('Are you sure you want to delete this author?')) return;

  try {
    await $fetch(`/api/authors/${id}`, { method: 'DELETE' });
    refresh();
  } catch (e: any) {
    console.error('Failed to delete author:', e);
    if (e.statusCode === 409) {
      alert('Cannot delete author because they have associated recipes.');
    } else {
      alert('Failed to delete author');
    }
  }
};

// Computed properties
const authors = computed(() => data.value?.data || []);
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
.authors-page {
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

/* Search */
.filters-container {
  margin-bottom: 2rem;
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

/* Table */
.table-container {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  overflow: hidden;
  margin-bottom: 2rem;
}

.authors-table {
  width: 100%;
  border-collapse: collapse;
}

.authors-table thead {
  background: rgba(0, 0, 0, 0.3);
}

.authors-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.8125rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-muted);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.authors-table tbody tr {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.2s;
}

.authors-table tbody tr:hover {
  background: rgba(242, 128, 182, 0.05);
}

.authors-table td {
  padding: 1rem 1.5rem;
  color: var(--color-text-light);
  font-size: 0.9375rem;
  vertical-align: middle;
}

.name-cell {
  font-weight: 500;
}

.author-link {
  color: var(--color-primary);
  text-decoration: none;
  transition: color 0.2s;
  display: block;
}

.author-link:hover {
  color: #ff69b4;
}

.slug-text {
  font-size: 0.75rem;
  color: var(--color-text-muted);
  margin-top: 0.25rem;
}

.bio-cell {
  max-width: 300px;
}

.truncate-text {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--color-text-muted);
}

.social-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.platform-badge {
  font-size: 0.75rem;
  padding: 0.125rem 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  text-transform: capitalize;
}

.website-link {
  color: var(--color-text-muted);
  display: flex;
  align-items: center;
}

.website-link:hover {
  color: var(--color-primary);
}

.website-link .material-symbols-outlined {
  font-size: 16px;
}

.verified-badge {
  color: #2ecc71;
  display: flex;
  align-items: center;
}

.verified-badge .material-symbols-outlined {
  font-size: 20px;
}

.actions-cell {
  width: 100px;
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
