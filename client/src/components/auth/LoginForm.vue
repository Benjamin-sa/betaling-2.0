<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 px-4 py-8 pt-24">
    <div class="w-full max-w-md">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">Welkom terug</h1>
        <p class="text-gray-600">Log in om door te gaan naar je account</p>
      </div>

      <!-- Login Form Card -->
      <form @submit.prevent="handleSubmit" class="bg-white rounded-2xl shadow-xl p-8 space-y-6">
        <!-- Email Field -->
        <div class="space-y-2">
          <label for="email" class="block text-sm font-semibold text-gray-900">E-mailadres</label>
          <input id="email" v-model="email" type="email" required placeholder="jouw@email.be"
            class="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            :disabled="loading" />
        </div>

        <!-- Password Field -->
        <div class="space-y-2">
          <label for="password" class="block text-sm font-semibold text-gray-900">Wachtwoord</label>
          <input id="password" v-model="password" type="password" required placeholder="••••••••"
            class="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200"
            :disabled="loading" />
        </div>

        <!-- Error Messages -->
        <div v-if="mainError" class="space-y-3">
          <div class="p-4 bg-red-50 border border-red-200 rounded-xl">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd" />
              </svg>
              <p class="text-red-700 text-sm">{{ mainError }}</p>
            </div>
          </div>

          <div v-if="showHelpText" class="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div class="flex items-start space-x-3">
              <svg class="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clip-rule="evenodd" />
              </svg>
              <div class="text-blue-700 text-sm">
                <p class="font-medium mb-1">Hulp nodig?</p>
                <p>Controleer ook je spamfolder. Indien je de verificatie-e-mail nog steeds niet ontvangt, stuur dan een
                  e-mail naar <a href="mailto:groepsleiding@lodlavki.be"
                    class="underline hover:text-blue-800 font-medium">groepsleiding@lodlavki.be</a>.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Success Message -->
        <div v-if="successMessage" class="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
          <div class="flex items-start space-x-3">
            <svg class="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clip-rule="evenodd" />
            </svg>
            <p class="text-emerald-700 text-sm">{{ successMessage }}</p>
          </div>
        </div>

        <!-- Login Button -->
        <button type="submit" :disabled="loading"
          class="w-full bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center">
          <svg v-if="loading" class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg"
            fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
          </svg>
          {{ loading ? 'Bezig met inloggen...' : 'Inloggen' }}
        </button>

        <!-- Divider -->
        <div class="relative my-6">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-4 bg-white text-gray-500 font-medium">Of</span>
          </div>
        </div>

        <!-- Google Login Button -->
        <button type="button" @click="handleGoogleLogin" :disabled="loading"
          class="w-full bg-white text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center justify-center shadow-sm">
          <svg class="h-5 w-5 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#EA4335"
              d="M24 9.5c3.1 0 5.7 1.1 7.8 3.1l5.8-5.8C33.9 3.6 29.3 1.5 24 1.5 14.8 1.5 7.1 7.8 4.5 16.1l6.9 5.4C13.2 15.1 18.1 9.5 24 9.5z" />
            <path fill="#4285F4"
              d="M46.5 24c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3.1-2.4 5.7-4.9 7.4l7.6 5.9c4.4-4.1 7.1-10.2 7.1-17.8z" />
            <path fill="#FBBC05"
              d="M10.9 28.5c-.7-2.1-1.1-4.3-1.1-6.5s.4-4.4 1.1-6.5L4 10.1C2.5 13.4 1.5 17.1 1.5 21s1 7.6 2.5 10.9l6.9-5.4z" />
            <path fill="#34A853"
              d="M24 46.5c5.3 0 9.8-1.8 13.1-4.9l-6.9-5.4c-1.9 1.3-4.3 2.1-6.9 2.1-5.4 0-10-3.6-11.6-8.5l-6.9 5.4C7.1 40.2 14.8 46.5 24 46.5z" />
            <path fill="none" d="M0 0h48v48H0z" />
          </svg>
          Inloggen met Google
        </button>

        <!-- Forgot Password -->
        <div class="text-center">
          <button type="button" @click="handlePasswordReset"
            class="text-emerald-600 hover:text-emerald-700 font-medium text-sm transition-colors duration-200">
            Wachtwoord vergeten?
          </button>
        </div>
      </form>

      <!-- Register Link -->
      <div class="text-center mt-6">
        <p class="text-gray-600">
          Nog geen account?
          <router-link to="/register"
            class="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200">
            Registreer hier
          </router-link>
        </p>
      </div>
    </div>
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
const successMessage = ref('');
const userNotVerifiedCount = ref(0);
const showHelpText = ref(false);

const handleSubmit = async () => {
  try {
    loading.value = true;
    mainError.value = '';
    successMessage.value = '';
    showHelpText.value = false;
    await auth.login(email.value, password.value);
    router.push('/'); // Redirect to home page after successful login
  } catch (e) {
    mainError.value = e.message;
    // Check if the error is about unverified email
    if (e.message.includes('E-mailadres nog niet geverifieerd')) {
      userNotVerifiedCount.value++;
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
    successMessage.value = '';
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
  if (!email.value) {
    mainError.value = 'Voer eerst je e-mailadres in om je wachtwoord te resetten.';
    return;
  }

  try {
    loading.value = true;
    mainError.value = '';
    showHelpText.value = false;
    await auth.resetPassword(email.value);
    successMessage.value = 'Er is een e-mail verzonden met instructies om je wachtwoord te resetten.';
  } catch (e) {
    mainError.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>