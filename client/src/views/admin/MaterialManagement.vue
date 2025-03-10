<template>
  <div>
    <h3 class="text-lg font-medium text-gray-900 mb-6">Materialen Beheer</h3>

    <!-- Add Material Form -->
    <div class="bg-white shadow rounded-lg p-6 mb-8">
      <h4 class="text-md font-medium text-gray-800 mb-4">Nieuw Materiaal Toevoegen</h4>
      <form @submit.prevent="handleAddMaterial" class="space-y-4">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="naam" class="block text-sm font-medium text-gray-700">Naam</label>
            <input
              id="naam"
              v-model="newMaterial.Naam"
              type="text"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div>
            <label for="type" class="block text-sm font-medium text-gray-700">Type</label>
            <select
              id="type"
              v-model="newMaterial.TypeID"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
              @change="handleTypeChange"
            >
              <option value="" disabled>Selecteer een type</option>
              <option v-for="type in materialTypes" :key="type.TypeID" :value="type.TypeID">
                {{ type.Naam }}
              </option>
            </select>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label for="aantal" class="block text-sm font-medium text-gray-700">Aantal</label>
            <input
              id="aantal"
              v-model.number="newMaterial.Aantal"
              type="number"
              min="1"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div>
            <label for="aanschafdatum" class="block text-sm font-medium text-gray-700">Aanschafdatum</label>
            <input
              id="aanschafdatum"
              v-model="newMaterial.Aanschafdatum"
              type="date"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            />
          </div>
          <div>
            <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              v-model="newMaterial.Status"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            >
              <option value="Goed">Goed</option>
              <option value="Beschadigd">Beschadigd</option>
              <option value="Reparatie nodig">Reparatie nodig</option>
              <option value="Afgekeurd">Afgekeurd</option>
            </select>
          </div>
        </div>

        <div v-if="showTentOptions" class="space-y-4">
          <h5 class="text-sm font-medium text-gray-700">Tent Details</h5>
          <div class="flex items-center">
            <input
              id="tentpalen"
              v-model="newMaterial.Tentpalen_In_Orde"
              type="checkbox"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label for="tentpalen" class="ml-2 block text-sm text-gray-700">Tentpalen in orde</label>
          </div>
        </div>

        <div class="flex items-center space-x-4">
          <div class="flex items-center">
            <input
              id="isTent"
              v-model="isTent"
              type="checkbox"
              class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              @change="handleIsTentChange"
            />
            <label for="isTent" class="ml-2 block text-sm text-gray-700">Is een tent</label>
          </div>
          <button
            type="submit"
            class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            :disabled="loading"
          >
            <svg v-if="loading" class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ loading ? 'Bezig met toevoegen...' : 'Toevoegen' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Materials List -->
    <div class="bg-white shadow rounded-lg p-6">
      <div class="flex justify-between items-center mb-4">
        <h4 class="text-md font-medium text-gray-800">Materialen Lijst</h4>
        <div class="flex space-x-2">
          <button
            @click="loadMaterialen"
            class="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg v-if="refreshing" class="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <svg v-else xmlns="http://www.w3.org/2000/svg" class="-ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Vernieuwen
          </button>
        </div>
      </div>

      <div v-if="loading" class="py-4 text-center text-gray-500">
        Materialen laden...
      </div>

      <div v-else-if="materialen.length === 0" class="py-4 text-center text-gray-500">
        Geen materialen gevonden.
      </div>

      <div v-else class="mt-4 overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Naam</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aantal</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="material in materialen" :key="material.MateriaalID">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ material.Naam }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ material.Type }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ material.Aantal }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <span 
                  :class="{
                    'px-2 py-1 text-xs rounded-full': true,
                    'bg-green-100 text-green-800': material.Status === 'Goed',
                    'bg-yellow-100 text-yellow-800': material.Status === 'Beschadigd' || material.Status === 'Reparatie nodig',
                    'bg-red-100 text-red-800': material.Status === 'Afgekeurd'
                  }"
                >
                  {{ material.Status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex space-x-2">
                  <button
                    @click="editMaterial(material)"
                    class="text-primary hover:text-primary-dark"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button
                    @click="deleteMaterial(material.MateriaalID)"
                    class="text-red-500 hover:text-red-700"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { apiClient } from '@/services/api';

const materialen = ref([]);
const materialTypes = ref([]); // Add this to store material types
const loading = ref(true);
const refreshing = ref(false);
const showTentOptions = ref(false);
const isTent = ref(false);

// Use reactive instead of ref for better object handling
const newMaterial = reactive({
  Naam: '',
  Type: '',
  TypeID: '',
  Aantal: 1,
  Aanschafdatum: new Date().toISOString().split('T')[0],
  Status: 'Goed',
  Tentpalen_In_Orde: true
});

const handleTypeChange = () => {
  const selectedType = materialTypes.value.find(type => type.TypeID === newMaterial.TypeID);
  if (selectedType) {
    newMaterial.Type = selectedType.Naam;
    
    // If type is a tent, check the tent checkbox
    if (selectedType.Naam === 'Tent' || selectedType.Naam === 'Materiaaltent') {
      isTent.value = true;
      showTentOptions.value = true;
    } else {
      isTent.value = false;
      showTentOptions.value = false;
    }
  }
};

const handleIsTentChange = () => {
  showTentOptions.value = isTent.value;
  if (isTent.value) {
    // Find the tent type ID
    const tentType = materialTypes.value.find(type => type.Naam === 'Tent');
    if (tentType) {
      newMaterial.TypeID = tentType.TypeID;
      newMaterial.Type = 'Tent';
    }
  }
};

// Load material types
const loadMaterialTypes = async () => {
  try {
    refreshing.value = true;
    const response = await apiClient.getMaterialTypes();
    materialTypes.value = response;
  } catch (error) {
    console.error('Error loading material types:', error);
    alert('Er is een fout opgetreden bij het laden van de materiaal types.');
  }
  refreshing.value = false;
};

const loadMaterialen = async () => {
  try {
    refreshing.value = true;
    const response = await apiClient.getMaterialen();
    materialen.value = response;
  } catch (error) {
    console.error('Error loading materialen:', error);
    alert('Er is een fout opgetreden bij het laden van de materialen.');
  } finally {
    loading.value = false;
    refreshing.value = false;
  }
};

const handleAddMaterial = async () => {
  try {
    loading.value = true;
    
    // Prepare data for submission - ensure correct types
    const materialToSubmit = {
      ...newMaterial,
      Aantal: Number(newMaterial.Aantal) // Ensure aantal is a number
    };
    
    if (isTent.value) {
      await apiClient.createTent(materialToSubmit);
    } else {
      await apiClient.createMateriaal(materialToSubmit);
    }
    
    // Reset form with correct types
    Object.assign(newMaterial, {
      Naam: '',
      Type: '',
      TypeID: '',
      Aantal: 1,
      Aanschafdatum: new Date().toISOString().split('T')[0],
      Status: 'Goed',
      Tentpalen_In_Orde: true
    });
    
    isTent.value = false;
    showTentOptions.value = false;
    
    // Refresh the list
    await loadMaterialen();
    alert('Materiaal succesvol toegevoegd!');
  } catch (error) {
    console.error('Error adding material:', error);
    alert('Er is een fout opgetreden bij het toevoegen van het materiaal.');
  } finally {
    loading.value = false;
  }
};

const editMaterial = (material) => {
  // Implement edit functionality
  alert('Bewerken van materiaal functionaliteit komt binnenkort!');
};

const deleteMaterial = async (id) => {
  if (!confirm('Weet je zeker dat je dit materiaal wilt verwijderen?')) return;
  
  try {
    loading.value = true;
    await apiClient.deleteMateriaal(id);
    await loadMaterialen();
    alert('Materiaal succesvol verwijderd!');
  } catch (error) {
    console.error('Error deleting material:', error);
    alert('Er is een fout opgetreden bij het verwijderen van het materiaal.');
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  // Load material types first
  await loadMaterialTypes();
  // Then load materials
  await loadMaterialen();
});
</script>
