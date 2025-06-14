<template>
    <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Producten Beheren</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Product Creation Form -->
            <div>
                <h3 class="text-lg font-medium mb-4">Nieuw Product Toevoegen</h3>
                <form @submit.prevent="handleAddProduct" class="space-y-4">
                    <div class="form-group">
                        <label for="name" class="block text-sm font-medium text-text">Naam</label>
                        <input id="name" v-model="newProduct.name" type="text" required placeholder="Productnaam"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div class="form-group">
                        <label for="description" class="block text-sm font-medium text-text">Beschrijving</label>
                        <textarea id="description" v-model="newProduct.description" required
                            placeholder="Productbeschrijving"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="price" class="block text-sm font-medium text-text">Prijs (€)</label>
                        <input id="price" v-model="newProduct.price" type="number" required min="0" step="0.01"
                            placeholder="Prijs in euro's"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div class="form-group">
                        <label for="eventId" class="block text-sm font-medium text-text">Event</label>
                        <select id="eventId" v-model="newProduct.eventId" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                            <option value="">Selecteer een event</option>
                            <option v-for="event in events" :key="event.id" :value="event.id">
                                {{ event.name }} ({{ event.type === 'shift_event' ? 'Shift Event' : 'Product Verkoop'
                                }})
                            </option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label for="image" class="block text-sm font-medium text-text">Afbeelding</label>
                        <input id="image" type="file" @change="handleImageChange" accept="image/*"
                            class="mt-1 block w-full" />
                    </div>

                    <div class="form-group">
                        <label for="requiresTimeslot" class="block text-sm font-medium text-text">Vereist
                            tijdslot</label>
                        <input id="requiresTimeslot" v-model="newProduct.requiresTimeslot" type="checkbox"
                            class="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded" />
                    </div>

                    <button type="submit" :disabled="loading"
                        class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition duration-300">
                        {{ loading ? 'Bezig met toevoegen...' : 'Product Toevoegen' }}
                    </button>
                </form>
            </div>

            <!-- Product List -->
            <div>
                <h3 class="text-lg font-medium mb-4">Producten Voorvertoning</h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
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
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmation } from '@/composables/useConfirmation';
import { apiClient } from '@/services/api';
import ProductCard from '@/components/products/ProductCard.vue';

const notifications = useNotificationStore();
const confirmation = useConfirmation();

const props = defineProps({
    events: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['products-updated']);

const loading = ref(false);
const products = ref([]);

const newProduct = ref({
    name: '',
    description: '',
    price: '',
    eventId: '',
    image: null,
    requiresTimeslot: false,
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
        formData.append('eventId', newProduct.value.eventId);
        formData.append('requiresTimeslot', newProduct.value.requiresTimeslot);

        if (newProduct.value.image) {
            formData.append('image', newProduct.value.image);
        }

        const response = await apiClient.addProduct(formData);
        products.value.push(response.product);
        emit('products-updated');

        notifications.success('Opgeslagen!', 'Product is succesvol opgeslagen.');

        // Reset form
        newProduct.value = {
            name: '',
            description: '',
            price: '',
            eventId: '',
            image: null,
            requiresTimeslot: false,
        };

        // Reset file input
        const fileInput = document.getElementById('image');
        if (fileInput) fileInput.value = '';

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
            emit('products-updated');
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

onMounted(() => {
    loadProducts();
});
</script>
