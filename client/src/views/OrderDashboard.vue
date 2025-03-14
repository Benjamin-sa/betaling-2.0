<!-- src/views/OrderDashboard.vue -->
<template>
    <div class="py-8">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-extrabold text-gray-900 mb-8">
          Mijn Bestellingen
        </h1>
  
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
  
        <!-- Empty State -->
        <div v-else-if="orders.length === 0" class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Geen bestellingen</h3>
          <p class="mt-1 text-sm text-gray-500">Je hebt nog geen bestellingen geplaatst.</p>
          <div class="mt-6">
            <router-link
              to="/"
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary hover:bg-green-700"
            >
              Bekijk producten
            </router-link>
          </div>
        </div>
  
        <!-- Orders List -->
        <div v-else class="space-y-8">
          <div 
            v-for="order in orders" 
            :key="order.id" 
            class="bg-white shadow-lg rounded-lg overflow-hidden"
          >
            <div class="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div class="flex items-center justify-between">
                <div>
                  <h3 class="text-lg font-medium text-gray-900">
                    Bestelling #{{ order.id }}
                  </h3>
                  <div class="mt-1 text-sm text-gray-500">
                    {{ formatDate(order.created) }}
                    <span v-if="order.metadata?.timeSlot" class="ml-2 text-primary">
                      | Tijdslot: {{ order.metadata.timeSlot }}
                    </span>
                  </div>
                </div>
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    order.status === 'complete' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ translateStatus(order.status) }}
                </span>
              </div>
            </div>
  
            <div class="px-6 py-4">
              <ul role="list" class="divide-y divide-gray-200">
                <li 
                  v-for="item in order.items" 
                  :key="item.id"
                  class="py-4 flex"
                >
                  <div class="ml-4 flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="text-sm font-medium text-gray-900">{{ item.description }}</h4>
                      <p class="text-sm font-medium text-gray-900">€{{ formatPrice(item.amount_total) }}</p>
                    </div>
                    <p class="mt-1 text-sm text-gray-500">Aantal: {{ item.quantity }}</p>
                    <p class="text-xs text-gray-400">Prijs per stuk: €{{ formatPrice(item.unit_price) }}</p>
                  </div>
                </li>
              </ul>
            </div>
  
            <div class="px-6 py-4 bg-gray-50 border-t border-gray-200">
              <div class="flex justify-between text-base font-medium text-gray-900">
                <p>Totaal</p>
                <p>€{{ formatAmount(order.amount_total) }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiClient } from '@/services/api';

const orders = ref([]);
const loading = ref(false);

/**
 * Haal bestellingen op en laad de bijbehorende line items
 */
const loadOrders = async () => {
  try {
    loading.value = true;
    const { orders: fetchedOrders } = await apiClient.getOrders();
    
    // Sort orders by status (complete first) and then by date
    orders.value = fetchedOrders.sort((a, b) => {
      if (a.status === b.status) {
        return b.created - a.created;
      }
      return a.status === 'complete' ? -1 : 1;
    });
  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Er is een fout opgetreden bij het laden van je bestellingen.');
  } finally {
    loading.value = false;
  }
};

/**
 * Formateer de datum naar een leesbaar formaat
 * @param {number} timestamp - Unix timestamp in seconden
 * @returns {string} - Geformatteerde datum
 */
const formatDate = (timestamp) => {
    const date = new Date(timestamp * 1000); // Stripe timestamps zijn in seconden
    return date.toLocaleDateString('nl-NL', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
};

/**
 * Formateer het bedrag van centen naar euro's
 * @param {number} amount - Bedrag in centen
 * @returns {string} - Bedrag in euro's
 */
const formatAmount = (amount) => {
    return (amount).toFixed(2);
};

/**
 * Formateer de prijs naar twee decimalen
 * @param {number} price - Prijs
 * @returns {string} - Geformatteerde prijs
 */
const formatPrice = (price) => {
  return (price).toFixed(2);
};


/**
 * Vertaal de status naar Nederlands
 * @param {string} status - Status in het Engels
 * @returns {string} - Status in het Nederlands
 */
const translateStatus = (status) => {
  const translations = {
    'pending': 'In afwachting',
    'complete': 'Betaald',
    'cancelled': 'Geannuleerd',
    'failed': 'Mislukt',
    'processing': 'Wordt verwerkt',
    'confirmed': 'Bevestigd'
  };
  return translations[status] || status;
};

onMounted(() => {
    loadOrders();
});
</script>

<style scoped>
.order-dashboard {
    padding: 2rem 0;
}

.loading {
    text-align: center;
    font-size: 1.2rem;
    color: var(--text-color);
}

.no-orders {
    text-align: center;
    color: var(--text-color);
}

.orders-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 2rem;
}

@media (min-width: 600px) {
    .orders-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.order-card {
    background: var(--card-background);
    border-radius: var(--border-radius);
    box-shadow: 0 2px 8px var(--card-shadow);
    padding: 1.5rem;
}

.order-card h3 {
    margin-top: 0;
    color: var(--primary-color);
}

.order-card p {
    margin: 0.5rem 0;
}

.items ul {
    list-style-type: disc;
    padding-left: 1.5rem;
}

.items li {
    margin-bottom: 0.5rem;
}
</style>