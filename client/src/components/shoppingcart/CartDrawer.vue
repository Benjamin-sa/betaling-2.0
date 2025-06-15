<template>
  <!-- Overlay -->
  <div v-if="isOpen" class="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
    :class="{ 'opacity-100': isOpen, 'opacity-0': !isOpen }" @click="$emit('close')" @touchmove.prevent></div>

  <!-- Cart Drawer -->
  <div
    class="fixed top-0 right-0 h-full bg-white shadow-2xl z-50 transition-transform duration-300 ease-in-out flex flex-col cart-drawer"
    :class="[
      isOpen ? 'translate-x-0' : 'translate-x-full',
      'w-full sm:w-96 lg:w-[28rem]'
    ]" style="overscroll-behavior: contain;" @touchmove.stop>
    <!-- Header -->
    <div
      class="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-primary/5 to-green-600/5">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 bg-gradient-to-r from-primary to-green-600 rounded-full flex items-center justify-center">
          <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7M7 13l1.5-7M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">Winkelmandje</h2>
          <p class="text-sm text-gray-600">{{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }}</p>
        </div>
      </div>

      <button @click="$emit('close')" class="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200">
        <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>

    <!-- Cart Items -->
    <div class="flex-1 overflow-y-auto p-6 overscroll-behavior-contain cart-content"
      style="-webkit-overflow-scrolling: touch;">
      <!-- Empty Cart -->
      <div v-if="selectedProducts.length === 0" class="text-center py-12">
        <div class="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7M7 13l1.5-7M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
          </svg>
        </div>
        <h3 class="text-lg font-semibold text-gray-900 mb-2">Je winkelmandje is leeg</h3>
        <p class="text-gray-600 mb-6">Voeg producten toe om te beginnen met bestellen</p>
        <button @click="$emit('close')"
          class="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
          Verder winkelen
        </button>
      </div>

      <!-- Cart with Items -->
      <div v-else class="space-y-4">
        <!-- Multiple Shifts Information -->
        <div v-if="selectedEvent?.type === 'shift_event' && shiftInformation.hasMultipleShifts"
          class="p-4 bg-orange-50 rounded-xl border border-orange-200">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-orange-900 text-sm">Meerdere Tijdsloten</h4>
              <p class="text-xs text-orange-700">Je hebt {{ shiftInformation.totalShifts }} verschillende tijdsloten.
                Reken per tijdslot af.</p>
            </div>
          </div>
        </div>

        <!-- Single Shift Event Info -->
        <div v-else-if="selectedEvent?.type === 'shift_event' && hasProductsWithShifts"
          class="p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <h4 class="font-medium text-blue-900 text-sm">Tijdslot Event</h4>
              <p class="text-xs text-blue-700">Producten hebben individuele tijdsloten</p>
            </div>
          </div>
        </div>

        <!-- Products Display -->
        <div class="space-y-3">
          <div v-for="product in selectedProducts" :key="`cart-${product.cartItemKey}`"
            class="bg-gray-50 rounded-xl p-4 hover:bg-gray-100 transition-colors duration-200">
            <div class="flex items-start space-x-4">
              <!-- Product Image -->
              <div class="w-16 h-16 flex-shrink-0">
                <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
                  class="w-full h-full object-cover rounded-lg shadow-sm" />
                <div v-else
                  class="w-full h-full bg-gradient-to-br from-primary/10 to-green-600/10 rounded-lg flex items-center justify-center border border-primary/20">
                  <span class="text-lg font-bold text-primary/80">{{ product.name.charAt(0) }}</span>
                </div>
              </div>

              <!-- Product Details -->
              <div class="flex-1 min-w-0">
                <h4 class="font-semibold text-gray-900 text-sm truncate">{{ product.name }}</h4>
                <p class="text-xs text-gray-600 mb-2">€{{ product.price.toFixed(2) }} per stuk</p>

                <!-- Timeslot Info -->
                <div v-if="product.requiresTimeslot && selectedEvent?.type === 'shift_event'" class="text-xs mb-2">
                  <span v-if="product.shiftId" class="text-blue-600 font-medium">
                    📅 {{ getShiftName(product.shiftId) }}
                  </span>
                  <span v-else class="text-red-600 font-medium">
                    ⚠️ Geen tijdslot geselecteerd
                  </span>
                </div>

                <!-- Quantity Controls -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center space-x-3 bg-white rounded-lg p-1">
                    <button @click="updateCartItem(product.id, product.shiftId, product.quantity - 1)"
                      :disabled="product.quantity <= 0"
                      class="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200">
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
                      </svg>
                    </button>

                    <span class="font-semibold text-gray-900 min-w-[2rem] text-center">{{ product.quantity }}</span>

                    <button @click="updateCartItem(product.id, product.shiftId, product.quantity + 1)"
                      class="w-8 h-8 rounded-md bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200">
                      <svg class="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </div>

                  <!-- Subtotal & Remove -->
                  <div class="flex items-center space-x-3">
                    <span class="font-bold text-primary">€{{ (product.price * product.quantity).toFixed(2) }}</span>
                    <button @click="removeProduct(product.id, product.shiftId)"
                      class="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors duration-200"
                      title="Verwijder product">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Clear Cart Button -->
        <div class="pt-4 border-t border-gray-200">
          <button @click="clearCart"
            class="w-full text-center text-red-600 hover:text-red-800 text-sm font-medium py-2 hover:bg-red-50 rounded-lg transition-colors duration-200">
            🗑️ Winkelmandje legen
          </button>
        </div>
      </div>
    </div>

    <!-- Footer with Total and Checkout -->
    <div v-if="selectedProducts.length > 0" class="border-t border-gray-200 p-6 bg-white">
      <!-- Event Info -->
      <div v-if="selectedEvent" class="mb-4 p-3 bg-gray-50 rounded-lg">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span class="text-sm font-medium text-gray-900">{{ selectedEvent.name }}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="flex justify-between items-center mb-4">
        <span class="text-lg font-semibold text-gray-900">Totaal</span>
        <span class="text-2xl font-bold text-primary">€{{ total.toFixed(2) }}</span>
      </div>

      <!-- Checkout Button -->
      <button @click="handleCheckout" :disabled="loading || !hasValidItems"
        class="w-full bg-gradient-to-r from-primary to-green-600 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]">
        <div v-if="loading" class="flex items-center justify-center space-x-2">
          <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
            viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>Bezig met afrekenen...</span>
        </div>
        <div v-else class="flex items-center justify-center space-x-2">
          <span>Afrekenen</span>
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </div>
      </button>

      <!-- Validation Message -->
      <div v-if="!hasValidItems && selectedProducts.length > 0"
        class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
        <div class="flex items-center space-x-2">
          <svg class="w-4 h-4 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clip-rule="evenodd" />
          </svg>
          <span class="text-sm text-orange-800">Selecteer tijdsloten voor alle gemarkeerde producten</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Ensure smooth scrolling on mobile devices */
