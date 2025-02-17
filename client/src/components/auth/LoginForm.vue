<template>
  <div class="min-h-[60vh] flex items-center justify-center">
    <form @submit.prevent="handleSubmit" class="w-full max-w-md p-6 bg-cardBackground rounded-lg shadow-md space-y-6">
      <h2 class="text-2xl font-semibold text-center text-primary">Inloggen</h2>

      <div class="space-y-4">
        <div class="form-group">
          <label for="email" class="block text-sm font-medium text-text">E-mail</label>
          <input
            id="email"
            v-model="email"
            type="email"
            required
            placeholder="Uw e-mailadres"
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            :disabled="loading"
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
            class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
            :disabled="loading"
          />
        </div>

        <div v-if="mainError" class="space-y-3 rounded-md overflow-hidden">
          <div class="p-3 bg-red-50 text-red-500 text-sm rounded">
            {{ mainError }}
          </div>
          <div v-if="showHelpText" class="p-3 bg-blue-50 text-blue-600 text-sm rounded flex items-start space-x-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            <span>
              Controleer ook je spamfolder. Indien je de verificatie-e-mail nog steeds niet ontvangt, 
              stuur dan een e-mail naar <a href="mailto:groepsleiding@lodlavki.be" class="underline hover:text-blue-800">groepsleiding@lodlavki.be</a>.
            </span>
          </div>
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:bg-gray-400 transition duration-300 flex items-center justify-center"
        >
          <svg
            v-if="loading"
            class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            ></circle>
            <path
              class="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            ></path>
          </svg>
          {{ loading ? 'Bezig met inloggen...' : 'Inloggen' }}
        </button>

        <button
          type="button"
          @click="handleGoogleLogin"
          class="w-full bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 flex items-center justify-center"
        >
          <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.1 0 5.7 1.1 7.8 3.1l5.8-5.8C33.9 3.6 29.3 1.5 24 1.5 14.8 1.5 7.1 7.8 4.5 16.1l6.9 5.4C13.2 15.1 18.1 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.1-2.4 5.7-4.9 7.4l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.8z"/>
            <path fill="#FBBC05" d="M10.9 28.5c-.7-2.1-1.1-4.3-1.1-6.5s.4-4.4 1.1-6.5L4 10.1C2.5 13.4 1.5 17.1 1.5 21s1 7.6 2.5 10.9l6.9-5.4z"/>
            <path fill="#34A853" d="M24 46.5c5.3 0 9.8-1.8 13.1-4.9l-6.9-5.4c-1.9 1.3-4.3 2.1-6.9 2.1-5.4 0-10-3.6-11.6-8.5l-6.9 5.4C7.1 40.2 14.8 46.5 24 46.5z"/>
            <path fill="none" d="M0 0h48v48H0z"/>
          </svg>
          Log in met Google
        </button>

        <p class="text-center text-sm text-gray-600">
          Wachtwoord vergeten?
          <button @click="handlePasswordReset" class="text-primary hover:text-green-700 underline">
            Reset hier
          </button>
        </p>

        <p class="text-center text-sm text-gray-600">
          Nog geen account?
          <router-link to="/register" class="text-primary hover:text-green-700">
            Registreer hier
          </router-link>
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();

const email = ref('');
const password = ref('');
const loading = ref(false);
const mainError = ref('');
const userNotVerifiedCount = ref(0);
const showHelpText = ref(false);

const handleSubmit = async () => {
  try {
    loading.value = true;
    mainError.value = '';
    showHelpText.value = false;
    await auth.login(email.value, password.value);
    router.push('/'); // Redirect to home page after successful login
  } catch (e) {
    mainError.value = e.message;
    // Check if the error is about unverified email
    if (e.message.includes('E-mailadres nog niet geverifieerd')) {
      userNotVerifiedCount.value++;
      console.log(userNotVerifiedCount.value);
      if (userNotVerifiedCount.value >= 3) {
        showHelpText.value = true;
      }
    }
  } finally {
    loading.value = false;
  }
};

const handleGoogleLogin = async () => {
  try {
    loading.value = true;
    mainError.value = '';
    showHelpText.value = false;
    await auth.loginWithGoogle();
    router.push('/'); // Redirect to home page after successful login
  } catch (e) {
    mainError.value = e.message;
  } finally {
    loading.value = false;
  }
};

const handlePasswordReset = async () => {
  try {
    loading.value = true;
    mainError.value = '';
    showHelpText.value = false;
    await auth.resetPassword(email.value);
    mainError.value = 'Er is een e-mail verzonden met instructies om je wachtwoord te resetten.';
  } catch (e) {
    mainError.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>