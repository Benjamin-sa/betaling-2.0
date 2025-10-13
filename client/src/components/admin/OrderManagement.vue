<template>
    <div class="space-y-6">
        <!-- Order Statistics Cards -->
        <div v-if="statistics" class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-gradient-to-br from-primary to-green-600 rounded-2xl p-6 text-white shadow-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-primary-light text-sm font-medium">Totaal Bestellingen</p>
                        <p class="text-3xl font-bold">{{ statistics.summary.totalOrders }}</p>
                    </div>
                    <div class="p-3 bg-white/20 rounded-full">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-green-100 text-sm font-medium">Totale Omzet</p>
                        <p class="text-3xl font-bold">€{{ statistics.summary.totalRevenue.toFixed(2) }}</p>
                    </div>
                    <div class="p-3 bg-white/20 rounded-full">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1">
                            </path>
                        </svg>
                    </div>
                </div>
            </div>

            <div class="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 text-white shadow-xl">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-blue-100 text-sm font-medium">Gemiddelde Bestelling</p>
                        <p class="text-3xl font-bold">€{{ statistics.summary.averageOrderValue.toFixed(2) }}</p>
                    </div>
                    <div class="p-3 bg-white/20 rounded-full">
                        <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z">
                            </path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters Section -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span class="w-2 h-6 bg-gradient-to-b from-primary to-green-600 rounded-full mr-3"></span>
                Filters & Zoeken
            </h3>

            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <!-- Search -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Zoeken</label>
                    <input v-model="filters.search" type="text" placeholder="Zoek op bestelling ID, email of product..."
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        @input="debouncedSearch" />
                </div>

                <!-- Event Filter -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Event</label>
                    <select v-model="filters.eventId"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none cursor-pointer"
                        @change="loadOrders">
                        <option value="">Alle events</option>
                        <option v-for="event in events" :key="event.id" :value="event.id">
                            {{ event.name }}
                        </option>
                    </select>
                </div>

                <!-- Payment Method Filter -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Betaalmethode</label>
                    <select v-model="filters.paymentMethod"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none cursor-pointer"
                        @change="loadOrders">
                        <option value="">Alle methoden</option>
                        <option value="stripe">Stripe</option>
                        <option value="manual">Handmatig</option>
                    </select>
                </div>

                <!-- Date Range -->
                <div>
                    <label class="block text-sm font-medium text-gray-700 mb-2">Datum van</label>
                    <input v-model="filters.dateFrom" type="date"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        @change="loadOrders" />
                </div>

                <div class="md:col-start-2 lg:col-start-5">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Datum tot</label>
                    <input v-model="filters.dateTo" type="date"
                        class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                        @change="loadOrders" />
                </div>
            </div>

            <!-- Action Buttons -->
            <div class="flex flex-wrap gap-3 mt-4">
                <button @click="clearFilters"
                    class="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors duration-200">
                    Filters Wissen
                </button>
                <button @click="exportOrders"
                    class="bg-gradient-to-r from-primary to-green-600 text-white px-4 py-2 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    :disabled="loading">
                    <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <svg v-else class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-4-4m4 4l4-4m-4-4V3m0 3a3 3 0 013 3v1"></path>
                    </svg>
                    {{ loading ? 'Exporteren...' : 'Export CSV' }}
                </button>
            </div>
        </div>

        <!-- Orders Table -->
        <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div class="p-6 border-b border-gray-200">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 class="text-lg font-bold text-gray-900 flex items-center">
                        <span class="w-2 h-6 bg-gradient-to-b from-primary to-green-600 rounded-full mr-3"></span>
                        Bestellingen
                        <span v-if="pagination" class="ml-2 text-sm font-normal text-gray-500">
                            ({{ pagination.totalOrders }} totaal)
                        </span>
                    </h3>

                    <!-- Sort Controls -->
                    <div class="flex items-center gap-2">
                        <label class="text-sm font-medium text-gray-700">Sorteer:</label>
                        <select v-model="sortBy"
                            class="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                            @change="loadOrders">
                            <option value="createdAt">Datum</option>
                            <option value="amountTotal">Bedrag</option>
                            <option value="userId">Klant</option>
                        </select>
                        <button @click="toggleSortOrder"
                            class="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                            <svg class="w-4 h-4" :class="{ 'rotate-180': sortOrder === 'asc' }" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="p-8">
                <div class="space-y-4">
                    <div v-for="i in 5" :key="i" class="animate-pulse">
                        <div class="flex items-center space-x-4">
                            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                            <div class="h-4 bg-gray-200 rounded w-1/3"></div>
                            <div class="h-4 bg-gray-200 rounded w-1/6"></div>
                            <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Orders List -->
            <div v-else-if="orders.length > 0" class="divide-y divide-gray-200">
                <div v-for="order in orders" :key="order.id"
                    class="p-6 hover:bg-gray-50 transition-colors duration-200">
                    <div class="grid grid-cols-1 lg:grid-cols-4 gap-4 items-start">
                        <!-- Order Info -->
                        <div>
                            <div class="flex items-center gap-2">
                                <p class="font-bold text-gray-900">
                                    <span v-if="order.orderNumber" class="text-primary">#{{ order.orderNumber }}</span>
                                    <span v-else>{{ formatOrderId(order.id) }}</span>
                                </p>
                                <button 
                                    @click="copyOrderId(order.id)"
                                    :title="`Kopieer volledige order ID: ${order.id}`"
                                    class="p-1 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                >
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                                    </svg>
                                </button>
                            </div>
                            <p class="text-sm text-gray-600">{{ formatDate(order.createdAt) }}</p>
                            <p class="text-sm text-gray-600">{{ order.userEmail }}</p>
                        </div>

                        <!-- Items -->
                        <div>
                            <p class="font-semibold text-gray-900 mb-1">Items:</p>
                            <div class="space-y-1">
                                <p v-for="item in order.items" :key="item.id" class="text-sm text-gray-600">
                                    {{ item.quantity }}x {{ item.productName }}
                                    <span v-if="item.shiftId" class="text-blue-600">(Shift)</span>
                                </p>
                            </div>
                        </div>

                        <!-- Payment & Event -->
                        <div>
                            <p class="font-semibold text-gray-900">€{{ order.amountTotal?.toFixed(2) }}</p>
                            <p class="text-sm text-gray-600 capitalize">{{ order.paymentMethod }}</p>
                            <p v-if="order.eventId" class="text-sm text-blue-600">
                                {{ getEventName(order.eventId) }}
                            </p>
                        </div>

                        <!-- Status & Actions -->
                        <div class="flex items-center justify-between">
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                                :class="getStatusClass(order)">
                                {{ getOrderStatus(order) }}
                            </span>
                            <button @click="viewOrderDetails(order)"
                                class="text-primary hover:text-primary-dark font-medium text-sm transition-colors duration-200">
                                Details
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else class="p-12 text-center">
                <svg class="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z">
                    </path>
                </svg>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">Geen bestellingen gevonden</h3>
                <p class="text-gray-600">Geen bestellingen gevonden met de huidige filters.</p>
            </div>
        </div>

        <!-- Pagination -->
        <div v-if="pagination && pagination.totalPages > 1"
            class="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div class="text-sm text-gray-700">
                Pagina {{ pagination.currentPage }} van {{ pagination.totalPages }}
                ({{ pagination.totalOrders }} totaal)
            </div>

            <div class="flex items-center gap-2">
                <button @click="goToPage(pagination.currentPage - 1)" :disabled="!pagination.hasPrev"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200">
                    Vorige
                </button>

                <span class="px-3 py-2 text-sm font-medium text-gray-700">
                    {{ pagination.currentPage }}
                </span>

                <button @click="goToPage(pagination.currentPage + 1)" :disabled="!pagination.hasNext"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors duration-200">
                    Volgende
                </button>
            </div>
        </div>

        <!-- CSV Export Builder Modal -->
        <CsvExportBuilder
            v-model="showExportBuilder"
            :orders="allOrdersForExport"
            :events="events"
            @export="handleExportWithConfig"
        />
    </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useNotificationStore } from '@/stores/notifications'
