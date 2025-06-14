<template>
    <div v-if="hasItems" class="fixed bottom-0 left-0 right-0 z-50">
        <!-- Background Blur -->
        <div class="absolute inset-0 bg-white/80 backdrop-blur-md border-t border-gray-200"></div>

        <div class="relative">
            <div class="max-w-7xl mx-auto px-4 py-4">
                <!-- Collapsed Summary -->
                <div class="flex items-center justify-between">
                    <!-- Left Side - Cart Toggle & Summary -->
                    <div class="flex items-center space-x-6">
                        <!-- Cart Toggle Button -->
                        <button @click="isCartOpen = !isCartOpen"
                            class="flex items-center space-x-3 text-gray-700 hover:text-primary transition-all duration-200 group">
                            <div class="relative">
                                <div
                                    class="w-12 h-12 bg-gradient-to-br from-primary to-green-600 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-200">
                                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 7M7 13l1.5-7M17 21a2 2 0 100-4 2 2 0 000 4zM9 21a2 2 0 100-4 2 2 0 000 4z" />
                                    </svg>
                                </div>
                                <!-- Item Count Badge -->
                                <div
                                    class="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg">
                                    {{ totalItems }}
                                </div>
                            </div>

                            <div class="hidden sm:block">
                                <div class="flex items-center space-x-2">
                                    <span class="text-sm font-medium text-gray-600">{{ totalItems }} items</span>
                                    <svg class="w-4 h-4 text-gray-400 transition-transform duration-200"
                                        :class="{ 'rotate-180': isCartOpen }" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </button>

                        <!-- Total Price -->
                        <div class="bg-white rounded-xl px-4 py-2 shadow-lg border border-gray-200">
                            <div class="text-sm text-gray-600">Totaal</div>
                            <div class="text-xl font-bold text-gray-900">€{{ total.toFixed(2) }}</div>
                        </div>
                    </div>

                    <!-- Right Side - Checkout Button -->
                    <button @click="handleCheckout" :disabled="loading"
                        class="group relative overflow-hidden bg-gradient-to-r from-primary to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                        <!-- Loading Spinner -->
                        <div v-if="loading" class="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <svg class="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none"
                                viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                    stroke-width="4" />
                                <path class="opacity-75" fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        </div>

                        <!-- Button Content -->
                        <div class="flex items-center space-x-3" :class="{ 'opacity-0': loading }">
                            <span>{{ loading ? 'Bezig met afrekenen...' : 'Afrekenen' }}</span>
                            <svg class="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </button>
                </div>

                <!-- Expanded Product List -->
                <div v-if="isCartOpen" class="mt-6 transition-all duration-300 ease-in-out">
                    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 max-h-80 overflow-y-auto">
                        <!-- Header -->
                        <div class="flex items-center justify-between pb-4 border-b border-gray-200 mb-4">
                            <h3 class="text-lg font-bold text-gray-900">Je winkelmandje</h3>
                            <button @click="isCartOpen = false"
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <!-- Cart Items -->
                        <div class="space-y-4">
                            <!-- Selected Shift Info (for shift events) -->
                            <div v-if="selectedEvent?.type === 'shift_event' && selectedShifts.length > 0"
                                class="p-4 bg-blue-50 rounded-xl border border-blue-200">
                                <div class="flex items-center space-x-3">
                                    <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <svg class="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fill-rule="evenodd"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                                clip-rule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 class="font-medium text-blue-900">Gekozen tijdslot:</h4>
                                        <p class="text-sm text-blue-700">{{ selectedShifts[0].name }} ({{
                                            selectedShifts[0].startTime }} - {{ selectedShifts[0].endTime }})</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Products -->
                            <div v-for="product in selectedProducts" :key="'product-' + product.id"
                                class="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                                <!-- Product Info -->
                                <div class="flex items-center space-x-4 flex-1">
                                    <!-- Product Image -->
                                    <div class="w-16 h-16 flex-shrink-0">
                                        <img v-if="product.imageUrl" :src="product.imageUrl" :alt="product.name"
                                            class="w-full h-full object-cover rounded-lg shadow-sm" />
                                        <div v-else
                                            class="w-full h-full bg-gradient-to-br from-primary/10 to-green-600/10 rounded-lg flex items-center justify-center border border-primary/20">
                                            <span class="text-lg font-bold text-primary/80">{{ product.name.charAt(0)
                                                }}</span>
                                        </div>
                                    </div>

                                    <!-- Product Details -->
                                    <div class="flex-1 min-w-0">
                                        <h4 class="font-semibold text-gray-900 truncate">{{ product.name }}</h4>
                                        <p class="text-sm text-gray-600">€{{ product.price.toFixed(2) }} per stuk</p>
                                        <p v-if="selectedEvent?.type === 'shift_event'" class="text-xs text-blue-600">
                                            Voor tijdslot: {{ selectedShifts[0]?.name }}
                                        </p>
                                    </div>
                                </div>

                                <!-- Quantity & Price -->
                                <div class="flex items-center space-x-4">
                                    <div class="text-center">
                                        <div class="text-sm text-gray-600">Aantal</div>
                                        <div class="font-bold text-gray-900">{{ quantities[product.id] }}x</div>
                                    </div>

                                    <div class="text-right">
                                        <div class="text-sm text-gray-600">Subtotaal</div>
                                        <div class="font-bold text-lg text-primary">€{{ (product.price *
                                            quantities[product.id]).toFixed(2) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Cart Summary -->
                        <div class="mt-6 pt-4 border-t border-gray-200">
                            <div class="flex justify-between items-center">
                                <span class="text-lg font-semibold text-gray-900">Totaal</span>
                                <span class="text-2xl font-bold text-primary">€{{ total.toFixed(2) }}</span>
                            </div>

                            <!-- Event Info -->
                            <div v-if="selectedEvent" class="mt-3 text-sm text-gray-600">
                                <div class="flex items-center space-x-2">
                                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{{ selectedEvent.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

defineProps({
    hasItems: {
        type: Boolean,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    selectedProducts: {
        type: Array,
        required: true
    },
    selectedShifts: {
        type: Array,
        default: () => []
    },
    quantities: {
        type: Object,
        required: true
    },
    loading: {
        type: Boolean,
        default: false
    },
    selectedEvent: {
        type: Object,
        default: null
    }
});

const emit = defineEmits(['checkout']);

const isCartOpen = ref(false);

const handleCheckout = () => {
    emit('checkout');
};
</script>

<style scoped>
/* Smooth animation for cart expansion */
.transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
