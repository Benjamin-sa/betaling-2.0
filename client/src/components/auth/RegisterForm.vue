<template>
  <form @submit.prevent="handleSubmit" class="max-w-md mx-auto p-6 bg-cardBackground rounded-lg shadow-md space-y-6">
    <h2 class="text-2xl font-semibold text-center text-primary">Registreren</h2>

    <div class="form-group">
      <label for="email" class="block text-sm font-medium text-text">E-mail</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        placeholder="Uw e-mailadres"
        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
      />
    </div>

    <div class="form-group">
      <label for="password" class="block text-sm font-medium text-text">Wachtwoord</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        placeholder="Uw wachtwoord"
        minlength="6"
        class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
      />
    </div>

    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition duration-300"
    >
      {{ loading ? 'Bezig met registreren...' : 'Registreren' }}
    </button>
    <div class="relative my-6">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <span class="px-2 bg-cardBackground text-gray-500">Of</span>
      </div>
    </div>

    <!-- Google Sign Up Button -->
    <button
  type="button"
  @click="handleGoogleSignUp"
  :disabled="loading"
  class="w-full flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
>
  <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.1 0 5.7 1.1 7.8 3.1l5.8-5.8C33.9 3.6 29.3 1.5 24 1.5 14.8 1.5 7.1 7.8 4.5 16.1l6.9 5.4C13.2 15.1 18.1 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.1-2.4 5.7-4.9 7.4l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.8z"/>
    <path fill="#FBBC05" d="M10.9 28.5c-.7-2.1-1.1-4.3-1.1-6.5s.4-4.4 1.1-6.5L4 10.1C2.5 13.4 1.5 17.1 1.5 21s1 7.6 2.5 10.9l6.9-5.4z"/>
    <path fill="#34A853" d="M24 46.5c5.3 0 9.8-1.8 13.1-4.9l-6.9-5.4c-1.9 1.3-4.3 2.1-6.9 2.1-5.4 0-10-3.6-11.6-8.5l-6.9 5.4C7.1 40.2 14.8 46.5 24 46.5z"/>
    <path fill="none" d="M0 0h48v48H0z"/>
  </svg>
  Registreer met Google
</button>

    <!-- Error message -->
    <div v-if="error" class="text-red-500 text-sm">
      {{ error }}
    </div>
  </form>

  <Modal 
  type="verification"
  :show="showVerificationMessage"
  :email="email"
  @close="showVerificationMessage = false"
/>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';
import Modal from '@/components/Modal.vue';

const router = useRouter(); // Add router instance
const auth = useAuthStore();

const email = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');
const showVerificationMessage = ref(false);

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    await auth.register(email.value, password.value);
    showVerificationMessage.value = true;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

const handleGoogleSignUp = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    await auth.loginWithGoogle();
    
    // After successful Google login and backend user creation
    router.push('/');
  } catch (e) {
    error.value = e.message || 'Er is een fout opgetreden bij het registreren met Google';
    console.error('Google signup error:', e);
  } finally {
    loading.value = false;
  }
};
</script>