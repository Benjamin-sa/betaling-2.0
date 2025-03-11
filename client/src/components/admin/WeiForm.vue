<template>
  <form @submit.prevent="handleSubmit" class="space-y-4">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- Wei Naam -->
      <div class="col-span-1">
        <label for="naam" class="block text-sm font-medium text-gray-700">Naam van de wei*</label>
        <input
          id="naam"
          v-model="formData.Naam"
          type="text"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <!-- Contactperson -->
      <div class="col-span-1">
        <label for="contactpersoon" class="block text-sm font-medium text-gray-700">Contactpersoon*</label>
        <input
          id="contactpersoon"
          v-model="formData.Contactpersoon"
          type="text"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <!-- Telefoonnummer -->
      <div class="col-span-1">
        <label for="telefoonnummer" class="block text-sm font-medium text-gray-700">Telefoonnummer*</label>
        <input
          id="telefoonnummer"
          v-model="formData.Telefoonnummer"
          type="tel"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <!-- Email -->
      <div class="col-span-1">
        <label for="email" class="block text-sm font-medium text-gray-700">E-mail</label>
        <input
          id="email"
          v-model="formData.Email"
          type="email"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <!-- Aantal Hectare -->
      <div class="col-span-1">
        <label for="hectare" class="block text-sm font-medium text-gray-700">Aantal hectare*</label>
        <input
          id="hectare"
          v-model.number="formData.Aantal_Hectare"
          type="number"
          step="0.1"
          min="0"
          required
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <!-- Coordinaten -->
      <div class="col-span-1">
        <label for="coordinaten" class="block text-sm font-medium text-gray-700">Coördinaten</label>
        <input
          id="coordinaten"
          v-model="formData.Coordinaten"
          type="text"
          placeholder="bijv. 51.2345, 4.5678"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        />
      </div>

      <!-- Adres -->
      <div class="col-span-2">
        <label for="adres" class="block text-sm font-medium text-gray-700">Adres</label>
        <textarea
          id="adres"
          v-model="formData.Adres"
          rows="2"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        ></textarea>
      </div>

      <!-- Opmerkingen -->
      <div class="col-span-2">
        <label for="opmerkingen" class="block text-sm font-medium text-gray-700">Opmerkingen</label>
        <textarea
          id="opmerkingen"
          v-model="formData.Opmerkingen"
          rows="3"
          class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-primary focus:border-primary"
        ></textarea>
      </div>
    </div>

    <div class="pt-2 text-sm text-gray-500">
      * Verplicht veld
    </div>
    
    <div class="flex justify-end gap-3 pt-4">
      <button 
        type="button" 
        @click="$emit('cancel')"
        class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
      >
        Annuleren
      </button>
      <button 
        type="submit"
        class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark"
      >
        {{ wei ? 'Bijwerken' : 'Toevoegen' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const props = defineProps({
  wei: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['save', 'cancel']);

const formData = ref({
  Naam: '',
  Contactpersoon: '',
  Telefoonnummer: '',
  Email: '',
  Aantal_Hectare: 0,
  Coordinaten: '',
  Adres: '',
  Opmerkingen: ''
});

onMounted(() => {
  if (props.wei) {
    // Copy wei data to form
    formData.value = { ...props.wei };
  }
});

const handleSubmit = () => {
  emit('save', { ...formData.value });
};
</script>
