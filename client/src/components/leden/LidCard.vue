<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <!-- Header with color based on tak -->
    <div 
      :class="[
        'p-4 text-white',
        takColorClass
      ]"
    >
      <div class="flex justify-between items-center">
        <h3 class="font-bold text-lg">{{ lid.Voornaam }} {{ lid.Achternaam }}</h3>
        <div class="flex space-x-2">
          <!-- Badge for Leiding status -->
          <div v-if="lid.IsLeiding" class="bg-yellow-500 text-xs rounded-full px-2 py-1 font-medium">
            Leiding
          </div>
          <!-- Badge for active status -->
          <div 
            :class="[
              'text-xs rounded-full px-2 py-1 font-medium',
              lid.Is_Actief ? 'bg-green-500' : 'bg-red-500'
            ]"
          >
            {{ lid.Is_Actief ? 'Actief' : 'Inactief' }}
          </div>
        </div>
      </div>
    </div>
    
    <!-- Content -->
    <div class="p-4">
      <div class="space-y-2">
        <div class="flex items-center">
          <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <span>{{ lid.Tak || 'Geen tak' }}</span>
        </div>
        
        <div class="flex items-center">
          <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>{{ formattedBirthdate }}</span>
        </div>
        
        <div v-if="lid.Telefoonnummer" class="flex items-center">
          <svg class="w-5 h-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span>{{ lid.Telefoonnummer }}</span>
        </div>

        <!-- Additional info -->
        <div v-if="lid.Allergieën" class="flex items-start mt-2">
          <svg class="w-5 h-5 text-yellow-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span class="text-sm">{{ truncate(lid.Allergieën, 40) }}</span>
        </div>
      </div>
    </div>
    
    <!-- Actions -->
    <div class="border-t px-4 py-3 bg-gray-50 flex justify-end space-x-2">
      <!-- Details button -->
      <router-link :to="`/leden/${lid.LidID}/details`" class="text-blue-600 hover:text-blue-800">
        Details
      </router-link>
      
      <!-- Edit button -->
      <button @click="emit('edit', lid)" class="text-gray-600 hover:text-gray-800">
        Bewerken
      </button>
      
      <!-- Leiding toggle -->
      <button 
        v-if="!lid.IsLeiding" 
        @click="emit('promote', lid)" 
        class="text-yellow-600 hover:text-yellow-800"
        title="Promoveer naar leiding"
      >
        → Leiding
      </button>
      <button 
        v-else 
        @click="emit('demote', lid)" 
        class="text-yellow-600 hover:text-yellow-800"
        title="Verwijder uit leiding"
      >
        Geen leiding →
      </button>
      
      <!-- Delete button -->
      <button @click="emit('delete', lid)" class="text-red-600 hover:text-red-800">
        Verwijderen
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  lid: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['edit', 'delete', 'promote', 'demote']);

// Format birthdate
const formattedBirthdate = computed(() => {
  if (!props.lid.Geboortedatum) return 'Geboortedatum onbekend';
  const date = new Date(props.lid.Geboortedatum);
  return new Intl.DateTimeFormat('nl-BE', { 
    day: '2-digit', 
    month: '2-digit', 
    year: 'numeric' 
  }).format(date);
});

// Color based on tak
const takColorClass = computed(() => {
  const takColors = {
    'Kapoenen': 'bg-blue-600',
    'Welpen': 'bg-yellow-600',
    'JongVerkenner': 'bg-green-600',
    'Verkenner': 'bg-red-600',
    'Jin': 'bg-purple-600'
  };
  
  return takColors[props.lid.Tak] || 'bg-gray-600';
});

// Truncate long text
const truncate = (text, length) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};
</script>
