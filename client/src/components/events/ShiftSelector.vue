<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div v-for="shift in availableShifts" :key="shift.id" class="relative group cursor-pointer"
            @click="toggleShiftSelection(shift)">
            <!-- Shift Card -->
            <div class="bg-white rounded-2xl p-6 border-2 transition-all duration-300 shadow-lg hover:shadow-xl" :class="{
                'border-primary bg-primary/5 ring-2 ring-primary/20': isShiftSelected(shift),
                'border-gray-200 hover:border-primary/50': !isShiftSelected(shift)
            }">
                <!-- Selection Indicator -->
                <div class="absolute top-4 right-4">
                    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                        :class="{
                            'border-primary bg-primary': isShiftSelected(shift),
                            'border-gray-300 group-hover:border-primary/50': !isShiftSelected(shift)
                        }">
                        <svg v-if="isShiftSelected(shift)" class="w-4 h-4 text-white" fill="currentColor"
                            viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clip-rule="evenodd" />
                        </svg>
                    </div>
                </div>

                <!-- Shift Header -->
                <div class="mb-4">
                    <h3 class="text-xl font-bold text-gray-900 mb-2">{{ shift.name }}</h3>
                    <div class="flex items-center text-gray-600 mb-2">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="font-medium">{{ shift.startTime }} - {{ shift.endTime }}</span>
                    </div>
                </div>

                <!-- Capacity Info -->
                <div class="space-y-3">
                    <div class="flex items-center justify-between">
                        <span class="text-sm text-gray-600">Beschikbare plaatsen:</span>
                        <span class="font-semibold" :class="getCapacityColor(shift)">
                            {{ shift.maxCapacity }} personen
                        </span>
                    </div>

                    <!-- Capacity Bar -->
                    <div class="w-full bg-gray-200 rounded-full h-2">
                        <div class="h-2 rounded-full transition-all duration-300" :class="getCapacityBarColor(shift)"
                            :style="{ width: '85%' }"></div>
                    </div>

                    <div class="text-xs text-gray-500">
                        <!-- Simulated capacity feedback -->
                        Nog {{ Math.floor(shift.maxCapacity * 0.85) }} van {{ shift.maxCapacity }} plaatsen beschikbaar
                    </div>
                </div>


                <!-- Selection Feedback -->
                <div v-if="isShiftSelected(shift)" class="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <div class="flex items-center text-primary">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fill-rule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clip-rule="evenodd" />
                        </svg>
                        <span class="font-medium">Geselecteerd voor winkelmandje</span>
                    </div>
                </div>

                <!-- Hover Effect -->
                <div
                    class="absolute inset-0 bg-gradient-to-r from-primary/0 to-green-600/0 group-hover:from-primary/5 group-hover:to-green-600/5 rounded-2xl transition-all duration-300 pointer-events-none">
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    selectedEvent: {
        type: Object,
        required: true
    },
    selectedShifts: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['update:selected-shifts']);

const availableShifts = computed(() => {
    if (!props.selectedEvent?.shifts) return [];
    return props.selectedEvent.shifts.filter(shift => shift.isActive);
});

const isShiftSelected = (shift) => {
    return props.selectedShifts.some(selected => selected.id === shift.id);
};

const toggleShiftSelection = (shift) => {
    const currentSelection = [...props.selectedShifts];
    const existingIndex = currentSelection.findIndex(selected => selected.id === shift.id);

    if (existingIndex >= 0) {
        // Remove shift if already selected
        currentSelection.splice(existingIndex, 1);
    } else {
        // Add shift to selection
        // For shift events, we typically allow only one shift selection per order
        const maxShifts = 1; // Only one shift per order for linking products

        if (currentSelection.length < maxShifts) {
            currentSelection.push({
                id: shift.id,
                name: shift.name,
                startTime: shift.startTime,
                endTime: shift.endTime
                // No price/quantity - shifts are just metadata for linking products
            });
        } else {
            // Replace the first selection if limit reached
            currentSelection[0] = {
                id: shift.id,
                name: shift.name,
                startTime: shift.startTime,
                endTime: shift.endTime
                // No price/quantity - shifts are just metadata for linking products
            };
        }
    }

    emit('update:selected-shifts', currentSelection);
};

const getCapacityColor = (shift) => {
    const availablePercentage = 0.85; // Simulated 85% available
    if (availablePercentage > 0.7) return 'text-green-600';
    if (availablePercentage > 0.3) return 'text-orange-600';
    return 'text-red-600';
};

const getCapacityBarColor = (shift) => {
    const availablePercentage = 0.85; // Simulated 85% available
    if (availablePercentage > 0.7) return 'bg-green-500';
    if (availablePercentage > 0.3) return 'bg-orange-500';
    return 'bg-red-500';
};
</script>

<style scoped>
/* Add subtle animation for better user feedback */
.group:active {
    transform: scale(0.98);
}
</style>
