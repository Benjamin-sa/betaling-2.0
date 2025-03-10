<template>
  <div>
    <div class="mb-6 flex justify-between items-center">
      <h3 class="text-xl font-semibold">Weien Beheer</h3>
      <button
        @click="showAddForm = true"
        class="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition"
      >
        <i class="fas fa-plus mr-2"></i>Nieuwe Wei Toevoegen
      </button>
    </div>

    <!-- Success message -->
    <div v-if="successMessage" class="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
      <span class="block sm:inline">{{ successMessage }}</span>
      <button @click="successMessage = ''" class="absolute top-0 bottom-0 right-0 px-4">
        <span class="sr-only">Sluiten</span>
        <i class="fas fa-times"></i>
      </button>
    </div>

    <!-- Loading and error states -->
    <div v-if="loading" class="text-center py-6">
      <div class="spinner"></div>
      <p class="mt-2">Weien laden...</p>
    </div>
    
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
      <p>{{ error }}</p>
    </div>

    <!-- Wei Form Dialog -->
    <div v-if="showAddForm || showEditForm" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-semibold">{{ showEditForm ? 'Wei bewerken' : 'Nieuwe wei toevoegen' }}</h3>
          <button @click="closeForm" class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <WeiForm 
          :wei="currentWei" 
          @save="saveWei" 
          @cancel="closeForm"
        />
      </div>
    </div>

    <!-- Confirmation Dialog -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-xl font-semibold mb-4">Wei verwijderen</h3>
        <p class="mb-6">Weet je zeker dat je de wei "{{ weiToDelete?.Naam }}" wilt verwijderen?</p>
        <div class="flex justify-end gap-3">
          <button 
            @click="showDeleteConfirm = false; weiToDelete = null;" 
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Annuleren
          </button>
          <button 
            @click="confirmDelete" 
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
          >
            Verwijderen
          </button>
        </div>
      </div>
    </div>

    <!-- Wei list -->
    <div v-if="!loading && !error && weien.length > 0" class="overflow-x-auto">
      <table class="min-w-full bg-white border border-gray-200">
        <thead>
          <tr>
            <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Naam
            </th>
            <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Contactpersoon
            </th>
            <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Telefoonnummer
            </th>
            <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              E-mail
            </th>
            <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Hectare
            </th>
            <th class="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
              Coördinaten
            </th>
            <th class="px-6 py-3 border-b border-gray-200 bg-gray-50"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="wei in weien" :key="wei.WeiID">
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              {{ wei.Naam }}
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              {{ wei.Contactpersoon }}
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              {{ wei.Telefoonnummer }}
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              {{ wei.Email }}
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              {{ wei.Aantal_Hectare }}
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
              {{ wei.Coordinaten || '-' }}
              <a 
                v-if="wei.Coordinaten" 
                :href="`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(wei.Coordinaten)}`"
                target="_blank"
                class="ml-2 text-blue-500 hover:text-blue-700"
                title="Bekijk op Google Maps"
              >
                <i class="fas fa-map-marker-alt"></i>
              </a>
            </td>
            <td class="px-6 py-4 whitespace-no-wrap border-b border-gray-200 text-right">
              <div class="flex justify-end">
                <button 
                  @click="editWei(wei)" 
                  class="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-md mr-2"
                  title="Bewerken"
                >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                </button>
                <button 
                  @click="deleteWei(wei)" 
                  class="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-md"
                  title="Verwijderen"
                >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!loading && !error && weien.length === 0" class="text-center py-10 bg-gray-50 rounded">
      <i class="fas fa-info-circle text-gray-400 text-3xl mb-2"></i>
      <p class="text-gray-500">Geen weien gevonden. Voeg een nieuwe wei toe.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiClient } from '@/services/api';
import WeiForm from '@/components/admin/WeiForm.vue';

const weien = ref([]);
const loading = ref(true);
const error = ref(null);
const showAddForm = ref(false);
const showEditForm = ref(false);
const currentWei = ref(null);
const successMessage = ref('');
const showDeleteConfirm = ref(false);
const weiToDelete = ref(null);

onMounted(async () => {
  await loadWeien();
});

const loadWeien = async () => {
  try {
    loading.value = true;
    weien.value = await apiClient.getWeien();
  } catch (err) {
    error.value = `Error loading weien: ${err.message}`;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const editWei = (wei) => {
  currentWei.value = { ...wei };
  showEditForm.value = true;
};

const closeForm = () => {
  showAddForm.value = false;
  showEditForm.value = false;
  currentWei.value = null;
};

const saveWei = async (weiData) => {
  try {
    loading.value = true;
    if (weiData.WeiID) {
      // Update existing wei
      await apiClient.updateWei(weiData.WeiID, weiData);
      successMessage.value = `Wei "${weiData.Naam}" is succesvol bijgewerkt`;
    } else {
      // Create new wei
      const response = await apiClient.createWei(weiData);
      successMessage.value = `Nieuwe wei "${weiData.Naam}" is succesvol toegevoegd`;
    }
    
    // Refresh the list
    await loadWeien();
    closeForm();
    
    // Auto-dismiss success message after 5 seconds
    setTimeout(() => {
      if (successMessage.value) {
        successMessage.value = '';
      }
    }, 5000);
  } catch (err) {
    error.value = `Error saving wei: ${err.message}`;
    console.error(err);
  } finally {
    loading.value = false;
  }
};

const deleteWei = (wei) => {
  weiToDelete.value = wei;
  showDeleteConfirm.value = true;
};

const confirmDelete = async () => {
  try {
    loading.value = true;
    showDeleteConfirm.value = false;
    
    if (!weiToDelete.value) return;
    
    await apiClient.deleteWei(weiToDelete.value.WeiID);
    successMessage.value = `Wei "${weiToDelete.value.Naam}" is succesvol verwijderd`;
    
    // Refresh the list
    await loadWeien();
    weiToDelete.value = null;
    
    // Auto-dismiss success message after 5 seconds
    setTimeout(() => {
      if (successMessage.value) {
        successMessage.value = '';
      }
    }, 5000);
  } catch (err) {
    error.value = `Error deleting wei: ${err.message}`;
    console.error(err);
    showDeleteConfirm.value = false;
    weiToDelete.value = null;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: theme('colors.primary');
  animation: spin 1s linear infinite;
  margin: 0 auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
