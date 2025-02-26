<template>
  <div class="home-container">
    <!-- Manual Payments Warning -->
    <div v-if="manualPaymentsEnabled" class="bg-gradient-to-r from-amber-50 to-red-50 border-l-4 border-red-400 p-8 mb-8 mx-4 sm:mx-auto max-w-4xl shadow-sm">
      <div class="flex items-start space-x-4">
        <div class="flex-shrink-0">
          <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div class="flex-1">
          <h3 class="text-lg font-medium text-red-800 mb-2">
            Tijdelijke aanpassing betalingssysteem
          </h3>
          <p class="text-red-700 mb-4">
            Wegens een lopende verificatie van onze jeugdbeweging bij onze betalingsprovider maken we tijdelijk gebruik van overschrijvingen.
          </p>
          <div class="bg-white bg-opacity-50 rounded-lg p-4">
            <p class="text-sm text-red-600">
              Je bestelling zal pas bevestigd worden na ontvangst van de betaling. Gebruik zeker de correcte mededeling bij je overschrijving.
            </p>
          </div>
        </div>
      </div>
    </div>

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
          Spaghetti Avond
        </h1>
        <p class="mt-4 sm:mt-6 text-base sm:text-lg md:text-xl text-gray-100 max-w-3xl font-medium drop-shadow">
          Schrijf je in voor onze jaarlijkse spaghetti avond op 15 maart 2025. Kies je shift en geniet van heerlijke spaghetti!
        </p>
        
        <!-- Call to Action -->
        <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
          <a 
            @click.prevent="scrollToProducts" 
            href="#products" 
            class="w-full sm:w-auto text-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-green-700 transition-colors"
          >
            Kies je shift
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
    <div id="products-section" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
        <!-- Products that require time slots -->
        <div v-if="productsWithTimeSlot.length > 0">
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
            <div v-for="product in productsWithTimeSlot" :key="product.id" 
                 class="group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div class="relative aspect-w-4 aspect-h-3">
                <img v-if="product.imageUrl"
                     :src="product.imageUrl" 
                     :alt="product.name" 
                     @error="handleImageError(product)"
                     class="w-full h-full object-cover transform transition-transform group-hover:scale-105" />
                <div v-else
                     class="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center p-4">
                  <span class="text-2xl font-bold text-primary/80 text-center">{{ product.name }}</span>
                  <span class="mt-2 text-sm text-gray-600 text-center">€{{ product.price.toFixed(2) }}</span>
                </div>
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
        </div>

        <!-- Divider if both types exist -->
        <div v-if="productsWithTimeSlot.length > 0 && productsWithoutTimeSlot.length > 0" 
             class="border-t border-gray-200 my-12"></div>

        <!-- Products without time slots -->
        <div v-if="productsWithoutTimeSlot.length > 0">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Extra's</h2>
          <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            <div v-for="product in productsWithoutTimeSlot" :key="product.id" 
                 class="group bg-white rounded-lg shadow-lg overflow-hidden transform transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
              <div class="relative aspect-w-4 aspect-h-3">
                <img v-if="product.imageUrl"
                     :src="product.imageUrl" 
                     :alt="product.name" 
                     @error="handleImageError(product)"
                     class="w-full h-full object-cover transform transition-transform group-hover:scale-105" />
                <div v-else
                     class="w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 flex flex-col items-center justify-center p-4">
                  <span class="text-2xl font-bold text-primary/80 text-center">{{ product.name }}</span>
                  <span class="mt-2 text-sm text-gray-600 text-center">€{{ product.price.toFixed(2) }}</span>
                </div>
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
        :disabled="loading || (requiresTimeSlot && !selectedTimeSlot)"
        class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
  <span v-if="loading" class="mr-2">
    <svg class="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  </span>
  {{ loading ? 'Bezig met afrekenen...' : 
     (requiresTimeSlot && !selectedTimeSlot) ? 'Selecteer eerst een tijdslot' : 
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
          <div v-if="product.imageUrl" 
               class="w-8 h-8">
            <img :src="product.imageUrl" 
                 :alt="product.name" 
                 class="w-full h-full object-cover rounded">
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
<Modal
  type="auth"
  :show="showAuthModal"
  @login="handleLogin"
  @register="handleRegister"
  @close="showAuthModal = false"
/>
</template>

<script setup> 
import {ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import Modal from '@/components/Modal.vue'; // Add this
import TimeSlotSelector from '@/components/TimeSlotSelector.vue'; // Add this

const router = useRouter(); // Add this
const auth = useAuthStore();
const stripePromise = loadStripe('pk_live_51Q2YysK7LyHlGaLskm9jgeFHZ8r7ZeCHxNzEvEO1553OeCAcXzAYQIXGvWgggcp6aZQCV61IgF5gJqwTJY4YK6d1009Gq55TcX');
const products = ref([]);
const quantities = ref({});
const loading = ref(false);
const isCartOpen = ref(false)
const showAuthModal = ref(false); // Add this
const selectedTimeSlot = ref(null);
const manualPaymentsEnabled = ref(false); // Add this

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

// Add this computed property in the <script setup> section
const requiresTimeSlot = computed(() => {
  return selectedProducts.value.some(product => product.requires_timeslot === 1);
});

// Add these computed properties
const productsWithTimeSlot = computed(() => {
  return products.value.filter(product => product.requires_timeslot === 1);
});

const productsWithoutTimeSlot = computed(() => {
  return products.value.filter(product => product.requires_timeslot === 0);
});

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


const handleCheckout = async () => {
  loading.value = true;

  if (!auth.token) {
    showAuthModal.value = true;
    loading.value = false;
    return;
  }

  try {
    // Check if manual payments are enabled
    const manualPaymentsEnabled = await apiClient.isManualPaymentsEnabled();

    if (requiresTimeSlot.value && !selectedTimeSlot.value) {
      alert('Selecteer een tijdslot.');
      return;
    }

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
      alert('Selecteer ten minste één product om af te rekenen.');
      return;
    }

    if (manualPaymentsEnabled) {

      console.log('Manual payments enabled');
      // Redirect to manual payments with cart data
      router.push({
        name: 'ManualPayments',
        query: {
          items: JSON.stringify(items),
          timeSlot: selectedTimeSlot.value
        }
      });
      return;
    }

    // Existing Stripe checkout flow
    const response = await apiClient.createCheckoutSession(
      items.map(item => ({
        productId: item.id,
        quantity: item.quantity,
      })), 
      requiresTimeSlot.value ? selectedTimeSlot.value : null
    );

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
    const [productsResponse, manualPaymentsStatus] = await Promise.all([
      loadProducts(),
      apiClient.isManualPaymentsEnabled()
    ]);
    manualPaymentsEnabled.value = manualPaymentsStatus;
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
  -moz-appearance: textfield;
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

