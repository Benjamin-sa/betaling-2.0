<template>
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
                <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Email Delivery Tracking</h2>
                <p class="mt-1 text-sm text-gray-600">
                    Monitor order confirmation email delivery status and troubleshoot issues
                </p>
            </div>
            <button @click="refreshData" :disabled="loading"
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

        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" v-if="statistics">
            <div class="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-2xl p-6">
                <div class="flex items-center">
                    <div class="p-2 bg-green-500 rounded-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-green-600">Sent Successfully</p>
                        <p class="text-2xl font-bold text-green-900">{{ statistics.sent || 0 }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-2xl p-6">
                <div class="flex items-center">
                    <div class="p-2 bg-red-500 rounded-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-red-600">Failed</p>
                        <p class="text-2xl font-bold text-red-900">{{ statistics.failed || 0 }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 border border-yellow-200 rounded-2xl p-6">
                <div class="flex items-center">
                    <div class="p-2 bg-yellow-500 rounded-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-yellow-600">Skipped</p>
                        <p class="text-2xl font-bold text-yellow-900">{{ statistics.skipped || 0 }}</p>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-2xl p-6">
                <div class="flex items-center">
                    <div class="p-2 bg-blue-500 rounded-lg">
                        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <div class="ml-4">
                        <p class="text-sm font-medium text-blue-600">Total</p>
                        <p class="text-2xl font-bold text-blue-900">{{ statistics.total || 0 }}</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <select v-model="filters.status" @change="loadEmailLogs"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary">
                        <option value="">All Statuses</option>
                        <option value="sent">Sent</option>
                        <option value="failed">Failed</option>
                        <option value="skipped">Skipped</option>
                    </select>
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Order ID</label>
                    <input v-model="filters.orderId" @input="debouncedSearch" type="text"
                        placeholder="Enter order ID..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">User Email</label>
                    <input v-model="filters.userEmail" @input="debouncedSearch" type="email"
                        placeholder="Enter email address..."
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>

                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
                    <input v-model="filters.dateFrom" @change="loadEmailLogs" type="date"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                </div>
            </div>

            <div class="mt-4 flex justify-end">
                <button @click="clearFilters"
                    class="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200">
                    Clear Filters
                </button>
            </div>
        </div>

        <!-- Email Logs Table -->
        <div class="bg-white rounded-2xl border border-gray-200 overflow-hidden">
            <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900">Email Delivery Logs</h3>
            </div>

            <div v-if="loading" class="p-8 text-center">
                <div class="inline-flex items-center space-x-2">
                    <svg class="animate-spin w-5 h-5 text-primary" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <span class="text-gray-600">Loading email logs...</span>
                </div>
            </div>

            <div v-else-if="emailLogs.length === 0" class="p-8 text-center">
                <svg class="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <p class="text-gray-600">No email logs found</p>
                <p class="text-sm text-gray-500 mt-1">Try adjusting your filters or check back later</p>
            </div>

            <div v-else class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Order ID
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                User Email
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Status
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Sent At
                            </th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Error
                            </th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        <tr v-for="log in emailLogs" :key="log.id"
                            class="hover:bg-gray-50 transition-colors duration-200">
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm font-medium text-gray-900">{{ log.orderId }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <div class="text-sm text-gray-900">{{ log.userEmail }}</div>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap">
                                <span :class="getStatusClass(log.status)"
                                    class="inline-flex px-2 py-1 text-xs font-semibold rounded-full">
                                    {{ log.status }}
                                </span>
                            </td>
                            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {{ formatDate(log.sentAt) }}
                            </td>
                            <td class="px-6 py-4">
                                <div v-if="log.errorMessage" class="text-sm text-red-600 max-w-xs truncate"
                                    :title="log.errorMessage">
                                    {{ log.errorMessage }}
                                </div>
                                <span v-else class="text-sm text-gray-400">-</span>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Pagination -->
            <div v-if="pagination.totalPages > 1"
                class="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div class="flex-1 flex justify-between sm:hidden">
                    <button @click="goToPage(pagination.currentPage - 1)" :disabled="!pagination.hasPrev"
                        class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Previous
                    </button>
                    <button @click="goToPage(pagination.currentPage + 1)" :disabled="!pagination.hasNext"
                        class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                        Next
                    </button>
                </div>
                <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p class="text-sm text-gray-700">
                            Showing <span class="font-medium">{{ (pagination.currentPage - 1) * 50 + 1 }}</span>
                            to <span class="font-medium">{{ Math.min(pagination.currentPage * 50, pagination.totalLogs)
                            }}</span>
                            of <span class="font-medium">{{ pagination.totalLogs }}</span> results
                        </p>
                    </div>
                    <div>
                        <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                            <button @click="goToPage(pagination.currentPage - 1)" :disabled="!pagination.hasPrev"
                                class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span class="sr-only">Previous</span>
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                            <span
                                class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                                Page {{ pagination.currentPage }} of {{ pagination.totalPages }}
                            </span>
                            <button @click="goToPage(pagination.currentPage + 1)" :disabled="!pagination.hasNext"
                                class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                                <span class="sr-only">Next</span>
                                <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                        clip-rule="evenodd" />
                                </svg>
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useNotificationStore } from '../../stores/notifications'
import { apiClient } from '../../services/api'

const notifications = useNotificationStore()

// Reactive data
const loading = ref(false)
const emailLogs = ref([])
const statistics = ref(null)
const pagination = reactive({
    currentPage: 1,
    totalPages: 1,
    totalLogs: 0,
    hasNext: false,
    hasPrev: false,
})

const filters = reactive({
    status: '',
    orderId: '',
    userEmail: '',
    dateFrom: '',
})

// Debounced search for text inputs
let searchTimeout = null
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadEmailLogs()
    }, 500)
}

