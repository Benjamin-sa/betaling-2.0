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
        <h2 class="text-2xl font-semibold text-primary mb-4">Producten Voorvertoning</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="product in products" :key="product.id" class="relative">
            <ProductCard :product="product" :preview="true" @image-error="handleImageError" />
            <button @click="handleDeleteProduct(product.id)"
              class="absolute top-2 right-2 bg-secondary text-white p-2 rounded-full hover:bg-red-700 transition duration-300 shadow-lg z-10">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16">
                </path>
              </svg>
            </button>
          </div>
        </div>
        <div v-if="products.length === 0" class="text-center text-gray-500 py-8">
          Geen producten gevonden.
        </div>
      </div>
    </div>

    <!-- Users Management Section -->
    <div class="mt-8">
      <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Gebruikers Beheren</h2>
        <div class="space-y-4">
          <div v-for="user in users" :key="user.firebase_uid"
            class="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-primary">{{ user.email }}</h3>
              <p class="text-sm text-gray-600">Firebase UID: {{ user.firebase_uid }}</p>
              <p class="text-sm text-gray-600">Stripe Customer ID: {{ user.stripe_customer_id }}</p>
              <p class="text-sm font-medium" :class="user.is_admin ? 'text-green-600' : 'text-gray-500'">
                {{ user.is_admin ? 'Administrator' : 'Gewone gebruiker' }}
              </p>
            </div>
            <div class="flex space-x-2">
              <button v-if="!user.is_admin" @click="makeAdmin(user.firebase_uid)"
                class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-300">
                Maak Admin
              </button>
              <button v-if="user.is_admin" @click="removeAdmin(user.firebase_uid)"
                class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-300">
                Verwijder Admin
              </button>
              <button @click="deleteUser(user.firebase_uid)"
                class="bg-secondary text-white px-3 py-1 rounded hover:bg-red-700 transition duration-300">
                Verwijder Gebruiker
              </button>
            </div>
          </div>
          <div v-if="users.length === 0" class="text-center text-gray-500 py-8">
            Geen gebruikers gevonden.
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="confirmation.isOpen.value" :title="confirmation.config.value.title"
      :message="confirmation.config.value.message" :type="confirmation.config.value.type"
      :confirm-text="confirmation.config.value.confirmText" :cancel-text="confirmation.config.value.cancelText"
      @confirm="confirmation.confirm" @cancel="confirmation.cancel" @close="confirmation.close" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmation } from '@/composables/useConfirmation';
import { apiClient } from '@/services/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';
import ProductCard from '@/components/products/ProductCard.vue';

const notifications = useNotificationStore();
const confirmation = useConfirmation();
const loading = ref(false);
const products = ref([]);
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

const handleImageError = (product) => {
  console.log('Image failed to load for product:', product.name);
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

    console.log('Adding product:', formData);

    const response = await apiClient.addProduct(formData);
    products.value.push(response.product);

    // Show success notification
    notifications.success('Opgeslagen!', 'Product is succesvol opgeslagen.');

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
    notifications.error('Product toevoegen mislukt', 'Er is een fout opgetreden bij het toevoegen van het product.');
  } finally {
    loading.value = false;
  }
};

const handleDeleteProduct = async (productId) => {
  try {
    await confirmation.confirmDelete('dit product');
    try {
      await apiClient.deleteProduct(productId);
      products.value = products.value.filter((product) => product.id !== productId);
      notifications.success('Verwijderd!', 'Product is succesvol verwijderd.');
    } catch (error) {
      console.error('Error deleting product:', error);
      notifications.error('Verwijderen mislukt', 'Er is een fout opgetreden bij het verwijderen van het product.');
    }
  } catch {
    // User cancelled
  }
};

const loadProducts = async () => {
  try {
    const data = await apiClient.getProducts();
    products.value = data.products;
  } catch (error) {
    console.error('Error loading products:', error);
    notifications.error('Laadprobleem', error?.message || 'Er is een fout opgetreden bij het laden van de producten.');
  }
};


const loadUsers = async () => {
  try {
    const data = await apiClient.getAdminUsers();
    users.value = data.users;
  } catch (error) {
    console.error('Error loading users:', error);
    notifications.error('Laadprobleem', error?.message || 'Er is een fout opgetreden bij het laden van de gebruikers.');
  }
};

const deleteUser = async (firebaseUid) => {
  try {
    await confirmation.confirmDelete('deze gebruiker');
    try {
      await apiClient.deleteUser(firebaseUid);
      users.value = users.value.filter((user) => user.firebase_uid !== firebaseUid);
      notifications.success('Verwijderd!', 'Gebruiker is succesvol verwijderd.');
    } catch (error) {
      console.error('Error deleting user:', error);
      notifications.error('Gebruiker verwijderen mislukt', 'Er is een fout opgetreden bij het verwijderen van de gebruiker.');
    }
  } catch {
    // User cancelled
  }
};

const removeAdmin = async (firebaseUid) => {
  try {
    await confirmation.show({
      title: 'Admin rechten verwijderen',
      message: 'Weet je zeker dat je de admin rechten wilt verwijderen van deze gebruiker?',
      type: 'warning',
      confirmText: 'Rechten verwijderen',
      cancelText: 'Annuleren'
    });

    try {
      await apiClient.removeAdmin(firebaseUid);
      // Update the local users array
      const userIndex = users.value.findIndex(u => u.firebase_uid === firebaseUid);
      if (userIndex !== -1) {
        users.value[userIndex].is_admin = false;
      }
      notifications.success('Rechten aangepast', 'Admin rechten zijn succesvol verwijderd.');
    } catch (error) {
      console.error('Error removing admin:', error);
      notifications.error('Rechten aanpassen mislukt', 'Er is een fout opgetreden bij het verwijderen van admin rechten.');
    }
  } catch {
    // User cancelled
  }
};

const makeAdmin = async (firebaseUid) => {
  try {
    await confirmation.show({
      title: 'Admin rechten toekennen',
      message: 'Weet je zeker dat je deze gebruiker admin rechten wilt geven?',
      type: 'info',
      confirmText: 'Admin maken',
      cancelText: 'Annuleren'
    });

    try {
      await apiClient.makeUserAdmin(firebaseUid);
      // Update the local users array
      const userIndex = users.value.findIndex(u => u.firebase_uid === firebaseUid);
      if (userIndex !== -1) {
        users.value[userIndex].is_admin = true;
      }
      notifications.success('Admin aangemaakt', 'Gebruiker heeft nu admin rechten.');
    } catch (error) {
      console.error('Error making user admin:', error);
      notifications.error('Admin aanmaken mislukt', 'Er is een fout opgetreden bij het maken van de gebruiker tot admin.');
    }
  } catch {
    // User cancelled
  }
};

onMounted(() => {
  loadProducts();
  loadUsers();
});
</script>
