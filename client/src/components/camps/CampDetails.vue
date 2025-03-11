<template>
  <div class="bg-white p-4 rounded-lg shadow mb-6">
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
</template>

<script setup>
const props = defineProps({
  campDetails: {
    type: Object,
    required: true
  },
  campWei: {
    type: Object,
    default: null
  },
  formatDateRange: {
    type: Function,
    required: true
  }
});
</script>
