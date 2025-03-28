<template>
  <div class="home-container">
    <!-- E-commerce Style Payment Notice Banner -->
    <div v-if="manualPaymentsEnabled && showBanner && !registrationsClosed" class="bg-gradient-to-r from-blue-50 to-indigo-50 fixed z-10 bottom-20 sm:bottom-6 right-4 sm:right-6 max-w-sm rounded-lg shadow-lg overflow-hidden">
      <div class="border-l-4 border-blue-400 p-4">
        <div class="flex">
          <!-- Close Button -->
          <button @click="closeBanner" class="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <div class="flex flex-col">
            <div class="flex items-center mb-2">
              <svg class="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 class="text-sm font-medium text-blue-800">
                Betaling via overschrijving
              </h3>
            </div>
            <p class="text-xs text-blue-700 mb-3">
              We werken momenteel met overschrijvingen. Je krijgt alle betaalgegevens na je bestelling.
            </p>
            <div class="flex justify-end">
              <a @click="openInfoModal" class="text-xs font-medium text-blue-600 hover:text-blue-800 cursor-pointer">Meer info</a>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment Info Modal -->
    <div v-if="showInfoModal" class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="payment-modal" role="dialog" aria-modal="true">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="showInfoModal = false"></div>

        <!-- Modal panel -->
        <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                <svg class="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                  Betaling via overschrijving
                </h3>
                <div class="mt-4 space-y-3">
                  <p class="text-sm text-gray-700">
                    Voor deze activiteit maken we gebruik van overschrijvingen in plaats van online betalingen.
                  </p>
                  <div class="bg-blue-50 rounded-md p-4">
                    <h4 class="text-sm font-medium text-blue-800 mb-2">Zo werkt het:</h4>
                    <ol class="text-sm text-blue-700 list-decimal list-inside space-y-1">
                      <li>Selecteer je gewenste producten en tijdslot</li>
                      <li>Klik op "Afrekenen" om je bestelling te plaatsen</li>
                      <li>Je krijgt alle nodige betaalgegevens (rekeningnummer en gestructureerde mededeling)</li>
                      <li>Maak het exacte bedrag over naar onze rekening met de juiste mededeling</li>
                      <li>Na ontvangst van je betaling wordt je bestelling bevestigd</li>
                    </ol>
                  </div>
                  <p class="text-sm text-gray-700">
                    Dit is een tijdelijke oplossing die even veilig is als online betalen. Heb je vragen? 
                    Contacteer ons via <a href="mailto:groepsleiding@lodlavki.be" class="text-blue-600 hover:underline">groepsleiding@lodlavki.be</a>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button 
              type="button" 
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              @click="showInfoModal = false">
              Begrepen
            </button>
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
        
        <!-- Call to Action - Show different button based on registration status -->
        <div class="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-4">
          <a v-if="!registrationsClosed" 
            @click.prevent="scrollToProducts" 
            href="#products" 
            class="w-full sm:w-auto text-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary hover:bg-green-700 transition-colors"
          >
            Kies je shift
          </a>
          <div v-else
            class="w-full sm:w-auto text-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600"
          >
            Inschrijvingen gesloten
          </div>
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
      <!-- Registration Closed Message -->
      <div v-if="registrationsClosed" class="text-center py-12 bg-red-50 border border-red-100 rounded-lg mb-8">
        <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
          <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="mt-2 text-lg font-medium text-gray-900">Inschrijvingen zijn gesloten</h3>
        <p class="mt-3 text-base text-gray-500 max-w-md mx-auto">
          De inschrijvingen voor deze activiteit zijn momenteel niet beschikbaar. Bedankt voor je interesse!
        </p>
        <div class="mt-6">
          <a href="mailto:groepsleiding@lodlavki.be" class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500">
            Contact opnemen
          </a>
        </div>
      </div>

      <!-- Only show the following sections if registrations are not closed -->
      <template v-if="!registrationsClosed">
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
      </template>

    <!-- Checkout Bar -->
<div v-if="hasItems && !registrationsClosed" 
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
          
          <!-- Registration status notice -->
          <div v-if="registrationsClosed" class="mt-6 p-4 bg-red-50 rounded-lg inline-block mx-auto">
            <p class="text-sm font-medium text-red-800">
              Inschrijvingen zijn momenteel gesloten
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
import {ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores/auth';
import Modal from '@/components/ui/Modal.vue'; // Add this
import TimeSlotSelector from '@/components/ui/TimeSlotSelector.vue'; // Add this

// HARDCODED FLAG: Set to true to close registrations, false to keep them open
const registrationsClosed = ref(true);

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
const showBanner = ref(true);
const showInfoModal = ref(false); // Add this for the modal

// Laad producten vanuit de lokale backend
const loadProducts = async () => {
  try {
    // Only load products if registrations are open
    if (!registrationsClosed.value) {
      const data = await apiClient.getProducts();
      products.value = data.products;

      // Initialiseer hoeveelheden vanuit localStorage
      const savedQuantities = JSON.parse(localStorage.getItem('quantities')) || {};
      products.value.forEach((product) => {
        quantities.value[product.id] = savedQuantities[product.id] || 0;
      });
    }
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

// New function to close banner
const closeBanner = () => {
  showBanner.value = false;
};

// Updated function to open modal instead of showing alert
const openInfoModal = () => {
  showInfoModal.value = true;
};

onMounted(async () => {
  try {
    if (!registrationsClosed.value) {
      const [productsResponse, manualPaymentsStatus] = await Promise.all([
        loadProducts(),
        apiClient.isManualPaymentsEnabled()
      ]);
      manualPaymentsEnabled.value = manualPaymentsStatus;
    } else {
      // No need to load products or check payment settings if registrations are closed
      loading.value = false;
    }
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

