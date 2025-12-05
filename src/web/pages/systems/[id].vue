<template>
  <AdminLayout>
    <div class="page-container">
      <div class="page-header">
        <h1>Edit System</h1>
      </div>

      <div v-if="pending" class="loading-state">
        <span class="material-symbols-outlined spin">progress_activity</span>
        Loading system...
      </div>

      <div v-else-if="error" class="error-state">
        <span class="material-symbols-outlined">error</span>
        Failed to load system
        <button class="btn btn-secondary" @click="router.push('/systems')">
          Back to List
        </button>
      </div>

      <div v-else class="content-grid">
        <!-- System Details -->
        <div class="content-card">
          <h2>System Details</h2>
          <SystemForm 
            :initial-data="system"
            :is-edit="true"
            :loading="saving"
            @submit="handleUpdate"
            @cancel="router.push('/systems')"
          />
        </div>

        <!-- System Settings -->
        <div class="content-card">
          <div class="card-header">
            <h2>System Settings</h2>
            <p class="subtitle">Configure which settings are available for this system</p>
          </div>

          <!-- Add Setting Form -->
          <div class="add-setting-form">
            <select v-model="newSettingId" class="form-control">
              <option value="" disabled>Select a setting to add...</option>
              <option 
                v-for="def in availableSettings" 
                :key="def.id" 
                :value="def.id"
              >
                {{ def.name }} ({{ def.category_name }})
              </option>
            </select>
            <button 
              class="btn btn-primary" 
              :disabled="!newSettingId || addingSetting"
              @click="addSetting"
            >
              <span v-if="addingSetting" class="material-symbols-outlined spin">progress_activity</span>
              <span v-else class="material-symbols-outlined">add</span>
              Add
            </button>
          </div>

          <!-- Settings List -->
          <div v-if="settingsPending" class="loading-state small">
            <span class="material-symbols-outlined spin">progress_activity</span>
          </div>
          
          <div v-else-if="systemSettings.length === 0" class="empty-state small">
            <p>No settings configured for this system</p>
          </div>

          <div v-else class="settings-list">
            <div 
              v-for="setting in systemSettings" 
              :key="setting.setting_definition_id" 
              class="setting-item"
            >
              <div class="setting-info">
                <span class="setting-name">{{ setting.setting_name }}</span>
                <span class="setting-category">{{ setting.category_name }}</span>
              </div>
              <button 
                class="btn-icon delete" 
                title="Remove setting"
                @click="removeSetting(setting.setting_definition_id)"
              >
                <span class="material-symbols-outlined">close</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import SystemForm from '~/components/systems/SystemForm.vue';
import AdminLayout from '~/components/layout/AdminLayout.vue';

const route = useRoute();
const router = useRouter();
const id = route.params.id;

const saving = ref(false);
const addingSetting = ref(false);
const newSettingId = ref('');

// Fetch System Details
const { data: system, pending, error } = await useFetch(`/api/systems/${id}`);

// Fetch System Settings
const { 
  data: systemSettingsData, 
  pending: settingsPending, 
  refresh: refreshSettings 
} = await useFetch(`/api/systems/${id}/settings`);

const systemSettings = computed(() => systemSettingsData.value || []);

// Fetch All Setting Definitions (for the dropdown)
const { data: availableSettingsData, refresh: refreshDefinitions } = await useFetch('/api/settings/definitions', {
  key: 'setting-definitions',
  server: false, // Force fetch on client to avoid hydration mismatch if cache differs
  lazy: true
});

const availableSettings = computed(() => availableSettingsData.value || []);

onMounted(() => {
  refreshDefinitions();
});

const handleUpdate = async (formData: any) => {
  saving.value = true;
  try {
    await $fetch(`/api/systems/${id}`, {
      method: 'PUT',
      body: formData
    });
    router.push('/systems');
  } catch (error: any) {
    alert(error.data?.message || 'Failed to update system');
  } finally {
    saving.value = false;
  }
};

const addSetting = async () => {
  if (!newSettingId.value) return;
  
  addingSetting.value = true;
  try {
    await $fetch(`/api/systems/${id}/settings`, {
      method: 'POST',
      body: {
        setting_definition_id: parseInt(newSettingId.value),
        is_supported: true
      }
    });
    newSettingId.value = '';
    refreshSettings();
  } catch (error: any) {
    alert(error.data?.message || 'Failed to add setting');
  } finally {
    addingSetting.value = false;
  }
};

const removeSetting = async (settingId: number) => {
  if (!confirm('Remove this setting from the system?')) return;

  try {
    await $fetch(`/api/systems/${id}/settings`, {
      method: 'DELETE',
      body: { setting_definition_id: settingId }
    });
    refreshSettings();
  } catch (error: any) {
    alert(error.data?.message || 'Failed to remove setting');
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
  margin-bottom: 2rem;
}

h1 {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-text-light);
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
}

.content-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  height: fit-content;
}

.card-header {
  margin-bottom: 1.5rem;
}

h2 {
  font-size: 1.25rem;
  margin: 0 0 0.5rem 0;
  color: var(--color-text-light);
}

.subtitle {
  margin: 0;
  color: var(--color-text-muted);
  font-size: 0.875rem;
}

.add-setting-form {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.form-control {
  flex: 1;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--color-text-light);
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.setting-info {
  display: flex;
  flex-direction: column;
}

.setting-name {
  font-weight: 500;
  color: var(--color-text-light);
}

.setting-category {
  font-size: 0.75rem;
  color: var(--color-text-muted);
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-icon:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-danger);
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

.loading-state.small, .empty-state.small {
  padding: 2rem;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-secondary {
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.1);
  border: none;
  border-radius: 6px;
  color: var(--color-text-light);
  cursor: pointer;
}
</style>
