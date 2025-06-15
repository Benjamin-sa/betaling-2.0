<template>
    <div class="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100/50">
        <!-- Content Container with enhanced spacing -->
        <div class="pt-28 pb-8 px-4 sm:pt-32 sm:pb-12 sm:px-6 lg:px-8">
            <!-- Navigation Back Button -->
            <div class="max-w-5xl mx-auto mb-8 sm:mb-10">
                <button @click="goBack"
                    class="group flex items-center space-x-3 text-primary hover:text-primary-dark font-semibold transition-all duration-300 hover:scale-105 bg-white/80 hover:bg-white px-6 py-3 rounded-2xl shadow-sm hover:shadow-lg backdrop-blur-sm border border-gray-200/50 hover:border-primary/20">
                    <svg class="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span>Terug naar Winkel</span>
                </button>
            </div>

            <!-- Page Header with enhanced styling -->
            <div class="max-w-5xl mx-auto text-center mb-12 sm:mb-16">
                <div class="relative">
                    <h1
                        class="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4 tracking-tight">
                        Mijn Bestellingen
                    </h1>
                    <div
                        class="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent rounded-full">
                    </div>
                </div>
                <p class="text-lg sm:text-xl text-gray-600 mt-6 max-w-2xl mx-auto leading-relaxed">
                    Overzicht van al je bestellingen
                </p>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="max-w-5xl mx-auto">
                <div class="space-y-8">
                    <div v-for="i in 3" :key="i"
                        class="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 p-8 animate-pulse hover:shadow-2xl transition-shadow duration-300">
                        <div class="flex justify-between items-start mb-6">
                            <div class="space-y-3">
                                <div class="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-40"></div>
                                <div class="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-32"></div>
                            </div>
                            <div class="h-8 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full w-24"></div>
                        </div>
                        <div class="space-y-4">
                            <div class="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-full"></div>
                            <div class="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-4/5"></div>
                            <div class="h-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded w-3/5"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="max-w-2xl mx-auto">
                <div class="text-center py-16">
                    <div
                        class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-red-200/50 p-10 mx-auto">
                        <div class="mb-6">
                            <div
                                class="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg class="w-10 h-10 text-red-500" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-3">Fout bij laden</h3>
                        <p class="text-gray-600 mb-8 leading-relaxed">{{ error }}</p>
                        <button @click="fetchOrders"
                            class="bg-gradient-to-r from-primary to-green-600 text-white px-8 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                            Opnieuw Proberen
                        </button>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="orders.length === 0" class="max-w-2xl mx-auto">
                <div class="text-center py-16">
                    <div
                        class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 p-12 mx-auto">
                        <div class="mb-8">
                            <div
                                class="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                            </div>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900 mb-4">Nog geen bestellingen</h3>
                        <p class="text-gray-600 mb-8 leading-relaxed max-w-md mx-auto">
                            Je hebt nog geen bestellingen geplaatst. Begin met winkelen en ontdek onze geweldige
                            producten!
                        </p>
                        <button @click="goToShop"
                            class="bg-gradient-to-r from-primary to-green-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                            Start met Winkelen
                        </button>
                    </div>
                </div>
            </div>

            <!-- Orders List -->
            <div v-else class="max-w-5xl mx-auto">
                <div class="space-y-8">
                    <div v-for="order in orders" :key="order.id"
                        class="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-200/50 overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">

                        <!-- Order Header -->
                        <div
                            class="bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm px-8 py-6 border-b border-gray-200/50">
                            <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                <div class="mb-3 sm:mb-0">
                                    <h3 class="text-xl font-bold text-gray-900 mb-1">
                                        Bestelling #{{ order.id.slice(-8).toUpperCase() }}
                                    </h3>
                                    <p class="text-sm text-gray-600 font-medium">
                                        {{ formatDate(order.createdAt) }}
                                    </p>
                                </div>
                                <div class="flex items-center space-x-4">
                                    <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-bold"
                                        :class="getStatusBadgeClass(order)">
                                        {{ getOrderStatus(order) }}
                                    </span>
                                    <span
                                        class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                                        €{{ (order.amountTotal).toFixed(2) }}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <!-- Order Details -->
                        <div class="p-8">
                            <!-- Event Info (if available) -->
                            <div v-if="hasEventInfo(order)"
                                class="mb-6 p-6 bg-gradient-to-r from-blue-50 to-blue-100/50 rounded-2xl border border-blue-200/30">
                                <div class="flex items-center space-x-3 mb-3">
                                    <div class="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <span class="font-bold text-blue-900 text-lg">Evenement Informatie</span>
                                </div>
                                <div class="text-sm text-blue-800 space-y-2 ml-11">
                                    <p v-if="order.eventName" class="font-medium">
                                        <span class="font-bold">Evenement:</span> {{ order.eventName }}
                                    </p>
                                    <p v-else-if="order.eventId && order.eventId.trim() !== ''" class="font-medium">
                                        <span class="font-bold">Evenement ID:</span> {{ order.eventId }}
                                    </p>
                                    <p v-if="order.timeSlot && order.timeSlot.trim() !== ''" class="font-medium">
                                        <span class="font-bold">Tijdslot:</span> {{ order.timeSlot }}
                                    </p>
                                    <p v-if="hasShiftItems(order) && !order.eventName && !order.eventId"
                                        class="text-blue-600 font-medium">
                                        <span class="font-bold">Opmerking:</span> Deze bestelling bevat items met shifts
                                    </p>
                                </div>
                            </div>

                            <!-- Order Items -->
                            <div class="space-y-4">
                                <h4 class="font-bold text-gray-900 text-lg mb-4 flex items-center">
                                    <span
                                        class="w-2 h-6 bg-gradient-to-b from-primary to-green-600 rounded-full mr-3"></span>
                                    Bestelde Items
                                </h4>
                                <div v-for="item in order.items" :key="item.id"
                                    class="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl border border-gray-200/30 hover:shadow-md transition-shadow duration-200">
                                    <div class="flex-1">
                                        <h5 class="font-bold text-gray-900 text-lg mb-1">{{ item.productName }}</h5>
                                        <p class="text-gray-600 font-medium">
                                            {{ item.quantity }}x à €{{ (item.unitPrice).toFixed(2) }}
                                        </p>
                                        <!-- Show shift information if available -->
                                        <ShiftInfo
                                            v-if="item.shiftId && item.shiftId.trim() !== '' && order.eventId && order.eventId.trim() !== ''"
                                            :event-id="order.eventId" :shift-id="item.shiftId" />
                                        <div v-else-if="item.shiftId && item.shiftId.trim() !== ''" class="mt-2">
                                            <p
                                                class="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-md inline-block">
                                                <svg class="w-3 h-3 inline mr-1" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Shift ID: {{ item.shiftId }}
                                            </p>
                                        </div>
                                    </div>
                                    <div class="text-right ml-6">
                                        <span class="font-bold text-gray-900 text-xl">
                                            €{{ (item.amountTotal).toFixed(2) }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- Payment Info -->
                            <div class="mt-8 pt-6 border-t border-gray-200">
                                <div class="bg-gradient-to-r from-gray-50 to-gray-100/30 rounded-2xl p-6 space-y-3">
                                    <div class="flex items-center justify-between text-gray-700">
                                        <span class="font-semibold">Betaalmethode:</span>
                                        <span class="capitalize font-bold">{{ order.paymentMethod || 'Online betaling'
                                            }}</span>
                                    </div>
                                    <div v-if="order.currency" class="flex items-center justify-between text-gray-700">
                                        <span class="font-semibold">Valuta:</span>
                                        <span class="uppercase font-bold">{{ order.currency }}</span>
                                    </div>
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
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import { apiClient } from '@/services/api'
import ShiftInfo from '@/components/orders/ShiftInfo.vue'

const router = useRouter()
const notifications = useNotificationStore()

// Reactive data
const orders = ref([])
const loading = ref(true)
const error = ref('')

// Methods
const fetchOrders = async () => {
    try {
        loading.value = true
        error.value = ''

        const response = await apiClient.getOrders()
        console.log('Raw API response:', response)

        // The API returns { orders: [...] } directly
        orders.value = response.orders || []

        console.log('Orders set to:', orders.value)
    } catch (err) {
        console.error('Error fetching orders:', err)
        error.value = err.message || 'Er is een fout opgetreden bij het laden van je bestellingen'
        notifications.error(
            'Laadprobleem',
            'Kon bestellingen niet laden. Probeer het opnieuw.'
        )
    } finally {
        loading.value = false
    }
}

const formatDate = (timestamp) => {
    if (!timestamp) return 'Datum onbekend'

    try {
        // Handle different timestamp formats
        let date;

        if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
            // Firestore Timestamp object
            date = timestamp.toDate()
        } else if (timestamp && typeof timestamp === 'object' && timestamp._seconds) {
            // Firestore Timestamp-like object with _seconds (from API response)
            date = new Date(timestamp._seconds * 1000)
        } else if (timestamp && typeof timestamp === 'object' && timestamp.seconds) {
            // Firestore Timestamp-like object with seconds
            date = new Date(timestamp.seconds * 1000)
        } else if (timestamp instanceof Date) {
            // Already a Date object
            date = timestamp
        } else if (typeof timestamp === 'string' || typeof timestamp === 'number') {
            // String or number timestamp
            date = new Date(timestamp)
        } else {
            // Unknown format
            return 'Datum onbekend'
        }

        // Check if date is valid
        if (isNaN(date.getTime())) {
            return 'Datum onbekend'
        }

        return date.toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (err) {
        console.error('Error formatting date:', err)
        return 'Datum onbekend'
    }
}

const getOrderStatus = (order) => {
    if (order.manualPaymentConfirmedAt) {
        return 'Handmatig Bevestigd'
    }
    if (order.paymentMethod) {
        return 'Betaald'
    }
    return 'In Behandeling'
}

const getStatusBadgeClass = (order) => {
    if (order.manualPaymentConfirmedAt) {
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
    }
    if (order.paymentMethod) {
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border border-green-300'
    }
    return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border border-yellow-300'
}

const hasEventInfo = (order) => {
    // Show event section if we have event name, event ID, shift info, or timeslot
    return !!(
        order.eventName ||
        (order.eventId && order.eventId.trim() !== '') ||
        order.timeSlot ||
        hasShiftItems(order)
    )
}

const hasShiftItems = (order) => {
    return order.items && order.items.some(item =>
        (item.shiftId && item.shiftId.trim() !== '') ||
        (item.shiftName && item.shiftName.trim() !== '')
    )
}

const goBack = () => {
    router.push('/')
}

const goToShop = () => {
    router.push('/')
}

// Initialize
onMounted(() => {
    fetchOrders()
})
</script>

<style scoped>
/* Animation for loading state */
@keyframes pulse {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.5;
    }
}

.animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Smooth transitions for all interactive elements */
* {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Custom scrollbar for better aesthetics */
::-webkit-scrollbar {
    width: 8px;
}

::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 10px;
}

::-webkit-scrollbar-thumb {
    background: linear-gradient(to bottom, #10b981, #059669);
    border-radius: 10px;
}

::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(to bottom, #059669, #047857);
}
</style>
