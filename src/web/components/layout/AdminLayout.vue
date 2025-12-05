<template>
  <div class="admin-layout">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-header">
        <h1 class="logo">iShootJpeg</h1>
        <p class="logo-subtitle">Admin</p>
      </div>

      <nav class="sidebar-nav">
        <!-- Dashboard -->
        <NuxtLink to="/" class="nav-item">
          <span class="material-symbols-outlined">dashboard</span>
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Content Section -->
        <div class="nav-section">
          <span class="nav-section-title">Content</span>
          <NuxtLink to="/recipes" class="nav-item">
            <span class="material-symbols-outlined">restaurant</span>
            <span>Recipes</span>
          </NuxtLink>
          <NuxtLink to="/authors" class="nav-item">
            <span class="material-symbols-outlined">person</span>
            <span>Authors</span>
          </NuxtLink>
          <NuxtLink to="/tags" class="nav-item">
            <span class="material-symbols-outlined">label</span>
            <span>Tags</span>
          </NuxtLink>
        </div>

        <!-- Camera Section -->
        <div class="nav-section">
          <span class="nav-section-title">Camera</span>
          <NuxtLink to="/systems" class="nav-item">
            <span class="material-symbols-outlined">photo_camera</span>
            <span>Systems</span>
          </NuxtLink>
          <NuxtLink to="/camera-models" class="nav-item">
            <span class="material-symbols-outlined">camera</span>
            <span>Models</span>
          </NuxtLink>
          <NuxtLink to="/sensors" class="nav-item">
            <span class="material-symbols-outlined">sensors</span>
            <span>Sensors</span>
          </NuxtLink>
          <NuxtLink to="/film-simulations" class="nav-item">
            <span class="material-symbols-outlined">palette</span>
            <span>Film Simulations</span>
          </NuxtLink>
        </div>

        <!-- Settings Section -->
        <!-- Settings Section -->
        <!-- <div class="nav-section">
          <span class="nav-section-title">Settings</span>
          <NuxtLink to="/settings/categories" class="nav-item">
            <span class="material-symbols-outlined">category</span>
            <span>Categories</span>
          </NuxtLink>
          <NuxtLink to="/settings/definitions" class="nav-item">
            <span class="material-symbols-outlined">tune</span>
            <span>Definitions</span>
          </NuxtLink>
        </div> -->
      </nav>
    </aside>

    <!-- Main Content -->
    <main class="main-content">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
  background-color: var(--color-background-dark);
}

.sidebar {
  width: 260px;
  background-color: var(--color-surface-dark);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  overflow-y: auto;
}

.sidebar-header {
  padding: 2rem 1.5rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
  margin: 0;
  line-height: 1;
}

.logo-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-dark);
  margin: 0.25rem 0 0;
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
}

.nav-section {
  margin-bottom: 1.5rem;
}

.nav-section-title {
  display: block;
  padding: 0.5rem 1.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-dark);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  color: var(--color-text-light);
  text-decoration: none;
  transition: all var(--duration-fast) ease;
  position: relative;
}

.nav-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: var(--color-primary);
  transform: scaleY(0);
  transition: transform var(--duration-fast) ease;
}

.nav-item:hover {
  background-color: rgba(242, 128, 182, 0.1);
  color: var(--color-primary);
}

.nav-item:hover::before {
  transform: scaleY(1);
}

.nav-item.router-link-active {
  background-color: rgba(242, 128, 182, 0.15);
  color: var(--color-primary);
}

.nav-item.router-link-active::before {
  transform: scaleY(1);
}

.nav-item .material-symbols-outlined {
  font-size: 20px;
}

.main-content {
  flex: 1;
  margin-left: 260px;
  padding: 2rem;
  min-height: 100vh;
}

/* Scrollbar for sidebar */
.sidebar::-webkit-scrollbar {
  width: 6px;
}

.sidebar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.sidebar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
