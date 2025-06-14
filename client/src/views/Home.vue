<template>
  <div class="home-container">
    <!-- Hero Section -->
    <HeroSection :selected-event="eventManager.selectedEvent.value" @scroll-to-products="scrollToProducts" />

    <!-- Main Content -->
    <div id="products-section" class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <!-- Conditional Event Display -->
        <!-- Simple aesthetic divider when there's only one event -->
        <div v-if="!eventManager.shouldShowEventSelector.value" class="mb-12">
          <div class="flex items-center justify-center">
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
            <div class="mx-6 text-gray-500 font-medium text-sm uppercase tracking-wider">
              Onze Producten
            </div>
            <div class="flex-1 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
          </div>
        </div>

        <!-- Show Event Selector when there are multiple events -->
        <EventSelector v-if="eventManager.shouldShowEventSelector.value"
          :active-events="eventManager.activeEvents.value" :selected-event-id="eventManager.selectedEventId.value"
          :selected-event="eventManager.selectedEvent.value" @update:selected-event-id="onEventChange" />

        <!-- Product Grid -->
        <ProductGrid :loading="productManager.loading.value" :products="productManager.products.value"
          :cart-items="cartItemsStorage.cartItems.value" :active-events="eventManager.activeEvents.value"
          :selected-event-id="eventManager.selectedEventId.value" :selected-event="eventManager.selectedEvent.value"
          :product-shift-selection="productShiftStorage.productShiftSelection.value" @update:cart-item="updateCartItem"
          @image-error="handleImageError" @update:product-shift="updateProductShift" />
      </div>

      <!-- Event Details -->
      <EventDetails :selected-event="eventManager.selectedEvent.value" />
    </div>

    <!-- New Floating Cart System -->
    <FloatingCartWidget :has-items="productManager.hasSelectedProducts.value"
      :total-items="productManager.totalItems.value" :total="productManager.totalPrice.value"
      @toggle-cart="isCartOpen = !isCartOpen" />

    <CartDrawer :is-open="isCartOpen" :selected-products="productManager.selectedProducts.value"
      :product-shift-selection="productShiftStorage.productShiftSelection.value"
      :cart-items="cartItemsStorage.cartItems.value" :loading="checkout.loading.value"
      :selected-event="eventManager.selectedEvent.value" :total-items="productManager.totalItems.value"
      :total="productManager.totalPrice.value" :has-valid-items="productManager.hasValidCartItems.value"
      @close="isCartOpen = false" @checkout="handleCheckout" @update-cart-item="updateCartItem"
      @remove-product="removeProduct" @clear-cart="clearCart" />

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="confirmation.isOpen.value" :title="confirmation.config.value.title"
      :message="confirmation.config.value.message" :type="confirmation.config.value.type"
      :confirm-text="confirmation.config.value.confirmText" :cancel-text="confirmation.config.value.cancelText"
      @confirm="confirmation.confirm" @cancel="confirmation.cancel" @close="confirmation.close" />
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from 'vue';
import { UI_CONSTANTS } from '@/config/constants';

// Import composables
import { useEventManager } from '@/composables/useEventManager';
import { useProductManager } from '@/composables/useProductManager';
import { useCartItemsStorage, useProductShiftStorage } from '@/composables/useLocalStorage';
import { useCheckout } from '@/composables/useCheckout';
import { useConfirmation } from '@/composables/useConfirmation';

// Import components
import HeroSection from '@/components/events/HeroSection.vue';
import EventSelector from '@/components/events/EventSelector.vue';
import ProductGrid from '@/components/events/ProductGrid.vue';
import EventDetails from '@/components/events/EventDetails.vue';
import FloatingCartWidget from '@/components/shoppingcart/FloatingCartWidget.vue';
import CartDrawer from '@/components/shoppingcart/CartDrawer.vue';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';

// Cart state
const isCartOpen = ref(false);

// Initialize composables
const eventManager = useEventManager();
const cartItemsStorage = useCartItemsStorage();
const productShiftStorage = useProductShiftStorage();
const confirmation = useConfirmation();

// Product manager with validation integrated
const productManager = useProductManager(
  cartItemsStorage.cartItems,
  eventManager.selectedEvent
);

// Checkout functionality
const checkout = useCheckout(
  productManager.products,
  cartItemsStorage.cartItems,
  eventManager.selectedEvent
);

