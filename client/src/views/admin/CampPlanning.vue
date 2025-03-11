<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">Camp Planning</h2>
    
    <!-- Camp Selection Section -->
    <CampSelector 
      :camps="camps"
      :selected-camp-id="selectedCampId"
      @select-camp="selectCamp"
      @create-camp="openCampEditor()"
      @edit-camp="openCampEditor($event)"
      @delete-camp="confirmDeleteCamp"
    />
    
    <!-- Camp Details Section (visible when camp is selected) -->
    <CampDetails 
      v-if="selectedCampId && campDetails" 
      :camp-details="campDetails"
      :camp-wei="campWei"
      :format-date-range="formatDateRange"
    />
    
    <!-- Camp Planning Section -->
    <div v-if="selectedCampId && campDetails" class="mt-6 bg-white p-4 rounded-lg shadow">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium">Camp Schedule</h3>
      </div>
      
      <!-- Schedule Tabs -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex">
            <button 
              v-for="tab in planningTabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'py-2 px-4 mr-2 font-medium text-sm focus:outline-none',
                activeTab === tab.id 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              {{ tab.name }}
            </button>
          </nav>
        </div>
      </div>
      
      <!-- Tab Content -->
      <div class="mt-4">
        <!-- Meals Tab -->
        <div v-if="activeTab === 'meals'" class="space-y-6">
          <MealPlanning 
            :camp-days="campDays"
            :camp-meals="campMeals"
            :meal-types="mealTypes"
            :recipes="recipes"
            :format-date="formatDate"
            :selected-camp-id="selectedCampId"
            @refresh-camp-details="loadCampDetails(selectedCampId)"
          />
        </div>
        
        <!-- Activities Tab -->
        <div v-else-if="activeTab === 'activities'" class="p-6 bg-gray-50 rounded-lg">
          <p class="text-center text-gray-500">Activity planning features coming soon.</p>
        </div>
        
        <!-- Inventory Tab -->
        <div v-else-if="activeTab === 'inventory'" class="p-6 bg-gray-50 rounded-lg">
          <p class="text-center text-gray-500">Inventory management features coming soon.</p>
        </div>
      </div>
    </div>
    
    <!-- Camp Editor Modal -->
    <BaseModal
      v-model="showCampForm"
      :title="isEditingCamp ? 'Edit Camp' : 'Create New Camp'"
      size="lg"
      confirm-text="Save Camp"
      @confirm="saveCamp"
    >
      <CampForm 
        :editing="isEditingCamp"
        :edit-camp="editCamp"
        :weien="weien"
        :selected-wei="selectedWei"
        :wei-details="weiDetails"
        :show-wei-selector="showWeiSelector"
        :wei-filter="weiFilter"
        @update:wei-filter="weiFilter = $event"
        @toggle-wei-selector="showWeiSelector = $event"
        @select-wei="selectWeiAndHideSelector($event)"
      />
    </BaseModal>
    
    <!-- Delete Camp Confirmation Modal -->
    <BaseModal
      v-model="showDeleteConfirmation"
      title="Delete Camp"
      size="sm"
      :confirm-text="'Delete'"
      confirm-button-class="bg-red-600 hover:bg-red-700"
      @confirm="deleteCamp"
    >
      <p class="mb-6">
        Are you sure you want to delete this camp? 
        This will remove all associated meals, activities, and other plans. This action cannot be undone.
      </p>
    </BaseModal>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { apiClient } from '@/services/api';
import BaseModal from '@/components/ui/BaseModal.vue';
import CampSelector from '@/components/camps/CampSelector.vue';
import CampDetails from '@/components/camps/CampDetails.vue';
import CampForm from '@/components/camps/CampForm.vue';
import MealPlanning from '@/components/camps/MealPlanning.vue';

// State
const camps = ref([]);
const selectedCampId = ref('');
const campDetails = ref(null);
const campMeals = ref([]);
const recipes = ref([]);
const showDeleteConfirmation = ref(false);

// Wei (Field) Management
const weien = ref([]);
const campWei = ref(null);
const selectedWei = ref(null);
const weiFilter = ref('');
const showWeiSelector = ref(false);
const weiDetails = ref({
  Voorgaande_Prijs: '',
  Ervaring: '',
  Opmerkingen: ''
});

// Camp form
const showCampForm = ref(false);
const isEditingCamp = ref(false);
const editCamp = ref({
  KampID: null,
  Startdatum: '',
  Eindatum: '',
  Naam: '',
  Thema: ''
});

// Planning Tabs
const activeTab = ref('meals');
const planningTabs = [
  { id: 'meals', name: 'Meals' },
  { id: 'activities', name: 'Activities' },
  { id: 'inventory', name: 'Inventory' }
];

// Meal configuration
const mealTypes = ['Ontbijt', 'Lunch', 'Avondeten', 'Snack'];

// Computed properties
const campDays = computed(() => {
  if (!campDetails.value) return [];
  
  const days = [];
  const start = new Date(campDetails.value.Startdatum);
  const end = new Date(campDetails.value.Eindatum);
  
  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day));
  }
  
  return days;
});

