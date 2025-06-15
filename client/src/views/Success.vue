<template>
    <div class="min-h-screen bg-gradient-to-br from-primary/5 to-green-600/5 flex items-center justify-center px-4">
        <!-- Success Card -->
        <div class="max-w-md w-full bg-white rounded-2xl shadow-xl border border-primary/10 overflow-hidden">
            <!-- Success Icon Header -->
            <div class="bg-gradient-to-r from-primary to-green-600 px-6 py-8 text-center">
                <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg class="w-12 h-12 text-primary" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clip-rule="evenodd" />
                    </svg>
                </div>
                <h1 class="text-2xl font-bold text-white mb-2">Betaling Gelukt!</h1>
                <p class="text-white/90">Bedankt voor je bestelling</p>
            </div>

            <!-- Content -->
            <div class="p-6 space-y-6">
                <!-- Success Message -->
                <div class="text-center space-y-3">
                    <h2 class="text-xl font-semibold text-gray-900">Je bestelling is bevestigd</h2>
                    <p class="text-gray-600 leading-relaxed">
                        We hebben je betaling succesvol ontvangen. Je ontvangt binnenkort een bevestigingsmail met alle
                        details van je bestelling.
                    </p>
                </div>

                <!-- Order Status -->
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 border border-gray-200">
                    <div class="flex items-center space-x-3">
                        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div>
                            <p class="font-medium text-gray-900">Bestelling Verwerkt</p>
                            <p class="text-sm text-gray-600">Je bestelling wordt nu voorbereid</p>
                        </div>
                    </div>
                </div>

                <!-- Next Steps -->
                <div class="space-y-3">
                    <h3 class="font-semibold text-gray-900">Wat gebeurt er nu?</h3>
                    <div class="space-y-2">
                        <div class="flex items-start space-x-3">
                            <div class="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <p class="text-sm text-gray-600">Je ontvangt een bevestigingsmail</p>
                        </div>
                        <div class="flex items-start space-x-3">
                            <div class="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <p class="text-sm text-gray-600">We bereiden je bestelling voor</p>
                        </div>
                        <div class="flex items-start space-x-3">
                            <div class="w-2 h-2 bg-primary rounded-full mt-2"></div>
                            <p class="text-sm text-gray-600">Je krijgt bericht wanneer alles klaar is</p>
                        </div>
                    </div>
                </div>

                <!-- Action Buttons -->
                <div class="space-y-3 pt-4">
                    <!-- Primary Button - Back to Shop -->
                    <button @click="goToHome"
                        class="w-full bg-gradient-to-r from-primary to-green-600 text-white px-6 py-3 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95">
                        Terug naar de Winkel
                    </button>

                    <!-- Secondary Button - View Orders -->
                    <button @click="goToOrders"
                        class="w-full bg-white text-primary border-2 border-primary px-6 py-3 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-200">
                        Mijn Bestellingen Bekijken
                    </button>
                </div>

                <!-- Contact Info -->
                <div class="text-center pt-4 border-t border-gray-200">
                    <p class="text-sm text-gray-500">
                        Vragen over je bestelling?
                        <a href="mailto:info@scouts.be" class="text-primary hover:text-primary-dark font-medium">
                            Neem contact op
                        </a>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '@/stores/notifications'
import { STORAGE_KEYS } from '@/config/constants'

const router = useRouter()
const notifications = useNotificationStore()

// Clear cart from localStorage when success page loads
onMounted(() => {
    try {

        // check if link contains valid stripe session ID
        const urlParams = new URLSearchParams(window.location.search)
        const sessionId = urlParams.get('session_id')

        if (sessionId) {


            // Clear all cart-related data from localStorage
            const keys = Object.keys(localStorage)

            keys.forEach(key => {
                // Clear cart items for all events (using correct storage key format)
                if (key.startsWith('cart_items_')) {
                    localStorage.removeItem(key)
                }
                // Clear product-shift selections for all events (using correct storage key format)
                if (key.startsWith('product_shifts_')) {
                    localStorage.removeItem(key)
                }
                // Also clear any legacy quantities and shifts storage
                if (key.startsWith('quantities_') || key.startsWith('shifts_')) {
                    localStorage.removeItem(key)
                }
            })

            console.log('Cart cleared from localStorage after successful payment')

            // Show success notification
            notifications.success(
                'Bestelling Geplaatst!',
                'je bestelling is bevestigd.'
            )
        }
    } catch (error) {
        console.error('Error clearing cart from localStorage:', error)
    }
})

const goToHome = () => {
    router.push('/')
}

const goToOrders = () => {
    router.push('/bestellingen')
}
</script>

<style scoped>
/* Ensure the gradient covers the full height */
.min-h-screen {
    min-height: 100vh;
}

/* Add subtle animations */
.shadow-xl {
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

/* Smooth transitions for buttons */
button {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Prevent text selection on buttons */
button {
    user-select: none;
    -webkit-user-select: none;
}
</style>
