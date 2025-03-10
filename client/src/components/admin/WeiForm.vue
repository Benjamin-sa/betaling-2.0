<template>
  <form @submit.prevent="saveWei">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
      <div class="col-span-2">
        <label for="naam" class="block text-sm font-medium text-gray-700 mb-1">Naam*</label>
        <input
          id="naam"
          v-model="form.Naam"
          type="text"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div>
        <label for="contactpersoon" class="block text-sm font-medium text-gray-700 mb-1">Contactpersoon*</label>
        <input
          id="contactpersoon"
          v-model="form.Contactpersoon"
          type="text"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div>
        <label for="telefoonnummer" class="block text-sm font-medium text-gray-700 mb-1">Telefoonnummer*</label>
        <input
          id="telefoonnummer"
          v-model="form.Telefoonnummer"
          type="tel"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          required
        />
      </div>

      <div>
        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          id="email"
          v-model="form.Email"
          type="email"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <div>
        <label for="hectare" class="block text-sm font-medium text-gray-700 mb-1">Aantal Hectare</label>
        <input
          id="hectare"
          v-model="form.Aantal_Hectare"
          type="number"
          step="0.1"
          min="0"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>
      
      <div>
        <label for="coordinaten" class="block text-sm font-medium text-gray-700 mb-1">Coördinaten</label>
        <input
          id="coordinaten"
          v-model="form.Coordinaten"
          type="text"
          placeholder="bijv. 51.2194, 4.4025"
          class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
        />
        <p class="mt-1 text-xs text-gray-500">Formaat: latitude, longitude (bijv. 51.2194, 4.4025)</p>
      </div>
    </div>

    <div class="flex justify-end gap-3 mt-6">
      <button
        type="button"
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
      >
        Annuleren
      </button>
      <button
        type="submit"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none"
      >
        {{ wei ? 'Opslaan' : 'Toevoegen' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  wei: Object
});

const emit = defineEmits(['save', 'cancel']);

const form = ref({
  Naam: '',
  Contactpersoon: '',
  Telefoonnummer: '',
  Email: '',
  Aantal_Hectare: null,
  Coordinaten: ''
});

onMounted(() => {
  if (props.wei) {
    form.value = { ...props.wei };
  }
});

const saveWei = () => {
  emit('save', { ...form.value });
};
</script>
