<template>
  <div class="home-container">
<!-- Hero Section -->
<div class="relative bg-gray-900 mb-12">
  <!-- Background Image with Gradient Overlay -->
  <div class="absolute inset-0 overflow-hidden">
    <img
      src="/src/assets/groepsfoto.jpg"
      alt="Scouts Lod Lavki groepsfoto"
      class="w-full h-full object-cover object-center"
    />
    <div class="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/75 to-gray-900/60"></div>
  </div>

  <!-- Content -->
  <div class="relative mx-auto px-4 sm:px-6 lg:px-8">
    <div class="py-12 sm:py-20 lg:py-24 max-w-7xl mx-auto">
      <!-- Main Text -->
      <div class="animate-fade-in">
        <h1 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
          Scouts Lod Lavki
        </h1>
        <p class="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-3xl font-medium drop-shadow">
          Steun onze scoutsgroep door het kopen van heerlijke producten. 
        </p>
        
        <!-- Call to Action -->
        <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
          <a 
            @click.prevent="scrollToProducts" 
            href="#products" 
            class="w-full sm:w-auto text-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-green-700 transition-colors"
          >
            Bekijk producten
          </a>
          <a 
            href="#over-ons" 
            class="w-full sm:w-auto text-center px-6 py-3 border-2 border-white text-base font-medium rounded-md text-white hover:bg-white/10 transition-colors"
          >
            Over onze scouts
          </a>
        </div>
      </div>

      <!-- Photo Caption -->
      <div class="absolute bottom-4 right-4 text-xs sm:text-sm text-white/80 bg-black/30 px-2 sm:px-3 py-1 rounded-full backdrop-blur-sm">
        Scouts Lod Lavki - Groepsfoto 2024
      </div>
    </div>
  </div>
</div>
  <div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Time Slot Selector -->
      <div class="mb-8">
        <TimeSlotSelector v-model="selectedTimeSlot" />
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center py-12">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>

      <!-- Empty State -->
      <div v-else-if="products.length === 0" class="text-center py-12">
        <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">Geen producten beschikbaar</h3>
        <p class="mt-1 text-sm text-gray-500">Kom later terug voor nieuwe producten!</p>
      </div>

      <!-- Products Grid -->
      <div v-else>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="product in products" :key="product.id" 
               class="group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
            <div class="relative aspect-w-4 aspect-h-3">
              <img :src="product.imageUrl" :alt="product.name" 
                   class="w-full h-full object-cover transform transition-transform group-hover:scale-105" />
              <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
            </div>
            
            <div class="p-6">
              <h3 class="text-xl font-bold text-gray-900 mb-2">{{ product.name }}</h3>
              <p class="text-gray-600 text-sm mb-4">{{ product.description }}</p>
              
              <div class="flex items-center justify-between">
                <span class="text-2xl font-bold text-primary">€{{ product.price.toFixed(2) }}</span>
                <div class="flex items-center space-x-2">
                  <button @click="decreaseQuantity(product.id)" 
                          class="p-1 rounded-full hover:bg-gray-100">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"/>
                    </svg>
                  </button>
                  
                  <input type="number"
                         v-model.number="quantities[product.id]"
                         min="0"
                         class="w-16 text-center border-gray-200 rounded-md focus:ring-primary focus:border-primary" />
                  
                  <button @click="increaseQuantity(product.id)"
                          class="p-1 rounded-full hover:bg-gray-100">
                    <svg class="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

    <!-- Checkout Bar -->
