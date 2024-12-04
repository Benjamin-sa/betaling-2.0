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
  </form>
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
const error = ref('');

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = '';
    await auth.register(email.value, password.value);
    await auth.login(email.value, password.value);
    router.push('/'); // Redirect to home page after successful registration
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>