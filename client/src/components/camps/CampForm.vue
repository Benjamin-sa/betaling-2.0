<template>
  <div class="space-y-6">
    <!-- Camp Details Section -->
    <div>
      <h4 class="font-medium text-lg mb-3">Camp Details</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Camp Name</label>
          <input 
            type="text" 
            v-model="editCampLocal.Naam" 
            placeholder="Summer Camp 2024"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Theme</label>
          <input 
            type="text" 
            v-model="editCampLocal.Thema" 
            placeholder="Pirates"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Start Date</label>
          <input 
            type="date" 
            v-model="editCampLocal.Startdatum" 
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
          >
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">End Date</label>
          <input 
            type="date" 
            v-model="editCampLocal.Eindatum" 
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
      
      <div v-if="!localShowWeiSelector" class="mb-4">
        <!-- Selected Wei display or button to add if none selected -->
        <div v-if="localSelectedWei" class="bg-gray-50 p-4 rounded mb-3">
          <div class="flex justify-between items-center">
            <h5 class="font-medium">{{ localSelectedWei.Naam }}</h5>
            <button @click="toggleWeiSelector(true)" class="text-blue-600 text-sm hover:underline">
              Change Location
            </button>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 text-sm">
            <p><span class="font-medium">Contact:</span> {{ localSelectedWei.Contactpersoon }}</p>
            <p><span class="font-medium">Size:</span> {{ localSelectedWei.Aantal_Hectare }} hectares</p>
          </div>
          <!-- Wei Details Form -->
          <div class="mt-3 border-t pt-3">
            <h6 class="font-medium text-sm mb-2">Additional Information</h6>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label class="block text-xs font-medium text-gray-600">Previous Price (€)</label>
                <input 
                  type="number" 
                  v-model="weiDetailsLocal.Voorgaande_Prijs" 
                  class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
                  step="0.01"
                >
              </div>
              <div>
                <label class="block text-xs font-medium text-gray-600">Experience</label>
                <select v-model="weiDetailsLocal.Ervaring" class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm">
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
                v-model="weiDetailsLocal.Opmerkingen" 
                class="mt-1 block w-full text-sm rounded-md border-gray-300 shadow-sm"
                rows="2"
              ></textarea>
            </div>
          </div>
        </div>
        <div v-else class="flex justify-center">
          <button @click="toggleWeiSelector(true)" class="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200">
            Select Camp Location
          </button>
        </div>
      </div>
      
      <!-- Wei Selector -->
      <div v-if="localShowWeiSelector" class="border rounded-lg p-4">
        <!-- Search & Filter -->
        <div class="mb-4">
          <input 
            type="text" 
            :value="localWeiFilter"
            @input="updateWeiFilter($event.target.value)"
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
              <tr v-for="wei in filteredWeien" :key="wei.WeiID" :class="{'bg-blue-50': localSelectedWei && localSelectedWei.WeiID === wei.WeiID}">
                <td class="px-3 py-2">{{ wei.Naam }}</td>
                <td class="px-3 py-2">{{ wei.Contactpersoon }}</td>
                <td class="px-3 py-2">{{ wei.Aantal_Hectare }}</td>
                <td class="px-3 py-2">
                  <button 
                    @click="selectWei(wei)" 
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
          <button @click="toggleWeiSelector(false)" class="text-sm text-gray-600 hover:underline">
            Cancel Selection
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  editing: {
    type: Boolean,
    default: false
  },
  editCamp: {
    type: Object,
    required: true
  },
  weien: {
    type: Array,
    required: true
  },
  selectedWei: {
    type: Object,
    default: null
  },
  weiDetails: {
    type: Object,
    required: true
  },
  showWeiSelector: {
    type: Boolean,
    default: false
  },
  weiFilter: {
    type: String,
    default: ''
  }
});

const emit = defineEmits([
  'update:edit-camp',
  'update:wei-details',
  'update:selected-wei',
  'update:wei-filter',
  'toggle-wei-selector',
  'select-wei'
]);

const editCampLocal = ref({ ...props.editCamp });
const weiDetailsLocal = ref({ ...props.weiDetails });
const localSelectedWei = ref(props.selectedWei);
const localShowWeiSelector = ref(props.showWeiSelector);
const localWeiFilter = ref(props.weiFilter);

watch(() => props.editCamp, (newVal) => {
  editCampLocal.value = { ...newVal };
}, { deep: true });

watch(() => props.weiDetails, (newVal) => {
  weiDetailsLocal.value = { ...newVal };
}, { deep: true });

watch(() => props.selectedWei, (newVal) => {
  localSelectedWei.value = newVal;
});

watch(() => props.showWeiSelector, (newVal) => {
  localShowWeiSelector.value = newVal;
});

watch(() => props.weiFilter, (newVal) => {
  localWeiFilter.value = newVal;
});

watch(editCampLocal, (newVal) => {
  emit('update:edit-camp', newVal);
}, { deep: true });

watch(weiDetailsLocal, (newVal) => {
  emit('update:wei-details', newVal);
}, { deep: true });

const toggleWeiSelector = (show) => {
  emit('toggle-wei-selector', show);
};

const updateWeiFilter = (value) => {
  emit('update:wei-filter', value);
};

const selectWei = (wei) => {
  emit('select-wei', wei);
};

const filteredWeien = computed(() => {
  if (!localWeiFilter.value) return props.weien;
  
  const filter = localWeiFilter.value.toLowerCase();
  return props.weien.filter(wei => {
    return wei.Naam.toLowerCase().includes(filter) || 
           wei.Contactpersoon?.toLowerCase().includes(filter) ||
           wei.Email?.toLowerCase().includes(filter);
  });
});
</script>
