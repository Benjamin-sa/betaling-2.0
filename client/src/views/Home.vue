<template>
  <div class="home-container">
    <!-- Hero Section -->
    <HeroSection :selected-event="selectedEvent" @scroll-to-products="scrollToProducts" />

    <!-- Main Content -->
    <div id="products-section" class="bg-gray-50 py-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-32">
        <!-- Event Selector -->
        <EventSelector :active-events="activeEvents" :selected-event-id="selectedEventId"
          :selected-event="selectedEvent" @update:selected-event-id="onEventChange" />

        <!-- Product Grid -->
        <ProductGrid :loading="loading" :products="products" :quantities="quantities" :active-events="activeEvents"
          :selected-event-id="selectedEventId" :selected-event="selectedEvent" :selected-shifts="selectedShifts"
          @update:quantity="updateQuantity" @image-error="handleImageError"
          @update:selected-shifts="updateSelectedShifts" />
      </div>

      <!-- Shopping Cart -->
      <ShoppingCart :has-items="hasItems" :total-items="totalItems" :total="total" :selected-products="selectedProducts"
        :selected-shifts="selectedShifts" :quantities="quantities" :loading="checkoutLoading"
        :selected-event="selectedEvent" @checkout="handleCheckout" />

      <!-- Event Details -->
      <EventDetails :selected-event="selectedEvent" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';

// Import new components
import HeroSection from '@/components/events/HeroSection.vue';
import EventSelector from '@/components/events/EventSelector.vue';
import ProductGrid from '@/components/events/ProductGrid.vue';
import ShoppingCart from '@/components/events/ShoppingCart.vue';
import EventDetails from '@/components/events/EventDetails.vue';

const auth = useAuthStore();
const notifications = useNotificationStore();
const stripePromise = loadStripe('pk_test_51Q2YysK7LyHlGaLs1KaOcD1Gk6A8b8l45LVF3q9URgskNKwgFHBEIPRKtMXGZEu0kFn9Iq0yWGcJ0Aatm5XCMsiK00SWythWSu');

// State variables
const products = ref([]);
const quantities = ref({});
const selectedShifts = ref([]);
const loading = ref(false);
const checkoutLoading = ref(false);
const activeEvents = ref([]);
const selectedEventId = ref(null);

// Computed property for selected event
const selectedEvent = computed(() => {
  return activeEvents.value.find(event => event.id === selectedEventId.value);
});

// Load active events
const loadActiveEvents = async () => {
  try {
    const data = await apiClient.getActiveEvents();
    activeEvents.value = data.events;

    // Auto-select the first active event if available
    if (activeEvents.value.length > 0 && !selectedEventId.value) {
      selectedEventId.value = activeEvents.value[0].id;
    }
  } catch (error) {
    console.error('Error loading active events:', error);
    notifications.error('Laadprobleem', 'Er is een fout opgetreden bij het laden van de events.');
  }
};

// Load products for a specific event
const loadProductsForEvent = async (eventId) => {
  if (!eventId) {
    products.value = [];
    return;
  }

  loading.value = true;
  try {
    const data = await apiClient.getProducts(eventId);
    products.value = data.products;

    // Initialize quantities from localStorage for this event
    const savedQuantities = JSON.parse(localStorage.getItem(`quantities_${eventId}`)) || {};
    const newQuantities = {};
    products.value.forEach((product) => {
      newQuantities[product.id] = savedQuantities[product.id] || 0;
    });
    quantities.value = newQuantities;
  } catch (error) {
    console.error('Error loading products:', error);
    notifications.error('Laadprobleem', 'Er is een fout opgetreden bij het laden van de producten.');
    products.value = [];
  } finally {
    loading.value = false;
  }
};

// Handle event change
const onEventChange = (newEventId) => {
  if (selectedEventId.value !== newEventId) {
    // Save current quantities and shifts to localStorage before switching
    saveQuantitiesToStorage();
    saveShiftsToStorage();

    selectedEventId.value = newEventId;

    // Load products and shifts for new event
    if (newEventId) {
      loadProductsForEvent(newEventId);
      loadShiftsFromStorage();
    } else {
      // Clear selections when no event is selected
      selectedShifts.value = [];
    }
  }
};

// Save quantities to localStorage with event-specific key
const saveQuantitiesToStorage = () => {
  if (selectedEventId.value) {
    localStorage.setItem(`quantities_${selectedEventId.value}`, JSON.stringify(quantities.value));
  }
};

// Watch for changes in selectedEventId
watch(selectedEventId, (newEventId) => {
  if (newEventId) {
    loadProductsForEvent(newEventId);
    loadShiftsFromStorage();
  }
});

const selectedProducts = computed(() => {
  return products.value.filter(product => quantities.value[product.id] > 0)
});

