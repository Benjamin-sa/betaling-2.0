<template>
  <div class="home-container">

    <!-- Hero Section -->
    <div class="relative bg-gray-900 mb-12">
      <!-- Background Image with Gradient Overlay -->
      <div class="absolute inset-0 overflow-hidden">
        <img src="/src/assets/groepsfoto.jpg" alt="Scouts Lod Lavki groepsfoto"
          class="w-full h-full object-cover object-center" />
        <div class="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/75 to-gray-900/60"></div>
      </div>

      <!-- Content -->
      <div class="relative mx-auto px-4 sm:px-6 lg:px-8">
        <div class="py-12 sm:py-20 lg:py-24 max-w-7xl mx-auto">
          <!-- Main Text -->
          <div class="animate-fade-in">
            <h1
              class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
              Spaghetti Avond
            </h1>
            <p class="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-3xl font-medium drop-shadow">
              Schrijf je in voor onze jaarlijkse spaghetti avond op 15 maart 2025. Kies je shift en geniet van heerlijke
              spaghetti!
            </p>

            <!-- Call to Action -->
            <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
              <a @click.prevent="scrollToProducts" href="#products"
                class="w-full sm:w-auto text-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-green-700 transition-colors">
                Kies je shift
              </a>
            </div>
          </div>

          <!-- Photo Caption -->
          <div
            class="absolute bottom-4 right-4 text-xs sm:text-sm text-white/80 bg-black/30 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">
            Scouts Lod Lavki - Groepsfoto 2024
          </div>
        </div>
      </div>
    </div>
    <div>
      <!-- Main Content -->
      <div id="products-section" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <!-- Empty State -->
        <div v-else-if="products.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Geen producten beschikbaar</h3>
          <p class="mt-1 text-sm text-gray-500">Kom later terug voor nieuwe producten!</p>
        </div>

        <!-- Products Grid -->
        <div v-else>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <ProductCard v-for="product in products" :key="product.id" :product="product"
              :quantity="quantities[product.id] || 0" @update:quantity="updateQuantity"
              @image-error="handleImageError" />
          </div>
        </div>

        <!-- Checkout Bar -->
        <div v-if="hasItems" class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">

          <!-- Collapsed Summary -->
          <div class="max-w-7xl mx-auto px-4 py-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-4">
                <button @click="isCartOpen = !isCartOpen"
                  class="text-gray-600 hover:text-primary transition-colors flex items-center space-x-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path :d="isCartOpen ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'" stroke-linecap="round"
                      stroke-linejoin="round" stroke-width="2" />
                  </svg>
                  <span class="text-sm">{{ totalItems }} items</span>
                </button>
                <span class="text-lg font-semibold text-gray-900">
                  Totaal: €{{ total.toFixed(2) }}
                </span>
              </div>

              <button @click="handleCheckout" :disabled="loading"
                class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
                <span v-if="loading" class="mr-2">
                  <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </span>
                {{ loading ? 'Bezig met afrekenen...' : 'Afrekenen' }}
              </button>
            </div>

            <!-- Expanded Product List -->
            <div v-if="isCartOpen" class="mt-4 space-y-2 max-h-48 overflow-y-auto border-t pt-4">
              <div v-for="product in selectedProducts" :key="product.id"
                class="flex items-center justify-between text-sm text-gray-600">
                <div class="flex items-center space-x-2">
                  <div v-if="product.imageUrl" class="w-8 h-8">
                    <img :src="product.imageUrl" :alt="product.name" class="w-full h-full object-cover rounded">
                  </div>
                  <div v-else
                    class="w-8 h-8 bg-gradient-to-br from-primary/10 to-primary/5 rounded flex items-center justify-center">
                    <span class="text-xs font-medium text-primary/80">{{ product.name.charAt(0) }}</span>
                  </div>
                  <span>{{ product.name }}</span>
                </div>
                <div class="flex items-center space-x-4">
                  <span>{{ quantities[product.id] }}x</span>
                  <span>€{{ (product.price * quantities[product.id]).toFixed(2) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Support Section -->
    <div class="bg-gray-50 mt-24">
      <div class="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900">Spaghetti Avond Details</h2>
          <p class="mt-4 text-lg text-gray-500">
            Kom op 15 maart genieten van onze heerlijke spaghetti! Kies een shift die jou het beste uitkomt.
            De opbrengst gaat naar onze scoutswerking. Smakelijk!
          </p>
        </div>
      </div>
    </div>
  </div>

</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import ProductCard from '@/components/products/ProductCard.vue';

const auth = useAuthStore();
const notifications = useNotificationStore();
const stripePromise = loadStripe('pk_test_51Q2YysK7LyHlGaLs1KaOcD1Gk6A8b8l45LVF3q9URgskNKwgFHBEIPRKtMXGZEu0kFn9Iq0yWGcJ0Aatm5XCMsiK00SWythWSu');
const products = ref([]);
const quantities = ref({});
const loading = ref(false);
const isCartOpen = ref(false);

// Laad producten vanuit de lokale backend
const loadProducts = async () => {
  try {
    const data = await apiClient.getProducts();
    products.value = data.products;

    // Initialiseer hoeveelheden vanuit localStorage
    const savedQuantities = JSON.parse(localStorage.getItem('quantities')) || {};
    products.value.forEach((product) => {
      quantities.value[product.id] = savedQuantities[product.id] || 0;
    });
  } catch (error) {
    console.error('Error loading products:', error);
    notifications.error('Laadprobleem', error?.message || 'Er is een fout opgetreden bij het laden van de producten.');
  }
};

const selectedProducts = computed(() => {
  return products.value.filter(product => quantities.value[product.id] > 0)
})

const getQuantity = (productId) => {
  return quantities.value[productId] || 0;
};

const updateQuantity = (productId, newQuantity) => {
  quantities.value[productId] = Math.max(0, newQuantity);
};

const hasItems = computed(() => {
  return Object.values(quantities.value).some(quantity => quantity > 0);
});

const total = computed(() => {
  return products.value.reduce((sum, product) => {
    return sum + (product.price * getQuantity(product.id));
  }, 0);
});

const totalItems = computed(() => {
  return Object.values(quantities.value).reduce((sum, quantity) => sum + quantity, 0);
});


const handleCheckout = async () => {
  loading.value = true;

  if (!auth.token) {
    notifications.warning('Authenticatie', 'Log in om af te rekenen.');
    loading.value = false;
    return;
  }

  try {
    // Create items array from selected products and quantities
    const items = products.value
      .filter(product => quantities.value[product.id] > 0)
      .map(product => ({
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: quantities.value[product.id],
      }));

    if (items.length === 0) {
      notifications.warning('Controleer je invoer', 'Selecteer ten minste één product om af te rekenen.');
      return;
    }

    // Existing Stripe checkout flow
    const response = await apiClient.createCheckoutSession(
      items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })),
      null
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
  } catch (error) {
    console.error('Error during checkout:', error);
    notifications.error(
      'Afrekenfout',
      error.message || 'Er is een fout opgetreden tijdens het afrekenen.'
    );
  } finally {
    loading.value = false;
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
    loadProducts();

  } catch (error) {
    console.error('Error during initialization:', error);
  }
});
</script>

<style>
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
</style>