import { apiClient } from '@/services/api'
import CsvExportBuilder from './CsvExportBuilder.vue'

// Props
const props = defineProps({
    events: {
        type: Array,
        default: () => []
    }
})

// Composables
const notifications = useNotificationStore()

// Reactive data
const orders = ref([])
const statistics = ref(null)
const loading = ref(false)
const pagination = ref(null)
const showExportBuilder = ref(false)
const allOrdersForExport = ref([])

const filters = reactive({
    search: '',
    eventId: '',
    paymentMethod: '',
    dateFrom: '',
    dateTo: ''
})

const sortBy = ref('createdAt')
const sortOrder = ref('desc')
const currentPage = ref(1)
const itemsPerPage = ref(25)

// Debounced search
let searchTimeout = null
const debouncedSearch = () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        loadOrders()
    }, 500)
}

// Methods
const loadOrders = async () => {
    try {
        loading.value = true

        // Load orders with filters
        const response = await apiClient.getAdminOrdersFiltered(
            { ...filters },
            {
                sortBy: sortBy.value,
                sortOrder: sortOrder.value,
                page: currentPage.value,
                limit: itemsPerPage.value
            }
        )

        orders.value = response.orders || []
        pagination.value = response.pagination

        // Load statistics
        const statsResponse = await apiClient.getOrderStatistics({
            eventId: filters.eventId,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo
        })
        statistics.value = statsResponse.statistics

    } catch (error) {
        console.error('Error loading orders:', error)
        notifications.error('Fout', 'Kon bestellingen niet laden')
    } finally {
        loading.value = false
    }
}

