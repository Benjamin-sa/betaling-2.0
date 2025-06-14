<template>
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-secondary px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-t-2xl">
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Producten Beheren</h2>
            <p class="text-sm sm:text-base text-emerald-100">Voeg nieuwe producten toe en beheer bestaande</p>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-6 lg:p-8">
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                <!-- Product Creation Form -->
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6">
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span class="hidden sm:inline">Nieuw Product Toevoegen</span>
                        <span class="sm:hidden">Product Toevoegen</span>
                    </h3>

                    <form @submit.prevent="handleAddProduct" class="space-y-4 sm:space-y-6">
                        <!-- Product Name -->
                        <div>
                            <label for="name" class="block text-sm font-semibold text-gray-700 mb-2">Naam</label>
                            <input id="name" v-model="newProduct.name" type="text" required placeholder="Productnaam"
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" />
                        </div>

                        <!-- Product Description -->
                        <div>
                            <label for="description"
                                class="block text-sm font-semibold text-gray-700 mb-2">Beschrijving</label>
                            <textarea id="description" v-model="newProduct.description" required rows="3"
                                placeholder="Productbeschrijving"
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"></textarea>
                        </div>

                        <!-- Product Price -->
                        <div>
                            <label for="price" class="block text-sm font-semibold text-gray-700 mb-2">Prijs (€)</label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span class="text-gray-500 text-base sm:text-lg">€</span>
                                </div>
                                <input id="price" v-model="newProduct.price" type="number" required min="0" step="0.01"
                                    placeholder="0.00"
                                    class="w-full pl-6 sm:pl-8 pr-3 sm:pr-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" />
                            </div>
                        </div>

                        <!-- Event Selection -->
                        <div>
                            <label for="eventId" class="block text-sm font-semibold text-gray-700 mb-2">Event</label>
                            <select id="eventId" v-model="newProduct.eventId" required
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none cursor-pointer">
                                <option value="">Selecteer een event</option>
                                <option v-for="event in events" :key="event.id" :value="event.id">
                                    {{ event.name }} ({{ event.type === 'shift_event' ? 'Shift Event' :
                                        'Product Verkoop' }})
                                </option>
                            </select>
                        </div>

                        <!-- Image Upload -->
                        <div>
                            <label for="image" class="block text-sm font-semibold text-gray-700 mb-2">Afbeelding</label>
                            <div class="relative">
                                <input id="image" type="file" @change="handleImageChange" accept="image/*"
                                    class="hidden" />
                                <label for="image"
                                    class="flex items-center justify-center w-full px-3 sm:px-4 py-4 sm:py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-primary hover:bg-gray-50 transition-all duration-200">
                                    <div class="text-center">
                                        <svg class="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 text-gray-400" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                        <p class="text-xs sm:text-sm text-gray-600">
                                            <span class="font-medium text-primary">Upload een afbeelding</span><span class="hidden sm:inline"> of sleep hier</span>
                                        </p>
                                        <p class="text-xs text-gray-500 mt-1">PNG, JPG tot 5MB</p>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <!-- Requires Timeslot -->
                        <div v-if="selectedEventType === 'shift_event'" class="bg-white rounded-xl p-4 border-2 border-gray-200">
                            <div class="flex items-center">
                                <input id="requiresTimeslot" v-model="newProduct.requiresTimeslot" type="checkbox"
                                    class="h-5 w-5 text-primary focus:ring-primary border-gray-300 rounded transition-colors duration-200" />
                                <label for="requiresTimeslot" class="ml-3 block text-sm font-semibold text-gray-700">
                                    Vereist tijdslot selectie
                                </label>
                            </div>
                            <p class="mt-2 text-xs text-gray-500">
                                Voor shift events kunnen klanten een specifiek tijdslot kiezen
                            </p>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" :disabled="loading"
                            class="w-full bg-gradient-to-r from-primary to-secondary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            <span v-if="loading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                <span class="hidden sm:inline">Product toevoegen...</span>
                                <span class="sm:hidden">Toevoegen...</span>
                            </span>
                            <span v-else>
                                <span class="hidden sm:inline">Product Toevoegen</span>
                                <span class="sm:hidden">Toevoegen</span>
                            </span>
                        </button>
                    </form>
                </div>

                <!-- Product List -->
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6">
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                        <span class="hidden sm:inline">Bestaande Producten</span>
                        <span class="sm:hidden">Producten</span>
                    </h3>

                    <div v-if="products.length > 0" class="space-y-3 sm:space-y-4 max-h-[400px] sm:max-h-[500px] overflow-y-auto">
                        <div v-for="product in products" :key="product.id"
                            class="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div class="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                                <!-- Product Image -->
                                <div class="flex-shrink-0 mx-auto sm:mx-0">
                                    <div
                                        class="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                                        <svg v-if="!product.image" class="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none"
                                            stroke="currentColor" viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                        </svg>
                                        <img v-else :src="product.image" :alt="product.name"
                                            class="w-full h-full object-cover rounded-xl" />
                                    </div>
                                </div>

                                <!-- Product Info -->
                                <div class="flex-1 min-w-0 text-center sm:text-left">
                                    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-2 sm:space-y-0">
                                        <div class="flex-1">
                                            <h4 class="text-base sm:text-lg font-bold text-gray-900 truncate">{{ product.name }}</h4>
                                            <p class="text-gray-600 text-xs sm:text-sm mt-1 line-clamp-2">{{ product.description }}
                                            </p>

                                            <!-- Price and Badges -->
                                            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3 mt-2 sm:mt-3">
                                                <span class="text-lg sm:text-xl font-bold text-primary">€{{ product.price }}</span>
                                                <span v-if="product.requiresTimeslot"
                                                    class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-info-bg text-info border border-info/20">
                                                    <svg class="w-3 h-3 mr-1" fill="none" stroke="currentColor"
                                                        viewBox="0 0 24 24">
                                                        <path stroke-linecap="round" stroke-linejoin="round"
                                                            stroke-width="2"
                                                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    Tijdslot vereist
                                                </span>
                                            </div>
                                        </div>

                                        <!-- Delete Button -->
                                        <button @click="handleDeleteProduct(product.id)"
                                            class="self-center sm:self-start sm:ml-4 p-2 text-error hover:bg-error-bg rounded-xl transition-colors duration-200 flex-shrink-0"
                                            title="Product verwijderen">
                                            <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-12 sm:py-16">
                        <div
                            class="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <svg class="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Geen producten gevonden</h3>
                        <p class="text-gray-600">Voeg je eerste product toe om te beginnen.</p>
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
import { ref, computed, watch, onMounted } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmation } from '@/composables/useConfirmation';
import { apiClient } from '@/services/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';

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

// Computed property to get the selected event type
const selectedEventType = computed(() => {
    if (!newProduct.value.eventId) return null;
    const selectedEvent = props.events.find(event => event.id === newProduct.value.eventId);
    return selectedEvent?.type || null;
});

// Watch for event type changes and reset requiresTimeslot if switching to product_sale
watch(selectedEventType, (newType) => {
    if (newType === 'product_sale') {
        newProduct.value.requiresTimeslot = false;
    }
});


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