<div v-if="hasItems" 
     class="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
  
  <!-- Collapsed Summary -->
  <div class="max-w-7xl mx-auto px-4 py-4">
    <div class="flex items-center justify-between">
      <div class="flex items-center space-x-4">
        <button @click="isCartOpen = !isCartOpen" 
                class="text-gray-600 hover:text-primary transition-colors flex items-center space-x-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path :d="isCartOpen ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'" 
                  stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
          </svg>
          <span class="text-sm">{{ totalItems }} items</span>
        </button>
        <span class="text-lg font-semibold text-gray-900">
          Totaal: €{{ total.toFixed(2) }}
        </span>
      </div>

      <button @click="handleCheckout"
              :disabled="loading || !selectedTimeSlot"
              class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
        <span v-if="loading" class="mr-2">
          <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
        </span>
        {{ loading ? 'Bezig met afrekenen...' : 
           !selectedTimeSlot ? 'Selecteer eerst een tijdslot' : 
           'Afrekenen' }}
      </button>
    </div>

    <!-- Expanded Product List -->
    <div v-if="isCartOpen" 
         class="mt-4 space-y-2 max-h-48 overflow-y-auto border-t pt-4">
      <div v-for="product in selectedProducts" 
           :key="product.id" 
           class="flex items-center justify-between text-sm text-gray-600">
        <div class="flex items-center space-x-2">
          <img :src="product.imageUrl" 
               :alt="product.name" 
               class="w-8 h-8 object-cover rounded">
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
          <h2 class="text-3xl font-extrabold text-gray-900">Steun onze scouts</h2>
          <p class="mt-4 text-lg text-gray-500">
            Al onze opbrengsten gaan rechtstreeks naar het onderhoud en de verbetering van ons scoutslokaal.
            Bedankt voor je steun!
          </p>
        </div>
      </div>
    </div>
  </div>
</div>
<Modal
  type="auth"
  :show="showAuthModal"
  @login="handleLogin"
  @register="handleRegister"
  @close="showAuthModal = false"
/>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import Modal from '@/components/Modal.vue'; // Add this
import TimeSlotSelector from '@/components/TimeSlotSelector.vue'; // Add this

const router = useRouter(); // Add this
const auth = useAuthStore();
const stripePromise = loadStripe('pk_test_51Q2YysK7LyHlGaLs1KaOcD1Gk6A8b8l45LVF3q9URgskNKwgFHBEIPRKtMXGZEu0kFn9Iq0yWGcJ0Aatm5XCMsiK00SWythWSu');
const products = ref([]);
const quantities = ref({});
const loading = ref(false);
const isCartOpen = ref(false)
const showAuthModal = ref(false); // Add this
const selectedTimeSlot = ref(null);

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
    alert('Er is een fout opgetreden bij het laden van de producten.');
  }
};

const selectedProducts = computed(() => {
  return products.value.filter(product => quantities.value[product.id] > 0)
})

const getQuantity = (productId) => {
  return quantities.value[productId] || 0;
};

const decreaseQuantity = (productId) => {
  if (quantities.value[productId] > 0) {
    quantities.value[productId]--;
  }
};

const increaseQuantity = (productId) => {
  quantities.value[productId] = (quantities.value[productId] || 0) + 1;
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

// Add these handlers
const handleLogin = () => {
  router.push('/login');
  showAuthModal.value = false;
};

const handleRegister = () => {
  router.push('/register');
  showAuthModal.value = false;
};

// Add helper function for formatting time slots
const formatTimeSlot = (timeSlot) => {
  return timeSlot.replace('-', ' - ');
};

const handleCheckout = async () => {
  loading.value = true;

  try {

    if (!auth.token) {
    showAuthModal.value = true;
    return;
  }

    if (!selectedTimeSlot.value) {
      alert('Selecteer een tijdslot voor afhaling.');
      return;
    }

    // Creëer het items array op basis van geselecteerde producten en hoeveelheden
    const items = products.value
      .filter(product => quantities.value[product.id] > 0)
      .map(product => ({
        productId: product.id,
        quantity: quantities.value[product.id],
      }));

    if (items.length === 0) {
      alert('Selecteer ten minste één product om af te rekenen.');
      return;
    }

    // Verstuur checkout verzoek naar de backend
    const response = await apiClient.createCheckoutSession(items, selectedTimeSlot.value);
    const stripe = await stripePromise;
    
    if (!stripe) {
      throw new Error('Failed to load Stripe');
    }
    
    const { error } = await stripe.redirectToCheckout({ 
      sessionId: response.sessionId 
    });

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error during checkout:', error);
    alert(error.message || 'Er is een fout opgetreden tijdens het afrekenen.');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadProducts();
});
</script>

