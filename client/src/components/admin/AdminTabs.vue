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

            <div v-show="activeTab === 'users'">
                <UserManagement />
            </div>

            <div v-show="activeTab === 'analytics'">
                <div class="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
                    <div class="text-center py-12">
                        <div
                            class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Analytics Coming Soon</h3>
                        <p class="text-gray-600">Advanced analytics and reporting features will be available here.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EventManagement from './EventManagement.vue'
import ProductManagement from './ProductManagement.vue'
import UserManagement from './UserManagement.vue'

const props = defineProps({
    events: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['events-updated', 'products-updated'])

const activeTab = ref('events')

// Tab configuration
const tabs = computed(() => [
    {
        id: 'events',
        name: 'Events',
        icon: 'CalendarIcon',
        badge: props.events.length || null
    },
    {
        id: 'products',
        name: 'Producten',
        icon: 'CubeIcon',
        badge: null
    },
    {
        id: 'users',
        name: 'Gebruikers',
        icon: 'UsersIcon',
        badge: null
    },
    {
        id: 'analytics',
        name: 'Analytics',
        icon: 'ChartBarIcon',
        badge: null
    }
])

// Simple icon components (inline SVGs)
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

const UsersIcon = {
    template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0" />
    </svg>
  `
}

const ChartBarIcon = {
    template: `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  `
}
</script>
