<template>
  <div :class="[
    'group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
    { 'ring-2 ring-blue-500 ring-opacity-50': product.requiresTimeslot && !preview }
  ]">


    <div class="relative aspect-w-4 aspect-h-3 bg-white border-b border-gray-50">
      <!-- Test Mode Badge -->
      <div v-if="product.isTestMode"
        class="absolute top-2 left-2 z-20 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-warning text-white shadow-lg border-2 border-white">
        <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        TEST
      </div>

      <!-- Multiple Images Gallery -->
      <div v-if="productImages.length > 0" class="relative w-full h-full">
        <!-- Image Container -->
        <div class="relative w-full h-full overflow-hidden">
          <TransitionGroup name="image-fade" tag="div" class="relative w-full h-full">
            <img 
              v-for="(image, index) in productImages" 
              :key="image"
              v-show="index === currentImageIndex"
              :src="image" 
              :alt="`${product.name} - Afbeelding ${index + 1}`" 
              @error="handleImageError"
              class="absolute inset-0 w-full h-full object-contain p-2 transform transition-transform duration-300 group-hover:scale-105" 
            />
          </TransitionGroup>
        </div>

        <!-- Navigation Arrows (only show if multiple images) -->
        <template v-if="productImages.length > 1">
          <!-- Previous Button -->
          <button 
            @click.stop="previousImage"
            class="absolute left-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
            aria-label="Vorige afbeelding"
          >
            <svg class="w-4 h-4 text-gray-800 group-hover/btn:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <!-- Next Button -->
          <button 
            @click.stop="nextImage"
            class="absolute right-2 top-1/2 -translate-y-1/2 z-10 p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all duration-200 hover:scale-110 active:scale-95 group/btn"
            aria-label="Volgende afbeelding"
          >
            <svg class="w-4 h-4 text-gray-800 group-hover/btn:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <!-- Image Indicators (Dots) -->
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex space-x-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full">
            <button
              v-for="(image, index) in productImages"
              :key="`dot-${index}`"
              @click.stop="goToImage(index)"
              :class="[
                'transition-all duration-200',
                index === currentImageIndex 
                  ? 'w-6 h-2 bg-white rounded-full' 
                  : 'w-2 h-2 bg-white/50 hover:bg-white/75 rounded-full'
              ]"
              :aria-label="`Ga naar afbeelding ${index + 1}`"
            />
          </div>

          <!-- Image Counter -->
          <div class="absolute top-2 right-2 z-10 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-xs font-semibold rounded-full">
            {{ currentImageIndex + 1 }} / {{ productImages.length }}
          </div>
        </template>
      </div>

      <!-- No Image Fallback -->
      <div v-else :class="[
        'w-full h-full flex flex-col items-center justify-center p-4 relative',
        product.requiresTimeslot
          ? 'bg-gradient-to-br from-blue-50 to-blue-100'
          : 'bg-gradient-to-br from-primary/10 to-primary/5'
      ]">
        <!-- Test Mode Badge for fallback div -->
        <div v-if="product.isTestMode"
          class="absolute top-2 left-2 z-10 inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-warning text-white shadow-lg border-2 border-white">
          <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          TEST
        </div>

        <span :class="[
          'text-2xl font-bold text-center',
          product.requiresTimeslot ? 'text-blue-700' : 'text-primary/80'
        ]">{{ product.name }}</span>
        <span class="mt-2 text-sm text-gray-600 text-center">€{{ product.price.toFixed(2) }}</span>
      </div>
    </div>

    <div class="p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h3>
      <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>

      <!-- Shift Selection for Timeslot Required Products -->
      <div v-if="product.requiresTimeslot && !preview && isShiftEvent && availableShifts.length > 0"
        class="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <label class="block text-sm font-medium text-blue-900 mb-2">
          Selecteer tijdslot:
        </label>
        <select v-model="selectedShift" @change="handleShiftChange"
          class="w-full px-3 py-2 text-sm border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value="">-- Kies een tijdslot --</option>
          <option v-for="shift in availableShifts" :key="shift.id" :value="shift.id">
            {{ shift.name }} ({{ shift.startTime }} - {{ shift.endTime }})
            {{ getShiftCartInfo(shift.id) }}
          </option>
        </select>

        <!-- Real-time Capacity Indicator -->
        <div v-if="selectedShift && selectedEvent?.id" class="mt-2">
          <ShiftCapacityIndicator :event-id="selectedEvent.id" :shift-id="selectedShift" :quantity="currentQuantity"
            :show-badge="true" :show-details="false" size="small" />
        </div>

        <!-- Show existing items in other shifts -->
        <div v-if="getOtherShiftItems().length > 0" class="mt-2 text-xs text-blue-600">
          <p class="font-medium">Al in winkelmandje:</p>
          <div class="space-y-1">
            <div v-for="item in getOtherShiftItems()" :key="item.shiftId" class="flex justify-between">
              <span>{{ getShiftName(item.shiftId) }}</span>
              <span class="font-medium">{{ item.quantity }}x</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Quantity Selection -->
      <div v-if="!preview" class="mb-4">
        <label class="block text-sm font-medium text-gray-900 mb-2">Aantal:</label>
        <div class="flex items-center space-x-3">
          <button @click="decreaseQuantity" class="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50"
            :disabled="currentQuantity <= 1">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4" />
            </svg>
          </button>

          <input type="number" v-model.number="currentQuantity" min="1" max="99"
            class="w-20 text-center text-lg font-semibold border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary" />

          <button @click="increaseQuantity" class="p-2 rounded-lg hover:bg-gray-100">
            <svg class="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Price and Add to Cart -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <span :class="[
            'text-2xl font-bold',
            product.requiresTimeslot ? 'text-blue-600' : 'text-primary'
          ]">€{{ product.price.toFixed(2) }}</span>

          <!-- Show items already in cart for this product -->
          <div v-if="totalInCart > 0" class="text-sm text-gray-600">
            <span class="bg-green-100 text-green-800 px-2 py-1 rounded-full">
              {{ totalInCart }} in winkelmandje
            </span>
          </div>
        </div>

        <!-- Add to Cart Button -->
        <div v-if="!preview">
          <button @click="addToCart" :disabled="!canAddToCart" :class="[
            'w-full py-3 px-6 rounded-xl font-bold text-lg transition-all duration-200 transform',
            canAddToCart
              ? 'bg-gradient-to-r from-primary to-green-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          ]">
            <div v-if="canAddToCart" class="flex items-center justify-center space-x-2">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7M7 13l1.5-7M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
              </svg>
              <span>Toevoegen ({{ currentQuantity }}x)</span>
            </div>
            <div v-else class="text-center">
              {{ getDisabledReason() }}
            </div>
          </button>
        </div>

        <div v-else class="text-center text-sm text-gray-500 font-medium py-3">
          Preview Mode
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { EVENT_TYPES } from '@/config/constants'
import { useNotificationStore } from '@/stores/notifications'
import ShiftCapacityIndicator from '@/components/events/ShiftCapacityIndicator.vue'

