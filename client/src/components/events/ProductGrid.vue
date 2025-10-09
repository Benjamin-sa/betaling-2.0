<template>
    <div class="space-y-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center py-16">
            <div class="flex flex-col items-center space-y-4">
                <div class="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
                <p class="text-gray-600 font-medium">Producten laden...</p>
            </div>
        </div>

        <!-- No Event Selected State -->
        <div v-else-if="!selectedEventId && activeEvents.length > 0" class="text-center py-16">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border border-gray-200">
                <div
                    class="mx-auto w-24 h-24 bg-gradient-to-br from-primary/10 to-green-600/10 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">Selecteer een event</h3>
                <p class="text-lg text-gray-600 max-w-md mx-auto">Kies een event hierboven om de beschikbare producten
                    en opties te bekijken.</p>
            </div>
        </div>

        <!-- No Active Events State -->
        <div v-else-if="activeEvents.length === 0 && !loading" class="text-center py-16">
            <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-12 border border-gray-200">
                <div
                    class="mx-auto w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4v1a2 2 0 002 2h4a2 2 0 002-2v-1m-6 0h8m-8 0a2 2 0 00-2 2v5a2 2 0 002 2h8a2 2 0 002-2v-5a2 2 0 00-2-2" />
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">Geen actieve events</h3>
                <p class="text-lg text-gray-600 max-w-md mx-auto">Er zijn momenteel geen actieve events beschikbaar. Kom
                    later terug voor nieuwe events!</p>
            </div>
        </div>

        <!-- Empty Products State -->
        <div v-else-if="products.length === 0 && selectedEvent?.type !== 'shift_event'" class="text-center py-16">
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-12 border border-blue-200">
                <div
                    class="mx-auto w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">Geen producten beschikbaar</h3>
                <p class="text-lg text-gray-600 max-w-md mx-auto">Voor dit event zijn momenteel geen producten
                    beschikbaar. Kom later terug!</p>
            </div>
        </div>

        <!-- Empty Shifts State -->
        <div v-else-if="selectedEvent?.type === 'shift_event' && availableShiftsCount === 0" class="text-center py-16">
            <div class="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-12 border border-orange-200">
                <div
                    class="mx-auto w-24 h-24 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mb-6">
                    <svg class="w-12 h-12 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-3">Geen tijdslots beschikbaar</h3>
                <p class="text-lg text-gray-600 max-w-md mx-auto">Voor dit event zijn momenteel geen actieve tijdslots
                    beschikbaar. Kom later terug!</p>
            </div>
        </div>

        <!-- Content Grid -->
        <div v-else>

            <!-- Section Header -->
            <div class="text-center mb-12">
                <h2 class="text-3xl font-bold text-gray-900 mb-4">
                    {{ selectedEvent?.type === 'shift_event' ? 'Selecteer producten en tijdsloten' :
                        'Beschikbare producten'
                    }}
                </h2>
                <p class="text-lg text-gray-600 max-w-2xl mx-auto">
                    {{ selectedEvent?.type === 'shift_event'
                        ? 'Selecteer het juiste tijdslot voor elk product.'
                        : 'Bekijk alle beschikbare producten en voeg ze toe aan je winkelmandje.'
                    }}
                </p>
            </div>

            <!-- Test Mode Warning for Customers -->
            <div v-if="hasTestProducts" class="mb-8 max-w-4xl mx-auto">
                <div class="bg-orange-50 border-l-4 border-orange-500 rounded-r-xl p-6 shadow-lg">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h3 class="text-lg font-bold text-orange-900 mb-2">
                                ⚠️ Let op: Testomgeving
                            </h3>
                            <p class="text-orange-800 text-sm sm:text-base">
                                <strong>Deze producten zijn momenteel in testmodus.</strong> 
                                Je kunt producten bekijken en toevoegen aan je winkelmandje, maar <strong class="underline">er kunnen geen echte betalingen worden gedaan</strong>.
                            </p>
                            <p class="text-orange-700 text-xs sm:text-sm mt-2">
                                Dit is een test-/ontwikkelomgeving. Neem contact op met de beheerder als je een echte bestelling wilt plaatsen.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Products Grid - show for all events that have products -->
            <div v-if="products.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div v-for="product in products" :key="product.id"
                    class="transform transition-all duration-300 hover:scale-105">
                    <ProductCard :product="product" :cart-items="cartItems" :selected-event="selectedEvent"
                        :available-shifts="availableShifts" :product-shift-selection="productShiftSelection"
                        @update:cart-item="updateCartItem" @image-error="handleImageError"
                        @update:product-shift="updateProductShift" />
                </div>
            </div>

            <!-- Message when shift event has no products -->
            <div v-else-if="selectedEvent?.type === 'shift_event' && products.length === 0" class="mt-12 text-center">
                <div class="bg-orange-50 rounded-2xl p-8 border border-orange-200">
                    <div class="text-orange-600 mb-3">
                        <svg class="w-8 h-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <h3 class="text-lg font-semibold text-orange-900 mb-2">Geen producten beschikbaar</h3>
                    <p class="text-orange-700">Er zijn nog geen producten toegevoegd aan dit tijdslot-event.</p>
                </div>
            </div>

            <!-- Summary -->
            <div class="mt-12 text-center">
                <div class="bg-gradient-to-r from-primary/5 to-green-600/5 rounded-2xl p-8 border border-primary/10">
                    <h3 class="text-xl font-semibold text-gray-900 mb-2">
                        <span v-if="selectedEvent?.type === 'shift_event'">
                            <!-- Show both shifts and products count for shift events -->
                            <div class="space-y-1">
                                <div>{{ availableShiftsCount }} {{ availableShiftsCount === 1 ? 'tijdslot' : 'tijdslots'
                                    }} beschikbaar</div>
                                <div v-if="products.length > 0" class="text-lg">
                                    {{ products.length }} {{ products.length === 1 ? 'product' : 'producten' }}
                                    beschikbaar
                                </div>
                            </div>
                        </span>
                        <span v-else>
                            {{ products.length }} {{ products.length === 1 ? 'product' : 'producten' }} beschikbaar
                        </span>
                    </h3>
                    <p class="text-gray-600">
                        <span v-if="selectedEvent?.type === 'shift_event'">
                            Producten met tijdslotvereiste tonen een blauw tijdslot-icoon. Selecteer eerst het gewenste
                            tijdslot voordat je het product toevoegt.
                        </span>
                        <span v-else">
                            Scroll omhoog om je selectie te bevestigen en af te rekenen.
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import ProductCard from '@/components/products/ProductCard.vue';