const filteredWeien = computed(() => {
  if (!weiFilter.value) return weien.value;
  
  const filter = weiFilter.value.toLowerCase();
  return weien.value.filter(wei => {
    return wei.Naam.toLowerCase().includes(filter) || 
           wei.Contactpersoon?.toLowerCase().includes(filter) ||
           wei.Email?.toLowerCase().includes(filter);
  });
});

// Methods
const selectCamp = (campId) => {
  selectedCampId.value = campId;
};

const loadCamps = async () => {
  try {
    const response = await apiClient.getKampen();
    camps.value = response;
  } catch (error) {
    console.error('Error loading camps:', error);
  }
};

const loadCampDetails = async (campId) => {
  try {
    const [details, meals, wei] = await Promise.all([
      apiClient.getKamp(campId),
      apiClient.getKampMaaltijden(campId),
      apiClient.getKampWei(campId).catch(err => {
        // If no wei is associated, return null without throwing
        if (err.message.includes('404')) {
          return null;
        }
        throw err;
      })
    ]);
    campDetails.value = details;
    campMeals.value = meals;
    campWei.value = wei;
  } catch (error) {
    console.error('Error loading camp details:', error);
  }
};

const loadRecipes = async () => {
  try {
    const response = await apiClient.getRecepten();
    recipes.value = response;
  } catch (error) {
    console.error('Error loading recipes:', error);
  }
};

const loadWeien = async () => {
  try {
    const response = await apiClient.getWeien();
    weien.value = response;
  } catch (error) {
    console.error('Error loading locations:', error);
  }
};

const openCampEditor = async (campId = null) => {
  // Clear form
  resetCampForm();
  
  // If editing an existing camp
  if (campId) {
    isEditingCamp.value = true;
    
    try {
      // Load camp details if not already loaded
      if (!campDetails.value || campDetails.value.KampID != campId) {
        await loadCampDetails(campId);
      }
      
      // Populate form with camp details
      editCamp.value = {
        KampID: campDetails.value.KampID,
        Naam: campDetails.value.Naam || '',
        Thema: campDetails.value.Thema || '',
        Startdatum: campDetails.value.Startdatum,
        Eindatum: campDetails.value.Eindatum
      };
      
      // Set selected wei if camp has one
      if (campWei.value) {
        selectedWei.value = weien.value.find(w => w.WeiID === campWei.value.WeiID);
        weiDetails.value = {
          Voorgaande_Prijs: campWei.value.Voorgaande_Prijs || '',
          Ervaring: campWei.value.Ervaring || '',
          Opmerkingen: campWei.value.Opmerkingen || ''
        };
      } else {
        selectedWei.value = null;
      }
    } catch (error) {
      console.error('Error loading camp for editing:', error);
    }
  } else {
    // New camp
    isEditingCamp.value = false;
  }
  
  showCampForm.value = true;
};

const resetCampForm = () => {
  editCamp.value = {
    KampID: null,
    Startdatum: '',
    Eindatum: '',
    Naam: '',
    Thema: ''
  };
  selectedWei.value = null;
  weiDetails.value = {
    Voorgaande_Prijs: '',
    Ervaring: '',
    Opmerkingen: ''
  };
  showWeiSelector.value = false;
};

const saveCamp = async () => {
  try {
    let kampId;
    
    if (isEditingCamp.value) {
      // Update existing camp
      await apiClient.updateKamp(editCamp.value.KampID, editCamp.value);
      kampId = editCamp.value.KampID;
    } else {
      // Create new camp
      const response = await apiClient.createKamp(editCamp.value);
      kampId = response.id.toString();
    }
    
    // If a wei is selected, link it to the camp
    if (selectedWei.value) {
      await apiClient.linkWeiToKamp(selectedWei.value.WeiID, kampId, weiDetails.value);
    }
    
    await loadCamps();
    selectedCampId.value = kampId.toString();
    await loadCampDetails(kampId);
    
    showCampForm.value = false;
    resetCampForm();
  } catch (error) {
    console.error('Error saving camp:', error);
  }
};

const selectWeiAndHideSelector = (wei) => {
  selectedWei.value = wei;
  showWeiSelector.value = false;
};

const confirmDeleteCamp = () => {
  showDeleteConfirmation.value = true;
};

const deleteCamp = async () => {
  try {
    await apiClient.deleteKamp(selectedCampId.value);
    showDeleteConfirmation.value = false;
    selectedCampId.value = '';
    campDetails.value = null;
    campMeals.value = [];
    campWei.value = null;
    await loadCamps();
  } catch (error) {
    console.error('Error deleting camp:', error);
  }
};

const formatDateRange = (start, end) => {
  return `${formatDate(start)} to ${formatDate(end)}`;
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Watchers
watch(selectedCampId, async (newVal) => {
  if (newVal) {
    await loadCampDetails(newVal);
  } else {
    campDetails.value = null;
    campMeals.value = [];
    campWei.value = null;
  }
});

// Lifecycle hooks
onMounted(async () => {
  await Promise.all([loadCamps(), loadRecipes(), loadWeien()]);
});
</script>