const notifications = useNotificationStore()

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  cartItems: {
    type: Array,
    default: () => []
  },
  preview: {
    type: Boolean,
    default: false
  },
  selectedEvent: {
    type: Object,
    default: null
  },
  availableShifts: {
    type: Array,
    default: () => []
  },
  productShiftSelection: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:cart-item', 'image-error', 'update:product-shift'])

const selectedShift = ref(props.productShiftSelection[props.product.id] || '')
const currentQuantity = ref(1)
const currentImageIndex = ref(0)

// Image Gallery Logic
const productImages = computed(() => {
  // Priority: Use images array if available, fallback to single image, then empty
  if (props.product.images && Array.isArray(props.product.images) && props.product.images.length > 0) {
    return props.product.images.filter(img => img) // Filter out null/undefined
  } else if (props.product.image) {
    return [props.product.image]
  }
  return []
})

const nextImage = () => {
  if (productImages.value.length > 1) {
    currentImageIndex.value = (currentImageIndex.value + 1) % productImages.value.length
  }
}

const previousImage = () => {
  if (productImages.value.length > 1) {
    currentImageIndex.value = currentImageIndex.value === 0 
      ? productImages.value.length - 1 
      : currentImageIndex.value - 1
  }
}

const goToImage = (index) => {
  currentImageIndex.value = index
}