const props = defineProps({
    loading: {
        type: Boolean,
        default: false
    },
    products: {
        type: Array,
        required: true
    },
    cartItems: {
        type: Array,
        required: true
    },
    activeEvents: {
        type: Array,
        required: true
    },
    selectedEventId: {
        type: String,
        default: null
    },
    selectedEvent: {
        type: Object,
        default: null
    },
    productShiftSelection: {
        type: Object,
        default: () => ({})
    }
});

const emit = defineEmits(['update:cart-item', 'image-error', 'update:product-shift']);

const availableShiftsCount = computed(() => {
    if (!props.selectedEvent?.shifts) return 0;
    return props.selectedEvent.shifts.filter(shift => shift.isActive).length;
});

const availableShifts = computed(() => {
    if (!props.selectedEvent?.shifts) return [];
    return props.selectedEvent.shifts.filter(shift => shift.isActive);
});

// Check if any products are in test mode
const hasTestProducts = computed(() => {
    return props.products.some(product => product.isTestMode === true);
});

const updateCartItem = (productId, shiftId, newQuantity) => {
    emit('update:cart-item', productId, shiftId, newQuantity);
};

const handleImageError = (product) => {
    emit('image-error', product);
};

const updateProductShift = (productId, shiftId) => {
    emit('update:product-shift', productId, shiftId);
};
</script>
