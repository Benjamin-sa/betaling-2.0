<template>
  <nav class="auth-nav">
    <div class="nav-content">
      <router-link to="/" class="brand">Scoutswinkel</router-link>
      
      <div class="nav-links">
        <template v-if="auth.user">
          <span class="welcome-text">Welkom, {{ auth.user.email }}</span>
          <router-link v-if="auth.isAdmin" to="/admin" class="nav-link admin-link">
            Admin Dashboard
          </router-link>
          <button @click="handleLogout" :disabled="loading" class="logout-btn">
            {{ loading ? 'Bezig met uitloggen...' : 'Uitloggen' }}
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="nav-link">Inloggen</router-link>
          <router-link to="/register" class="nav-link">Registreren</router-link>
        </template>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useRouter } from 'vue-router';

const auth = useAuthStore();
const router = useRouter();
const loading = ref(false);

const handleLogout = async () => {
  try {
    loading.value = true;
    await auth.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.auth-nav {
  padding: 1rem;
  background-color: #2c3e50;
  color: white;
}

.nav-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  font-size: 1.5rem;
  font-weight: bold;
  color: white;
  text-decoration: none;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.welcome-text {
  color: #a8b6c3;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #3498db;
}

.admin-link {
  background-color: #e74c3c;
  padding: 0.5rem 1rem;
  border-radius: 4px;
}

.admin-link:hover {
  background-color: #c0392b;
  color: white;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: transparent;
  border: 1px solid white;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background-color: white;
  color: #2c3e50;
}

.logout-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
