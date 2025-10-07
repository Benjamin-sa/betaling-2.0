<template>
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-secondary px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-t-2xl">
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Event Beheer</h2>
            <p class="text-sm sm:text-base text-emerald-100">Maak en beheer events en shifts</p>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-6 lg:p-8">
            <div class="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
                <!-- Create Event Form -->
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6">
                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center">
                        <svg class="w-5 h-5 sm:w-6 sm:h-6 mr-2 sm:mr-3 text-primary" fill="none" stroke="currentColor"
                            viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <span class="hidden sm:inline">Nieuw Event Aanmaken</span>
                        <span class="sm:hidden">Event Aanmaken</span>
                    </h3>

                    <!-- Info Banner -->
                    <div class="bg-info-bg border border-info/20 rounded-xl p-4 mb-6">
                        <div class="flex items-start space-x-3">
                            <svg class="w-5 h-5 text-info mt-0.5 flex-shrink-0" fill="none" stroke="currentColor"
                                viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h4 class="text-sm font-semibold text-info mb-1">💡 Belangrijk</h4>
                                <p class="text-sm text-info leading-relaxed">
                                    De <strong>event naam</strong> wordt gebruikt als <strong>hoofdtitel</strong> op de
                                    homepage en de <strong>beschrijving</strong> is zichtbaar voor alle klanten. Zorg
                                    ervoor dat deze informatie duidelijk en aantrekkelijk is voor je doelgroep.
                                </p>
                            </div>
                        </div>
                    </div>

                    <form @submit.prevent="handleCreateEvent" class="space-y-4 sm:space-y-6">
                        <!-- Event Name -->
                        <div>
                            <label for="eventName" class="block text-sm font-semibold text-gray-700 mb-2">
                                Event Naam
                                <span class="text-xs font-normal text-info ml-1">(wordt weergegeven als
                                    hoofdtitel)</span>
                            </label>
                            <input id="eventName" v-model="newEvent.name" type="text" required
                                placeholder="Bijv. Spaghetti Avond 2025"
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" />
                        </div>

                        <!-- Event Description -->
                        <div>
                            <label for="eventDescription" class="block text-sm font-semibold text-gray-700 mb-2">
                                Beschrijving
                                <span class="text-xs font-normal text-info ml-1">(zichtbaar voor klanten)</span>
                            </label>
                            <textarea id="eventDescription" v-model="newEvent.description" required rows="3"
                                placeholder="Beschrijf het event voor je klanten - wat kunnen ze verwachten?"
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"></textarea>
                        </div>

                        <!-- Event Type -->
                        <div>
                            <label for="eventType" class="block text-sm font-semibold text-gray-700 mb-2">Event
                                Type</label>
                            <select id="eventType" v-model="newEvent.type" required
                                class="w-full px-3 sm:px-4 py-2 sm:py-3 text-base sm:text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none cursor-pointer">
                                <option value="product_sale">Product Verkoop</option>
                                <option value="shift_event">Shift Event</option>
                            </select>
                        </div>

                        <!-- Shift Configuration (only for shift events) -->
                        <div v-if="newEvent.type === 'shift_event'" class="space-y-3 sm:space-y-4">
                            <div
                                class="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                                <h4 class="text-base sm:text-lg font-bold text-gray-900">Shifts Configureren</h4>
                                <button type="button" @click="addShift"
                                    class="bg-white text-primary border-2 border-primary px-3 sm:px-4 py-2 rounded-xl font-semibold hover:bg-primary hover:text-white transition-all duration-200 text-sm sm:text-base">
                                    <span class="hidden sm:inline">+ Shift Toevoegen</span>
                                    <span class="sm:hidden">+ Shift</span>
                                </button>
                            </div>

                            <div v-for="(shift, index) in newEvent.shifts" :key="index"
                                class="bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-gray-900 text-sm sm:text-base">Shift {{ index + 1
                                        }}</span>
                                    <button type="button" @click="removeShift(index)"
                                        :disabled="newEvent.shifts.length === 1"
                                        class="text-error hover:text-red-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors duration-200">
                                        <svg class="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor"
                                            viewBox="0 0 24 24">
                                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                d="M6 18L18 6M6 6l12 12"></path>
                                        </svg>
                                    </button>
                                </div>

                                <div class="space-y-3">
                                    <input v-model="shift.name" placeholder="Shift naam (bijv. 17:00-18:00)" required
                                        class="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" />
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 mb-1">Start
                                                tijd</label>
                                            <input v-model="shift.startTime" type="time" required
                                                class="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" />
                                        </div>
                                        <div>
                                            <label class="block text-xs font-medium text-gray-500 mb-1">Eind
                                                tijd</label>
                                            <input v-model="shift.endTime" type="time" required
                                                class="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs font-medium text-gray-500 mb-1">Max
                                            capaciteit</label>
                                        <input v-model.number="shift.maxCapacity" type="number" min="1" placeholder="50"
                                            required
                                            class="w-full px-3 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Submit Button -->
                        <button type="submit" :disabled="loading"
                            class="w-full bg-gradient-to-r from-primary to-secondary text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                            <span v-if="loading" class="flex items-center justify-center">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Event aanmaken...
                            </span>
                            <span v-else>Event Aanmaken</span>
                        </button>
                    </form>
                </div>

                <!-- Events List -->
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-6">
                    <h3 class="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <svg class="w-6 h-6 mr-3 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Bestaande Events
                    </h3>

                    <div v-if="events.length > 0" class="space-y-4 max-h-[500px] overflow-y-auto">
                        <div v-for="event in events" :key="event.id"
                            class="bg-white border-2 border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                            <div
                                class="flex flex-col lg:flex-row lg:items-start justify-between space-y-4 lg:space-y-0">
                                <!-- Event Info -->
                                <div class="flex-1">
                                    <h4 class="text-lg font-bold text-gray-900 mb-2">{{ event.name }}</h4>
                                    <p class="text-gray-600 mb-3">{{ event.description }}</p>

                                    <!-- Event Type & Status Badges -->
                                    <div class="flex flex-wrap items-center gap-2 mb-3">
                                        <span :class="[
                                            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                                            event.type === 'shift_event'
                                                ? 'bg-info-bg text-info border border-info/20'
                                                : 'bg-success-bg text-success border border-success/20'
                                        ]">
                                            <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path v-if="event.type === 'shift_event'" stroke-linecap="round"
                                                    stroke-linejoin="round" stroke-width="2"
                                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path v-else stroke-linecap="round" stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                            {{ event.type === 'shift_event' ? 'Shift Event' : 'Product Verkoop' }}
                                        </span>

                                        <span :class="[
                                            'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                                            event.isActive
                                                ? 'bg-success-bg text-success border border-success/20'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        ]">
                                            <div :class="[
                                                'w-2 h-2 rounded-full mr-2',
                                                event.isActive ? 'bg-success' : 'bg-gray-400'
                                            ]"></div>
                                            {{ event.isActive ? 'Actief' : 'Inactief' }}
                                        </span>
                                    </div>

                                    <!-- Shifts Info for Shift Events -->
                                    <div v-if="event.type === 'shift_event' && event.shifts"
                                        class="bg-gray-50 rounded-lg p-3">
                                        <div class="flex items-center justify-between">
                                            <div class="flex items-center space-x-2">
                                                <svg class="w-4 h-4 text-gray-500" fill="none" stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path stroke-linecap="round" stroke-linejoin="round"
                                                        stroke-width="2"
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                <span class="text-sm font-medium text-gray-700">
                                                    {{ event.shifts.length }} shift{{ event.shifts.length !== 1 ? 's' :
                                                        ''
                                                    }} geconfigureerd
                                                </span>
                                            </div>
                                            <button @click="openShiftManager(event)"
                                                class="text-primary hover:text-primary-dark text-sm font-medium transition-colors duration-200">
                                                Bewerk shifts
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <!-- Action Button -->
                                <div class="lg:ml-6">
                                    <button @click="toggleEventStatus(event.id, !event.isActive)" :class="[
                                        'px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95',
                                        event.isActive
                                            ? 'bg-white text-warning border-2 border-warning hover:bg-warning hover:text-white'
                                            : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg'
                                    ]">
                                        <div class="flex items-center space-x-2">
                                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path v-if="event.isActive" stroke-linecap="round"
                                                    stroke-linejoin="round" stroke-width="2"
                                                    d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                <path v-else stroke-linecap="round" stroke-linejoin="round"
                                                    stroke-width="2"
                                                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M19 10a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>{{ event.isActive ? 'Deactiveren' : 'Activeren' }}</span>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Empty State -->
                    <div v-else class="text-center py-16">
                        <div
                            class="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                            <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <h3 class="text-xl font-semibold text-gray-900 mb-2">Geen events gevonden</h3>
                        <p class="text-gray-600">Maak je eerste event aan om te beginnen.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <ConfirmationModal v-model="confirmation.isOpen.value" :title="confirmation.config.value.title"
            :message="confirmation.config.value.message" :type="confirmation.config.value.type"
            :confirm-text="confirmation.config.value.confirmText" :cancel-text="confirmation.config.value.cancelText"
            @confirm="confirmation.confirm" @cancel="confirmation.cancel" @close="confirmation.close" />

        <!-- Shift Management Modal -->
        <div v-if="shiftManagement.isOpen" class="fixed inset-0 z-50 overflow-y-auto">
            <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:p-0">
                <!-- Background overlay -->
                <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" @click="closeShiftManager">
                </div>

                <!-- Modal panel -->
                <div class="relative bg-white rounded-2xl shadow-xl transform transition-all sm:max-w-2xl sm:w-full">
                    <!-- Header -->
                    <div class="bg-gradient-to-r from-primary to-secondary px-6 py-4 rounded-t-2xl">
                        <div class="flex items-center justify-between">
                            <h3 class="text-xl font-bold text-white">
                                Shifts beheren - {{ shiftManagement.event?.name }}
                            </h3>
                            <button @click="closeShiftManager"
                                class="text-white hover:text-gray-200 transition-colors duration-200">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Content -->
                    <div class="px-6 py-6 max-h-96 overflow-y-auto">
                        <!-- Existing Shifts -->
                        <div v-if="shiftManagement.event?.shifts?.length > 0" class="space-y-4 mb-6">
                            <h4 class="font-bold text-gray-900 mb-4">Bestaande shifts</h4>
                            <div v-for="(shift, index) in shiftManagement.event.shifts" :key="shift.id"
                                class="bg-gray-50 border border-gray-200 rounded-xl p-4">
                                <div v-if="!shift.editing" class="flex items-center justify-between">
                                    <div class="flex-1">
                                        <h5 class="font-semibold text-gray-900">{{ shift.name }}</h5>
                                        <p class="text-sm text-gray-600">
                                            {{ shift.startTime }} - {{ shift.endTime }} (max {{ shift.maxCapacity }})
                                        </p>
                                        <div v-if="shiftAvailability[shift.id]" class="text-xs text-blue-600 mt-1">
                                            {{ shiftAvailability[shift.id].occupied }}/{{ shift.maxCapacity }} bezet
                                            <span v-if="shiftAvailability[shift.id].isFull"
                                                class="ml-2 text-red-600 font-bold">
                                                (VOL)
                                            </span>
                                            <span v-else-if="shiftAvailability[shift.id].available <= 5"
                                                class="ml-2 text-orange-600 font-bold">
                                                ({{ shiftAvailability[shift.id].available }} vrij)
                                            </span>
                                        </div>
                                    </div>
                                    <button @click="editShift(shift)"
                                        class="text-primary hover:text-primary-dark text-sm font-medium transition-colors duration-200">
                                        Bewerken
                                    </button>
                                </div>

                                <!-- Edit form -->
                                <div v-else class="space-y-3">
                                    <input v-model="shift.name" placeholder="Shift naam"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                    <div class="grid grid-cols-2 gap-3">
                                        <input v-model="shift.startTime" type="time"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                        <input v-model="shift.endTime" type="time"
                                            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                    </div>
                                    <input v-model.number="shift.maxCapacity" type="number" min="1"
                                        placeholder="Max capaciteit"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                    <div class="flex space-x-2">
                                        <button @click="saveShift(shift)"
                                            class="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors duration-200">
                                            Opslaan
                                        </button>
                                        <button @click="cancelEdit(shift)"
                                            class="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors duration-200">
                                            Annuleren
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Add New Shift -->
                        <div class="border-t pt-6">
                            <h4 class="font-bold text-gray-900 mb-4">Nieuwe shift toevoegen</h4>
                            <div class="space-y-3">
                                <input v-model="newShift.name" placeholder="Shift naam (bijv. 18:00-19:00)"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                <div class="grid grid-cols-2 gap-3">
                                    <input v-model="newShift.startTime" type="time"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                    <input v-model="newShift.endTime" type="time"
                                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                </div>
                                <input v-model.number="newShift.maxCapacity" type="number" min="1"
                                    placeholder="Max capaciteit"
                                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary" />
                                <button @click="addNewShift" :disabled="!isNewShiftValid"
                                    class="w-full px-4 py-3 bg-gradient-to-r from-primary to-secondary text-white rounded-xl font-bold transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none">
                                    Shift Toevoegen
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmation } from '@/composables/useConfirmation';
import { apiClient } from '@/services/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';