// For shift events, we need products and potentially a shift (only if products require timeslots)
const hasItems = computed(() => {
  const hasProducts = Object.values(quantities.value).some(quantity => quantity > 0);

  if (selectedEvent.value?.type === 'shift_event') {
    if (!hasProducts) return false;
    
    // Check if any selected products require timeslots
    const selectedProducts = products.value.filter(product => 
      quantities.value[product.id] > 0
    );
    
    const hasTimeslotRequiredProducts = selectedProducts.some(product => 
      product.requiresTimeslot === true
    );

    // If any product requires timeslot, need shift selection
    if (hasTimeslotRequiredProducts) {
      return hasProducts && selectedShifts.value.length > 0;
    } else {
      // If no products require timeslots, just need products
      return hasProducts;
    }
  } else {
    // For regular events, only need products
    return hasProducts;
  }
});

const total = computed(() => {
  // Total is always based on products only
  // Shifts are just metadata for linking products to time slots
  return products.value.reduce((sum, product) => {
    return sum + (product.price * (quantities.value[product.id] || 0));
  }, 0);
});

const totalItems = computed(() => {
  // Count only product quantities, shifts are just linking metadata
  return Object.values(quantities.value).reduce((sum, quantity) => sum + quantity, 0);
});

const updateQuantity = (productId, newQuantity) => {
  quantities.value[productId] = Math.max(0, newQuantity);
  // Save to localStorage whenever quantities change
  saveQuantitiesToStorage();
};

const updateSelectedShifts = (shifts) => {
  selectedShifts.value = shifts;
  // Save shifts to localStorage
  saveShiftsToStorage();
};

// Save shifts to localStorage with event-specific key
const saveShiftsToStorage = () => {
  if (selectedEventId.value) {
    localStorage.setItem(`shifts_${selectedEventId.value}`, JSON.stringify(selectedShifts.value));
  }
};

// Load shifts from localStorage for the current event
const loadShiftsFromStorage = () => {
  if (selectedEventId.value) {
    const savedShifts = JSON.parse(localStorage.getItem(`shifts_${selectedEventId.value}`)) || [];
    selectedShifts.value = savedShifts;
  }
};

const handleCheckout = async () => {
  checkoutLoading.value = true;

  if (!auth.token) {
    notifications.warning('Authenticatie', 'Log in om af te rekenen.');
    checkoutLoading.value = false;
    return;
  }

  try {
    // Prepare product items - ALWAYS include products in the checkout
    const productItems = products.value
      .filter(product => quantities.value[product.id] > 0)
      .map(product => ({
        productId: product.id,
        quantity: quantities.value[product.id],
        type: 'product'
      }));

    if (productItems.length === 0) {
      notifications.warning('Controleer je invoer', 'Selecteer ten minste één product om af te rekenen.');
      return;
    }

    // For shift events, check if any selected products require timeslots
    if (selectedEvent.value?.type === 'shift_event') {
      const selectedProducts = products.value.filter(product => 
        quantities.value[product.id] > 0
      );
      
      const hasTimeslotRequiredProducts = selectedProducts.some(product => 
        product.requiresTimeslot === true
      );

      // Only require shift selection if products require timeslots
      if (hasTimeslotRequiredProducts) {
        if (selectedShifts.value.length === 0) {
          notifications.warning('Controleer je invoer', 'Selecteer een tijdslot voor producten die een tijdslot vereisen.');
          return;
        }

        if (selectedShifts.value.length > 1) {
          notifications.warning('Controleer je invoer', 'Selecteer slechts één tijdslot per bestelling.');
          return;
        }
      }

      // For shift events, products are linked to the selected shift (if one is selected)
      const response = await apiClient.createCheckoutSession(
        productItems,
        selectedEventId.value,
        selectedShifts.value.length > 0 ? selectedShifts.value[0].id : null
      );

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.sessionId
      });
      if (error) {
        throw new Error(error.message);
      }
    } else {
      // For regular events, just products without shift requirement
      const response = await apiClient.createCheckoutSession(
        productItems,
        selectedEventId.value
      );

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: response.sessionId
      });
      if (error) {
        throw new Error(error.message);
      }
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    notifications.error(
      'Afrekenfout',
      error.message || 'Er is een fout opgetreden tijdens het afrekenen.'
    );
  } finally {
    checkoutLoading.value = false;
  }
};

const scrollToProducts = () => {
  const productsSection = document.getElementById('products-section');
  if (productsSection) {
    productsSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
};

const handleImageError = (product) => {
  // Simply remove the imageUrl without any error handling visual feedback
  product.imageUrl = null;
};

onMounted(async () => {
  try {
    await loadActiveEvents();
  } catch (error) {
    console.error('Error during initialization:', error);
  }
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
