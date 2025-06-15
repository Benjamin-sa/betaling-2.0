<template>
    <div class="shift-capacity-indicator">
        <!-- Capacity Status Badge -->
        <div v-if="showBadge && capacityData" :class="[
            'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-all duration-200',
            statusClasses
        ]">
            <span class="mr-1">{{ statusMessages.icon }}</span>
            {{ statusMessages.message }}
        </div>

        <!-- Detailed Capacity Info -->
        <div v-if="showDetails && capacityData" :class="[
            'mt-2 p-3 rounded-lg border transition-all duration-200',
            detailClasses
        ]">
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium text-gray-900">Capaciteit</span>
                <span :class="['text-sm font-bold', statusTextColor]">
                    {{ capacityData.currentAttendees }}/{{ capacityData.maxCapacity }}
                </span>
            </div>

            <!-- Progress Bar -->
            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div :class="[
                    'h-2 rounded-full transition-all duration-300',
                    progressBarColor
                ]" :style="{ width: utilizationPercentage + '%' }"></div>
            </div>

            <div class="flex items-center justify-between text-xs text-gray-600">
                <span>{{ capacityData.available }} plekken vrij</span>
                <span>{{ utilizationPercentage }}% bezet</span>
            </div>

            <!-- Warning Messages -->
            <div v-if="availabilityStatus === 'full'" class="mt-2 text-xs text-red-600 font-medium">
                ⚠️ Dit tijdslot is volledig geboekt
            </div>
            <div v-else-if="availabilityStatus === 'almost-full'" class="mt-2 text-xs text-orange-600 font-medium">
                ⚡ Bijna vol - snel boeken aanbevolen
            </div>
            <div v-else-if="availabilityStatus === 'low'" class="mt-2 text-xs text-yellow-600 font-medium">
                🔔 Beperkte beschikbaarheid
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="loading" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600">
            <svg class="animate-spin -ml-1 mr-2 h-3 w-3 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                </path>
            </svg>
            Capaciteit laden...
        </div>

        <!-- Error State -->
        <div v-if="error" class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-600">
            ❌ Capaciteit niet beschikbaar
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useReactiveShiftCapacity } from '@/composables/useShiftCapacity';

const props = defineProps({
    eventId: {
        type: String,
        required: true
    },
    shiftId: {
        type: String,
        required: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    showBadge: {
        type: Boolean,
        default: true
    },
    showDetails: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        default: 'normal', // 'small', 'normal', 'large'
        validator: (value) => ['small', 'normal', 'large'].includes(value)
    }
});

// Use reactive shift capacity
const {
    capacityData,
    loading,
    error,
    availabilityStatus,
    statusMessages,
    canBook,
    available,
    isFull
} = useReactiveShiftCapacity(
    computed(() => props.eventId),
    computed(() => props.shiftId),
    computed(() => props.quantity)
);

// Computed styles based on availability status
const statusClasses = computed(() => {
    const baseClasses = 'border';
    const sizeClasses = {
        small: 'text-xs px-1.5 py-0.5',
        normal: 'text-xs px-2 py-1',
        large: 'text-sm px-3 py-1.5'
    };

    const statusClasses = {
        available: 'bg-green-50 text-green-700 border-green-200',
        low: 'bg-yellow-50 text-yellow-700 border-yellow-200',
        'almost-full': 'bg-orange-50 text-orange-700 border-orange-200',
        full: 'bg-red-50 text-red-700 border-red-200',
        unknown: 'bg-gray-50 text-gray-700 border-gray-200'
    };

    return [
        baseClasses,
        sizeClasses[props.size],
        statusClasses[availabilityStatus.value] || statusClasses.unknown
    ].join(' ');
});

const detailClasses = computed(() => {
    const statusClasses = {
        available: 'bg-green-50 border-green-200',
        low: 'bg-yellow-50 border-yellow-200',
        'almost-full': 'bg-orange-50 border-orange-200',
        full: 'bg-red-50 border-red-200',
        unknown: 'bg-gray-50 border-gray-200'
    };

    return statusClasses[availabilityStatus.value] || statusClasses.unknown;
});

const statusTextColor = computed(() => {
    const colors = {
        available: 'text-green-700',
        low: 'text-yellow-700',
        'almost-full': 'text-orange-700',
        full: 'text-red-700',
        unknown: 'text-gray-700'
    };

    return colors[availabilityStatus.value] || colors.unknown;
});

const progressBarColor = computed(() => {
    const colors = {
        available: 'bg-green-500',
        low: 'bg-yellow-500',
        'almost-full': 'bg-orange-500',
        full: 'bg-red-500',
        unknown: 'bg-gray-500'
    };

    return colors[availabilityStatus.value] || colors.unknown;
});

const utilizationPercentage = computed(() => {
    if (!capacityData.value) return 0;
    return Math.round((capacityData.value.currentAttendees / capacityData.value.maxCapacity) * 100);
});

// Expose reactive properties for parent components
defineExpose({
    capacityData,
    loading,
    error,
    availabilityStatus,
    canBook,
    available,
    isFull
});
</script>

<style scoped>
.shift-capacity-indicator {
    @apply transition-all duration-200;
}

/* Pulse animation for loading state */
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
</style>
