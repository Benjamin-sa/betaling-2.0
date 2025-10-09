<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Stripe Configuration</h2>
                <p class="mt-1 text-sm text-gray-600">
                    Manage Stripe test/live mode settings
                </p>
            </div>
            <button @click="loadConfig" :disabled="loading"
                class="mt-4 sm:mt-0 bg-gradient-to-r from-primary to-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 disabled:opacity-50">
                <div class="flex items-center space-x-2">
                    <svg :class="['w-4 h-4', loading ? 'animate-spin' : '']" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <span>Refresh</span>
                </div>
            </button>
        </div>

        <!-- Current Status Card -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <div v-if="loading" class="text-center py-4">
                <div class="inline-flex items-center space-x-2">
                    <svg class="animate-spin w-5 h-5 text-primary" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span class="text-gray-600">Loading configuration...</span>
                </div>
            </div>

            <div v-else-if="config" class="space-y-4">
                <!-- Current Mode Indicator -->
                <div class="flex items-center justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">Huidige Modus</h3>
                        <p class="text-sm text-gray-600">Actieve Stripe omgeving</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span :class="[
                            'inline-flex items-center px-4 py-2 text-sm font-bold rounded-xl border-2 shadow-sm',
                            config.mode === 'live'
                                ? 'bg-green-100 text-green-900 border-green-300'
                                : 'bg-orange-500 text-white border-orange-600'
                        ]">
                            <svg v-if="config.mode === 'live'" class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg v-else class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            {{ config.mode === 'live' ? '✅ LIVE MODUS' : '⚠️ TEST MODUS' }}
                        </span>
                    </div>
                </div>

                <!-- Warning for Test Mode -->
                <div v-if="config.mode === 'test'" class="bg-orange-50 border-2 border-orange-500 rounded-xl p-6">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <svg class="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h4 class="text-base font-bold text-orange-900 mb-2">⚠️ TEST MODUS ACTIEF - Alleen voor Ontwikkelaars</h4>
                            <div class="text-sm text-orange-800 space-y-2">
                                <p class="font-semibold">In test modus kunnen <strong class="underline">klanten GEEN echte betalingen doen</strong>:</p>
                                <ul class="list-disc ml-5 space-y-1">
                                    <li>Alle betalingen zijn gesimuleerd (geen echt geld)</li>
                                    <li>Nieuwe producten worden aangemaakt in test modus</li>
                                    <li>Klanten zien een waarschuwing dat ze niet kunnen betalen</li>
                                    <li>Alleen geschikt voor test en ontwikkeling</li>
                                </ul>
                                <p class="mt-3 font-bold text-orange-900 bg-orange-100 border border-orange-300 rounded-lg p-2">
                                    💡 Schakel over naar LIVE MODUS om echte betalingen te accepteren
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Success indicator for Live Mode -->
                <div v-else class="bg-green-50 border-2 border-green-500 rounded-xl p-6">
                    <div class="flex items-start">
                        <div class="flex-shrink-0">
                            <svg class="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <div class="ml-4">
                            <h4 class="text-base font-bold text-green-900 mb-2">✅ Live Modus Actief</h4>
                            <div class="text-sm text-green-800 space-y-1">
                                <p><strong>Klanten kunnen nu echte betalingen doen.</strong></p>
                                <p>Nieuwe producten worden aangemaakt voor echte verkoop.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Keys Status -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div :class="[
                                    'w-3 h-3 rounded-full mr-2',
                                    config.hasTestKeys ? 'bg-green-500' : 'bg-red-500'
                                ]"></div>
                                <span class="text-sm font-semibold text-gray-900">Test Sleutels</span>
                            </div>
                            <svg v-if="config.hasTestKeys" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg v-else class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">
                            {{ config.hasTestKeys ? '✅ Geconfigureerd' : '❌ Ontbreekt' }}
                        </p>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <div class="flex items-center justify-between">
                            <div class="flex items-center">
                                <div :class="[
                                    'w-3 h-3 rounded-full mr-2',
                                    config.hasLiveKeys ? 'bg-green-500' : 'bg-red-500'
                                ]"></div>
                                <span class="text-sm font-semibold text-gray-900">Live Sleutels</span>
                            </div>
                            <svg v-if="config.hasLiveKeys" class="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <svg v-else class="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">
                            {{ config.hasLiveKeys ? '✅ Geconfigureerd' : '❌ Ontbreekt' }}
                        </p>
                    </div>
                </div>

                <!-- Mode Switch Controls -->
                <div class="border-t border-gray-200 pt-4">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Modus Wisselen</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button @click="switchMode('test')"
                            :disabled="switching || config.mode === 'test' || !config.hasTestKeys"
                            class="px-4 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg">
                            <div class="flex items-center justify-center space-x-2">
                                <svg v-if="switching && targetMode === 'test'" class="animate-spin w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Wissel naar Test Modus</span>
                            </div>
                            <p class="text-xs text-orange-100 mt-1">Voor ontwikkeling en testen</p>
                        </button>

                        <button @click="switchMode('live')"
                            :disabled="switching || config.mode === 'live' || !config.hasLiveKeys"
                            class="px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:shadow-lg">
                            <div class="flex items-center justify-center space-x-2">
                                <svg v-if="switching && targetMode === 'live'" class="animate-spin w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Wissel naar Live Modus</span>
                            </div>
                            <p class="text-xs text-green-100 mt-1">Voor echte betalingen</p>
                        </button>
                    </div>
                    <div class="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p class="text-xs text-yellow-800 flex items-start">
                            <svg class="w-4 h-4 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <span>⚠️ Het wisselen van modus heeft onmiddellijk effect op alle nieuwe betalingen en producten</span>
                        </p>
                    </div>
                </div>
            </div>

            <div v-else-if="error" class="text-center py-8">
                <div class="text-red-600 mb-2">
                    <svg class="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p class="text-gray-900 font-medium">Failed to load configuration</p>
                    <p class="text-sm text-gray-600 mt-1">{{ error }}</p>
                </div>
            </div>
        </div>

        <!-- Information Card -->
        <div class="bg-blue-50 border border-blue-200 rounded-2xl p-6">
            <div class="flex items-start">
                <svg class="w-6 h-6 text-blue-500 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 class="text-base font-bold text-blue-900 mb-3">Over Stripe Modi</h4>
                    <div class="text-sm text-blue-800 space-y-2">
                        <div>
                            <p class="font-semibold">🧪 Test Modus:</p>
                            <p>Veilig voor ontwikkeling en testen. Geen echte betalingen. Klanten kunnen NIET betalen.</p>
                        </div>
                        <div>
                            <p class="font-semibold">✅ Live Modus:</p>
                            <p>Echte betalingen worden verwerkt. Klanten kunnen producten kopen en betalen.</p>
                        </div>
                        <div>
                            <p class="font-semibold">⚡ Wisselen:</p>
                            <p>Veranderingen hebben onmiddellijk effect op nieuwe betalingen en producten.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useNotificationStore } from '../../stores/notifications'
