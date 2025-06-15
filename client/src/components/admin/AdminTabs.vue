<template>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Admin Header -->
        <div class="mb-6 sm:mb-8">
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Admin Dashboard
            </h1>
            <p class="text-base sm:text-lg text-gray-600">
                Beheer events, producten en gebruikers
            </p>
        </div>

        <!-- Tab Navigation -->
        <div class="border-b border-gray-200 mb-6 sm:mb-8">
            <!-- Mobile dropdown for tabs -->
            <div class="sm:hidden">
                <select v-model="activeTab"
                    class="block w-full px-3 py-2 border border-gray-300 rounded-md text-base font-medium bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                    <option v-for="tab in tabs" :key="tab.id" :value="tab.id">
                        {{ tab.name }}{{ tab.badge ? ` (${tab.badge})` : '' }}
                    </option>
                </select>
            </div>

            <!-- Desktop tab navigation -->
            <nav class="hidden sm:flex -mb-px space-x-4 lg:space-x-8" aria-label="Tabs">
                <button v-for="tab in tabs" :key="tab.id" @click="activeTab = tab.id" :class="[
                    'whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm sm:text-base lg:text-lg transition-colors duration-200',
                    activeTab === tab.id
                        ? 'border-primary text-primary'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                ]" :aria-current="activeTab === tab.id ? 'page' : undefined">
                    <div class="flex items-center space-x-1 sm:space-x-2">
                        <component :is="tab.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
                        <span class="hidden sm:inline">{{ tab.name }}</span>
                        <span class="sm:hidden">{{ tab.name.substring(0, 3) }}</span>
                        <span v-if="tab.badge"
                            class="ml-1 sm:ml-2 inline-flex items-center px-1.5 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary text-white">
                            {{ tab.badge }}
                        </span>
                    </div>
                </button>
            </nav>
        </div>

        <!-- Tab Content -->
        <div class="animate-fade-in">
            <div v-show="activeTab === 'events'">
                <EventManagement :events="events" @events-updated="$emit('events-updated')" />
            </div>

            <div v-show="activeTab === 'products'">
                <ProductManagement :events="events" @products-updated="$emit('products-updated')" />
            </div>

            <div v-show="activeTab === 'orders'">
                <OrderManagement :events="events" />
            </div>

            <div v-show="activeTab === 'users'">
                <UserManagement />
            </div>

            <div v-show="activeTab === 'google'">
                <GoogleServicesManagement />
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EventManagement from './EventManagement.vue'
import ProductManagement from './ProductManagement.vue'
import OrderManagement from './OrderManagement.vue'
import UserManagement from './UserManagement.vue'
import GoogleServicesManagement from './GoogleServicesManagement.vue'

const props = defineProps({
    events: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['events-updated', 'products-updated'])

const activeTab = ref('events')

// Icon components
const CalendarIcon = {
    template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  `
}

const CubeIcon = {
    template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  `
}

const ShoppingCartIcon = {
    template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  `
}

const UsersIcon = {
    template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0" />
    </svg>
  `
}
const GoogleIcon = {
    template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 008 4.07M3 15.364c.64-1.319 1-2.8 1-4.364 0-1.457.39-2.823 1.07-4" />
    </svg>
  `
}

// Tab configuration - use component objects instead of strings
const tabs = computed(() => [
    {
        id: 'events',
        name: 'Events',
        icon: CalendarIcon,
        badge: props.events.length || null
    },
    {
        id: 'products',
        name: 'Producten',
        icon: CubeIcon,
        badge: null
    },
    {
        id: 'orders',
        name: 'Bestellingen',
        icon: ShoppingCartIcon,
        badge: null
    },
    {
        id: 'users',
        name: 'Gebruikers',
        icon: UsersIcon,
        badge: null
    },
    {
        id: 'google',
        name: 'Google Services',
        icon: GoogleIcon,
        badge: null
    }
])
</script>