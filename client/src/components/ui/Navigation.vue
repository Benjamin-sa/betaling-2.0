<template>
    <nav class="fixed top-0 w-full z-50 transition-all duration-500"
        :class="isHomePage ? homeNavClasses : defaultNavClasses">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between h-20">
                <!-- Logo/Brand -->
                <div class="flex items-center">
                    <router-link to="/" class="flex items-center group">
                        <img src="/src/assets/logo.png" alt="Logo"
                            class="transition-all duration-300 group-hover:scale-110"
                            :class="isHomePage ? 'h-12 w-auto drop-shadow-2xl opacity-90 group-hover:opacity-100' : 'h-8 w-auto'" />
                        <span class="ml-3 font-bold transition-all duration-300 group-hover:scale-105"
                            :class="isHomePage ? 'text-2xl text-white drop-shadow-lg' : 'text-xl text-primary'">
                            Scouts Lod Lavki
                        </span>
                    </router-link>
                </div>

                <!-- Desktop Navigation -->
                <div class="hidden md:flex md:items-center md:space-x-8">
                    <template v-if="auth.user">
                        <span class="font-medium transition-colors duration-300"
                            :class="isHomePage ? 'text-white/90 drop-shadow-sm' : 'text-gray-700'">
                            Welkom, {{ auth.user.email }}
                        </span>
                        <router-link to="/orders"
                            class="flex items-center space-x-2 font-medium transition-all duration-300 hover:scale-105"
                            :class="isHomePage
                                ? 'text-white/80 hover:text-white drop-shadow-sm px-4 py-2 rounded-xl hover:bg-white/10 backdrop-blur-sm'
                                : 'text-gray-600 hover:text-primary'">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                            <span>Bestellingen</span>
                        </router-link>
                        <button @click="handleLogout" :disabled="loading"
                            class="font-medium transition-all duration-300 hover:scale-105 px-4 py-2 rounded-xl" :class="isHomePage
                                ? 'text-white/80 hover:text-white drop-shadow-sm hover:bg-white/10 backdrop-blur-sm'
                                : 'text-gray-600 hover:text-primary hover:bg-gray-50'">
                            {{ loading ? 'Bezig met uitloggen...' : 'Uitloggen' }}
                        </button>
                    </template>

                    <router-link v-if="auth.isAdmin" to="/admin"
                        class="font-medium px-4 py-2 rounded-xl transition-all duration-300 hover:scale-105" :class="isHomePage
                            ? 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm drop-shadow-sm border border-white/20'
                            : 'text-gray-600 hover:text-primary hover:bg-gray-50 border border-gray-200'">
                        Admin Dashboard
                    </router-link>

                    <template v-if="!auth.token">
                        <router-link to="/login"
                            class="font-medium px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105" :class="isHomePage
                                ? 'text-white/80 hover:text-white hover:bg-white/10 backdrop-blur-sm drop-shadow-sm'
                                : 'text-gray-600 hover:text-primary hover:bg-gray-50'">
                            Inloggen
                        </router-link>
                        <router-link to="/register"
                            class="font-medium px-4 py-2 rounded-xl border-2 transition-all duration-300 hover:scale-105 transform"
                            :class="isHomePage
                                ? 'text-white border-white/30 hover:bg-white/10 hover:border-white/50 backdrop-blur-sm drop-shadow-lg'
                                : 'text-primary border-primary hover:bg-primary hover:text-white'">
                            Registreren
                        </router-link>
                    </template>
                </div>

                <!-- Mobile Menu Button -->
                <div class="md:hidden flex items-center">
                    <button @click="toggleMenu"
                        class="p-3 rounded-xl transition-all duration-300 hover:scale-110 border" :class="isHomePage
                            ? 'text-white hover:bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl'
                            : 'text-gray-600 hover:text-primary hover:bg-gray-50 border-gray-200'">
                        <svg class="h-6 w-6 transition-transform duration-300" :class="{ 'rotate-90': isMenuActive }"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path v-if="!isMenuActive" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M4 6h16M4 12h16M4 18h16" />
                            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>

        <!-- Mobile Menu -->
        <transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="transform scale-95 opacity-0" enter-to-class="transform scale-100 opacity-100"
            leave-active-class="transition duration-200 ease-in" leave-from-class="transform scale-100 opacity-100"
            leave-to-class="transform scale-95 opacity-0">
            <div v-show="isMenuActive" class="md:hidden" :class="isHomePage
                ? 'bg-black/90 backdrop-blur-xl border-t border-white/20'
                : 'bg-white border-t border-gray-200'">>
                <div class="pt-2 pb-3 space-y-1">
                    <template v-if="auth.user">
                        <span class="block px-4 py-2 font-medium"
                            :class="isHomePage ? 'text-white/90' : 'text-gray-700'">
                            Welkom, {{ auth.user.email }}
                        </span>
                        <router-link to="/orders" class="block px-4 py-2 font-medium transition-all duration-300"
                            :class="isHomePage
                                ? 'text-white/80 hover:bg-white/10 hover:text-white'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'" @click="closeMenu">
                            Bestellingen
                        </router-link>
                        <button @click="handleLogout" :disabled="loading"
                            class="w-full text-left px-4 py-2 font-medium transition-all duration-300" :class="isHomePage
                                ? 'text-white/80 hover:bg-white/10 hover:text-white'
                                : 'text-gray-600 hover:bg-gray-50 hover:text-primary'">
                            {{ loading ? 'Bezig met uitloggen...' : 'Uitloggen' }}
                        </button>
                    </template>

                    <router-link v-if="auth.isAdmin" to="/admin"
                        class="block px-4 py-2 font-medium transition-all duration-300" :class="isHomePage
                            ? 'text-white/80 hover:bg-white/10 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary'" @click="closeMenu">
                        Admin Dashboard
                    </router-link>

                    <template v-if="!auth.token">
                        <router-link to="/login" class="block px-4 py-2 font-medium transition-all duration-300" :class="isHomePage
                            ? 'text-white/80 hover:bg-white/10 hover:text-white'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-primary'" @click="closeMenu">
                            Inloggen
                        </router-link>
                        <router-link to="/register"
                            class="block mx-4 my-2 px-4 py-2 font-medium rounded-xl border-2 text-center transition-all duration-300"
                            :class="isHomePage
                                ? 'text-white border-white/30 hover:bg-white/10 hover:border-white/50'
                                : 'text-primary border-primary hover:bg-primary hover:text-white'" @click="closeMenu">
                            Registreren
                        </router-link>
                    </template>
                </div>
            </div>
        </transition>
    </nav>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter, useRoute } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()
const notifications = useNotificationStore()
const loading = ref(false)
const isMenuActive = ref(false)
const scrollY = ref(0)

// Scroll event handler
const handleScroll = () => {
    scrollY.value = window.scrollY
}

// Lifecycle hooks
onMounted(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
    window.removeEventListener('scroll', handleScroll)
})

// Computed properties for styling
const isHomePage = computed(() => route.name === 'Home')
const hasScrolled = computed(() => scrollY.value > 50)

const homeNavClasses = computed(() => {
    if (hasScrolled.value) {
        return 'bg-black/80 backdrop-blur-xl border-b border-white/10 shadow-2xl'
    }
    return 'bg-transparent'
})

const defaultNavClasses = computed(() =>
    'bg-white shadow-sm'
)

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
        notifications.success('Tot ziens!', 'Je bent succesvol uitgelogd.')
        router.push('/login')
    } catch (error) {
        console.error('Logout error:', error)
        notifications.error('Uitloggen mislukt', 'Er is een probleem opgetreden bij het uitloggen.')
    } finally {
        loading.value = false
    }
}
</script>