const clearFilters = () => {
    Object.keys(filters).forEach(key => {
        filters[key] = ''
    })
    currentPage.value = 1
    loadOrders()
}

const toggleSortOrder = () => {
    sortOrder.value = sortOrder.value === 'desc' ? 'asc' : 'desc'
    loadOrders()
}

const goToPage = (page) => {
    currentPage.value = page
    loadOrders()
}

const exportOrders = async () => {
    try {
        loading.value = true
        
        // Get all orders with current filters (no pagination for export)
        const response = await apiClient.getAdminOrdersFiltered(
            { ...filters },
            {
                sortBy: sortBy.value,
                sortOrder: sortOrder.value,
                page: 1,
                limit: 10000, // Large limit to get all orders
                export: true
            }
        )

        allOrdersForExport.value = response.orders || []
        
        if (allOrdersForExport.value.length === 0) {
            notifications.warning('Geen data', 'Geen bestellingen gevonden om te exporteren')
            return
        }

        // Open the export builder modal
        showExportBuilder.value = true
        
    } catch (error) {
        console.error('Export error:', error)
        notifications.error('Export Fout', 'Kon orders niet laden voor export')
    } finally {
        loading.value = false
    }
}

const handleExportWithConfig = (config) => {
    try {
        const csvContent = config.format === 'detailed' 
            ? convertOrdersToDetailedCSV(allOrdersForExport.value, config)
            : convertOrdersToCompactCSV(allOrdersForExport.value, config);
        
        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob)
            link.setAttribute('href', url)
            link.setAttribute('download', generateFilename(config))
            link.style.visibility = 'hidden'
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            URL.revokeObjectURL(url)
        }

        showExportBuilder.value = false
        notifications.success('Export voltooid', `${allOrdersForExport.value.length} bestellingen geëxporteerd naar CSV`)
        
    } catch (error) {
        console.error('Export error:', error)
        notifications.error('Export Fout', 'Kon orders niet exporteren')
    }
}

