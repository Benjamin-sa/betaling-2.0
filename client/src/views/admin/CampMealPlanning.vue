<template>
  <div>
    <h2 class="text-2xl font-semibold mb-6">Camp Meal Planning</h2>
    
    <!-- Camp Selection -->
    <div class="mb-6 bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-medium mb-3">Select Camp</h3>
      <div class="flex gap-4 items-center">
        <select v-model="selectedCampId" class="rounded border px-3 py-2 flex-grow">
          <option value="">-- Select a camp --</option>
          <option v-for="camp in camps" :key="camp.KampID" :value="camp.KampID">
            {{ camp.Naam ? camp.Naam : formatDateRange(camp.Startdatum, camp.Eindatum) }}
          </option>
        </select>
        <button @click="openCampEditor()" class="bg-primary text-white px-4 py-2 rounded hover:bg-green-700">
          New Camp
        </button>
        <button 
          v-if="selectedCampId" 
          @click="openCampEditor(selectedCampId)" 
          class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Edit Camp
        </button>
        <button 
          v-if="selectedCampId" 
          @click="confirmDeleteCamp" 
          class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Delete Camp
        </button>
      </div>
    </div>
    
    <!-- Camp Details Section (visible when camp is selected) -->
    <div v-if="selectedCampId && campDetails" class="bg-white p-4 rounded-lg shadow mb-6">
      <h3 class="text-lg font-medium mb-4">
        {{ campDetails.Naam ? `${campDetails.Naam} - ` : '' }}
        {{ formatDateRange(campDetails.Startdatum, campDetails.Eindatum) }}
        <span v-if="campDetails.Thema" class="text-sm text-gray-500 ml-2">({{ campDetails.Thema }})</span>
      </h3>
      
      <!-- Wei (Field) Information Display -->
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <h4 class="font-medium text-lg">Camp Location</h4>
        </div>
        
        <!-- Display current wei information -->
        <div v-if="campWei" class="bg-gray-50 p-4 rounded">
          <h5 class="font-medium text-lg mb-2">{{ campWei.Naam }}</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p><span class="font-medium">Contact:</span> {{ campWei.Contactpersoon }}</p>
              <p><span class="font-medium">Phone:</span> {{ campWei.Telefoonnummer }}</p>
              <p><span class="font-medium">Email:</span> {{ campWei.Email }}</p>
            </div>
            <div>
              <p><span class="font-medium">Size:</span> {{ campWei.Aantal_Hectare }} hectares</p>
              <p><span class="font-medium">Previous Price:</span> €{{ campWei.Voorgaande_Prijs || 'N/A' }}</p>
              <p><span class="font-medium">Experience:</span> {{ campWei.Ervaring || 'None' }}</p>
            </div>
          </div>
          <div v-if="campWei.Opmerkingen" class="mt-2">
            <p><span class="font-medium">Notes:</span></p>
            <p class="italic text-gray-600">{{ campWei.Opmerkingen }}</p>
          </div>
        </div>
        <div v-else class="text-gray-500 italic">No location set for this camp</div>
      </div>
    </div>
    
    <!-- Meal Planning Section (visible when camp is selected) -->
    <div v-if="selectedCampId && campDetails" class="bg-white p-4 rounded-lg shadow">
      <h3 class="text-lg font-medium mb-4">Meal Planning</h3>
      
      <!-- Days Agenda -->
      <div class="grid grid-cols-1 gap-6">
        <div v-for="(day, index) in campDays" :key="index" class="border rounded-lg p-4">
          <h4 class="font-medium text-lg mb-3">{{ formatDate(day) }}</h4>
          
          <!-- Meals for this day -->
          <div class="space-y-4">
            <div v-for="mealType in mealTypes" :key="mealType" class="border-l-4 border-primary pl-3 py-2">
              <div class="flex justify-between items-center mb-2">
                <h5 class="font-medium">{{ mealType }}</h5>
                <button 
                  @click="showMealModal(day, mealType)" 
                  class="text-sm bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
                >
                  {{ getMeal(day, mealType) ? 'Edit' : 'Add' }} Meal
                </button>
              </div>
              
              <!-- Display meal info if exists -->
              <div v-if="getMeal(day, mealType)" class="bg-gray-50 p-2 rounded text-sm">
                <div class="flex justify-between mb-1">
                  <div>
                    <span class="font-medium">Eaters:</span> {{ getMeal(day, mealType).Aantal_Eters || 0 }}
                  </div>
                  <button 
                    @click="showAttendanceModal(getMeal(day, mealType))" 
                    class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded hover:bg-blue-100"
                  >
                    Manage Attendance
                  </button>
                </div>
                <div v-if="getMeal(day, mealType).ReceptID" class="text-sm">
                  <span class="font-medium">Recipe:</span> {{ getMealRecipeName(getMeal(day, mealType).ReceptID) }}
                </div>
              </div>
              <div v-else class="text-gray-500 text-sm italic">No meal planned</div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Wei Selection Modal -->
    <div v-if="showWeiModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium">Select Camp Location</h3>
          <button @click="closeWeiModal" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Search & Filter -->
        <div class="mb-4">
          <input 
            type="text" 
            v-model="weiFilter" 
            placeholder="Search locations..." 
            class="w-full px-4 py-2 border rounded"
          >
        </div>
        
        <!-- Wei Details Form (when selecting a wei) -->
        <div v-if="selectedWei" class="border-t pt-4 mb-4">
          <h4 class="font-medium mb-2">Additional Information for {{ selectedWei.Naam }}</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Previous Price (€)</label>
              <input 
                type="number" 
                v-model="weiDetails.Voorgaande_Prijs" 
                class="w-full px-3 py-2 border rounded"
                step="0.01"
              >
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Experience</label>
              <select v-model="weiDetails.Ervaring" class="w-full px-3 py-2 border rounded">
                <option value="">-- Select --</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
                <option value="First Time">First Time</option>
              </select>
            </div>
            <div class="col-span-1 md:col-span-2">
              <label class="block text-sm font-medium mb-1">Notes</label>
              <textarea 
                v-model="weiDetails.Opmerkingen" 
                class="w-full px-3 py-2 border rounded"
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        
        <!-- Wei List -->
        <div class="border rounded overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (ha)</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="wei in filteredWeien" :key="wei.WeiID" :class="{'bg-blue-50': selectedWei && selectedWei.WeiID === wei.WeiID}">
                <td class="px-4 py-2">{{ wei.Naam }}</td>
                <td class="px-4 py-2">{{ wei.Contactpersoon }}</td>
                <td class="px-4 py-2">{{ wei.Aantal_Hectare }}</td>
                <td class="px-4 py-2">{{ wei.Coordinaten || 'N/A' }}</td>
                <td class="px-4 py-2">
                  <button 
                    @click="selectWei(wei)" 
                    class="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200"
                  >
                    Select
                  </button>
                </td>
              </tr>
              <tr v-if="weien.length === 0">
                <td colspan="5" class="px-4 py-2 text-center text-gray-500">No locations available</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeWeiModal" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button 
            @click="linkWeiToCamp" 
            class="px-4 py-2 bg-primary text-white rounded hover:bg-green-700"
            :disabled="!selectedWei"
          >
            Save Location
          </button>
        </div>
      </div>
    </div>
    
    <!-- Meal Modal -->
    <div v-if="showMealForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium mb-4">{{ currentMeal?.MaaltijdID ? 'Edit' : 'Add' }} Meal</h3>
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Meal Type</label>
            <select 
              v-model="currentMeal.Soort_Maaltijd" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              disabled
            >
              <option v-for="type in mealTypes" :key="type" :value="type">{{ type }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Recipe</label>
            <select 
              v-model="currentMeal.ReceptID" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option :value="null">-- No Recipe --</option>
              <option v-for="recipe in recipes" :key="recipe.ReceptID" :value="recipe.ReceptID">
                {{ recipe.Naam }}
              </option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Expected Number of Eaters</label>
            <input 
              type="number" 
              v-model="currentMeal.Aantal_Eters" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Notes</label>
            <textarea 
              v-model="currentMeal.Notes" 
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              rows="3"
            ></textarea>
          </div>
        </div>
        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeMealModal" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button @click="saveMeal" class="px-4 py-2 bg-primary text-white rounded hover:bg-green-700">
            Save
          </button>
        </div>
      </div>
    </div>
    
    <!-- Attendance Modal -->
    <div v-if="showAttendance" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-y-auto">
        <h3 class="text-lg font-medium mb-2">Manage Attendance</h3>
        <p class="text-gray-600 mb-4">
          {{ formatDate(selectedMeal?.Datum) }} - {{ selectedMeal?.Soort_Maaltijd }}
        </p>
        
        <div class="mb-4 flex gap-2">
          <input 
            type="text" 
            v-model="memberFilter" 
            placeholder="Search members..." 
            class="px-3 py-2 border rounded flex-grow"
          >
        </div>
        
        <div class="border rounded">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Section</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attending</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Special Needs</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="member in filteredMembers" :key="member.LidID">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ member.Voornaam }} {{ member.Achternaam }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ member.Tak }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="checkbox" 
                    :checked="isAttending(member.LidID)"
                    @change="toggleAttendance(member.LidID)"
                    class="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  >
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <input 
                    type="text" 
                    v-model="specialNeeds[member.LidID]" 
                    placeholder="Special needs..."
                    class="px-2 py-1 border rounded text-sm w-full"
                    :disabled="!isAttending(member.LidID)"
                  >
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeAttendanceModal" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button @click="saveAttendance" class="px-4 py-2 bg-primary text-white rounded hover:bg-green-700">
            Save Attendance
          </button>
        </div>
      </div>
    </div>
    
    <!-- Delete Camp Confirmation Modal -->
    <div v-if="showDeleteConfirmation" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium mb-4 text-red-600">Delete Camp</h3>
        <p class="mb-6">
          Are you sure you want to delete this camp? 
          This will remove all meals associated with this camp and cannot be undone.
        </p>
        <div class="flex justify-end gap-3">
          <button @click="showDeleteConfirmation = false" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button @click="deleteCamp" class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
            Delete
          </button>
        </div>
      </div>
    </div>
    
    <!-- Camp Editor Modal -->
    <div v-if="showCampForm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-medium">{{ isEditingCamp ? 'Edit Camp' : 'Create New Camp' }}</h3>
          <button @click="closeCampForm" class="text-gray-400 hover:text-gray-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        
        <!-- Camp Form -->
        <div class="space-y-6">
          <!-- Camp Details Section -->
          <div>
            <h4 class="font-medium text-lg mb-3">Camp Details</h4>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700">Camp Name</label>
                <input 
                  type="text" 
                  v-model="editCamp.Naam" 
                  placeholder="Summer Camp 2024"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Theme</label>
                <input 
                  type="text" 
                  v-model="editCamp.Thema" 
                  placeholder="Pirates"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">Start Date</label>
                <input 
                  type="date" 
                  v-model="editCamp.Startdatum" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700">End Date</label>
                <input 
                  type="date" 
                  v-model="editCamp.Eindatum" 
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                >
              </div>
            </div>
          </div>
          
          <!-- Wei (Field) Selection Section -->
          <div class="border-t pt-4">
            <div class="flex justify-between items-center mb-3">
              <h4 class="font-medium text-lg">Camp Location</h4>
            </div>
            
            <div v-if="!showWeiSelector" class="mb-4">
              <!-- Selected Wei display or button to add if none selected -->
              <div v-if="selectedWei" class="bg-gray-50 p-4 rounded mb-3">
                <div class="flex justify-between items-center">
                  <h5 class="font-medium">{{ selectedWei.Naam }}</h5>
                  <button @click="showWeiSelector = true" class="text-blue-600 text-sm hover:underline">
                    Change Location
                  </button>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
                  <p><span class="font-medium">Contact:</span> {{ selectedWei.Contactpersoon }}</p>
                  <p><span class="font-medium">Size:</span> {{ selectedWei.Aantal_Hectare }} hectares</p>
                </div>
                <!-- Wei Details Form -->
                <div class="mt-3 border-t pt-3">
                  <h6 class="font-medium text-sm mb-2">Additional Information</h6>
                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                    <div>
                      <label class="block text-xs font-medium text-gray-600">Previous Price (€)</label>
                      <input 
                        type="number" 
                        v-model="weiDetails.Voorgaande_Prijs" 
                        class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
                        step="0.01"
                      >
                    </div>
                    <div>
                      <label class="block text-xs font-medium text-gray-600">Experience</label>
                      <select v-model="weiDetails.Ervaring" class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm">
                        <option value="">-- Select --</option>
                        <option value="Positive">Positive</option>
                        <option value="Neutral">Neutral</option>
                        <option value="Negative">Negative</option>
                        <option value="First Time">First Time</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label class="block text-xs font-medium text-gray-600">Notes</label>
                    <textarea 
                      v-model="weiDetails.Opmerkingen" 
                      class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
                      rows="2"
                    ></textarea>
                  </div>
                </div>
              </div>
              <div v-else class="flex justify-center">
                <button @click="showWeiSelector = true" class="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">
                  Select Camp Location
                </button>
              </div>
            </div>
            
            <!-- Wei Selector -->
            <div v-if="showWeiSelector" class="border rounded-lg p-4">
              <!-- Search & Filter -->
              <div class="mb-4">
                <input 
                  type="text" 
                  v-model="weiFilter" 
                  placeholder="Search locations..." 
                  class="w-full px-3 py-1 text-sm border rounded"
                >
              </div>
              
              <!-- Wei List -->
              <div class="border rounded overflow-hidden max-h-60 overflow-y-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size (ha)</th>
                      <th class="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="wei in filteredWeien" :key="wei.WeiID" :class="{'bg-blue-50': selectedWei && selectedWei.WeiID === wei.WeiID}">
                      <td class="px-3 py-2">{{ wei.Naam }}</td>
                      <td class="px-3 py-2">{{ wei.Contactpersoon }}</td>
                      <td class="px-3 py-2">{{ wei.Aantal_Hectare }}</td>
                      <td class="px-3 py-2">
                        <button 
                          @click="selectWeiAndHideSelector(wei)" 
                          class="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm hover:bg-blue-200"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div class="mt-3 flex justify-end">
                <button @click="showWeiSelector = false" class="text-sm text-gray-600 hover:underline">
                  Cancel Selection
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Form Actions -->
        <div class="mt-6 flex justify-end gap-3">
          <button @click="closeCampForm" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
            Cancel
          </button>
          <button @click="saveCamp" class="px-4 py-2 bg-primary text-white rounded hover:bg-green-700">
            Save Camp
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { apiClient } from '@/services/api';