// Handle event change with proper cleanup and state management
const onEventChange = (newEventId) => {
  if (eventManager.selectedEventId.value !== newEventId) {
    // Save current state before switching
    cartItemsStorage.saveCartItems(eventManager.selectedEventId.value);
    productShiftStorage.saveProductShiftSelection(eventManager.selectedEventId.value);

    // Switch to new event
    eventManager.selectEvent(newEventId);

    // Load state for new event
    if (newEventId) {
      productManager.loadProductsForEvent(newEventId);
      cartItemsStorage.loadCartItems(newEventId);
      productShiftStorage.loadProductShiftSelection(newEventId);
    } else {
      // Clear selections when no event is selected
      cartItemsStorage.clearCartItems();
      productShiftStorage.clearProductShiftSelection();
      productManager.clearProducts();
    }
  }
};

// Handle cart item updates (replaces updateQuantity)
const updateCartItem = (productId, shiftId, newQuantity) => {
  cartItemsStorage.updateCartItem(productId, shiftId, newQuantity, eventManager.selectedEventId.value);
};

// Handle shift selection updates
const updateProductShift = (productId, shiftId) => {
  productShiftStorage.updateProductShift(productId, shiftId, eventManager.selectedEventId.value);
};

// Handle image errors
const handleImageError = (product) => {
  productManager.handleImageError(product);
};

// Cart management functions
const removeProduct = async (productId, shiftId = null) => {
  const product = productManager.getProductById(productId);
  const productName = product?.name || 'dit product';
  const shiftText = shiftId ? ' (voor geselecteerd tijdslot)' : '';

  try {
    await confirmation.show({
      title: 'Product verwijderen',
      message: `Weet je zeker dat je "${productName}${shiftText}" uit je winkelmandje wilt verwijderen?`,
      type: 'warning',
      confirmText: 'Verwijderen',
      cancelText: 'Behouden'
    });

    // User confirmed - remove the product
    cartItemsStorage.updateCartItem(productId, shiftId, 0, eventManager.selectedEventId.value);
  } catch {
    // User cancelled - do nothing
  }
};

const clearCart = async () => {
  try {
    await confirmation.show({
      title: 'Winkelmandje legen',
      message: 'Weet je zeker dat je alle items uit je winkelmandje wilt verwijderen?',
      type: 'warning',
      confirmText: 'Alles verwijderen',
      cancelText: 'Annuleren'
    });

    // User confirmed - clear the cart
    cartItemsStorage.clearCart(eventManager.selectedEventId.value);
    isCartOpen.value = false;
  } catch {
    // User cancelled - do nothing
  }
};

const handleCheckout = () => {
  checkout.handleCheckout();
};

// Scroll to products section
const scrollToProducts = () => {
  const productsSection = document.getElementById('products-section');
  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: UI_CONSTANTS.SCROLL_BEHAVIOR,
      block: 'start'
    });
  }
};

// Watch for event changes and load products accordingly
watch(eventManager.selectedEventId, (newEventId) => {
  if (newEventId) {
    productManager.loadProductsForEvent(newEventId).then(() => {
      // Initialize cart items after products are loaded
      cartItemsStorage.initializeCartItems(productManager.products.value, newEventId);
      // Initialize product-shift selections
      productShiftStorage.initializeProductShiftSelection(productManager.products.value, newEventId);
    });
    cartItemsStorage.loadCartItems(newEventId);
    productShiftStorage.loadProductShiftSelection(newEventId);
  }
});

// Initialize on mount
onMounted(async () => {
  try {
    await eventManager.loadActiveEvents();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
});

// Cleanup on unmount
onUnmounted(() => {
  cartItemsStorage.cleanup();
  productShiftStorage.cleanup();
});
</script>

<style scoped>
/* Prevent double-tap zoom and unwanted text selection on interactive elements */
button,
a,
.home-container input[type="number"] {
  touch-action: manipulation;
  -webkit-user-select: none;
  user-select: none;
}

/* Make sure the entire container prevents unwanted zooming */
.home-container {
  touch-action: pan-x pan-y;
}

/* Prevent number input spinners from causing zoom */
input[type="number"] {
  appearance: textfield;
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Smooth scrolling for the entire page */
html {
  scroll-behavior: smooth;
}

/* Background gradient for the entire page */
.home-container {
  background: transparent;
  min-height: 100vh;
}
</style>
