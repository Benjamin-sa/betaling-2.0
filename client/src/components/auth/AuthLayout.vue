<template>
  <nav class="bg-white shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Logo/Brand -->
        <div class="flex items-center">
          <router-link to="/" class="flex items-center">
            <span class="text-xl font-bold text-primary">Scouts Lod Lavki</span>
          </router-link>
        </div>

        <!-- Desktop Navigation -->
        <div class="hidden md:flex md:items-center md:space-x-8">
          <template v-if="auth.user">
            <span class="text-gray-700">
              Welkom, {{ auth.user.email }}
            </span>
            <router-link 
              to="/orders" 
              class="text-gray-600 hover:text-primary transition-colors px-3 py-2"
            >
              Mijn Bestellingen
            </router-link>
            <router-link 
              v-if="auth.isAdmin" 
              to="/admin"
              class="text-gray-600 hover:text-primary transition-colors px-3 py-2"
            >
              Admin Dashboard
            </router-link>
            <button 
              @click="handleLogout" 
              :disabled="loading"
              class="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-400"
            >
              <span v-if="loading" class="mr-2">
                <svg class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
              </span>
              {{ loading ? 'Bezig...' : 'Uitloggen' }}
            </button>
          </template>
          <template v-else>
            <router-link 
              to="/login" 
              class="text-gray-600 hover:text-primary transition-colors px-3 py-2"
            >
              Inloggen
            </router-link>
            <router-link 
              to="/register" 
              class="ml-4 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Registreren
            </router-link>
          </template>
        </div>

        <!-- Mobile Menu Button -->
        <div class="flex items-center md:hidden">
          <button 
            @click="toggleMenu"
            class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary"
          >
            <svg 
              class="h-6 w-6" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                v-if="!isMenuActive" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16"
              />
              <path 
                v-else 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                stroke-width="2" 
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <div 
      v-show="isMenuActive"
      class="md:hidden"
    >
      <div class="pt-2 pb-3 space-y-1">
        <template v-if="auth.user">
          <span class="block px-4 py-2 text-gray-700">
            Welkom, {{ auth.user.email }}
          </span>
          <router-link 
            to="/orders" 
            class="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
            @click="closeMenu"
          >
            Mijn Bestellingen
          </router-link>
          <router-link 
            v-if="auth.isAdmin" 
            to="/admin"
            class="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
            @click="closeMenu"
          >
            Admin Dashboard
          </router-link>
          <button 
            @click="handleLogout" 
            :disabled="loading"
            class="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
          >
            {{ loading ? 'Bezig met uitloggen...' : 'Uitloggen' }}
          </button>
        </template>
        <template v-else>
          <router-link 
            to="/login" 
            class="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
            @click="closeMenu"
          >
            Inloggen
          </router-link>
          <router-link 
            to="/register" 
            class="block px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
            @click="closeMenu"
          >
            Registreren
          </router-link>
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
const isMenuActive = ref(false);

const toggleMenu = () => {
  isMenuActive.value = !isMenuActive.value;
};

const closeMenu = () => {
  isMenuActive.value = false;
};

const handleLogout = async () => {
  try {
    loading.value = true;
    await auth.logout();
    closeMenu();
    router.push('/login');
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    loading.value = false;
  }
};
</script>