<!-- components/Modal.vue -->
<template>
  <Transition name="fade">
    <div v-if="show" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>

        <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div class="relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <!-- Dynamic icon based on type -->
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full" 
                 :class="iconBackgroundClass">
              <svg class="h-6 w-6" :class="iconColorClass" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path v-if="type === 'verification'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                <path v-else-if="type === 'auth'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                {{ title }}
              </h3>
              <div class="mt-2">
                <p class="text-sm text-gray-500">
                  <template v-if="type === 'verification'">
                    We hebben een verificatie e-mail gestuurd naar <strong>{{ email }}</strong>. 
                    Controleer je inbox en volg de instructies om je account te activeren.
                  </template>
                  <template v-else-if="type === 'auth'">
                    Je moet ingelogd zijn om af te kunnen rekenen. 
                    Log in of maak een account aan om door te gaan.
                  </template>
                </p>
              </div>
            </div>
          </div>
          
          <!-- Dynamic buttons based on type -->
          <div class="mt-5 sm:mt-6 space-y-3">
            <template v-if="type === 'verification'">
              <button
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                @click="$emit('close')"
              >
                Begrepen
              </button>
            </template>
            <template v-else-if="type === 'auth'">
              <button
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                @click="$emit('login')"
              >
                Inloggen
              </button>
              <button
                type="button"
                class="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:text-sm"
                @click="$emit('register')"
              >
                Account aanmaken
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  show: Boolean,
  type: {
    type: String,
    required: true,
    validator: (value) => ['verification', 'auth'].includes(value)
  },
  email: String,
  autoDismiss: {
    type: Number,
    default: 5000
  }
});

defineEmits(['close', 'login', 'register']);

const title = computed(() => {
  return props.type === 'verification' 
    ? 'Verificatie e-mail verzonden'
    : 'Inloggen vereist';
});

const iconBackgroundClass = computed(() => {
  return props.type === 'verification'
    ? 'bg-green-100'
    : 'bg-yellow-100';
});

const iconColorClass = computed(() => {
  return props.type === 'verification'
    ? 'text-green-600'
    : 'text-yellow-600';
});

if (props.type === 'verification' && props.autoDismiss) {
  setTimeout(() => {
    emit('close');
  }, props.autoDismiss);
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>