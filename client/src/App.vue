<!-- App.vue -->
<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation -->
    <nav class="fixed top-0 w-full bg-white shadow-sm z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <!-- Logo/Brand -->
          <div class="flex items-center">
            <router-link to="/" class="flex items-center">
              <img src="/src/assets/logo.png" alt="Logo" class="h-8 w-auto" />
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
                class="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                <span>Bestellingen</span>
              </router-link>
              <button 
                @click="handleLogout" 
                :disabled="loading"
                class="text-gray-600 hover:text-primary transition-colors"
              >
                {{ loading ? 'Bezig met uitloggen...' : 'Uitloggen' }}
              </button>
            </template>
            <router-link 
              v-if="auth.isAdmin" 
              to="/admin"
              class="text-gray-600 hover:text-primary transition-colors px-3 py-2"
            >
              Admin Dashboard
            </router-link>
            <template v-if="!auth.token">
              <router-link to="/login" class="text-gray-600 hover:text-primary transition-colors">
                Inloggen
              </router-link>
              <router-link to="/register" class="text-gray-600 hover:text-primary transition-colors">
                Registreren
              </router-link>
            </template>
          </div>

          <!-- Mobile Menu Button -->
          <div class="md:hidden flex items-center">
            <button 
              @click="toggleMenu"
              class="text-gray-600 hover:text-primary"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path v-if="!isMenuActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-show="isMenuActive" class="md:hidden">
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
              Bestellingen
            </router-link>
            <button 
              @click="handleLogout" 
              :disabled="loading"
              class="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 hover:text-primary"
            >
              {{ loading ? 'Bezig met uitloggen...' : 'Uitloggen' }}
            </button>
          </template>
          <router-link 
              v-if="auth.isAdmin" 
              to="/admin"
              class="text-gray-600 hover:text-primary transition-colors px-3 py-2"
            >
              Admin Dashboard
            </router-link>
          <template v-if="!auth.token">
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
    
   <!-- Main content -->
   <main class="pt-16">
      <div class="container mx-auto px-4 py-8 max-w-7xl">
        <router-view v-slot="{ Component }">
          <transition name="page" mode="out-in">
            <div :key="$route.fullPath"> <!-- Add wrapper div -->
              <component :is="Component" />
            </div>
          </transition>
        </router-view>
      </div>
    </main>
  </div>
  <Footer />
</template>

<script setup>
import { ref} from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import Footer from './components/ui/Footer.vue'

const auth = useAuthStore()
const router = useRouter()
const loading = ref(false)
const isMenuActive = ref(false)


const toggleMenu = () => {
  isMenuActive.value = !isMenuActive.value
}

const closeMenu = () => {
  isMenuActive.value = false
}

const handleLogout = async () => {
  try {
    loading.value = true
    await auth.logout()
    closeMenu()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style>
/* Replace existing transition styles */

/* Fade and slide transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* Optional: Add will-change for performance */
.page-enter-active,
.page-leave-active {
  will-change: transform, opacity;
}
</style>