const convertOrdersToDetailedCSV = (orders, config) => {
    // Sort orders if groupByEvent is enabled
    let sortedOrders = [...orders]
    if (config.groupByEvent) {
        sortedOrders.sort((a, b) => {
            const eventA = getEventName(a.eventId)
            const eventB = getEventName(b.eventId)
            return eventA.localeCompare(eventB)
        })
    }

    // Build headers based on configuration
    const headers = []
    const columnMap = {
        orderId: 'Bestelling ID',
        orderNumber: 'Bestelling #',
        date: 'Datum',
        customerEmail: 'Klant Email',
        event: 'Event',
        shift: 'Shift',
        totalAmount: 'Totaal (€)',
        paymentMethod: 'Betaalmethode',
        status: 'Status',
        itemCount: 'Totaal Items',
        firebaseUid: 'Firebase UID',
        stripeCustomerId: 'Stripe Customer ID',
        confirmedAt: 'Bevestigd Op',
        confirmedBy: 'Bevestigd Door'
    }

    config.columns.forEach(colId => {
        headers.push(columnMap[colId] || colId)
    })

    // Add product columns if enabled
    if (config.includeProductColumns) {
        config.uniqueProducts.forEach(product => {
            headers.push(product)
        })
    }

    const csvArray = config.includeHeaders ? [headers] : []

    // Build data rows
    sortedOrders.forEach(order => {
        const row = []
        
        config.columns.forEach(colId => {
            switch(colId) {
                case 'orderId':
                    row.push(`"${order.id || ''}"`)
                    break
                case 'orderNumber':
                    row.push(`"${order.orderNumber || ''}"`)
                    break
                case 'date':
                    row.push(`"${formatDateForExport(order.createdAt)}"`)
                    break
                case 'customerEmail':
                    row.push(`"${order.userEmail || ''}"`)
                    break
                case 'event':
                    row.push(`"${getEventName(order.eventId)}"`)
                    break
                case 'shift':
                    row.push(`"${order.shiftName || ''}"`)
                    break
                case 'totalAmount':
                    row.push(order.amountTotal ? order.amountTotal.toFixed(2) : '0.00')
                    break
                case 'paymentMethod':
                    row.push(`"${order.paymentMethod || ''}"`)
                    break
                case 'status':
                    row.push(`"${getOrderStatus(order)}"`)
                    break
                case 'itemCount':
                    row.push(order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0)
                    break
                case 'firebaseUid':
                    row.push(`"${order.userId || ''}"`)
                    break
                case 'stripeCustomerId':
                    row.push(`"${order.stripeCustomerId || ''}"`)
                    break
                case 'confirmedAt':
                    row.push(`"${formatDateForExport(order.manualPaymentConfirmedAt)}"`)
                    break
                case 'confirmedBy':
                    row.push(`"${order.manualPaymentConfirmedBy || ''}"`)
                    break
                default:
                    row.push('""')
            }
        })

        // Add product quantities
        if (config.includeProductColumns) {
            config.uniqueProducts.forEach(productName => {
                let quantity = 0
                order.items?.forEach(item => {
                    let itemName = item.productName
                    if (config.includeShiftColumns && item.shiftId) {
                        itemName = `${item.productName} (${item.shiftName || 'Shift'})`
                    }
                    if (itemName === productName) {
                        quantity += item.quantity || 0
                    }
                })
                row.push(quantity)
            })
        }

        csvArray.push(row)
    })

    // Add summary row if enabled
    if (config.includeSummaryRow && config.includeProductColumns) {
        const summaryRow = []
        
        // Fill regular columns
        config.columns.forEach((colId, index) => {
            if (index === 0) {
                summaryRow.push('"TOTAAL"')
            } else if (colId === 'totalAmount') {
                const total = sortedOrders.reduce((sum, order) => sum + (order.amountTotal || 0), 0)
                summaryRow.push(total.toFixed(2))
            } else if (colId === 'itemCount') {
                const total = sortedOrders.reduce((sum, order) => 
                    sum + (order.items?.reduce((itemSum, item) => itemSum + (item.quantity || 0), 0) || 0), 0)
                summaryRow.push(total)
            } else {
                summaryRow.push('""')
            }
        })

        // Calculate totals for each product
        if (config.includeProductColumns) {
            config.uniqueProducts.forEach(productName => {
                let total = 0
                sortedOrders.forEach(order => {
                    order.items?.forEach(item => {
                        let itemName = item.productName
                        if (config.includeShiftColumns && item.shiftId) {
                            itemName = `${item.productName} (${item.shiftName || 'Shift'})`
                        }
                        if (itemName === productName) {
                            total += item.quantity || 0
                        }
                    })
                })
                summaryRow.push(total)
            })
        }

        csvArray.push(summaryRow)
    }

    return csvArray.map(row => row.join(',')).join('\n')
}

const convertOrdersToCompactCSV = (orders, config) => {
    const headers = []
    const columnMap = {
        orderId: 'Bestelling ID',
        orderNumber: 'Bestelling #',
        date: 'Datum',
        customerEmail: 'Klant Email',
        event: 'Event',
        shift: 'Shift',
        totalAmount: 'Totaal (€)',
        paymentMethod: 'Betaalmethode',
        status: 'Status',
        itemCount: 'Totaal Items',
        firebaseUid: 'Firebase UID',
        stripeCustomerId: 'Stripe Customer ID',
        confirmedAt: 'Bevestigd Op',
        confirmedBy: 'Bevestigd Door'
    }

    config.columns.forEach(colId => {
        headers.push(columnMap[colId] || colId)
    })
    
    // Add products column for compact view
    headers.push('Producten')

    const csvArray = config.includeHeaders ? [headers] : []

    orders.forEach(order => {
        const row = []
        
        config.columns.forEach(colId => {
            switch(colId) {
                case 'orderId':
                    row.push(`"${order.id || ''}"`)
                    break
                case 'orderNumber':
                    row.push(`"${order.orderNumber || ''}"`)
                    break
                case 'date':
                    row.push(`"${formatDateForExport(order.createdAt)}"`)
                    break
                case 'customerEmail':
                    row.push(`"${order.userEmail || ''}"`)
                    break
                case 'event':
                    row.push(`"${getEventName(order.eventId)}"`)
                    break
                case 'shift':
                    row.push(`"${order.shiftName || ''}"`)
                    break
                case 'totalAmount':
                    row.push(order.amountTotal ? order.amountTotal.toFixed(2) : '0.00')
                    break
                case 'paymentMethod':
                    row.push(`"${order.paymentMethod || ''}"`)
                    break
                case 'status':
                    row.push(`"${getOrderStatus(order)}"`)
                    break
                case 'itemCount':
                    row.push(order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0)
                    break
                case 'firebaseUid':
                    row.push(`"${order.userId || ''}"`)
                    break
                case 'stripeCustomerId':
                    row.push(`"${order.stripeCustomerId || ''}"`)
                    break
                case 'confirmedAt':
                    row.push(`"${formatDateForExport(order.manualPaymentConfirmedAt)}"`)
                    break
                case 'confirmedBy':
                    row.push(`"${order.manualPaymentConfirmedBy || ''}"`)
                    break
                default:
                    row.push('""')
            }
        })

        // Add combined products
        const productList = order.items?.map(item => 
            `${item.quantity}x ${item.productName}${item.shiftId ? ' (Shift)' : ''}`
        ).join('; ') || 'Geen items'
        row.push(`"${productList}"`)

        csvArray.push(row)
    })

    return csvArray.map(row => row.join(',')).join('\n')
}

