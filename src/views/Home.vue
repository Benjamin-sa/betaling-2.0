<template>
  <div class="home">
    <h1>Scoutswinkel</h1>
    
    <div v-if="products.length > 0" class="products-grid">
      <div v-for="product in products" :key="product.id" class="product-card">
        <img :src="product.imageUrl" :alt="product.name" class="product-image">
        <div class="product-info">
          <h3>{{ product.name }}</h3>
          <p class="description">{{ product.description }}</p>
          <p class="price">€{{ product.price.toFixed(2) }}</p>
          
          <div class="quantity-control">
            <button 
              @click="updateQuantity(product.id, getQuantity(product.id) - 1)"
              :disabled="getQuantity(product.id) <= 0"
            >-</button>
            <input 
              type="number" 
              v-model.number="quantities[product.id]" 
              min="0"
              @change="validateQuantity(product.id)"
            >
            <button 
              @click="updateQuantity(product.id, getQuantity(product.id) + 1)"
            >+</button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="no-products">
      <div class="no-products-content">
        <i class="no-products-icon">📦</i>
        <h2>Momenteel geen producten in de aanbieding</h2>
        <p>Kom later terug voor nieuwe artikelen!</p>
      </div>
    </div>

    <div class="checkout-bar" v-if="hasItems">
      <div class="checkout-info">
        <span>Totaal: €{{ total.toFixed(2) }}</span>
        <span>Aantal items: {{ totalItems }}</span>
      </div>
      <button 
        @click="handleCheckout"
        :disabled="loading"
        class="checkout-button"
      >
        {{ loading ? 'Bezig met laden...' : 'Afrekenen' }}
      </button>
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

const updateQuantity = (productId, value) => {
  quantities.value[productId] = Math.max(0, value);
};

const validateQuantity = (productId) => {
  const value = quantities.value[productId];
  if (isNaN(value) || value < 0) {
    quantities.value[productId] = 0;
  } else {
    quantities.value[productId] = Math.floor(value);
  }
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

<style scoped>
.home {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  margin-bottom: 80px;
}

.product-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-4px);
}

.product-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h3 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
}

.description {
  color: #666;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.quantity-control {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.quantity-control button {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.2rem;
}

.quantity-control button:hover:not(:disabled) {
  background: #e9ecef;
}

.quantity-control button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quantity-control input {
  width: 60px;
  height: 36px;
  text-align: center;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.checkout-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 1rem 2rem;
  box-shadow: 0 -2px 4px rgba(0,0,0,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkout-info {
  display: flex;
  gap: 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: #2c3e50;
}

.checkout-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.checkout-button:hover:not(:disabled) {
  background: #45a049;
}

.checkout-button:disabled {
  background: #cccccc;
  cursor: not-allowed;
}

.no-products {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 2rem 0;
}

.no-products-content {
  text-align: center;
  color: #2c3e50;
}

.no-products-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
  display: block;
}

.no-products-content h2 {
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
}

.no-products-content p {
  color: #666;
  font-size: 1rem;
}
</style>