// Load email logs from API
const loadEmailLogs = async (page = 1) => {
    try {
        loading.value = true

        const options = {
            page: page,
            limit: 50,
        }

        // Build filters object - only include non-empty values
        const activeFilters = {}
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value.trim()) {
                activeFilters[key] = value.trim()
            }
        })

        const response = await apiClient.getEmailLogs(activeFilters, options)

        if (response.success) {
            emailLogs.value = response.data.emailLogs || []

            const paginationData = response.data.pagination
            pagination.currentPage = paginationData.currentPage
            pagination.totalPages = paginationData.totalPages
            pagination.totalLogs = paginationData.totalLogs
            pagination.hasNext = paginationData.hasNext
            pagination.hasPrev = paginationData.hasPrev
        } else {
            throw new Error(response.message || 'Failed to load email logs')
        }
    } catch (error) {
        console.error('Error loading email logs:', error)
        notifications.addNotification('Failed to load email logs', 'error')
        emailLogs.value = []
    } finally {
        loading.value = false
    }
}

// Load email statistics
const loadStatistics = async () => {
    try {
        // Build filters object - only include non-empty values
        const activeFilters = {}
        if (filters.dateFrom) {
            activeFilters.dateFrom = filters.dateFrom
        }

        const response = await apiClient.getEmailStatistics(activeFilters)

        if (response.success) {
            statistics.value = response.data.statistics
        } else {
            throw new Error(response.message || 'Failed to load statistics')
        }
    } catch (error) {
        console.error('Error loading email statistics:', error)
        notifications.addNotification('Failed to load email statistics', 'error')
    }
}

// Refresh all data
const refreshData = async () => {
    await Promise.all([
        loadEmailLogs(pagination.currentPage),
        loadStatistics()
    ])
}

// Go to specific page
const goToPage = (page) => {
    if (page >= 1 && page <= pagination.totalPages) {
        loadEmailLogs(page)
    }
}

// Clear all filters
const clearFilters = () => {
    filters.status = ''
    filters.orderId = ''
    filters.userEmail = ''
    filters.dateFrom = ''
    loadEmailLogs(1)
}

// Get status badge class
const getStatusClass = (status) => {
    switch (status) {
        case 'sent':
            return 'bg-green-100 text-green-800'
        case 'failed':
            return 'bg-red-100 text-red-800'
        case 'skipped':
            return 'bg-yellow-100 text-yellow-800'
        default:
            return 'bg-gray-100 text-gray-800'
    }
}

// Format date for display
const formatDate = (dateString) => {
    if (!dateString) return '-'

    try {
        const date = new Date(dateString)
        return date.toLocaleString('nl-NL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    } catch (error) {
        return dateString
    }
}

// Load initial data
onMounted(async () => {
    await refreshData()
})
</script>
