<template>
  <div class="py-4 px-4 sm:py-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-center text-text">Admin Dashboard</h1>
    
    <!-- Settings Section - Add this near the top of your template -->
    <div class="bg-cardBackground rounded-lg shadow-lg p-6 mt-4">
      <h2 class="text-2xl font-semibold text-primary mb-4">Instellingen</h2>
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-medium">Manuele Betalingen</h3>
          <p class="text-sm text-gray-500">Sta betalingen via overschrijving toe</p>
        </div>
        <label class="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            v-model="manualPaymentsEnabled"
            @change="toggleManualPayments" 
            class="sr-only peer"
          >
          <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer 
                      peer-checked:after:translate-x-full peer-checked:after:border-white 
                      after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                      after:bg-white after:border-gray-300 after:border after:rounded-full 
                      after:h-5 after:w-5 after:transition-all peer-checked:bg-primary">
          </div>
        </label>
      </div>
    </div>

    <!-- Product management grid - made more responsive -->
    <div class="grid grid-cols-1 gap-4 sm:gap-6 mt-4 sm:mt-8 lg:grid-cols-2">
      <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Producten Beheren</h2>
        <!-- Product Toevoegen Formulier -->
        <form @submit.prevent="handleAddProduct" class="space-y-4">
          <div class="form-group">
            <label for="name" class="block text-sm font-medium text-text">Naam</label>
            <input id="name" v-model="newProduct.name" type="text" required placeholder="Productnaam"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div class="form-group">
            <label for="description" class="block text-sm font-medium text-text">Beschrijving</label>
            <textarea id="description" v-model="newProduct.description" required placeholder="Productbeschrijving"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
          </div>
          <div class="form-group">
            <label for="price" class="block text-sm font-medium text-text">Prijs (€)</label>
            <input id="price" v-model="newProduct.price" type="number" required min="0" step="0.01"
              placeholder="Prijs in euro's"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div class="form-group">
            <label for="image" class="block text-sm font-medium text-text">Afbeelding</label>
            <input id="image" type="file" @change="handleImageChange" accept="image/*" class="mt-1 block w-full" />
          </div>
          <div class="form-group">
            <label for="requiresTimeslot" class="block text-sm font-medium text-text">Vereist tijdslot</label>
            <input id="requiresTimeslot" v-model="newProduct.requiresTimeslot" type="checkbox"
              class="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
          </div>
          <button type="submit" :disabled="loading"
            class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition duration-300">
            {{ loading ? 'Bezig met toevoegen...' : 'Product Toevoegen' }}
          </button>
        </form>
      </div>

      <!-- Product Lijst Sectie -->
      <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Producten Lijst</h2>
        <div class="grid grid-cols-1 gap-4">
          <div v-for="product in products" :key="product.id"
            class="flex items-center justify-between p-4 bg-gray-100 rounded">
            <div>
              <h3 class="text-lg font-semibold text-primary">{{ product.name }}</h3>
              <p class="text-sm text-text">{{ product.description }}</p>
              <p class="text-sm font-bold text-text">€{{ formatAmount(product.price) }}</p>
            </div>
            <button @click="handleDeleteProduct(product.id)"
              class="bg-secondary text-white px-3 py-1 rounded hover:bg-red-700 transition duration-300">
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Manual User Creation -->
    <div class="bg-cardBackground rounded-lg shadow-lg p-6 mt-8">
      <h2 class="text-2xl font-semibold text-primary mb-4">Gebruiker Handmatig Toevoegen</h2>
      <form @submit.prevent="handleManualUserCreation" class="space-y-4">
        <div class="form-group">
          <label for="manualEmail" class="block text-sm font-medium text-text">Email</label>
          <input
            id="manualEmail"
            v-model="manualUser.email"
            type="email"
            required
            placeholder="Gebruiker email"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>
        
        <div class="form-group">
          <label for="firebaseUid" class="block text-sm font-medium text-text">Firebase UID</label>
          <input
            id="firebaseUid"
            v-model="manualUser.firebaseUid"
            type="text"
            required
            placeholder="Firebase UID"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <div class="form-group">
          <label for="stripeCustomerId" class="block text-sm font-medium text-text">Stripe Customer ID</label>
          <input
            id="stripeCustomerId"
            v-model="manualUser.stripeCustomerId"
            type="text"
            required
            placeholder="Stripe Customer ID"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          />
        </div>

        <button
          type="submit"
          :disabled="manualUserLoading"
          class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition duration-300"
        >
          {{ manualUserLoading ? 'Bezig met toevoegen...' : 'Gebruiker Toevoegen' }}
        </button>
      </form>
    </div>

    <!-- Verkochte Producten Overzicht -->
    <div class="bg-cardBackground rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-8">
      <h2 class="text-xl sm:text-2xl font-semibold text-primary mb-4">Verkochte Producten Overzicht</h2>
      
      <!-- Download buttons -->
      <div class="mb-4 flex justify-end flex-wrap gap-2">
        <button 
          @click="printOrderChecklist" 
          :disabled="!orders.length"
          class="flex items-center bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print Checklist
        </button>
        
        <button 
          @click="downloadOrdersCSV" 
          :disabled="!orders.length"
          class="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-green-700 transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Download CSV Overzicht
        </button>
      </div>
      
      <div class="space-y-6"> <!-- Changed from table to card-based layout -->
        <div v-for="(userOrders, email) in groupedOrders" :key="email" 
             class="bg-white rounded-lg shadow overflow-hidden">
          <!-- User Header -->
          <div class="bg-gray-50 px-4 py-3 border-b border-gray-200">
            <div class="flex items-center justify-between">
              <div>
                <h3 class="text-lg font-medium text-gray-900">{{ email }}</h3>
                <p class="text-sm text-gray-500">{{ userOrders.length }} producten</p>
              </div>
              <div class="text-right">
                <p class="text-lg font-semibold text-primary">
                  €{{ formatAmount(getTotalAmount(userOrders)) }}
                </p>
                <p class="text-sm text-gray-500">
                  Totaal {{ getTotalQuantity(userOrders) }} items
                </p>
              </div>
            </div>
          </div>

          <!-- Orders List -->
          <div class="divide-y divide-gray-200">
            <div v-for="order in userOrders" :key="order.order_id" 
                 class="px-4 py-3 hover:bg-gray-50 transition-colors">
              <div class="flex justify-between items-center">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{{ order.product_name }}</p>
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <p class="text-sm text-gray-500">{{ order.time_slot || 'Geen tijdslot' }}</p>
                      <span :class="{
                        'px-2 py-0.5 text-xs font-medium rounded-full': true,
                        'bg-yellow-100 text-yellow-800': order.payment_status === 'manual_pending',
                        'bg-green-100 text-green-800': order.payment_status === 'paid' || order.payment_status === 'manual_confirmed',
                      }">
                        {{ getPaymentStatusText(order) }}
                      </span>
                    </div>
                    <!-- Show confirmation details if available -->
                    <div v-if="order.confirmation_details" class="text-xs text-gray-500">
                      Bevestigd door {{ order.confirmation_details.confirmed_by }} op 
                      {{ formatDate(order.confirmation_details.confirmed_at) }}
                    </div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="text-sm text-gray-500">
                    {{ order.quantity }}x
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">
                      €{{ formatAmount(order.amount_total) }}
                    </p>
                  </div>
                  <!-- Add confirm button for pending manual orders -->
                  <button
                    v-if="order.payment_status === 'manual_pending'"
                    @click="confirmManualPayment(order.order_id)"
                    :disabled="verifyingOrder === order.order_id"
                    class="ml-4 px-3 py-1 text-sm bg-primary text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                  >
                    {{ verifyingOrder === order.order_id ? 'Bezig...' : 'Bevestig Betaling' }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- User Summary Footer -->
          <div class="bg-gray-50 px-4 py-3 border-t border-gray-200">
            <div class="flex justify-between items-center text-sm text-gray-500">
              <span>Besteld op {{ formatDate(userOrders[0].created_at) }}</span>
              <span>{{ userOrders[0].time_slot ? 'Met tijdslot' : 'Zonder tijdslot' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Users Overview - improved responsiveness -->
    <div class="bg-cardBackground rounded-lg shadow-lg p-4 sm:p-6 mt-4 sm:mt-8">
      <h2 class="text-xl sm:text-2xl font-semibold text-primary mb-4">Gebruikers Overzicht</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th class="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acties</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="user in users" :key="user.firebase_uid">
              <td class="px-2 sm:px-4 py-2 text-xs sm:text-sm truncate max-w-[200px]">{{ user.email }}</td>
              <td class="px-2 sm:px-4 py-2">
                <span :class="user.is_admin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
                  class="px-2 py-1 rounded-full text-xs font-medium">
                  {{ user.is_admin ? 'Admin' : 'Gebruiker' }}
                </span>
              </td>
              <td class="px-2 sm:px-4 py-2">
                <div class="flex flex-col sm:flex-row gap-2">
                  <button v-if="!user.is_admin" @click="makeAdmin(user.firebase_uid)"
                    class="text-xs sm:text-sm bg-primary text-white px-2 py-1 rounded hover:bg-green-700 transition duration-300">
                    Maak Admin
                  </button>
                  <button v-if="user.is_admin && user.firebase_uid !== auth.user.uid" @click="removeAdmin(user.firebase_uid)"
                    class="text-xs sm:text-sm bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 transition duration-300">
                    Verwijder Admin
                  </button>
                  <button @click="deleteUser(user.firebase_uid)"
                    class="text-xs sm:text-sm bg-secondary text-white px-2 py-1 rounded hover:bg-red-700 transition duration-300">
                    Verwijderen
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { apiClient } from '@/services/api';

const auth = useAuthStore();
const loading = ref(false);
const products = ref([]);
const orders = ref([]);
const users = ref([]);

const newProduct = ref({
  name: '',
  description: '',
  price: '',
  image: null,
  requiresTimeslot: true,
});

const handleImageChange = (event) => {
  newProduct.value.image = event.target.files[0];
};

const handleAddProduct = async () => {
  try {
    loading.value = true;
    const formData = new FormData();
    formData.append('name', newProduct.value.name);
    formData.append('description', newProduct.value.description);
    formData.append('price', newProduct.value.price);
    formData.append('requiresTimeslot', newProduct.value.requiresTimeslot ? 1 : 0); // Convert boolean to integer
    if (newProduct.value.image) {
      formData.append('image', newProduct.value.image);
    }

    console.log('Adding product:', formData);

    const response = await apiClient.addProduct(formData);
    products.value.push(response.product);

    // Reset form
    newProduct.value = {
      name: '',
      description: '',
      price: '',
      image: null,
      requiresTimeslot: true,
    };
  } catch (error) {
    console.error('Error adding product:', error);
    alert('Er is een fout opgetreden bij het toevoegen van het product.');
  } finally {
    loading.value = false;
  }
};

const handleDeleteProduct = async (productId) => {
  if (!confirm('Weet u zeker dat u dit product wilt verwijderen?')) return;
  try {
    await apiClient.deleteProduct(productId);
    products.value = products.value.filter((product) => product.id !== productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Er is een fout opgetreden bij het verwijderen van het product.');
  }
};

const loadProducts = async () => {
  try {
    const data = await apiClient.getProducts();
    products.value = data.products;
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Er is een fout opgetreden bij het laden van de producten.');
  }
};

const formatAmount = (amount) => {
  return (amount).toFixed(2);
};

const loadOrders = async () => {
  try {
    const data = await apiClient.getAdminOrders();
    orders.value = data.orders;
  } catch (error) {
    console.error('Error loading orders:', error);
    alert('Er is een fout opgetreden bij het laden van de bestellingen.');
  }
};

const loadUsers = async () => {
  try {
    const data = await apiClient.getAdminUsers();
    users.value = data.users;
  } catch (error) {
    console.error('Error loading users:', error);
    alert('Er is een fout opgetreden bij het laden van de gebruikers.');
  }
};

const deleteUser = async (firebaseUid) => {
  if (confirm('Weet je zeker dat je deze gebruiker wilt verwijderen?')) {
    try {
      await apiClient.deleteUser(firebaseUid);
      users.value = users.value.filter((user) => user.firebase_uid !== firebaseUid);
      alert('Gebruiker succesvol verwijderd.');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Er is een fout opgetreden bij het verwijderen van de gebruiker.');
    }
  }
};

const removeAdmin = async (firebaseUid) => {
  if (confirm('Weet je zeker dat je de admin rechten wilt verwijderen van deze gebruiker?')) {
    try {
      await apiClient.removeAdmin(firebaseUid);
      // Update the local users array
      const userIndex = users.value.findIndex(u => u.firebase_uid === firebaseUid);
      if (userIndex !== -1) {
        users.value[userIndex].is_admin = false;
      }
      alert('Admin rechten zijn verwijderd.');
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Er is een fout opgetreden bij het verwijderen van admin rechten.');
    }
  }
};


const makeAdmin = async (firebaseUid) => {
  if (confirm('Weet je zeker dat je deze gebruiker admin rechten wilt geven?')) {
    try {
      await apiClient.makeUserAdmin(firebaseUid);
      // Update the local users array
      const userIndex = users.value.findIndex(u => u.firebase_uid === firebaseUid);
      if (userIndex !== -1) {
        users.value[userIndex].is_admin = true;
      }
      alert('Gebruiker is nu een admin.');
    } catch (error) {
      console.error('Error making user admin:', error);
      alert('Er is een fout opgetreden bij het maken van de gebruiker tot admin.');
    }
  }
};

const groupedOrders = computed(() => {
  const grouped = {};
  orders.value.forEach(order => {
    if (!grouped[order.email]) {
      grouped[order.email] = [];
    }
    grouped[order.email].push(order);
  });
  return grouped;
});

const getTotalQuantity = (orders) => {
  return orders.reduce((sum, order) => sum + order.quantity, 0);
};

const getTotalAmount = (orders) => {
  return orders.reduce((sum, order) => sum + order.amount_total, 0);
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const manualUser = ref({
  email: '',
  firebaseUid: '',
  stripeCustomerId: ''
});
const manualUserLoading = ref(false);

const handleManualUserCreation = async () => {
  try {
    manualUserLoading.value = true;
    await apiClient.createManualUser({
      email: manualUser.value.email,
      firebaseUid: manualUser.value.firebaseUid,
      stripeCustomerId: manualUser.value.stripeCustomerId
    });

    // Reset form
    manualUser.value = {
      email: '',
      firebaseUid: '',
      stripeCustomerId: ''
    };

    // Refresh users list
    await loadUsers();
    alert('Gebruiker succesvol toegevoegd');
  } catch (error) {
    console.error('Error creating manual user:', error);
    alert('Er is een fout opgetreden bij het toevoegen van de gebruiker');
  } finally {
    manualUserLoading.value = false;
  }
};

const verifyingOrder = ref(null);

const getPaymentStatusText = (order) => {
  switch (order.payment_status) {
    case 'paid':
      return 'Betaald via Stripe';
    case 'manual_confirmed':
      return 'Manuele betaling bevestigd';
    case 'manual_pending':
      return 'Wacht op bevestiging';
    default:
      return 'Onbekende status';
  }
};

const confirmManualPayment = async (orderId) => {
  if (!confirm('Weet je zeker dat je deze betaling wilt bevestigen?')) return;
  
  try {
    verifyingOrder.value = orderId;
    await apiClient.confirmManualPayment(orderId);
    
    // Refresh orders to update the payment status
    await loadOrders();
    
    alert('Betaling succesvol bevestigd');
  } catch (error) {
    console.error('Error confirming payment:', error);
    alert('Er is een fout opgetreden bij het bevestigen van de betaling');
  } finally {
    verifyingOrder.value = null;
  }
};

// Add these with your other refs
const manualPaymentsEnabled = ref(false);
const loadingSettings = ref(false);

// Add these new functions
const loadSettings = async () => {
  try {
    loadingSettings.value = true;
    const settings = await apiClient.getSettings();
    manualPaymentsEnabled.value = settings.manualPaymentsEnabled;
  } catch (error) {
    console.error('Error loading settings:', error);
    alert('Er is een fout opgetreden bij het laden van de instellingen.');
  } finally {
    loadingSettings.value = false;
  }
};

const toggleManualPayments = async () => {
  try {
    loadingSettings.value = true;
    const result = await apiClient.toggleManualPayments(manualPaymentsEnabled.value);
    manualPaymentsEnabled.value = result.manualPaymentsEnabled;
  } catch (error) {
    console.error('Error updating manual payments setting:', error);
    alert('Er is een fout opgetreden bij het bijwerken van de instelling.');
    // Revert the toggle if the API call failed
    manualPaymentsEnabled.value = !manualPaymentsEnabled.value;
  } finally {
    loadingSettings.value = false;
  }
};

// Add these for CSV functionality
const downloadOrdersCSV = () => {
  // Generate CSV content
  const csvContent = generateOrdersCSV();
  
  // Create a Blob with the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  
  // Create a temporary link to trigger the download
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  // Set download attributes
  const currentDate = new Date().toISOString().split('T')[0];
  link.setAttribute('href', url);
  link.setAttribute('download', `bestellingen-${currentDate}.csv`);
  
  // Append to body, trigger click and clean up
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Update the CSV functionality to include detailed orders
const generateOrdersCSV = () => {
  // CSV headers for both summary and detailed sections
  let csvContent = 'Tijdslot,Product,Aantal,Totaal Prijs\n';
  
  // Group orders by time slot for summary
  const ordersByTimeSlot = {};
  
  // First pass: group orders by time slot and count quantities
  orders.value.forEach(order => {
    const timeSlot = order.time_slot || 'Geen tijdslot';
    
    if (!ordersByTimeSlot[timeSlot]) {
      ordersByTimeSlot[timeSlot] = {};
    }
    
    const productKey = order.product_name;
    if (!ordersByTimeSlot[timeSlot][productKey]) {
      ordersByTimeSlot[timeSlot][productKey] = {
        quantity: 0,
        totalPrice: 0
      };
    }
    
    ordersByTimeSlot[timeSlot][productKey].quantity += order.quantity;
    ordersByTimeSlot[timeSlot][productKey].totalPrice += order.amount_total;
  });
  
  // Second pass: generate summary CSV rows
  Object.entries(ordersByTimeSlot).forEach(([timeSlot, products]) => {
    let timeSlotTotal = 0;
    let timeSlotQuantity = 0;
    
    // Add products for this time slot
    Object.entries(products).forEach(([productName, data]) => {
      // Add quotes around fields that might contain commas
      const safeProductName = `"${productName}"`;
      csvContent += `${timeSlot},${safeProductName},${data.quantity},€${formatAmount(data.totalPrice)}\n`;
      
      timeSlotTotal += data.totalPrice;
      timeSlotQuantity += data.quantity;
    });
    
    // Add summary row for this time slot
    csvContent += `${timeSlot} Totaal,,,€${formatAmount(timeSlotTotal)}\n`;
    csvContent += `${timeSlot} Aantal Items,,${timeSlotQuantity},\n`;
    csvContent += `\n`; // Empty row for separation
  });
  
  // Add global totals
  const grandTotal = orders.value.reduce((sum, order) => sum + order.amount_total, 0);
  const grandQuantity = orders.value.reduce((sum, order) => sum + order.quantity, 0);
  
  csvContent += `\nTotaal Alle Bestellingen,,,€${formatAmount(grandTotal)}\n`;
  csvContent += `Totaal Aantal Items,,${grandQuantity},\n\n\n`;
  
  // Add detailed orders section
  csvContent += `\n\nGedetailleerde Bestellingen\n`;
  csvContent += `Email,Naam,Tijdslot,Product,Aantal,Prijs,Betalingsstatus\n`;
  
  // Group by email for easier reading
  const ordersByEmail = {};
  orders.value.forEach(order => {
    if (!ordersByEmail[order.email]) {
      ordersByEmail[order.email] = [];
    }
    ordersByEmail[order.email].push(order);
  });
  
  // Add each individual order
  Object.entries(ordersByEmail).forEach(([email, userOrders]) => {
    userOrders.forEach(order => {
      const customerName = order.customer_name || email;
      const safeEmail = `"${email}"`;
      const safeName = `"${customerName}"`;
      const timeSlot = order.time_slot || 'Geen tijdslot';
      const safeProduct = `"${order.product_name}"`;
      const status = getPaymentStatusText(order);
      
      csvContent += `${safeEmail},${safeName},${timeSlot},${safeProduct},${order.quantity},€${formatAmount(order.amount_total)},${status}\n`;
    });
    csvContent += `\n`; // Add empty line between different customers
  });
  
  return csvContent;
};

// Update the printOrderChecklist function to better handle orders with and without timeslots
const printOrderChecklist = () => {
  // Group orders by time slot first, ensuring "Geen tijdslot" is properly handled
  const ordersByTimeSlot = {};
  
  // First pass: collect all orders with time slots
  orders.value.forEach(order => {
    if (order.time_slot) {
      if (!ordersByTimeSlot[order.time_slot]) {
        ordersByTimeSlot[order.time_slot] = [];
      }
      ordersByTimeSlot[order.time_slot].push(order);
    } else {
      // For orders without time slot, we'll handle them separately
      if (!ordersByTimeSlot['Geen tijdslot']) {
        ordersByTimeSlot['Geen tijdslot'] = [];
      }
      ordersByTimeSlot['Geen tijdslot'].push(order);
    }
  });

  // Create a new window for printing
  const printWindow = window.open('', '_blank');
  
  // Generate CSS for the print view
  const printCSS = `
    <style>
      body {
        font-family: Arial, sans-serif;
        line-height: 1.5;
        margin: 0;
        padding: 20px;
      }
      h1 {
        text-align: center;
        margin-bottom: 20px;
        color: #4f6e4f; /* Primary color */
      }
      h2 {
        color: #4f6e4f;
        border-bottom: 2px solid #4f6e4f;
        padding-bottom: 5px;
        margin-top: 30px;
      }
      .order-card {
        border: 1px solid #ddd;
        border-radius: 4px;
        margin-bottom: 10px;
        page-break-inside: avoid;
      }
      .order-header {
        padding: 8px;
        background: #f5f5f5;
        display: flex;
        justify-content: space-between;
        border-bottom: 1px solid #ddd;
      }
      .order-details {
        padding: 8px;
      }
      .product-item {
        display: flex;
        align-items: center;
        padding: 4px 0;
      }
      .checkbox {
        width: 20px;
        height: 20px;
        border: 1px solid #333;
        margin-right: 10px;
        border-radius: 3px;
        display: inline-block;
      }
      .product-quantity {
        font-weight: bold;
        margin-right: 10px;
      }
      .timestamp {
        font-size: 0.8em;
        color: #666;
        margin-top: 4px;
      }
      .time-tag {
        display: inline-block;
        background: #e2f0e2;
        border: 1px solid #4f6e4f;
        border-radius: 3px;
        padding: 1px 5px;
        margin-right: 6px;
        font-size: 0.8em;
        color: #4f6e4f;
      }
      .page-break {
        page-break-before: always;
      }
      @media print {
        body {
          padding: 0;
        }
        button {
          display: none;
        }
      }
    </style>
  `;

  // Generate the HTML content
  let printContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Bestellingen Checklist</title>
      ${printCSS}
    </head>
    <body>
      <h1>Bestellingen Checklist - ${new Date().toLocaleDateString('nl-BE')}</h1>
      <button onclick="window.print()" style="padding: 10px 20px; background: #4f6e4f; color: white; border: none; border-radius: 4px; cursor: pointer; margin-bottom: 20px;">Print deze pagina</button>
  `;

  // Sort the time slots to ensure a consistent order, but place "Geen tijdslot" at the end
  const sortedTimeSlots = Object.keys(ordersByTimeSlot).sort((a, b) => {
    if (a === 'Geen tijdslot') return 1;
    if (b === 'Geen tijdslot') return -1;
    return a.localeCompare(b);
  });
  
  // Add each time slot section
  sortedTimeSlots.forEach((timeSlot, timeSlotIndex) => {
    // Add page break after the first time slot
    if (timeSlotIndex > 0) {
      printContent += `<div class="page-break"></div>`;
    }
    
    printContent += `<h2>${timeSlot}</h2>`;
    
    // Group orders by email within time slot
    const ordersByEmailAndName = {};
    
    // Group by email first, but we'll use name and email for display
    ordersByTimeSlot[timeSlot].forEach(order => {
      const key = order.email;
      if (!ordersByEmailAndName[key]) {
        ordersByEmailAndName[key] = {
          email: order.email,
          name: order.customer_name || order.email,
          orders: []
        };
      }
      ordersByEmailAndName[key].orders.push(order);
    });
    
    // Convert to array for sorting
    const customers = Object.values(ordersByEmailAndName);
    
    // Sort alphabetically by name then email
    customers.sort((a, b) => {
      const aKey = a.name.toLowerCase();
      const bKey = b.name.toLowerCase();
      return aKey.localeCompare(bKey);
    });
    
    // Add each person's orders
    customers.forEach(customer => {
      const personOrders = customer.orders;
      
      printContent += `
        <div class="order-card">
          <div class="order-header">
            <div><strong>${customer.name}</strong> ${customer.name.toLowerCase() !== customer.email.toLowerCase() ? `(${customer.email})` : ''}</div>
            <div>${formatAmount(getTotalAmount(personOrders))} €</div>
          </div>
          <div class="order-details">
      `;

      // Add each product - for orders without timeslot, add a visible label
      personOrders.forEach(order => {
        // If we're in a time slot section but this specific order doesn't have a time slot, mark it
        const needsTimeSlotTag = timeSlot !== 'Geen tijdslot' && !order.time_slot;
        // If we're in the "no time slot" section but this order has a time slot (shouldn't happen with our grouping), mark it
        const hasTimeSlotTag = timeSlot === 'Geen tijdslot' && order.time_slot;
        
        printContent += `
          <div class="product-item">
            <span class="checkbox"></span>
            <span class="product-quantity">${order.quantity}x</span>
            <span>
              ${needsTimeSlotTag ? '<span class="time-tag">Geen tijdslot</span>' : ''}
              ${hasTimeSlotTag ? `<span class="time-tag">${order.time_slot}</span>` : ''}
              ${order.product_name}
            </span>
          </div>
        `;
      });
      
      // Add timestamp
      printContent += `
        <div class="timestamp">Besteld op ${formatDate(personOrders[0].created_at)}</div>
        </div>
        </div>
      `;
    });
    
    // Add totals for the time slot
    const timeSlotOrders = ordersByTimeSlot[timeSlot];
    const timeSlotTotal = getTotalAmount(timeSlotOrders);
    const timeSlotQuantity = getTotalQuantity(timeSlotOrders);
    
    printContent += `
      <div style="margin-top: 20px; font-weight: bold; text-align: right;">
        Totaal voor ${timeSlot}: ${formatAmount(timeSlotTotal)} € (${timeSlotQuantity} items)
      </div>
    `;
  });
  
  // Close the HTML
  printContent += `
    </body>
    </html>
  `;

  // Write the content to the new window
  printWindow.document.open();
  printWindow.document.write(printContent);
  printWindow.document.close();
};

// Modify your onMounted to include loadSettings
onMounted(() => {
  loadProducts();
  loadOrders();
  loadUsers();
  loadSettings();
});
</script>
