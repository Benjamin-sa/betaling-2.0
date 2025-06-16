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
                        <h3 class="text-lg font-semibold text-gray-900">Current Mode</h3>
                        <p class="text-sm text-gray-600">Active Stripe environment</p>
                    </div>
                    <div class="flex items-center space-x-3">
                        <span :class="[
                            'inline-flex px-3 py-1 text-sm font-semibold rounded-full',
                            config.mode === 'live'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                        ]">
                            {{ config.mode === 'live' ? '🔴 LIVE MODE' : '🟡 TEST MODE' }}
                        </span>
                    </div>
                </div>

                <!-- Warning for Live Mode -->
                <div v-if="config.mode === 'live'" class="bg-red-50 border border-red-200 rounded-xl p-4">
                    <div class="flex items-start">
                        <svg class="w-5 h-5 text-red-500 mt-0.5 mr-3" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                        <div>
                            <h4 class="text-sm font-medium text-red-800">Live Mode Active</h4>
                            <p class="text-sm text-red-700 mt-1">Real payments are being processed. Please be careful
                                with any changes.</p>
                        </div>
                    </div>
                </div>

                <!-- Keys Status -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div :class="[
                                'w-3 h-3 rounded-full mr-2',
                                config.hasTestKeys ? 'bg-green-500' : 'bg-red-500'
                            ]"></div>
                            <span class="text-sm font-medium text-gray-900">Test Keys</span>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">
                            {{ config.hasTestKeys ? 'Configured' : 'Missing' }}
                        </p>
                    </div>

                    <div class="bg-gray-50 rounded-lg p-4">
                        <div class="flex items-center">
                            <div :class="[
                                'w-3 h-3 rounded-full mr-2',
                                config.hasLiveKeys ? 'bg-green-500' : 'bg-red-500'
                            ]"></div>
                            <span class="text-sm font-medium text-gray-900">Live Keys</span>
                        </div>
                        <p class="text-xs text-gray-600 mt-1">
                            {{ config.hasLiveKeys ? 'Configured' : 'Missing' }}
                        </p>
                    </div>
                </div>

                <!-- Mode Switch Controls -->
                <div class="border-t border-gray-200 pt-4">
                    <h4 class="text-sm font-medium text-gray-900 mb-3">Switch Mode</h4>
                    <div class="flex items-center space-x-4">
                        <button @click="switchMode('test')"
                            :disabled="switching || config.mode === 'test' || !config.hasTestKeys"
                            class="px-4 py-2 bg-yellow-500 text-white rounded-lg font-medium hover:bg-yellow-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                            <div class="flex items-center space-x-2">
                                <svg v-if="switching && targetMode === 'test'" class="animate-spin w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Switch to Test</span>
                            </div>
                        </button>

                        <button @click="switchMode('live')"
                            :disabled="switching || config.mode === 'live' || !config.hasLiveKeys"
                            class="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                            <div class="flex items-center space-x-2">
                                <svg v-if="switching && targetMode === 'live'" class="animate-spin w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                <span>Switch to Live</span>
                            </div>
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">
                        ⚠️ Switching modes will affect all new payments immediately
                    </p>
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
                <svg class="w-5 h-5 text-blue-500 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                    <h4 class="text-sm font-medium text-blue-800">About Stripe Modes</h4>
                    <div class="text-sm text-blue-700 mt-1 space-y-1">
                        <p><strong>Test Mode:</strong> Safe for development and testing. No real payments processed.</p>
                        <p><strong>Live Mode:</strong> Real payments will be processed. Use with caution.</p>
                        <p><strong>Switching:</strong> Changes take effect immediately for new payments.</p>
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
                '⚠️ WARNING: You are about to switch to LIVE mode!\n\n' +
                'This will process real payments immediately.\n' +
                'Are you absolutely sure you want to continue?'
            )
            if (!confirmed) return
        }

        switching.value = true
        targetMode.value = mode

        await apiClient.switchStripeMode(mode)

        notifications.success(
            `Successfully switched to ${mode.toUpperCase()} mode`,
            `Stripe is nu ingesteld op ${mode.toUpperCase()} modus.`
        )
        // Reload configuration
        await loadConfig()

    } catch (err) {
        console.error('Error switching Stripe mode:', err)
        notifications.error(`Failed to switch to ${mode} mode`, err?.message || `Er is een fout opgetreden bij het wijzigen naar ${mode} modus.`)
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
