<template>
  <div class="py-4 px-4 sm:py-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-center text-text">Admin Dashboard</h1>
    
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
                  <p class="text-sm text-gray-500">{{ order.time_slot || 'Geen tijdslot' }}</p>
                </div>
                <div class="flex items-center space-x-4">
                  <div class="text-sm text-gray-500">
                    {{ order.quantity }}x
                  </div>
                  <div class="text-right">
                    <p class="font-medium text-gray-900">
                      €{{ formatAmount(order.amount_total) }}
                    </p>
                  </div>
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

onMounted(() => {
  loadProducts();
  loadOrders();
  loadUsers();
});
</script>
