<template>
  <div>
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

    <!-- Meal Modal -->
    <BaseModal
      v-model="showMealForm"
      :title="currentMeal?.MaaltijdID ? 'Edit Meal' : 'Add Meal'"
      size="md"
      confirm-text="Save"
      @confirm="saveMeal"
    >
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
    </BaseModal>
    
    <!-- Attendance Modal -->
    <BaseModal
      v-model="showAttendance"
      title="Manage Attendance"
      size="xl"
    >
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
      
      <template #footer>
        <button @click="closeAttendanceModal" class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100">
          Cancel
        </button>
        <button @click="saveAttendance" class="px-4 py-2 bg-primary text-white rounded hover:bg-green-700">
          Save Attendance
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiClient } from '@/services/api';
import BaseModal from '@/components/ui/BaseModal.vue';

const props = defineProps({
  campDays: {
    type: Array,
    required: true
  },
  campMeals: {
    type: Array,
    required: true
  },
  mealTypes: {
    type: Array,
    required: true
  },
  recipes: {
    type: Array,
    required: true
  },
  formatDate: {
    type: Function,
    required: true
  },
  selectedCampId: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['refresh-camp-details']);

// State
const leden = ref([]);

// Meal management
const showMealForm = ref(false);
const currentMeal = ref({});
const selectedDay = ref(null);

// Attendance management
const showAttendance = ref(false);
const selectedMeal = ref(null);
const memberFilter = ref('');
const attendees = ref([]);
const specialNeeds = ref({});

// Computed
const filteredMembers = computed(() => {
  if (!memberFilter.value) return leden.value;
  
  const filter = memberFilter.value.toLowerCase();
  return leden.value.filter(member => {
    const fullName = `${member.Voornaam} ${member.Achternaam}`.toLowerCase();
    return fullName.includes(filter) || member.Tak?.toLowerCase().includes(filter);
  });
});

// Methods
const loadLeden = async () => {
  try {
    const response = await apiClient.getLeden();
    leden.value = response;
  } catch (error) {
    console.error('Error loading members:', error);
  }
};

const getMeal = (day, mealType) => {
  // Convert both dates to YYYY-MM-DD format for comparison
  const formattedDay = new Date(day).toISOString().split('T')[0];
  
  return props.campMeals.find(meal => {
    const mealDate = new Date(meal.Datum).toISOString().split('T')[0];
    return mealDate === formattedDay && meal.Soort_Maaltijd === mealType;
  });
};

const getMealRecipeName = (receptId) => {
  if (!receptId) return 'No recipe selected';
  const recipe = props.recipes.find(recipe => recipe.ReceptID === receptId);
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

const saveMeal = async () => {
  try {
    if (currentMeal.value.MaaltijdID) {
      // Update existing meal
      await apiClient.updateMaaltijd(currentMeal.value.MaaltijdID, currentMeal.value);
    } else {
      // Create new meal and link to camp
      const meal = await apiClient.createMaaltijd(currentMeal.value);
      await apiClient.linkMaaltijdToKamp(props.selectedCampId, meal.id);
    }
    
    // Refresh camp details
    emit('refresh-camp-details');
    showMealForm.value = false;
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
    
    // Refresh camp details
    emit('refresh-camp-details');
    closeAttendanceModal();
  } catch (error) {
    console.error('Error saving attendance:', error);
  }
};

// Load data on component mount
onMounted(async () => {
  await loadLeden();
});
</script>