// Keyboard navigation for image gallery
const handleKeyPress = (event) => {
  if (productImages.value.length <= 1) return
  
  if (event.key === 'ArrowLeft') {
    previousImage()
  } else if (event.key === 'ArrowRight') {
    nextImage()
  }
}

// Setup keyboard listeners
onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})

// Computed properties for better UX
const totalInCart = computed(() => {
  // Show total quantity of this product across all shifts
  return props.cartItems
    .filter(item => item.productId === props.product.id)
    .reduce((sum, item) => sum + item.quantity, 0);
})

const canAddToCart = computed(() => {
  // For products requiring timeslots, must have shift selected
  if (props.product.requiresTimeslot && isShiftEvent.value) {
    return selectedShift.value !== ''
  }
  // For regular products, always can add
  return true
})

const isShiftEvent = computed(() => {
  return props.selectedEvent?.type === EVENT_TYPES.SHIFT_EVENT
})

// Watch for changes in productShiftSelection prop
watch(() => props.productShiftSelection[props.product.id], (newShiftId) => {
  selectedShift.value = newShiftId || ''
})

const handleImageError = () => {
  emit('image-error', props.product)
}

const handleShiftChange = () => {
  emit('update:product-shift', props.product.id, selectedShift.value)
}

const increaseQuantity = () => {
  if (currentQuantity.value < 99) {
    currentQuantity.value++
  }
}

const decreaseQuantity = () => {
  if (currentQuantity.value > 1) {
    currentQuantity.value--
  }
}

const addToCart = () => {
  if (!canAddToCart.value) return

  const shiftId = props.product.requiresTimeslot ? selectedShift.value : null

  // Get current quantity in cart for this product-shift combination
  const existingItem = props.cartItems.find(
    item => item.productId === props.product.id && item.shiftId === shiftId
  )
  const existingQuantity = existingItem ? existingItem.quantity : 0

  // Add the selected quantity to existing quantity
  const newQuantity = existingQuantity + currentQuantity.value

  emit('update:cart-item', props.product.id, shiftId, newQuantity)

  // Show success notification
  const shiftText = shiftId ? ` voor ${getShiftName(shiftId)}` : ''
  notifications.success(
    'Toegevoegd!',
    `${currentQuantity.value}x ${props.product.name}${shiftText} toegevoegd aan winkelmandje`
  )

  // Reset quantity selector to 1 for next addition
  currentQuantity.value = 1
}

const getDisabledReason = () => {
  if (props.product.requiresTimeslot && !selectedShift.value) {
    return 'Selecteer eerst een tijdslot'
  }
  return 'Niet beschikbaar'
}

const getShiftCartInfo = (shiftId) => {
  const item = props.cartItems.find(
    item => item.productId === props.product.id && item.shiftId === shiftId
  )
  return item ? ` - ${item.quantity}x in winkelmandje` : ''
}

const getShiftName = (shiftId) => {
  const shift = props.availableShifts.find(s => s.id === shiftId)
  return shift ? shift.name : 'Onbekend tijdslot'
}

const getOtherShiftItems = () => {
  return props.cartItems
    .filter(item =>
      item.productId === props.product.id &&
      item.shiftId &&
      item.shiftId !== selectedShift.value
    )
    .map(item => ({
      shiftId: item.shiftId,
      quantity: item.quantity
    }))
}
</script>

<style scoped>
/* Image fade transition for smooth carousel effect */
.image-fade-enter-active,
.image-fade-leave-active {
  transition: opacity 0.5s ease-in-out;
}

.image-fade-enter-from {
  opacity: 0;
}

.image-fade-leave-to {
  opacity: 0;
}

/* Ensure aspect ratio container works properly */
.aspect-w-4 {
  position: relative;
  padding-bottom: 75%; /* 4:3 aspect ratio */
}

.aspect-w-4 > * {
  position: absolute;
  height: 100%;
  width: 100%;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
</style>
