<template>
  <div class="recepten-management">
    
    <div class="flex justify-between mb-4">
      <h2 class="text-xl font-semibold">Recepten Beheer</h2>
      <button 
        @click="openReceptModal()" 
        class="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors"
      >
        Nieuw Recept
      </button>
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="p-4 text-center">
      <div class="loader"></div>
      <p>Recepten laden...</p>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="p-4 text-red-600 bg-red-100 rounded">
      <p>{{ error }}</p>
      <button 
        @click="loadRecepten" 
        class="mt-2 px-3 py-1 bg-primary text-white rounded"
      >
        Opnieuw proberen
      </button>
    </div>

    <!-- Recepten list -->
    <div v-else class="overflow-x-auto">
      <table v-if="recepten.length > 0" class="w-full border-collapse">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-2 text-left">Naam</th>
            <th class="p-2 text-left">Vega optie</th>
            <th class="p-2 text-left">Allergieën</th>
            <th class="p-2 text-left">Moeilijkheidsgraad</th>
            <th class="p-2 text-left">Bereidingstijd</th>
            <th class="p-2 text-center">Acties</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="recept in recepten" :key="recept.ReceptID" class="border-b hover:bg-gray-50">
            <td class="p-2">{{ recept.Naam }}</td>
            <td class="p-2">
              <span v-if="recept.Heeft_Vega_Optie" class="text-green-600">✓</span>
              <span v-else class="text-red-600">✗</span>
            </td>
            <td class="p-2">{{ recept.Allergieën || '-' }}</td>
            <td class="p-2">{{ recept.Moeilijkheidsgraad || '-' }}</td>
            <td class="p-2">{{ recept.Bereidingstijd }} min.</td>
            <td class="p-2 text-center">
              <div class="flex justify-center space-x-2">
                <button 
                  @click="openReceptModal(recept)" 
                  class="p-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  title="Bewerk recept"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  @click="showDetails(recept)" 
                  class="p-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  title="Bekijk details"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button 
                  @click="confirmDeleteRecept(recept)" 
                  class="p-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                  title="Verwijder recept"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <div v-else class="p-4 bg-gray-50 text-center rounded">
        <p>Geen recepten gevonden</p>
      </div>
    </div>

    <!-- Recept Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-lg font-semibold mb-4">{{ editingRecept ? 'Recept bewerken' : 'Nieuw recept toevoegen' }}</h3>
        
        <form @submit.prevent="saveRecept">
          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Naam</label>
            <input 
              v-model="receptForm.Naam" 
              type="text" 
              required
              class="w-full p-2 border rounded"
            />
          </div>
          
          <!-- Structured Ingredients Section -->
          <div class="mb-4">
            <div class="flex justify-between items-center mb-2">
              <label class="block text-sm font-medium">Gestructureerde Ingrediënten</label>
              <button 
                type="button"
                @click="addIngredient"
                class="text-sm px-2 py-1 bg-primary text-white rounded hover:bg-primary-dark"
              >
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 inline mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" />
                </svg>
                Ingredient toevoegen
              </button>
            </div>
            
            <div 
              v-for="(ingredient, index) in receptForm.StructuredIngredienten" 
              :key="index" 
              class="p-3 border rounded mb-2 bg-gray-50"
            >
              <div class="flex justify-between mb-2">
                <h4 class="text-sm font-medium">Ingredient #{{ index + 1 }}</h4>
                <button 
                  type="button" 
                  @click="removeIngredient(index)" 
                  class="text-red-600 hover:text-red-800"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                  </svg>
                </button>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                <div>
                  <label class="block text-xs mb-1">Naam</label>
                  <input 
                    v-model="ingredient.Naam" 
                    type="text" 
                    class="w-full p-2 border rounded text-sm" 
                    required
                  />
                </div>
                <div>
                  <label class="block text-xs mb-1">Categorie</label>
                  <input 
                    v-model="ingredient.Categorie" 
                    type="text" 
                    class="w-full p-2 border rounded text-sm"
                    placeholder="bijv. Groenten, Vlees, etc."
                  />
                </div>
              </div>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label class="block text-xs mb-1">Hoeveelheid</label>
                  <input 
                    v-model.number="ingredient.Hoeveelheid" 
                    type="number" 
                    step="0.01"
                    class="w-full p-2 border rounded text-sm" 
                  />
                </div>
                <div>
                  <label class="block text-xs mb-1">Eenheid</label>
                  <select 
                    v-model="ingredient.Eenheid" 
                    class="w-full p-2 border rounded text-sm"
                  >
                    <option value="g">gram (g)</option>
                    <option value="kg">kilogram (kg)</option>
                    <option value="ml">milliliter (ml)</option>
                    <option value="l">liter (l)</option>
                    <option value="stuk">stuk</option>
                    <option value="el">eetlepel (el)</option>
                    <option value="tl">theelepel (tl)</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div v-if="receptForm.StructuredIngredienten.length === 0" class="text-center py-3 border rounded bg-gray-50 text-sm text-gray-500">
              Nog geen ingrediënten toegevoegd
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Moeilijkheidsgraad</label>
              <select 
                v-model="receptForm.Moeilijkheidsgraad" 
                class="w-full p-2 border rounded"
              >
                <option value="Makkelijk">Makkelijk</option>
                <option value="Gemiddeld">Gemiddeld</option>
                <option value="Moeilijk">Moeilijk</option>
              </select>
            </div>

            <div class="mb-4">
              <label class="block text-sm font-medium mb-1">Bereidingstijd (minuten)</label>
              <input 
                v-model.number="receptForm.Bereidingstijd" 
                type="number"
                min="1" 
                class="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Allergieën</label>
            <input 
              v-model="receptForm.Allergieën" 
              type="text" 
              class="w-full p-2 border rounded"
              placeholder="bijv. gluten, lactose, noten"
            />
          </div>

          <div class="mb-4 flex items-center">
            <input 
              id="vega-optie" 
              v-model="receptForm.Heeft_Vega_Optie" 
              type="checkbox" 
              class="mr-2"
            />
            <label for="vega-optie">Heeft vegetarische optie</label>
          </div>

          <div class="mb-4">
            <label class="block text-sm font-medium mb-1">Opmerkingen</label>
            <textarea 
              v-model="receptForm.Opmerkingen" 
              rows="3" 
              class="w-full p-2 border rounded"
            ></textarea>
          </div>

          <div class="flex justify-end space-x-2 mt-4">
            <button 
              type="button" 
              @click="showModal = false"
              class="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Annuleren
            </button>
            <button 
              type="submit" 
              class="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
              :disabled="saving"
            >
              {{ saving ? 'Opslaan...' : 'Opslaan' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Details Modal -->
    <div v-if="showDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <h3 class="text-xl font-semibold mb-3">{{ selectedRecept.Naam }}</h3>
        
        <!-- Structured Ingredients Display -->
        <div v-if="selectedRecept.StructuredIngredienten && selectedRecept.StructuredIngredienten.length > 0" class="bg-gray-50 p-4 mb-4 rounded">
          <h4 class="font-medium mb-2">Ingrediënten:</h4>
          
          <!-- Group ingredients by category if present -->
          <div v-for="category in ingredientCategories" :key="category" class="mb-3">
            <h5 v-if="category !== 'uncategorized'" class="font-medium text-sm text-gray-700 mb-1">{{ category }}</h5>
            <ul class="list-disc pl-5">
              <li v-for="ingredient in getIngredientsForCategory(category)" :key="ingredient.ID" class="mb-1">
                {{ ingredient.Hoeveelheid }} {{ ingredient.Eenheid }} {{ ingredient.Naam }}
                <span v-if="ingredient.Per_Persoon" class="text-xs text-gray-600">(per persoon)</span>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Traditional Ingredients Display -->
        <div v-else-if="selectedRecept.Ingrediënten" class="bg-gray-50 p-4 mb-4 rounded">
          <h4 class="font-medium mb-2">Ingrediënten:</h4>
          <pre class="whitespace-pre-wrap">{{ selectedRecept.Ingrediënten }}</pre>
        </div>
        
        <!-- No Ingredients -->
        <div v-else class="bg-gray-50 p-4 mb-4 rounded">
          <h4 class="font-medium mb-2">Ingrediënten:</h4>
          <p class="text-gray-600">Geen ingrediënten vermeld</p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <p><span class="font-medium">Moeilijkheidsgraad:</span> {{ selectedRecept.Moeilijkheidsgraad || '-' }}</p>
            <p><span class="font-medium">Bereidingstijd:</span> {{ selectedRecept.Bereidingstijd }} minuten</p>
          </div>
          <div>
            <p><span class="font-medium">Vegetarische optie:</span> {{ selectedRecept.Heeft_Vega_Optie ? 'Ja' : 'Nee' }}</p>
            <p><span class="font-medium">Allergieën:</span> {{ selectedRecept.Allergieën || 'Geen' }}</p>
          </div>
        </div>

        <div class="mb-4" v-if="selectedRecept.Opmerkingen">
          <h4 class="font-medium mb-2">Opmerkingen:</h4>
          <p class="whitespace-pre-wrap">{{ selectedRecept.Opmerkingen }}</p>
        </div>

        <div class="flex justify-end mt-4">
          <button 
            @click="showDetailsModal = false" 
            class="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 class="text-lg font-semibold mb-4">Recept verwijderen</h3>
        <p>Weet je zeker dat je het recept "{{ receptToDelete?.Naam }}" wilt verwijderen?</p>
        <p class="text-sm text-gray-600 mt-2">Deze actie kan niet ongedaan worden gemaakt.</p>
        
        <div class="flex justify-end space-x-2 mt-6">
          <button 
            @click="showDeleteModal = false" 
            class="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Annuleren
          </button>
          <button 
            @click="deleteRecept" 
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            :disabled="deleting"
          >
            {{ deleting ? 'Verwijderen...' : 'Verwijderen' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Simple toast notification -->
    <div 
      v-if="toast.show" 
      class="fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-md z-50"
      :class="{
        'bg-green-100 text-green-800': toast.type === 'success',
        'bg-red-100 text-red-800': toast.type === 'error'
      }"
    >
      {{ toast.message }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import ScoutManagementNav from '@/components/admin/ScoutManagementNav.vue';
import { apiClient } from '@/services/api';

// State variables
const recepten = ref([]);
const loading = ref(true);
const error = ref(null);
const showModal = ref(false);
const showDetailsModal = ref(false);
const showDeleteModal = ref(false);
const saving = ref(false);
const deleting = ref(false);
const editingRecept = ref(null);
const selectedRecept = ref({});
const receptToDelete = ref(null);

// Form data
const receptForm = reactive({
  Naam: '',
  Ingrediënten: '',
  Heeft_Vega_Optie: false,
  Allergieën: '',
  Moeilijkheidsgraad: 'Gemiddeld',
  Bereidingstijd: 30,
  Opmerkingen: '',
  StructuredIngredienten: []
});

// Simple toast implementation if you don't have a useToast composable
const toast = ref({
  show: false,
  message: '',
  type: 'success',
  timeout: null
});

// Computed properties for ingredient categories
const ingredientCategories = computed(() => {
  if (!selectedRecept.value.StructuredIngredienten || selectedRecept.value.StructuredIngredienten.length === 0) {
    return [];
  }
  
  const categories = new Set();
  
  selectedRecept.value.StructuredIngredienten.forEach(ingredient => {
    if (ingredient.Categorie) {
      categories.add(ingredient.Categorie);
    } else {
      categories.add('uncategorized');
    }
  });
  
  return Array.from(categories);
});

// Methods for handling ingredients
function getIngredientsForCategory(category) {
  if (!selectedRecept.value.StructuredIngredienten) return [];
  
  return selectedRecept.value.StructuredIngredienten.filter(ingredient => {
    if (category === 'uncategorized') {
      return !ingredient.Categorie;
    }
    return ingredient.Categorie === category;
  });
}

function addIngredient() {
  receptForm.StructuredIngredienten.push({
    Naam: '',
    Hoeveelheid: 0,
    Eenheid: 'g',
    Per_Persoon: true,
    Categorie: ''
  });
}

function removeIngredient(index) {
  receptForm.StructuredIngredienten.splice(index, 1);
}

function showToast(message, type = 'success') {
  if (toast.value.timeout) {
    clearTimeout(toast.value.timeout);
  }
  
  toast.value = {
    show: true,
    message,
    type,
    timeout: setTimeout(() => {
      toast.value.show = false;
    }, 3000)
  };
}

// Load recepten on component mount
onMounted(() => {
  loadRecepten();
});

// Load recepten from API
async function loadRecepten() {
  loading.value = true;
  error.value = null;
  
  try {
    recepten.value = await apiClient.getRecepten();
  } catch (err) {
    console.error('Error loading recepten:', err);
    error.value = 'Er is een fout opgetreden bij het laden van de recepten';
  } finally {
    loading.value = false;
  }
}

// Open modal to create or edit a recept
function openReceptModal(recept = null) {
  editingRecept.value = recept;
  
  if (recept) {
    // Edit existing recept - fill form with data
    Object.keys(receptForm).forEach(key => {
      if (key === 'StructuredIngredienten') {
        receptForm.StructuredIngredienten = recept.StructuredIngredienten 
          ? JSON.parse(JSON.stringify(recept.StructuredIngredienten)) 
          : [];
      } else {
        receptForm[key] = recept[key] !== undefined ? recept[key] : receptForm[key];
      }
    });
    
    // Ensure Per_Persoon is a boolean
    if (receptForm.StructuredIngredienten.length > 0) {
      receptForm.StructuredIngredienten.forEach(ingredient => {
        ingredient.Per_Persoon = !!ingredient.Per_Persoon;
      });
    }
  } else {
    // Create new recept - reset form
    Object.keys(receptForm).forEach(key => {
      if (key === 'StructuredIngredienten') {
        receptForm.StructuredIngredienten = [];
      } else if (typeof receptForm[key] === 'boolean') {
        receptForm[key] = false;
      } else if (typeof receptForm[key] === 'number') {
        receptForm[key] = key === 'Bereidingstijd' ? 30 : 0;
      } else {
        receptForm[key] = '';
      }
    });
    receptForm.Moeilijkheidsgraad = 'Gemiddeld';
  }
  
  showModal.value = true;
}

// Show recept details
async function showDetails(recept) {
  loading.value = true;
  
  try {
    // Fetch detailed recept information with ingredients
    const detailedRecept = await apiClient.getRecept(recept.ReceptID);
    selectedRecept.value = detailedRecept;
    showDetailsModal.value = true;
  } catch (err) {
    console.error('Error fetching recept details:', err);
    showToast('Er is een fout opgetreden bij het ophalen van de receptdetails', 'error');
  } finally {
    loading.value = false;
  }
}

// Save recept (create or update)
async function saveRecept() {
  saving.value = true;
  
  try {
    if (editingRecept.value) {
      // Update existing recept
      await apiClient.updateRecept(editingRecept.value.ReceptID, receptForm);
      showToast('Recept bijgewerkt', 'success');
    } else {
      // Create new recept
      await apiClient.createRecept(receptForm);
      showToast('Recept toegevoegd', 'success');
    }
    
    // Reload the list and close the modal
    await loadRecepten();
    showModal.value = false;
  } catch (err) {
    console.error('Error saving recept:', err);
    showToast('Er is een fout opgetreden bij het opslaan van het recept', 'error');
  } finally {
    saving.value = false;
  }
}

// Show delete confirmation
function confirmDeleteRecept(recept) {
  receptToDelete.value = recept;
  showDeleteModal.value = true;
}

// Delete recept
async function deleteRecept() {
  if (!receptToDelete.value) return;
  
  deleting.value = true;
  
  try {
    await apiClient.deleteRecept(receptToDelete.value.ReceptID);
    await loadRecepten();
    showToast('Recept verwijderd', 'success');
    showDeleteModal.value = false;
  } catch (err) {
    console.error('Error deleting recept:', err);
    showToast(
      err.message?.includes('in gebruik') 
        ? 'Dit recept is in gebruik en kan niet worden verwijderd' 
        : 'Er is een fout opgetreden bij het verwijderen van het recept', 
      'error'
    );
  } finally {
    deleting.value = false;
  }
}
</script>

<style scoped>
.loader {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 1rem auto;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
