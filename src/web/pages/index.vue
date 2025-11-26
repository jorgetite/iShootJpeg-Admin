<template>
  <AdminLayout>
    <div class="dashboard">
      <header class="page-header">
        <h1>Dashboard</h1>
        <p class="text-muted">Welcome to iShootJpeg Admin</p>
      </header>

      <!-- Statistics Cards -->
      <div class="stats-grid">
        <div class="stat-card card pink-glow-hover">
          <div class="stat-icon">
            <span class="material-symbols-outlined">restaurant</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              <span v-if="pending" class="loading-dots">...</span>
              <span v-else-if="error">-</span>
              <span v-else>{{ stats?.recipes?.toLocaleString() }}</span>
            </div>
            <div class="stat-label">Recipes</div>
          </div>
        </div>

        <div class="stat-card card pink-glow-hover">
          <div class="stat-icon">
            <span class="material-symbols-outlined">person</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              <span v-if="pending" class="loading-dots">...</span>
              <span v-else-if="error">-</span>
              <span v-else>{{ stats?.authors?.toLocaleString() }}</span>
            </div>
            <div class="stat-label">Authors</div>
          </div>
        </div>

        <div class="stat-card card pink-glow-hover">
          <div class="stat-icon">
            <span class="material-symbols-outlined">label</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              <span v-if="pending" class="loading-dots">...</span>
              <span v-else-if="error">-</span>
              <span v-else>{{ stats?.tags?.toLocaleString() }}</span>
            </div>
            <div class="stat-label">Tags</div>
          </div>
        </div>

        <div class="stat-card card pink-glow-hover">
          <div class="stat-icon">
            <span class="material-symbols-outlined">photo_camera</span>
          </div>
          <div class="stat-content">
            <div class="stat-value">
              <span v-if="pending" class="loading-dots">...</span>
              <span v-else-if="error">-</span>
              <span v-else>{{ stats?.cameraSystems?.toLocaleString() }}</span>
            </div>
            <div class="stat-label">Camera Systems</div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <section class="quick-actions">
        <h2>Quick Actions</h2>
        <div class="actions-grid">
          <NuxtLink to="/recipes" class="action-card card pink-glow-hover">
            <span class="material-symbols-outlined">add</span>
            <span>New Recipe</span>
          </NuxtLink>
          <NuxtLink to="/authors" class="action-card card pink-glow-hover">
            <span class="material-symbols-outlined">person_add</span>
            <span>New Author</span>
          </NuxtLink>
          <NuxtLink to="/tags" class="action-card card pink-glow-hover">
            <span class="material-symbols-outlined">label</span>
            <span>Manage Tags</span>
          </NuxtLink>
        </div>
      </section>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import AdminLayout from '~/components/layout/AdminLayout.vue';

// Fetch real statistics from API
const { data: stats, pending, error } = await useFetch('/api/stats');
</script>

<style scoped>
.dashboard {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  margin-bottom: 2rem;
}

.page-header h1 {
  margin: 0 0 0.5rem;
  font-size: 2rem;
  font-weight: 700;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: default;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--color-primary), #E06BA0);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-icon .material-symbols-outlined {
  font-size: 32px;
  color: white;
}

.stat-content {
  flex: 1;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-light);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-text-dark);
  font-weight: 500;
}

.quick-actions {
  margin-top: 3rem;
}

.quick-actions h2 {
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  text-decoration: none;
  color: var(--color-text-light);
  cursor: pointer;
  min-height: 140px;
}

.action-card .material-symbols-outlined {
  font-size: 40px;
  color: var(--color-primary);
}

.action-card span:last-child {
  font-weight: 500;
  font-size: 1rem;
}

.action-card:hover .material-symbols-outlined {
  transform: scale(1.1);
  transition: transform var(--duration-fast) ease;
}
</style>