import { apiClient } from '../../services/api'

const notifications = useNotificationStore()

// Reactive data
const loading = ref(false)
const switching = ref(false)
const targetMode = ref(null)
const config = ref(null)
const error = ref(null)

// Load Stripe configuration
const loadConfig = async () => {
    try {
        loading.value = true
        error.value = null

        const response = await apiClient.getStripeConfig()
        config.value = response

    } catch (err) {
        console.error('Error loading Stripe config:', err)
        error.value = err.message
        notifications.error('Failed to load Stripe configuration', err?.message || 'Er is een fout opgetreden bij het laden van de Stripe configuratie.')
    } finally {
        loading.value = false
    }
}

// Switch Stripe mode
const switchMode = async (mode) => {
    try {
        // Confirmation for live mode
        if (mode === 'live') {
            const confirmed = confirm(
                '⚠️ WAARSCHUWING: Je staat op het punt om over te schakelen naar LIVE MODUS!\n\n' +
                '✅ Klanten kunnen dan ECHTE betalingen doen\n' +
                '💰 Alle nieuwe producten worden aangemaakt voor echte verkoop\n' +
                '⚡ De wijziging treedt onmiddellijk in werking\n\n' +
                'Ben je er absoluut zeker van dat je wilt doorgaan?'
            )
            if (!confirmed) return
        } else {
            // Confirmation for test mode
            const confirmed = confirm(
                '⚠️ Je staat op het punt om over te schakelen naar TEST MODUS\n\n' +
                '🧪 Klanten kunnen dan GEEN echte betalingen meer doen\n' +
                '⚠️ Alleen voor ontwikkeling en testen\n' +
                '⚡ De wijziging treedt onmiddellijk in werking\n\n' +
                'Wil je doorgaan?'
            )
            if (!confirmed) return
        }

        switching.value = true
        targetMode.value = mode

        await apiClient.switchStripeMode(mode)

        if (mode === 'live') {
            notifications.success(
                '✅ Live Modus Actief',
                'Klanten kunnen nu echte betalingen doen. Nieuwe producten worden aangemaakt voor echte verkoop.'
            )
        } else {
            notifications.success(
                '🧪 Test Modus Actief',
                'Klanten kunnen nu GEEN echte betalingen meer doen. Alleen geschikt voor ontwikkeling en testen.'
            )
        }
        
        // Reload configuration
        await loadConfig()

    } catch (err) {
        console.error('Error switching Stripe mode:', err)
        notifications.error(
            `Fout bij wisselen naar ${mode} modus`, 
            err?.message || `Er is een fout opgetreden bij het wijzigen naar ${mode} modus.`
        )
    } finally {
        switching.value = false
        targetMode.value = null
    }
}

// Load initial data
onMounted(async () => {
    await loadConfig()
})
</script>
