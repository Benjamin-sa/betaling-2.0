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
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';

const auth = useAuthStore();
const loading = ref(false);
const products = ref([]);
const newAdminEmail = ref('');
const adminLoading = ref(false);

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

    // Create FormData to include the image file
    const formData = new FormData();
    formData.append('name', newProduct.value.name);
    formData.append('description', newProduct.value.description);
    formData.append('price', newProduct.value.price);
    if (newProduct.value.image) {
      formData.append('image', newProduct.value.image);
    }

    // Send POST request with form data
    const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/products`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${auth.token}`, // Voeg het ID-token toe
        // 'Content-Type' wordt automatisch ingesteld door de browser voor FormData
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to add product.');
    }

    const addedProduct = await response.json();

    // Voeg het nieuwe product toe aan de lijst
    products.value.push(addedProduct);

    // Reset het formulier
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
    // Delete the product via the API
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete product.');
    }

    // Verwijder het product uit de lijst
    products.value = products.value.filter((product) => product.id !== productId);
  } catch (error) {
    console.error('Error deleting product:', error);
    alert('Er is een fout opgetreden bij het verwijderen van het product.');
  }
};

const loadProducts = async () => {
  try {
    // Haal producten op via de backend API
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to load products.');
    }

    const data = await response.json();
    products.value = data.products;
  } catch (error) {
    console.error('Error loading products:', error);
    alert('Er is een fout opgetreden bij het laden van de producten.');
  }
};

const handleMakeAdmin = async () => {
  try {
    adminLoading.value = true;
    // Maak een admin, eventueel via een backend API
    alert(`${newAdminEmail.value} is nu een beheerder`);
    newAdminEmail.value = '';
  } catch (error) {
    console.error('Error making user admin:', error);
    alert(error.message);
  } finally {
    adminLoading.value = false;
  }
};

const formatAmount = (amount) => {
  return (amount / 100).toFixed(2);
};


onMounted(() => {
  loadProducts();
});
</script>
