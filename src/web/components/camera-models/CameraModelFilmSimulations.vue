<template>
  <div class="film-simulations-section">
    <div class="section-header">
      <h3 class="section-title">Film Simulations</h3>
      <p class="section-subtitle">Manage film simulations available on this camera model.</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="error-alert">
      <span class="material-symbols-outlined">error</span>
      <p>{{ error.message || 'Failed to load film simulations' }}</p>
    </div>

    <!-- Add New Simulation -->
    <div class="add-section">
      <div class="select-wrapper">
        <select v-model="selectedSimulationId" class="form-control" :disabled="loadingAvailable">
          <option :value="null" disabled>Select film simulation to add...</option>
          <option v-for="sim in availableSimulations" :key="sim.id" :value="sim.id">
            {{ sim.name }} ({{ sim.label }})
          </option>
        </select>
        <div v-if="loadingAvailable" class="spinner-sm"></div>
      </div>
      
      <div class="firmware-toggle">
        <label class="checkbox-label">
          <input type="checkbox" v-model="addedViaFirmware" />
          <span class="checkbox-text">Via Firmware?</span>
        </label>
      </div>

      <button 
        class="btn btn-primary" 
        :disabled="!selectedSimulationId || adding"
        @click="addSimulation"
      >
        <span v-if="adding" class="material-symbols-outlined spin">progress_activity</span>
        <span v-else class="material-symbols-outlined">add</span>
        Add
      </button>
    </div>

    <!-- Empty State -->
    <div v-if="!simulations.length && !loading" class="empty-list">
      <p>No film simulations assigned to this model yet.</p>
    </div>

    <!-- List of Simulations -->
    <div v-else class="simulations-list">
      <div v-if="loading" class="loading-overlay">
        <span class="material-symbols-outlined spin">progress_activity</span>
      </div>

      <div v-for="sim in simulations" :key="sim.id" class="simulation-item">
        <div class="sim-info">
          <span class="sim-name">{{ sim.name }}</span>
          <span class="sim-label">{{ sim.label }}</span>
          <span v-if="sim.added_via_firmware" class="firmware-badge">Firmware Update</span>
        </div>
        <button 
          class="btn-icon delete" 
          @click="removeSimulation(sim.id)"
          :disabled="removing === sim.id"
          title="Remove"
        >
          <span v-if="removing === sim.id" class="material-symbols-outlined spin">progress_activity</span>
          <span v-else class="material-symbols-outlined">delete</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

const props = defineProps<{
  modelId: number;
  systemId: number;
}>();

// State
const adding = ref(false);
const removing = ref<number | null>(null);
const selectedSimulationId = ref<number | null>(null);
const addedViaFirmware = ref(false);

// Fetch Current Simulations
const { 
  data: simulationsData, 
  pending: loading, 
  error, 
  refresh: refreshSimulations 
} = await useFetch<any[]>(`/api/camera-models/${props.modelId}/film-simulations`);

const simulations = computed(() => simulationsData.value || []);

// Fetch Available Simulations (for dropdown)
// We need to fetch this dynamically to filter out already added ones, 
// OR we fetch all for system and filter client side.
// The API endpoint `/api/systems/[id]/film-simulations` supports filtering by `modelId` query param.
const { 
  data: availableData, 
  pending: loadingAvailable,
  refresh: refreshAvailable
} = await useFetch<any[]>(`/api/systems/${props.systemId}/film-simulations`, {
  query: { modelId: props.modelId },
  watch: [simulations] // Refresh when list changes
});

const availableSimulations = computed(() => availableData.value || []);

// Actions
const addSimulation = async () => {
  if (!selectedSimulationId.value) return;

  adding.value = true;
  try {
    await $fetch(`/api/camera-models/${props.modelId}/film-simulations`, {
      method: 'POST',
      body: { 
        filmSimulationId: selectedSimulationId.value,
        addedViaFirmware: addedViaFirmware.value
      }
    });

    // Reset form and refresh
    selectedSimulationId.value = null;
    addedViaFirmware.value = false;
    await Promise.all([refreshSimulations(), refreshAvailable()]);
  } catch (e: any) {
    alert(e.data?.message || 'Failed to add film simulation');
  } finally {
    adding.value = false;
  }
};

const removeSimulation = async (simId: number) => {
  removing.value = simId;
  try {
    await $fetch(`/api/camera-models/${props.modelId}/film-simulations`, {
      method: 'DELETE',
      query: { filmSimulationId: simId }
    });
    
    await Promise.all([refreshSimulations(), refreshAvailable()]);
  } catch (e: any) {
    alert(e.data?.message || 'Failed to remove film simulation');
  } finally {
    removing.value = null;
  }
};
</script>

<style scoped>
.film-simulations-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.section-header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-text-light);
  margin: 0;
}

.section-subtitle {
  font-size: 0.875rem;
  color: var(--color-text-muted);
  margin: 0.25rem 0 0;
}

.error-alert {
  background: rgba(255, 77, 77, 0.1);
  border: 1px solid rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.add-section {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 1rem;
  align-items: flex-start;
  background: rgba(0, 0, 0, 0.2);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.select-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-control {
  width: 100%;
  padding: 0.625rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--color-text-light);
  font-size: 0.9375rem;
}

.firmware-toggle {
  display: flex;
  align-items: center;
  height: 100%;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.checkbox-text {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.btn {
  padding: 0.625rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.simulations-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  position: relative;
  min-height: 100px;
}

.simulation-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  transition: background 0.2s;
}

.simulation-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.sim-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.sim-name {
  font-weight: 500;
  color: var(--color-text-light);
}

.sim-label {
  font-size: 0.875rem;
  color: var(--color-text-muted);
}

.firmware-badge {
  font-size: 0.75rem;
  background: rgba(255, 193, 7, 0.1);
  color: #ffc107;
  padding: 0.125rem 0.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

.btn-icon {
  background: transparent;
  border: none;
  color: var(--color-text-muted);
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  color: var(--color-text-light);
  background: rgba(255, 255, 255, 0.1);
}

.btn-icon.delete:hover {
  color: #ff4d4d;
  background: rgba(255, 77, 77, 0.1);
}

.empty-list {
  text-align: center;
  padding: 2rem;
  color: var(--color-text-muted);
  font-style: italic;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>
