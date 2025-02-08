<template>
  <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <h3 class="text-lg font-medium text-gray-900 mb-4">Kies een afhaalmoment</h3>
    
    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-4">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="text-red-600 text-sm py-2">
      {{ error }}
    </div>

    <!-- Time Slots Grid -->
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <button
        v-for="slot in timeSlots"
        :key="slot.timeSlot"
        @click="selectTimeSlot(slot.timeSlot)"
        :class="[
          'relative p-4 rounded-lg border text-left transition-all',
          slot.isFull ? 
            'bg-gray-50 cursor-not-allowed border-gray-200' :
          selectedTimeSlot === slot.timeSlot ?
            'border-primary ring-2 ring-primary ring-opacity-50 bg-primary bg-opacity-5' :
            'border-gray-200 hover:border-primary'
        ]"
        :disabled="slot.isFull"
      >
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm font-medium text-gray-900">{{ formatTimeSlot(slot.timeSlot) }}</p>
            <p class="mt-1 text-xs text-gray-500">
              {{ slot.available }} plaatsen beschikbaar
            </p>
          </div>
          
          <!-- Availability Indicator -->
          <div :class="[
            'h-2.5 w-2.5 rounded-full',
            getAvailabilityColor(slot.available)
          ]"></div>
        </div>

        <!-- Selected Check Mark -->
        <div v-if="selectedTimeSlot === slot.timeSlot" 
             class="absolute top-2 right-2">
          <svg class="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
        </div>
      </button>
    </div>

    <!-- Help Text -->
    <p class="mt-4 text-sm text-gray-500">
      Geselecteerd tijdslot: 
      <span v-if="selectedTimeSlot" class="font-medium text-gray-900">
        {{ formatTimeSlot(selectedTimeSlot) }}
      </span>
      <span v-else class="text-gray-400">Nog geen tijdslot geselecteerd</span>
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { apiClient } from '@/services/api';

const props = defineProps({
  modelValue: String,
});

const emit = defineEmits(['update:modelValue']);

const loading = ref(false);
const error = ref(null);
const timeSlots = ref([]);
const selectedTimeSlot = ref(props.modelValue);

// Hardcoded time slots
const FIXED_TIME_SLOTS = [
  '18:00-19:30',
  '19:30-21:00'
];

// Watch for v-model changes
watch(() => props.modelValue, (newValue) => {
  selectedTimeSlot.value = newValue;
});

// Format time slot for display
const formatTimeSlot = (timeSlot) => {
  return timeSlot.replace('-', ' - ');
};

// Get color based on availability
const getAvailabilityColor = (available) => {
  if (available === 0) return 'bg-red-500';
  if (available <= 3) return 'bg-yellow-500';
  return 'bg-green-500';
};

// Handle time slot selection
const selectTimeSlot = (timeSlot) => {
  selectedTimeSlot.value = timeSlot;
  emit('update:modelValue', timeSlot);
};

// Load time slots
const loadTimeSlots = async () => {
  loading.value = true;
  error.value = null;
  
  try {
    const response = await apiClient.getTimeSlotAvailability();
    const availabilityData = response.availability || {};

    // Merge fixed time slots with availability data
    timeSlots.value = FIXED_TIME_SLOTS.map(slot => ({
      timeSlot: slot,
      available: availabilityData[slot] || 0,
      isFull: (availabilityData[slot] || 0) === 0
    }));
  } catch (err) {
    error.value = 'Er is een fout opgetreden bij het laden van de tijdsloten.';
    console.error('Error loading time slots:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadTimeSlots();
});
</script>
