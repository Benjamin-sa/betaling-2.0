<template>
    <BaseModal 
        :modelValue="modelValue" 
        @update:modelValue="$emit('update:modelValue', $event)"
        size="xl"
        :hideHeader="true"
        :hideFooter="true"
        :closeOnBackdrop="true"
    >
        <div class="flex flex-col h-full">
            <!-- Custom Header -->
            <div class="bg-gradient-to-r from-primary to-green-600 px-4 sm:px-6 py-4 sm:py-6 -mx-6 -mt-4 mb-6">
                <div class="flex items-center justify-between gap-3">
                    <div class="flex-1 min-w-0">
                        <h2 class="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">CSV Export Builder</h2>
                        <p class="text-sm sm:text-base text-emerald-100 hidden sm:block">Pas je export aan voor optimale analyse</p>
                    </div>
                    <button @click="closeModal" class="text-white hover:bg-white/20 p-2 rounded-lg transition-colors flex-shrink-0">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Content -->
            <div class="flex-1 overflow-y-auto -mx-6 px-4 sm:px-6">
                <!-- Export Format Selection -->
                <div class="mb-6 sm:mb-8">
                    <h3 class="text-base sm:text-lg font-bold text-gray-900 mb-3 sm:mb-4 flex items-center">
                        <span class="w-1.5 sm:w-2 h-5 sm:h-6 bg-gradient-to-b from-primary to-green-600 rounded-full mr-2 sm:mr-3"></span>
                        Export Formaat
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        <button
                            @click="exportConfig.format = 'detailed'"
                            :class="[
                                'p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 w-full',
                                exportConfig.format === 'detailed'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                            ]"
                        >
                            <div class="flex items-start space-x-2 sm:space-x-3">
                                <div class="flex-shrink-0 mt-0.5">
                                    <div :class="[
                                        'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center',
                                        exportConfig.format === 'detailed' ? 'border-primary' : 'border-gray-300'
                                    ]">
                                        <div v-if="exportConfig.format === 'detailed'" class="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-primary"></div>
                                    </div>
                                </div>
                                <div class="text-left flex-1 min-w-0">
                                    <p class="font-semibold text-gray-900 text-sm sm:text-base">Gedetailleerd <span class="text-primary">(Aanbevolen)</span></p>
                                    <p class="text-xs sm:text-sm text-gray-600 mt-0.5">Elk product krijgt zijn eigen kolom met aantallen</p>
                                </div>
                            </div>
                        </button>

                        <button
                            @click="exportConfig.format = 'compact'"
                            :class="[
                                'p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 w-full',
                                exportConfig.format === 'compact'
                                    ? 'border-primary bg-primary/5'
                                    : 'border-gray-200 hover:border-gray-300'
                            ]"
                        >
                            <div class="flex items-start space-x-2 sm:space-x-3">
                                <div class="flex-shrink-0 mt-0.5">
                                    <div :class="[
                                        'w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center',
                                        exportConfig.format === 'compact' ? 'border-primary' : 'border-gray-300'
                                    ]">
                                        <div v-if="exportConfig.format === 'compact'" class="w-2 sm:w-3 h-2 sm:h-3 rounded-full bg-primary"></div>
                                    </div>
                                </div>
                                <div class="text-left flex-1 min-w-0">
                                    <p class="font-semibold text-gray-900 text-sm sm:text-base">Compact</p>
                                    <p class="text-xs sm:text-sm text-gray-600 mt-0.5">Traditioneel formaat met gecombineerde producten</p>
                                </div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Column Selection -->
                <div class="mb-6 sm:mb-8">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-3 sm:mb-4">
                        <h3 class="text-base sm:text-lg font-bold text-gray-900 flex items-center">
                            <span class="w-1.5 sm:w-2 h-5 sm:h-6 bg-gradient-to-b from-primary to-green-600 rounded-full mr-2 sm:mr-3"></span>
                            Kolommen Selecteren
                        </h3>
                        <div class="flex gap-2 text-sm">
                            <button
                                @click="selectAllColumns"
                                class="text-primary hover:text-primary-dark font-medium transition-colors"
                            >
                                Alles selecteren
                            </button>
                            <span class="text-gray-300">|</span>
                            <button
                                @click="deselectAllColumns"
                                class="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                            >
                                Alles deselecteren
                            </button>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
                        <label
                            v-for="column in availableColumns"
                            :key="column.id"
                            class="flex items-start space-x-2 sm:space-x-3 p-2.5 sm:p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200"
                            :class="{ 'border-primary bg-primary/5': exportConfig.columns.includes(column.id) }"
                        >
                            <input
                                type="checkbox"
                                :value="column.id"
                                v-model="exportConfig.columns"
                                class="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary flex-shrink-0"
                            />
                            <div class="flex-1 min-w-0">
                                <p class="font-medium text-gray-900 text-xs sm:text-sm">{{ column.label }}</p>
                                <p class="text-xs text-gray-600 hidden sm:block">{{ column.description }}</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Product Breakdown (only for detailed format) -->
                <div v-if="exportConfig.format === 'detailed'" class="mb-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span class="w-2 h-6 bg-gradient-to-b from-primary to-green-600 rounded-full mr-3"></span>
                        Product Kolommen
                    </h3>
                    <div class="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 mb-4">
                        <div class="flex items-start space-x-3">
                            <svg class="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <p class="font-semibold text-blue-900 text-sm mb-1">Elk product krijgt zijn eigen kolom</p>
                                <p class="text-xs text-blue-700">
                                    Perfect voor het tellen van verkochte items. Elke kolom toont het aantal bestelde items van dat product.
                                    {{ uniqueProducts.length }} unieke producten gevonden.
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="space-y-3">
                        <label class="flex items-start space-x-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200"
                            :class="{ 'border-primary bg-primary/5': exportConfig.includeProductColumns }">
                            <input
                                type="checkbox"
                                v-model="exportConfig.includeProductColumns"
                                class="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 text-sm">Voeg productkolommen toe</p>
                                <p class="text-xs text-gray-600">Elk product krijgt een eigen kolom met aantal besteld</p>
                            </div>
                        </label>

                        <label class="flex items-start space-x-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200"
                            :class="{ 'border-primary bg-primary/5': exportConfig.includeShiftColumns }">
                            <input
                                type="checkbox"
                                v-model="exportConfig.includeShiftColumns"
                                class="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 text-sm">Voeg shift-kolommen toe</p>
                                <p class="text-xs text-gray-600">Aparte kolommen voor producten met shifts</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Additional Options -->
                <div class="mb-6">
                    <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <span class="w-2 h-6 bg-gradient-to-b from-primary to-green-600 rounded-full mr-3"></span>
                        Extra Opties
                    </h3>
                    <div class="space-y-3">
                        <label class="flex items-start space-x-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200"
                            :class="{ 'border-primary bg-primary/5': exportConfig.includeHeaders }">
                            <input
                                type="checkbox"
                                v-model="exportConfig.includeHeaders"
                                class="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 text-sm">Inclusief kolomnamen</p>
                                <p class="text-xs text-gray-600">Voeg headers toe aan de CSV</p>
                            </div>
                        </label>

                        <label class="flex items-start space-x-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200"
                            :class="{ 'border-primary bg-primary/5': exportConfig.includeSummaryRow }">
                            <input
                                type="checkbox"
                                v-model="exportConfig.includeSummaryRow"
                                class="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 text-sm">Totalen rij toevoegen</p>
                                <p class="text-xs text-gray-600">Extra rij onderaan met totalen per kolom</p>
                            </div>
                        </label>

                        <label class="flex items-start space-x-3 p-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200"
                            :class="{ 'border-primary bg-primary/5': exportConfig.groupByEvent }">
                            <input
                                type="checkbox"
                                v-model="exportConfig.groupByEvent"
                                class="mt-0.5 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <div class="flex-1">
                                <p class="font-medium text-gray-900 text-sm">Groepeer per event</p>
                                <p class="text-xs text-gray-600">Sorteer en groepeer bestellingen per event</p>
                            </div>
                        </label>
                    </div>
                </div>

                <!-- Preview -->
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                    <h3 class="text-sm font-bold text-gray-900 mb-2 flex items-center">
                        <svg class="w-4 h-4 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        Preview
                    </h3>
                    <div class="bg-white rounded-lg p-3 border border-gray-200 overflow-x-auto">
                        <div class="text-xs font-mono text-gray-600 whitespace-nowrap">
                            {{ getPreviewText() }}
                        </div>
                    </div>
                    <p class="text-xs text-gray-600 mt-2">
                        {{ exportConfig.columns.length + (exportConfig.includeProductColumns ? uniqueProducts.length : 0) }} kolommen geselecteerd
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div class="border-t border-gray-200 px-4 sm:px-6 py-4 bg-gray-50 -mx-6 -mb-4 mt-6">
                <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div class="text-sm text-gray-600 text-center sm:text-left">
                        <span class="font-medium">{{ totalOrders }}</span> bestellingen worden geëxporteerd
                    </div>
                    <div class="flex gap-3">
                        <button
                            @click="closeModal"
                            class="flex-1 sm:flex-none px-4 sm:px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-100 transition-all duration-200"
                        >
                            Annuleren
                        </button>
                        <button
                            @click="handleExport"
                            :disabled="exportConfig.columns.length === 0"
                            class="flex-1 sm:flex-none bg-gradient-to-r from-primary to-green-600 text-white px-4 sm:px-6 py-2.5 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <div class="flex items-center justify-center space-x-2">
                                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <span>Exporteer CSV</span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </BaseModal>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue';
