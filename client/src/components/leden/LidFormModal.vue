<template>
  <BaseModal
    v-model="showModal"
    :title="isEdit ? 'Lid bewerken' : 'Nieuw lid toevoegen'"
    @confirm="saveLid"
    confirm-text="Opslaan"
  >
    <form @submit.prevent="saveLid">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Basic info -->
        <div class="mb-4">
          <label for="voornaam" class="block text-sm font-medium text-gray-700 mb-1">
            Voornaam <span class="text-red-500">*</span>
          </label>
          <input
            id="voornaam"
            v-model="lidForm.Voornaam"
            type="text"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div class="mb-4">
          <label for="achternaam" class="block text-sm font-medium text-gray-700 mb-1">
            Achternaam <span class="text-red-500">*</span>
          </label>
          <input
            id="achternaam"
            v-model="lidForm.Achternaam"
            type="text"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div class="mb-4">
          <label for="geboortedatum" class="block text-sm font-medium text-gray-700 mb-1">
            Geboortedatum <span class="text-red-500">*</span>
          </label>
          <input
            id="geboortedatum"
            v-model="lidForm.Geboortedatum"
            type="date"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div class="mb-4">
          <label for="telefoonnummer" class="block text-sm font-medium text-gray-700 mb-1">
            Telefoonnummer
          </label>
          <input
            id="telefoonnummer"
            v-model="lidForm.Telefoonnummer"
            type="tel"
            class="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div class="mb-4">
          <label for="tak" class="block text-sm font-medium text-gray-700 mb-1">
            Tak <span class="text-red-500">*</span>
          </label>
          <select
            id="tak"
            v-model="lidForm.Tak"
            required
            class="w-full border rounded px-3 py-2"
          >
            <option value="">Selecteer tak</option>
            <option value="Kapoenen">Kapoenen</option>
            <option value="Welpen">Welpen</option>
            <option value="JongVerkenner">JongVerkenner</option>
            <option value="Verkenner">Verkenner</option>
            <option value="Jin">Jin</option>
          </select>
        </div>
        
        <div class="mb-4">
          <label for="lidmaatschap" class="block text-sm font-medium text-gray-700 mb-1">
            Lidmaatschap sinds <span class="text-red-500">*</span>
          </label>
          <input
            id="lidmaatschap"
            v-model="lidForm.Lidmaatschap_Datum"
            type="date"
            required
            class="w-full border rounded px-3 py-2"
          />
        </div>
        
        <div class="mb-4 flex items-center">
          <input
            id="is-actief"
            v-model="lidForm.Is_Actief"
            type="checkbox"
            class="h-4 w-4 text-primary border-gray-300 rounded"
          />
          <label for="is-actief" class="ml-2 block text-sm text-gray-900">
            Actief lid
          </label>
        </div>
        
        <!-- Full-width fields -->
        <div class="mb-4 col-span-1 md:col-span-2">
          <label for="allergieën" class="block text-sm font-medium text-gray-700 mb-1">
            Allergieën
          </label>
          <textarea
            id="allergieën"
            v-model="lidForm.Allergieën"
            rows="2"
            class="w-full border rounded px-3 py-2"
          ></textarea>
        </div>
        
        <div class="mb-4 col-span-1 md:col-span-2">
          <label for="dieetwensen" class="block text-sm font-medium text-gray-700 mb-1">
            Dieetwensen
          </label>
          <textarea
            id="dieetwensen"
            v-model="lidForm.Dieetwensen"
            rows="2"
            class="w-full border rounded px-3 py-2"
          ></textarea>
        </div>
      </div>
    </form>
  </BaseModal>
</template>

<script setup>
import { ref, watch } from 'vue';
import BaseModal from '../ui/BaseModal.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  lid: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'save']);

// Sync modal visibility with v-model
const showModal = ref(props.modelValue);

watch(() => props.modelValue, (newVal) => {
  showModal.value = newVal;
});

watch(showModal, (newVal) => {
  emit('update:modelValue', newVal);
});

// Form data (deep copy to prevent modifying props directly)
const lidForm = ref({...props.lid});

// Watch for changes in the lid prop
watch(() => props.lid, (newLid) => {
  lidForm.value = {...newLid};
}, { deep: true });

// Save handler
const saveLid = () => {
  // Prepare data with proper types
  const formData = {
    ...lidForm.value,
    Is_Actief: Boolean(lidForm.value.Is_Actief)
  };
  
  emit('save', formData);
};
</script>
