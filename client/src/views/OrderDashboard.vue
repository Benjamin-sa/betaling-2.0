<!-- src/views/OrderDashboard.vue -->
<template>
    <div class="py-8">
      <h1 class="text-3xl font-bold text-center text-text">Mijn Bestellingen</h1>
      <div v-if="loading" class="text-center text-lg text-text">Bezig met laden...</div>
      <div v-else>
        <div v-if="orders.length === 0" class="text-center text-text">
          <p>Je hebt nog geen voltooide bestellingen geplaatst.</p>
        </div>
        <div v-else class="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div v-for="order in orders" :key="order.id" class="bg-cardBackground rounded-lg shadow-lg p-6">
            <h3 class="text-xl font-semibold text-primary">Bestelling #{{ order.id }}</h3>
            <p class="mt-2"><strong>Datum:</strong> {{ formatDate(order.createdAt) }}</p>
            <p><strong>Status:</strong> {{ order.status }}</p>
            <p><strong>Totaal:</strong> €{{ formatAmount(order.amount_total) }}</p>
            <div class="mt-4">
              <h4 class="text-lg font-medium text-primary">Items:</h4>
              <ul class="list-disc pl-5 mt-2">
                <li v-for="item in order.items" :key="item.id" class="mt-1">
                  {{ item.description }} - {{ item.quantity }} stuks - €{{ formatAmount(item.amount_total) }}
                </li>
              </ul>
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