<template>
  <form @submit.prevent="handleSubmit" class="auth-form">
    <h2>Registreren</h2>
    
    <div class="form-group">
      <label for="email">E-mail</label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        placeholder="Uw e-mailadres"
      />
    </div>

    <div class="form-group">
      <label for="password">Wachtwoord</label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        placeholder="Uw wachtwoord"
        minlength="6"
      />
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <button type="submit" :disabled="loading">
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
    router.push('/'); // Redirect to home page after successful registration
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

button {
  width: 100%;
  padding: 0.75rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.error-message {
  color: #ff0000;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}
</style>
