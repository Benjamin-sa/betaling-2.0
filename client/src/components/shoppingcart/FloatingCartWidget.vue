<template>
  <div v-if="hasItems" class="fixed bottom-6 right-6 z-50">
    <!-- Floating Cart Button -->
    <button 
      @click="$emit('toggle-cart')"
      class="group relative bg-gradient-to-r from-primary to-green-600 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 active:scale-95"
      :class="[
        'w-16 h-16 flex items-center justify-center',
        'sm:w-20 sm:h-20',
        'ring-4 ring-white ring-opacity-30',
        { 'animate-bounce': isAnimating }
      ]"
    >
      <!-- Shopping Cart Icon -->
      <div class="relative">
        <svg class="w-7 h-7 sm:w-8 sm:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7M7 13l1.5-7M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
        </svg>
        
        <!-- Item Count Badge -->
        <div class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg transition-all duration-300">
          {{ totalItems }}
        </div>
      </div>

      <!-- Hover Effect Background -->
      <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 rounded-full transition-opacity duration-300"></div>
    </button>

    <!-- Price Badge (shows on hover) -->
    <div class="absolute bottom-full right-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
      <div class="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm font-semibold shadow-xl">
        €{{ total.toFixed(2) }}
        <!-- Arrow pointing down -->
        <div class="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref } from 'vue'

const props = defineProps({
  hasItems: {
    type: Boolean,
    required: true
  },
  totalItems: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  }
})

const emit = defineEmits(['toggle-cart'])

// Animation state for when items are added
const isAnimating = ref(false)

// Watch for changes in totalItems to trigger animation
watch(() => props.totalItems, (newCount, oldCount) => {
  if (newCount > oldCount) {
    isAnimating.value = true
    setTimeout(() => {
      isAnimating.value = false
    }, 600)
  }
})
</script>

<style scoped>
.shadow-3xl {
  box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.25);
}
</style>