import BaseModal from '@/components/modal/BaseModal.vue';

const props = defineProps({
    modelValue: {
        type: Boolean,
        required: true
    },
    orders: {
        type: Array,
        default: () => []
    },
    events: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:modelValue', 'export']);

// Available columns configuration
const availableColumns = [
    { id: 'orderId', label: 'Bestelling ID', description: 'Uniek order ID' },
    { id: 'orderNumber', label: 'Bestelling Nummer', description: 'Vriendelijk nummer' },
    { id: 'date', label: 'Datum', description: 'Besteldatum en tijd' },
    { id: 'customerEmail', label: 'Klant Email', description: 'Email adres klant' },
    { id: 'event', label: 'Event', description: 'Naam van het event' },
    { id: 'shift', label: 'Shift', description: 'Shift informatie' },
    { id: 'totalAmount', label: 'Totaal Bedrag', description: 'Totaalbedrag in €' },
    { id: 'paymentMethod', label: 'Betaalmethode', description: 'Stripe of Handmatig' },
    { id: 'status', label: 'Status', description: 'Betalingsstatus' },
    { id: 'itemCount', label: 'Aantal Items', description: 'Totaal aantal items' },
    { id: 'firebaseUid', label: 'Firebase UID', description: 'Technisch klant ID' },
    { id: 'stripeCustomerId', label: 'Stripe Customer ID', description: 'Stripe klant ID' },
    { id: 'confirmedAt', label: 'Bevestigd Op', description: 'Handmatige bevestigingsdatum' },
    { id: 'confirmedBy', label: 'Bevestigd Door', description: 'Wie bevestigde handmatig' }
];

// Export configuration
const exportConfig = reactive({
    format: 'detailed',
    columns: ['orderId', 'orderNumber', 'date', 'customerEmail', 'event', 'shift', 'totalAmount', 'paymentMethod', 'status', 'itemCount'],
    includeProductColumns: true,
    includeShiftColumns: true,
    includeHeaders: true,
    includeSummaryRow: true,
    groupByEvent: false
});

// Computed properties
const totalOrders = computed(() => props.orders.length);

const uniqueProducts = computed(() => {
    const productsSet = new Set();
    props.orders.forEach(order => {
        order.items?.forEach(item => {
            if (exportConfig.includeShiftColumns && item.shiftId) {
                productsSet.add(`${item.productName} (${item.shiftName || 'Shift'})`);
            } else {
                productsSet.add(item.productName);
            }
        });
    });
    return Array.from(productsSet).sort();
});

// Methods
const selectAllColumns = () => {
    exportConfig.columns = availableColumns.map(col => col.id);
};

const deselectAllColumns = () => {
    exportConfig.columns = [];
};

const closeModal = () => {
    emit('update:modelValue', false);
};

const getPreviewText = () => {
    const columns = exportConfig.columns.map(colId => {
        const col = availableColumns.find(c => c.id === colId);
        return col ? col.label : colId;
    });

    if (exportConfig.format === 'detailed' && exportConfig.includeProductColumns) {
        const sampleProducts = uniqueProducts.value.slice(0, 3);
        columns.push(...sampleProducts);
        if (uniqueProducts.value.length > 3) {
            columns.push(`... (+${uniqueProducts.value.length - 3} meer)`);
        }
    }

    return columns.join(' | ');
};

const handleExport = () => {
    emit('export', { ...exportConfig, uniqueProducts: uniqueProducts.value });
};
</script>
