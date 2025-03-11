<template>
  <div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-6">Leden Management</h1>
    
    <!-- Filters and controls -->
    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div class="flex flex-wrap gap-4 items-center justify-between">
        <div class="flex flex-wrap gap-4 items-center">
          <!-- Tak filter -->
          <div>
            <label for="tak-filter" class="block text-sm font-medium text-gray-700 mb-1">Tak</label>
            <select
              id="tak-filter"
              v-model="filters.tak"
              @change="applyFilters"
              class="border rounded px-3 py-2 w-40"
            >
              <option value="">Alle takken</option>
              <option value="Kapoenen">Kapoenen</option>
              <option value="Welpen">Welpen</option>
              <option value="JongVerkenner">JongVerkenner</option>
              <option value="Verkenner">Verkenner</option>
              <option value="Jin">Jin</option>
            </select>
          </div>
          
          <!-- Active status filter -->
          <div>
            <label for="status-filter" class="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              id="status-filter"
              v-model="filters.isActief"
              @change="applyFilters"
              class="border rounded px-3 py-2 w-40"
            >
              <option value="">Alle leden</option>
              <option value="true">Actieve leden</option>
              <option value="false">Inactieve leden</option>
            </select>
          </div>
          
          <!-- Search -->
          <div>
            <label for="search" class="block text-sm font-medium text-gray-700 mb-1">Zoeken</label>
            <div class="relative">
              <input
                id="search"
                v-model="filters.search"
                @input="debounceSearch"
                type="text"
                placeholder="Zoek op naam..."
                class="border rounded pl-10 pr-3 py-2 w-64"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button 
            @click="openCsvImportModal" 
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
            title="Importeer leden via CSV"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            CSV Import
          </button>
          <button 
            @click="openAddLidModal" 
            class="bg-primary text-white px-4 py-2 rounded hover:bg-green-700 flex items-center gap-2"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nieuw Lid
          </button>
        </div>
      </div>
    </div>
    
    <!-- Loading state -->
    <div v-if="loading" class="flex justify-center my-12">
      <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
    
    <!-- Empty state -->
    <div v-else-if="leden.length === 0" class="bg-white rounded-lg shadow p-8 text-center my-8">
      <svg class="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Geen leden gevonden</h3>
      <p class="text-gray-500 mb-6">Er zijn geen leden die voldoen aan de gekozen filters.</p>
      <button 
        @click="resetFilters" 
        class="text-primary hover:text-green-700 font-medium"
      >
        Reset filters
      </button>
    </div>
    
    <!-- Members grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <LidCard 
        v-for="lid in leden" 
        :key="lid.LidID" 
        :lid="lid"
        @edit="openEditLidModal"
        @delete="confirmDeleteLid"
        @promote="promoteLid"
        @demote="demoteLid"
      />
    </div>

    <!-- Add/Edit Member Modal -->
    <LidFormModal
      v-model="showLidModal"
      :lid="selectedLid"
      :is-edit="isEditing"
      @save="saveLid"
    />
    
    <!-- Confirmation Modal -->
    <BaseModal
      v-model="showConfirmModal"
      title="Verwijder lid"
      confirm-text="Verwijderen"
      confirm-button-class="bg-red-600 hover:bg-red-700"
      @confirm="deleteLid"
    >
      <p>Weet je zeker dat je dit lid wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.</p>
      <p class="mt-2 font-medium">{{ selectedLid?.Voornaam }} {{ selectedLid?.Achternaam }}</p>
    </BaseModal>
    
    <!-- CSV Import Modal -->
    <CsvImportModal
      v-model="showCsvImportModal"
      @import-success="onImportSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { apiClient } from '../../services/api';
import LidCard from '../../components/leden/LidCard.vue';
import LidFormModal from '../../components/leden/LidFormModal.vue';
import BaseModal from '../../components/ui/BaseModal.vue';
import CsvImportModal from '../../components/leden/CsvImportModal.vue';

// State
const leden = ref([]);
const loading = ref(false);
const showLidModal = ref(false);
const showConfirmModal = ref(false);
const showCsvImportModal = ref(false);
const selectedLid = ref(null);
const isEditing = ref(false);
const filters = reactive({
  tak: '',
  isActief: '',
  search: ''
});

let searchTimeout;

// Fetch members
const fetchLeden = async () => {
  loading.value = true;
  try {
    const response = await apiClient.getLeden(filters);
    leden.value = response;
  } catch (error) {
    console.error('Error fetching leden:', error);
    alert('Er ging iets mis bij het ophalen van de leden.');
  } finally {
    loading.value = false;
  }
};

// Debounce search input
const debounceSearch = () => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    applyFilters();
  }, 300);
};

// Apply filters
const applyFilters = () => {
  fetchLeden();
};

// Reset filters
const resetFilters = () => {
  filters.tak = '';
  filters.isActief = '';
  filters.search = '';
  fetchLeden();
};

// CRUD Operations
const openAddLidModal = () => {
  selectedLid.value = {
    Voornaam: '',
    Achternaam: '',
    Geboortedatum: '',
    Allergieën: '',
    Dieetwensen: '',
    Tak: '',
    Telefoonnummer: '',
    Is_Actief: true,
    Lidmaatschap_Datum: new Date().toISOString().split('T')[0]
  };
  isEditing.value = false;
  showLidModal.value = true;
};

const openEditLidModal = (lid) => {
  selectedLid.value = { ...lid };
  isEditing.value = true;
  showLidModal.value = true;
};

const saveLid = async (lidData) => {
  loading.value = true;
  try {
    if (isEditing.value) {
      await apiClient.updateLid(lidData.LidID, lidData);
    } else {
      await apiClient.createLid(lidData);
    }
    showLidModal.value = false;
    fetchLeden();
  } catch (error) {
    console.error('Error saving lid:', error);
    alert('Er ging iets mis bij het opslaan van het lid.');
  } finally {
    loading.value = false;
  }
};

const confirmDeleteLid = (lid) => {
  selectedLid.value = lid;
  showConfirmModal.value = true;
};

const deleteLid = async () => {
  if (!selectedLid.value) return;
  
  loading.value = true;
  try {
    await apiClient.deleteLid(selectedLid.value.LidID);
    showConfirmModal.value = false;
    fetchLeden();
  } catch (error) {
    console.error('Error deleting lid:', error);
    alert('Er ging iets mis bij het verwijderen van het lid.');
  } finally {
    loading.value = false;
  }
};

const promoteLid = async (lid) => {
  loading.value = true;
  try {
    await apiClient.promoteLidToLeiding(lid.LidID, {
      Is_Groepsleiding: false,
      Is_Hopman: false
    });
    fetchLeden();
  } catch (error) {
    console.error('Error promoting lid:', error);
    alert('Er ging iets mis bij het promoveren van het lid naar leiding.');
  } finally {
    loading.value = false;
  }
};

const demoteLid = async (lid) => {
  loading.value = true;
  try {
    await apiClient.demoteFromLeiding(lid.LidID);
    fetchLeden();
  } catch (error) {
    console.error('Error demoting lid:', error);
    alert('Er ging iets mis bij het degraderen van het lid van leiding.');
  } finally {
    loading.value = false;
  }
};

// CSV Import
const openCsvImportModal = () => {
  showCsvImportModal.value = true;
};

const onImportSuccess = (importedCount) => {
  fetchLeden();
  alert(`${importedCount} leden succesvol geïmporteerd.`);
};

// Lifecycle
onMounted(() => {
  fetchLeden();
});
</script>
