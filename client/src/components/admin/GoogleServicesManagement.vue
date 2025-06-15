<template>
    <div class="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
        <!-- Header Section -->
        <div class="flex items-center justify-between mb-8">
            <div>
                <h2 class="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                    🔐 Google Services Management
                </h2>
                <p class="text-sm text-gray-600">
                    Unified management for Gmail and Google Drive integration using OAuth2
                </p>
            </div>
            <button @click="refreshStatus" :disabled="isRefreshing"
                class="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 disabled:opacity-50">
                <span v-if="isRefreshing" class="flex items-center">
                    <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Refreshing...
                </span>
                <span v-else>🔄 Refresh Status</span>
            </button>
        </div>

        <!-- Authentication Status Overview -->
        <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">🔑 OAuth2 Authentication Status</h3>

            <!-- Main OAuth2 Status Card -->
            <div :class="[
                'p-6 rounded-xl border-2 mb-6',
                googleStatus?.oauth2?.authenticated
                    ? 'bg-green-50 border-green-200'
                    : 'bg-yellow-50 border-yellow-200'
            ]">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div :class="[
                            'w-4 h-4 rounded-full',
                            googleStatus?.oauth2?.authenticated ? 'bg-green-500' : 'bg-yellow-500'
                        ]"></div>
                        <h4 class="text-xl font-bold">
                            Google OAuth2 Connection
                        </h4>
                    </div>
                    <span :class="[
                        'px-3 py-1 rounded-full text-sm font-medium',
                        googleStatus?.oauth2?.authenticated
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                    ]">
                        {{ googleStatus?.oauth2?.authenticated ? 'Connected' : 'Setup Required' }}
                    </span>
                </div>

                <div v-if="googleStatus?.oauth2" class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span class="text-gray-600">Email:</span>
                        <p class="font-medium">{{ googleStatus.oauth2.email || 'Not configured' }}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Connected At:</span>
                        <p class="font-medium">{{ formatDate(googleStatus.oauth2.createdAt) }}</p>
                    </div>
                    <div>
                        <span class="text-gray-600">Allowed Email:</span>
                        <p class="font-medium">{{ googleStatus.oauth2.allowedEmail || 'Any' }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Main Actions Section -->
        <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">⚡ Actions</h3>

            <div class="flex flex-wrap gap-3">
                <!-- Setup/Connect Button -->
                <button v-if="!googleStatus?.oauth2?.authenticated" @click="setupGoogleAuth" :disabled="isLoading"
                    class="bg-gradient-to-r from-primary to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50">
                    <span v-if="isLoading" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Setting up...
                    </span>
                    <span v-else>🔐 Connect Google Services</span>
                </button>

                <!-- Reload Tokens Button -->
                <button v-if="googleStatus?.oauth2?.authenticated" @click="reloadTokens" :disabled="isReloadingTokens"
                    class="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-orange-600 hover:to-orange-700 transition-all duration-200 disabled:opacity-50">
                    <span v-if="isReloadingTokens" class="flex items-center">
                        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none"
                            viewBox="0 0 24 24">
                            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                            </circle>
                            <path class="opacity-75" fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                            </path>
                        </svg>
                        Reloading...
                    </span>
                    <span v-else">🔄 Reload Tokens</span>
                </button>
            </div>
        </div>

        <!-- Setup Instructions -->
        <div v-if="!googleStatus?.oauth2?.authenticated" class="mb-8">
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 class="text-lg font-semibold text-blue-900 mb-4">📝 Setup Instructions</h3>
                <div class="space-y-3 text-blue-800">
                    <div class="flex items-start space-x-3">
                        <div
                            class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                            1</div>
                        <p>Click "Connect Google Services" to start the OAuth2 authorization process</p>
                    </div>
                    <div class="flex items-start space-x-3">
                        <div
                            class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                            2</div>
                        <p>Log in with <strong>groepsleiding@lodlavki.be</strong> and grant permissions for Gmail and
                            Drive</p>
                    </div>
                    <div class="flex items-start space-x-3">
                        <div
                            class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                            3</div>
                        <p>You'll be automatically redirected back to this admin panel</p>
                    </div>
                    <div class="flex items-start space-x-3">
                        <div
                            class="w-6 h-6 bg-blue-200 rounded-full flex items-center justify-center text-xs font-bold text-blue-800">
                            4</div>
                        <p>Test Gmail with the "Send Test Email" button</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Error Messages -->
        <div v-if="error" class="mb-6">
            <div class="bg-red-50 border border-red-200 rounded-xl p-4">
                <div class="flex items-start">
                    <span class="text-red-600 text-lg mr-3">❌</span>
                    <div>
                        <h4 class="font-medium text-red-900">Error</h4>
                        <p class="text-sm text-red-700 mt-1">{{ error }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Success Messages -->
        <div v-if="success" class="mb-6">
            <div class="bg-green-50 border border-green-200 rounded-xl p-4">
                <div class="flex items-start">
                    <span class="text-green-600 text-lg mr-3">✅</span>
                    <div>
                        <h4 class="font-medium text-green-900">Success</h4>
                        <p class="text-sm text-green-700 mt-1">{{ success }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { apiClient } from '../../services/api.js';

// Reactive state
const isLoading = ref(false);
const isRefreshing = ref(false);
const isReloadingTokens = ref(false);
const isSendingTest = ref(false);
const googleStatus = ref(null);
const error = ref('');
const success = ref('');

// Check for URL parameters on mount (OAuth callback results)
onMounted(() => {
    checkUrlParams();
    refreshStatus();
});

const checkUrlParams = () => {
    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get('gmail_success')) {
        success.value = 'Google Services connected successfully! Both Gmail and Drive are now ready.';
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        // Refresh status after success
        setTimeout(() => {
            refreshStatus();
            clearMessages();
        }, 2000);
    }

    if (urlParams.get('gmail_error')) {
        const errorMsg = urlParams.get('gmail_error');
        error.value = `Google Services connection failed: ${errorMsg}`;
        // Clean URL
        window.history.replaceState({}, '', window.location.pathname);
        setTimeout(clearMessages, 5000);
    }
};

// Get comprehensive Google services status
const refreshStatus = async () => {
    isRefreshing.value = true;
    try {
        const response = await apiClient.getGoogleAuthStatus();
        googleStatus.value = response;
    } catch (err) {
        console.error('Error refreshing Google services status:', err);
        error.value = err.message || 'Failed to load Google services status';
        setTimeout(clearMessages, 5000);
    } finally {
        isRefreshing.value = false;
    }
};

// Setup Google OAuth2 authorization
const setupGoogleAuth = async () => {
    isLoading.value = true;
    try {
        const response = await apiClient.setupGoogleAuth();
        const { authUrl } = response;

        // Open authorization URL in current window
        window.location.href = authUrl;
    } catch (err) {
        console.error('Error setting up Google auth:', err);
        error.value = err.message || 'Failed to setup Google authorization';
        setTimeout(clearMessages, 5000);
        isLoading.value = false;
    }
};

// Reload Google OAuth2 tokens
const reloadTokens = async () => {
    isReloadingTokens.value = true;
    try {
        const response = await apiClient.reloadGoogleTokens();

        if (response.success) {
            success.value = response.message || 'Google services tokens reloaded successfully';
            await refreshStatus(); // Refresh status
        } else {
            error.value = response.message || 'Failed to reload Google services tokens';
        }

        setTimeout(clearMessages, 3000);
    } catch (err) {
        console.error('Error reloading Google tokens:', err);
        error.value = err.message || 'Failed to reload Google services tokens';
        setTimeout(clearMessages, 5000);
    } finally {
        isReloadingTokens.value = false;
    }
};

// Send test email via Gmail
const sendTestEmail = async () => {
    isSendingTest.value = true;
    try {
        const response = await apiClient.sendTestEmail();
        success.value = response.message || 'Test email sent successfully';
        setTimeout(clearMessages, 3000);
    } catch (err) {
        console.error('Error sending test email:', err);
        error.value = err.message || 'Failed to send test email';
        setTimeout(clearMessages, 5000);
    } finally {
        isSendingTest.value = false;
    }
};

// Clear messages
const clearMessages = () => {
    error.value = '';
    success.value = '';
};

// Format date
const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString('nl-NL', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
</script>

<style scoped>
/* Custom scrollbar for image grid */
.grid {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
}

.grid::-webkit-scrollbar {
    width: 8px;
}

.grid::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
}

.grid::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 4px;
}

.grid::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
}
</style>