const formatDateForExport = (timestamp) => {
    if (!timestamp) return ''
    
    try {
        let date
        if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
            date = timestamp.toDate()
        } else if (timestamp && timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000)
        } else {
            date = new Date(timestamp)
        }
        
        return date.toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        })
    } catch (error) {
        return ''
    }
}

const generateFilename = (config = null) => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '-') // HH-MM-SS
    
    let filename = `bestellingen_${dateStr}_${timeStr}`
    
    // Add format type
    if (config) {
        filename += `_${config.format}`
    }
    
    // Add filter info to filename
    const filterParts = []
    if (filters.eventId) {
        const eventName = getEventName(filters.eventId).replace(/[^a-zA-Z0-9]/g, '_')
        filterParts.push(`event_${eventName}`)
    }
    if (filters.paymentMethod) {
        filterParts.push(`payment_${filters.paymentMethod}`)
    }
    if (filters.dateFrom) {
        filterParts.push(`van_${filters.dateFrom}`)
    }
    if (filters.dateTo) {
        filterParts.push(`tot_${filters.dateTo}`)
    }
    
    if (filterParts.length > 0) {
        filename += `_${filterParts.join('_')}`
    }
    
    return `${filename}.csv`
}

const viewOrderDetails = (order) => {
    // In a real implementation, you would open a modal or navigate to details page
    console.log('View order details:', order)
    notifications.info('Details', 'Order details functionaliteit wordt binnenkort toegevoegd')
}

const getEventName = (eventId) => {
    const event = props.events.find(e => e.id === eventId)
    return event ? event.name : 'Onbekend event'
}

const getOrderStatus = (order) => {
    if (order.manualPaymentConfirmedAt) return 'Handmatig bevestigd'
    if (order.paymentMethod === 'stripe') return 'Betaald'
    return 'In behandeling'
}

const getStatusClass = (order) => {
    if (order.manualPaymentConfirmedAt || order.paymentMethod === 'stripe') {
        return 'bg-green-100 text-green-800'
    }
    return 'bg-yellow-100 text-yellow-800'
}

const formatDate = (timestamp) => {
    if (!timestamp) return 'Onbekend'
    
    try {
        let date
        if (timestamp && typeof timestamp === 'object' && timestamp.toDate) {
            date = timestamp.toDate()
        } else if (timestamp && timestamp.seconds) {
            date = new Date(timestamp.seconds * 1000)
        } else {
            date = new Date(timestamp)
        }
        
        return date.toLocaleDateString('nl-NL', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    } catch (error) {
        return 'Onbekende datum'
    }
}

const formatOrderId = (orderId) => {
    if (!orderId) return 'Onbekend'
    
    // For Stripe session IDs (cs_test_...) or (cs_live_...)
    if (orderId.startsWith('cs_')) {
        // Extract meaningful part and create shorter display
        const parts = orderId.split('_')
        if (parts.length >= 3) {
            // Show prefix + first 8 chars of the actual ID
            const prefix = `${parts[0]}_${parts[1]}`
            const shortId = parts[2].substring(0, 8)
            return `${prefix}_${shortId}...`
        }
    }
    
    // For other IDs, just truncate
    if (orderId.length > 20) {
        return `${orderId.substring(0, 16)}...`
    }
    
    return orderId
}

const copyOrderId = async (orderId) => {
    try {
        await navigator.clipboard.writeText(orderId)
        notifications.success('Gekopieerd', 'Order ID is gekopieerd naar klembord')
    } catch (error) {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = orderId
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        notifications.success('Gekopieerd', 'Order ID is gekopieerd naar klembord')
    }
}

// Initialize
onMounted(() => {
    loadOrders()
})
</script>

<style scoped>
.animate-fade-in {
    animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.rotate-180 {
    transform: rotate(180deg);
}
</style>
