<template>
  <div class="admin-dashboard">
    <h1>Admin Dashboard</h1>
    <div class="admin-sections">
      <div class="section">
        <h2>Beheerders Beheer</h2>
        <div class="admin-management">
          <form @submit.prevent="handleMakeAdmin">
            <div class="form-group">
              <label for="adminEmail">E-mailadres van nieuwe beheerder</label>
              <input
                id="adminEmail"
                v-model="newAdminEmail"
                type="email"
                required
                placeholder="E-mailadres"
              />
            </div>
            <button type="submit" :disabled="adminLoading">
              {{ adminLoading ? 'Bezig...' : 'Maak Beheerder' }}
            </button>
          </form>
        </div>
      </div>
      <div class="section">
        <h2>Producten Beheer</h2>
        <div class="product-form">
          <h3>Nieuw Product Toevoegen</h3>
          <form @submit.prevent="handleAddProduct">
            <div class="form-group">
              <label for="name">Productnaam</label>
              <input 
                id="name"
                v-model="newProduct.name"
                type="text"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="description">Beschrijving</label>
              <textarea
                id="description"
                v-model="newProduct.description"
                required
              ></textarea>
            </div>
            
            <div class="form-group">
              <label for="price">Prijs (€)</label>
              <input
                id="price"
                v-model="newProduct.price"
                type="number"
                step="0.01"
                min="0"
                required
              />
            </div>
            
            <div class="form-group">
              <label for="image">Afbeelding</label>
              <input
                id="image"
                type="file"
                @change="handleImageChange"
                accept="image/*"
                required
              />
            </div>

            <button type="submit" :disabled="loading">
              {{ loading ? 'Product toevoegen...' : 'Product Toevoegen' }}
            </button>
          </form>
        </div>

        <div class="product-list" v-if="products.length">
          <h3>Bestaande Producten</h3>
          <div class="products-grid">
            <div v-for="product in products" :key="product.id" class="product-card">
              <img :src="product.imageUrl" :alt="product.name">
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p>€{{ product.price }}</p>
                <button @click="handleDeleteProduct(product.id)" class="delete-btn">
                  Verwijderen
                </button>
              </div>
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

onMounted(() => {
  loadProducts();
});
</script>

<style scoped>
.admin-dashboard {
  padding: 2rem;
}

h1, h2, h3 {
  color: #333;
  margin-bottom: 1.5rem;
}

.admin-sections {
  display: grid;
  gap: 2rem;
}

.section {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

input, textarea {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

textarea {
  height: 100px;
  resize: vertical;
}

button {
  padding: 0.75rem 1.5rem;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #45a049;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.delete-btn {
  background-color: #dc3545;
}

.delete-btn:hover {
  background-color: #c82333;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.product-card {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h4 {
  margin: 0 0 0.5rem 0;
}
</style>
