<template>
  <div class="mb-6 bg-white p-4 rounded-lg shadow">
    <h3 class="text-lg font-medium mb-3">Select Camp</h3>
    <div class="flex gap-4 items-center">
      <select v-model="localSelectedCampId" class="rounded border px-3 py-2 flex-grow">
        <option value="">-- Select a camp --</option>
        <option v-for="camp in camps" :key="camp.KampID" :value="camp.KampID">
          {{ camp.Naam ? camp.Naam : formatDateRange(camp.Startdatum, camp.Eindatum) }}
        </option>
      </select>
      <button @click="$emit('create-camp')" class="bg-primary text-white px-4 py-2 rounded hover:bg-green-700">
        New Camp
      </button>
      <button 
        v-if="localSelectedCampId" 
        @click="$emit('edit-camp', localSelectedCampId)" 
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Edit Camp
      </button>
      <button 
        v-if="localSelectedCampId" 
        @click="$emit('delete-camp')" 
        class="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
      >
        Delete Camp
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const props = defineProps({
  camps: {
    type: Array,
    required: true
  },
  selectedCampId: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['select-camp', 'create-camp', 'edit-camp', 'delete-camp']);

const localSelectedCampId = ref(props.selectedCampId);

watch(localSelectedCampId, (newVal) => {
  emit('select-camp', newVal);
});

watch(() => props.selectedCampId, (newVal) => {
  localSelectedCampId.value = newVal;
});

const formatDateRange = (start, end) => {
  if (!start || !end) return '';
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  return `${formatDate(start)} to ${formatDate(end)}`;
};
</script>