// State
const camps = ref([]);
const selectedCampId = ref('');
const campDetails = ref(null);
const campMeals = ref([]);
const leden = ref([]);
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

// Meal management
const showMealForm = ref(false);
const currentMeal = ref({});
const selectedDay = ref(null);
const mealTypes = ['Ontbijt', 'Lunch', 'Avondeten', 'Snack'];

// Attendance management
const showAttendance = ref(false);
const selectedMeal = ref(null);
const memberFilter = ref('');
const attendees = ref([]);
const specialNeeds = ref({});

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

const filteredMembers = computed(() => {
  if (!memberFilter.value) return leden.value;
  
  const filter = memberFilter.value.toLowerCase();
  return leden.value.filter(member => {
    const fullName = `${member.Voornaam} ${member.Achternaam}`.toLowerCase();
    return fullName.includes(filter) || member.Tak?.toLowerCase().includes(filter);
  });
});

// Methods
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

const loadLeden = async () => {
  try {
    const response = await apiClient.getLeden();
    leden.value = response;
  } catch (error) {
    console.error('Error loading members:', error);
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

const closeCampForm = () => {
  showCampForm.value = false;
  resetCampForm();
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

// Computed properties for wei filtering
const filteredWeien = computed(() => {
  if (!weiFilter.value) return weien.value;
  
  const filter = weiFilter.value.toLowerCase();
  return weien.value.filter(wei => {
    return wei.Naam.toLowerCase().includes(filter) || 
           wei.Contactpersoon?.toLowerCase().includes(filter) ||
           wei.Email?.toLowerCase().includes(filter);
  });
});

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

const getMeal = (day, mealType) => {
  // Convert both dates to YYYY-MM-DD format for comparison
  const formattedDay = new Date(day).toISOString().split('T')[0];
  
  return campMeals.value.find(meal => {
    const mealDate = new Date(meal.Datum).toISOString().split('T')[0];
    return mealDate === formattedDay && meal.Soort_Maaltijd === mealType;
  });
};

const getMealRecipeName = (receptId) => {
  if (!receptId) return 'No recipe selected';
  const recipe = recipes.value.find(recipe => recipe.ReceptID === receptId);
  return recipe ? recipe.Naam : 'Unknown recipe';
};

const showMealModal = (day, mealType) => {
  const existingMeal = getMeal(day, mealType);
  
  if (existingMeal) {
    currentMeal.value = { ...existingMeal };
  } else {
    currentMeal.value = {
      Datum: new Date(day).toISOString().split('T')[0],
      Soort_Maaltijd: mealType,
      Aantal_Eters: 0,
      ReceptID: null,
      Notes: ''
    };
  }
  
  selectedDay.value = day;
  showMealForm.value = true;
};

const closeMealModal = () => {
  showMealForm.value = false;
};

const saveMeal = async () => {
  try {
    if (currentMeal.value.MaaltijdID) {
      // Update existing meal
      await apiClient.updateMaaltijd(currentMeal.value.MaaltijdID, currentMeal.value);
    } else {
      // Create new meal and link to camp
      const meal = await apiClient.createMaaltijd(currentMeal.value);
      await apiClient.linkMaaltijdToKamp(selectedCampId.value, meal.id);
    }
    
    // Reload meals
    await loadCampDetails(selectedCampId.value);
    closeMealModal();
  } catch (error) {
    console.error('Error saving meal:', error);
  }
};

const showAttendanceModal = async (meal) => {
  try {
    selectedMeal.value = meal;
    
    // Load current attendees
    const mealAttendees = await apiClient.getMaaltijdDeelnemers(meal.MaaltijdID);
    attendees.value = mealAttendees;
    
    // Initialize special needs from current attendees
    specialNeeds.value = {};
    mealAttendees.forEach(attendee => {
      if (attendee.Speciale_Wensen) {
        specialNeeds.value[attendee.LidID] = attendee.Speciale_Wensen;
      }
    });
    
    showAttendance.value = true;
  } catch (error) {
    console.error('Error loading meal attendees:', error);
  }
};

const closeAttendanceModal = () => {
  showAttendance.value = false;
  selectedMeal.value = null;
  attendees.value = [];
  specialNeeds.value = {};
};

const isAttending = (lidId) => {
  return attendees.value.some(a => a.LidID === lidId);
};

const toggleAttendance = (lidId) => {
  const index = attendees.value.findIndex(a => a.LidID === lidId);
  
  if (index >= 0) {
    // Remove from attendees
    attendees.value = attendees.value.filter(a => a.LidID !== lidId);
    // Keep the special needs in case they re-add
  } else {
    // Add to attendees
    attendees.value.push({ 
      LidID: lidId, 
      MaaltijdID: selectedMeal.value.MaaltijdID,
      Aanwezig: true
    });
  }
};

const saveAttendance = async () => {
  try {
    // Get current attendees from the API to compare
    const currentAttendees = await apiClient.getMaaltijdDeelnemers(selectedMeal.value.MaaltijdID);
    
    // Find who to add, update, or remove
    for (const member of leden.value) {
      const isCurrentlyAttending = currentAttendees.some(a => a.LidID === member.LidID);
      const shouldBeAttending = attendees.value.some(a => a.LidID === member.LidID);
      
      if (!isCurrentlyAttending && shouldBeAttending) {
        // Add new attendee
        await apiClient.addMaaltijdDeelnemer(selectedMeal.value.MaaltijdID, member.LidID, {
          Speciale_Wensen: specialNeeds.value[member.LidID] || ''
        });
      } else if (isCurrentlyAttending && shouldBeAttending) {
        // Update existing attendee
        await apiClient.updateMaaltijdDeelnemer(selectedMeal.value.MaaltijdID, member.LidID, {
          Speciale_Wensen: specialNeeds.value[member.LidID] || ''
        });
      } else if (isCurrentlyAttending && !shouldBeAttending) {
        // Remove attendee
        await apiClient.removeMaaltijdDeelnemer(selectedMeal.value.MaaltijdID, member.LidID);
      }
    }
    
    // Update meal with new total
    await apiClient.updateMaaltijd(selectedMeal.value.MaaltijdID, {
      ...selectedMeal.value,
      Aantal_Eters: attendees.value.length
    });
    
    // Reload meals
    await loadCampDetails(selectedCampId.value);
    closeAttendanceModal();
  } catch (error) {
    console.error('Error saving attendance:', error);
  }
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
  await Promise.all([loadCamps(), loadLeden(), loadRecipes(), loadWeien()]);
});
</script>