const notifications = useNotificationStore();
const confirmation = useConfirmation();

const props = defineProps({
    events: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['events-updated']);

const loading = ref(false);

const newEvent = ref({
    name: '',
    description: '',
    type: 'product_sale',
    shifts: [
        {
            id: generateShiftId(),
            name: '',
            startTime: '',
            endTime: '',
            maxCapacity: 50,
        }
    ],
});

function generateShiftId() {
    return 'shift-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

const addShift = () => {
    newEvent.value.shifts.push({
        id: generateShiftId(),
        name: '',
        startTime: '',
        endTime: '',
        maxCapacity: 50,
    });
};

const removeShift = (index) => {
    if (newEvent.value.shifts.length > 1) {
        newEvent.value.shifts.splice(index, 1);
    }
};

const handleCreateEvent = async () => {
    try {
        loading.value = true;

        // Prepare event data
        const eventData = {
            name: newEvent.value.name,
            description: newEvent.value.description,
            type: newEvent.value.type,
        };

        // Add shifts for shift events
        if (newEvent.value.type === 'shift_event') {
            eventData.shifts = newEvent.value.shifts.map(shift => ({
                id: shift.id,
                name: shift.name,
                startTime: shift.startTime,
                endTime: shift.endTime,
                maxCapacity: shift.maxCapacity,
                isActive: true
            }));
        }

        const response = await apiClient.createEvent(eventData);
        emit('events-updated');

        notifications.success('Opgeslagen!', 'Event is succesvol opgeslagen.');

        // Reset form
        newEvent.value = {
            name: '',
            description: '',
            type: 'product_sale',
            shifts: [
                {
                    id: generateShiftId(),
                    name: '',
                    startTime: '',
                    endTime: '',
                    maxCapacity: 50,
                }
            ],
        };
    } catch (error) {
        console.error('Error creating event:', error);
        notifications.error('Event aanmaken mislukt', 'Er is een fout opgetreden bij het aanmaken van het event.');
    } finally {
        loading.value = false;
    }
};

const toggleEventStatus = async (eventId, isActive) => {
    try {
        console.log(`Toggling event ${eventId} status to ${isActive ? 'active' : 'inactive'}`);
        const action = isActive ? 'activeer' : 'deactiveer';

        try {
            await confirmation.show({
                title: `${action.charAt(0).toUpperCase() + action.slice(1)} evenement`,
                message: `Weet je zeker dat je dit evenement wilt ${action}eren?`,
                type: isActive ? 'info' : 'warning',
                confirmText: isActive ? 'Activeer' : 'Deactiveer',
                cancelText: 'Annuleren'
            });
        } catch (cancelled) {
            // User cancelled the confirmation, just return without doing anything
            console.log('User cancelled event status toggle');
            return;
        }

        await apiClient.updateEventStatus(eventId, isActive);
        emit('events-updated');

        notifications.success(`Evenement ${action}eerd`, `Het evenement is succesvol ${action}eerd.`);
    } catch (error) {
        console.error(`Error ${isActive ? 'activating' : 'deactivating'} event:`, error);
        notifications.error(`Evenement ${isActive ? 'activeren' : 'deactiveren'} mislukt`, `Er is een fout opgetreden.`);
    }
};

// Shift Management
const shiftManagement = ref({
    isOpen: false,
    event: null
});

const shiftAvailability = ref({});

const newShift = ref({
    name: '',
    startTime: '',
    endTime: '',
    maxCapacity: 50
});

const isNewShiftValid = computed(() => {
    return newShift.value.name &&
        newShift.value.startTime &&
        newShift.value.endTime &&
        newShift.value.maxCapacity > 0;
});

const openShiftManager = async (event) => {
    shiftManagement.value.event = { ...event, shifts: [...(event.shifts || [])] };
    shiftManagement.value.isOpen = true;

    // Load shift availability data
    try {
        const response = await apiClient.getEventShiftAvailability(event.id);
        shiftAvailability.value = response.availability.reduce((acc, shift) => {
            acc[shift.shiftId] = shift;
            return acc;
        }, {});
    } catch (error) {
        console.error('Error loading shift availability:', error);
    }
};

const closeShiftManager = () => {
    shiftManagement.value.isOpen = false;
    shiftManagement.value.event = null;
    shiftAvailability.value = {};
    resetNewShift();
};

const resetNewShift = () => {
    newShift.value = {
        name: '',
        startTime: '',
        endTime: '',
        maxCapacity: 50
    };
};

const editShift = (shift) => {
    // Store original values for cancellation
    shift.originalValues = {
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        maxCapacity: shift.maxCapacity
    };
    shift.editing = true;
};

const cancelEdit = (shift) => {
    // Restore original values
    if (shift.originalValues) {
        shift.name = shift.originalValues.name;
        shift.startTime = shift.originalValues.startTime;
        shift.endTime = shift.originalValues.endTime;
        shift.maxCapacity = shift.originalValues.maxCapacity;
        delete shift.originalValues;
    }
    shift.editing = false;
};

const saveShift = async (shift) => {
    try {
        const shiftData = {
            name: shift.name,
            startTime: shift.startTime,
            endTime: shift.endTime,
            maxCapacity: shift.maxCapacity
        };

        await apiClient.updateShift(shiftManagement.value.event.id, shift.id, shiftData);

        shift.editing = false;
        delete shift.originalValues;

        notifications.success('Shift bijgewerkt', 'De shift is succesvol bijgewerkt.');
        emit('events-updated');

    } catch (error) {
        console.error('Error updating shift:', error);
        notifications.error('Shift bijwerken mislukt', error.response?.data?.message || 'Er is een fout opgetreden.');
    }
};

const addNewShift = async () => {
    try {
        const shiftData = {
            name: newShift.value.name,
            startTime: newShift.value.startTime,
            endTime: newShift.value.endTime,
            maxCapacity: newShift.value.maxCapacity
        };

        const response = await apiClient.addShift(shiftManagement.value.event.id, shiftData);

        // Add the new shift to the local event data
        shiftManagement.value.event.shifts.push(response.shift);

        resetNewShift();
        notifications.success('Shift toegevoegd', 'De nieuwe shift is succesvol toegevoegd.');
        emit('events-updated');

    } catch (error) {
        console.error('Error adding shift:', error);
        notifications.error('Shift toevoegen mislukt', error.response?.data?.message || 'Er is een fout opgetreden.');
    }
};
</script>
