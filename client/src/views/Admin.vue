<template>
  <div class="py-8">
    <h1 class="text-3xl font-bold text-center text-text">Admin Dashboard</h1>
    <div class="grid grid-cols-1 gap-6 mt-8 md:grid-cols-2">
      <!-- Product Beheer Sectie -->
      <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Producten Beheren</h2>
        <!-- Product Toevoegen Formulier -->
        <form @submit.prevent="handleAddProduct" class="space-y-4">
          <div class="form-group">
            <label for="name" class="block text-sm font-medium text-text">Naam</label>
            <input
              id="name"
              v-model="newProduct.name"
              type="text"
              required
              placeholder="Productnaam"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div class="form-group">
            <label for="description" class="block text-sm font-medium text-text">Beschrijving</label>
            <textarea
              id="description"
              v-model="newProduct.description"
              required
              placeholder="Productbeschrijving"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            ></textarea>
          </div>
          <div class="form-group">
            <label for="price" class="block text-sm font-medium text-text">Prijs (€)</label>
            <input
              id="price"
              v-model="newProduct.price"
              type="number"
              required
              min="0"
              step="0.01"
              placeholder="Prijs in euro's"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div class="form-group">
            <label for="image" class="block text-sm font-medium text-text">Afbeelding</label>
            <input
              id="image"
              type="file"
              @change="handleImageChange"
              accept="image/*"
              class="mt-1 block w-full"
            />
          </div>
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition duration-300"
          >
            {{ loading ? 'Bezig met toevoegen...' : 'Product Toevoegen' }}
          </button>
        </form>
      </div>

      <!-- Product Lijst Sectie -->
      <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Producten Lijst</h2>
        <div class="grid grid-cols-1 gap-4">
          <div v-for="product in products" :key="product.id" class="flex items-center justify-between p-4 bg-gray-100 rounded">
            <div>
              <h3 class="text-lg font-semibold text-primary">{{ product.name }}</h3>
              <p class="text-sm text-text">{{ product.description }}</p>
              <p class="text-sm font-bold text-text">€{{ formatAmount(product.price) }}</p>
            </div>
            <button @click="handleDeleteProduct(product.id)" class="bg-secondary text-white px-3 py-1 rounded hover:bg-red-700 transition duration-300">
              Verwijderen
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="bg-cardBackground rounded-lg shadow-lg p-6 mt-8">
    <h2 class="text-2xl font-semibold text-primary mb-4">Verkochte Producten Overzicht</h2>
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bestelling ID</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gebruiker</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aantal</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Totaal</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="order in orders" :key="order.order_id">
          <td class="px-6 py-4">{{ order.order_id }}</td>
          <td class="px-6 py-4">{{ order.email }}</td>
          <td class="px-6 py-4">{{ order.product_name }}</td>
          <td class="px-6 py-4">{{ order.quantity }}</td>
          <td class="px-6 py-4">€{{ formatAmount(order.amount_total) }}</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Users Overview -->
  <div class="bg-cardBackground rounded-lg shadow-lg p-6 mt-8">
    <h2 class="text-2xl font-semibold text-primary mb-4">Gebruikers Overzicht</h2>
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acties</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="user in users" :key="user.firebase_uid">
          <td class="px-6 py-4">{{ user.email }}</td>
          <td class="px-6 py-4">
            <button
              @click="deleteUser(user.firebase_uid)"
              class="bg-secondary text-white px-3 py-1 rounded hover:bg-red-700 transition duration-300"
            >
              Verwijderen
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
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
    if (newProduct.value.image) {
      formData.append('image', newProduct.value.image);
    }

    const response = await apiClient.addProduct(formData);
    products.value.push(response.product);

    // Reset form
    newProduct.value = {
      name: '',
      description: '',
      price: '',
      image: null,
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

onMounted(() => {
  loadProducts();
  loadOrders();
  loadUsers();
});
</script>
