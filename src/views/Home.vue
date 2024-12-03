<template>
  <div class="py-8">
    <h1 class="text-4xl font-bold text-center text-text mb-8">Welkom bij Scoutswinkel</h1>
    <div v-if="loading" class="text-center text-lg text-text">Bezig met laden...</div>
    <div v-else>
      <div v-if="products.length === 0" class="text-center text-text">
        <p>Momenteel geen producten in de aanbieding. Kom later terug!</p>
      </div>
      <div v-else class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="product in products" :key="product.id" class="bg-cardBackground rounded-lg shadow-lg overflow-hidden">
          <img :src="product.imageUrl" :alt="product.name" class="w-full h-48 object-cover">
          <div class="p-4 text-center">
            <h3 class="text-xl font-semibold text-primary">{{ product.name }}</h3>
            <p class="text-lg font-bold text-text">€{{ product.price.toFixed(2) }}</p>
            <input 
              type="number" 
              v-model.number="quantities[product.id]" 
              min="0" 
              placeholder="Aantal" 
              class="mt-2 w-3/4 mx-auto p-2 border border-gray-300 rounded focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
        </div>
      </div>

      <div v-if="hasItems" class="fixed bottom-0 left-0 right-0 bg-navBackground p-4 shadow-inner flex justify-between items-center">
        <div class="font-bold text-text">
          Totaal: €{{ total.toFixed(2) }}
        </div>
        <button @click="handleCheckout" :disabled="loading" class="bg-primary text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-gray-400 transition duration-300">
          {{ loading ? 'Bezig met afrekenen...' : 'Afrekenen' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import { apiClient } from '@/services/api';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const stripePromise = loadStripe('pk_test_51Q2YysK7LyHlGaLs1KaOcD1Gk6A8b8l45LVF3q9URgskNKwgFHBEIPRKtMXGZEu0kFn9Iq0yWGcJ0Aatm5XCMsiK00SWythWSu');
const products = ref([]);
const quantities = ref({});
const loading = ref(false);

// Laad producten vanuit de lokale backend
const loadProducts = async () => {
  try {
    const response = await fetch('/api/products'); // Backend-endpoint om producten op te halen
    if (!response.ok) {
      throw new Error('Failed to load products');
    }

    const data = await response.json();
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

const getQuantity = (productId) => {
  return quantities.value[productId] || 0;
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
  try {
    loading.value = true;

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
    const response = await apiClient.post('/checkout', { items }, auth.token);

    const { sessionId } = response;

    // Gebruik Stripe.js om de gebruiker naar de Checkout pagina te sturen
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId });

    if (error) {
      console.error('Stripe redirect error:', error);
      alert('Er is een fout opgetreden tijdens het afrekenen.');
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