.cart-content {
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
}

/* Global styles for preventing background scroll when cart is open */
:global(body.cart-open) {
  overflow: hidden;
  position: fixed;
  width: 100%;
}

/* Ensure cart drawer can still scroll */
.cart-drawer {
  overscroll-behavior: contain;
}
</style>

<script setup>
import { computed, watch, onUnmounted } from 'vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  selectedProducts: {
    type: Array,
    required: true
  },
  productShiftSelection: {
    type: Object,
    default: () => ({})
  },
  cartItems: {
    type: Array,
    required: true
  },
  loading: {
    type: Boolean,
    default: false
  },
  selectedEvent: {
    type: Object,
    default: null
  },
  totalItems: {
    type: Number,
    required: true
  },
  total: {
    type: Number,
    required: true
  },
  hasValidItems: {
    type: Boolean,
    required: true
  }
})

const emit = defineEmits(['close', 'checkout', 'update-cart-item', 'remove-product', 'clear-cart'])

// Manage body scroll class
let originalScrollPosition = 0

const toggleBodyClass = (isOpen) => {
  if (isOpen) {
    originalScrollPosition = window.scrollY
    document.body.style.top = `-${originalScrollPosition}px`
    document.body.classList.add('cart-open')
  } else {
    document.body.classList.remove('cart-open')
    document.body.style.top = ''
    window.scrollTo(0, originalScrollPosition)
  }
}

// Watch for cart open/close
watch(() => props.isOpen, toggleBodyClass)

// Cleanup on unmount
onUnmounted(() => {
  if (props.isOpen) {
    toggleBodyClass(false)
  }
})

// Computed properties
const hasProductsWithShifts = computed(() => {
  return props.selectedProducts.some(product => product.shiftId)
})

const shiftInformation = computed(() => {
  // This will be provided by the parent component's checkout composable
  // For now, return a basic structure
  return {
    hasMultipleShifts: false,
    shiftsWithProducts: [],
    totalShifts: 0
  }
})

// Helper functions
const getShiftName = (shiftId) => {
  if (!shiftId) return 'Geen tijdslot'
  if (!props.selectedEvent?.shifts) return 'Onbekend tijdslot'

  const shift = props.selectedEvent.shifts.find(s => s.id === shiftId)
  return shift ? `${shift.name} (${shift.startTime} - ${shift.endTime})` : 'Onbekend tijdslot'
}

// Event handlers
const updateCartItem = (productId, shiftId, newQuantity) => {
  emit('update-cart-item', productId, shiftId, Math.max(0, newQuantity))
}

const removeProduct = (productId, shiftId = null) => {
  emit('remove-product', productId, shiftId)
}

const clearCart = () => {
  emit('clear-cart')
}

const handleCheckout = () => {
  emit('checkout')
}
</script>
