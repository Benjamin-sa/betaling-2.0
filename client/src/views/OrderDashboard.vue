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
                  <p class="mt-1 text-sm text-gray-500">
                    {{ formatDate(order.createdAt) }}
                  </p>
                </div>
                <span 
                  :class="[
                    'px-3 py-1 rounded-full text-sm font-medium',
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  ]"
                >
                  {{ order.status }}
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
                  <img 
                    :src="item.imageUrl" 
                    :alt="item.description"
                    class="h-20 w-20 rounded-lg object-cover"
                  />
                  <div class="ml-4 flex-1">
                    <div class="flex items-center justify-between">
                      <h4 class="text-sm font-medium text-gray-900">{{ item.description }}</h4>
                      <p class="text-sm font-medium text-gray-900">€{{ formatAmount(item.amount_total) }}</p>
                    </div>
                    <p class="mt-1 text-sm text-gray-500">Aantal: {{ item.quantity }}</p>
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
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/services/api';

const auth = useAuthStore();
const orders = ref([]);
const loading = ref(false);

/**
 * Haal bestellingen op en laad de bijbehorende line items
 */
const loadOrders = async () => {
    try {
        loading.value = true;
        // Haal bestellingen op
        const response = await apiClient.get('/orders', auth.token);
        orders.value = response.orders;

        // Filter bestellingen met status 'complete'
        const completeOrders = response.orders.filter(order => order.status === 'complete');
        orders.value = completeOrders;

        // Voor elke bestelling, haal de line items op
        await Promise.all(orders.value.map(async (order) => {
            try {
                const itemsResponse = await apiClient.get(`/orders/session/${order.id}/line-items`, auth.token);
                order.items = itemsResponse.data;
            } catch (error) {
                console.error(`Error fetching line items voor bestelling ${order.id}:`, error);
                order.items = []; // Fallback indien fout
            }
        }));
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
    return (amount / 100).toFixed(2);
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