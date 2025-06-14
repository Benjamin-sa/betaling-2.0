<template>
    <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Event Beheer</h2>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Create Event Form -->
            <div>
                <h3 class="text-lg font-medium mb-4">Nieuw Event Aanmaken</h3>
                <form @submit.prevent="handleCreateEvent" class="space-y-4">
                    <div class="form-group">
                        <label for="eventName" class="block text-sm font-medium text-text">Event Naam</label>
                        <input id="eventName" v-model="newEvent.name" type="text" required
                            placeholder="Bijv. Spaghetti Avond 2025"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
                    </div>

                    <div class="form-group">
                        <label for="eventDescription" class="block text-sm font-medium text-text">Beschrijving</label>
                        <textarea id="eventDescription" v-model="newEvent.description" required
                            placeholder="Event beschrijving"
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"></textarea>
                    </div>

                    <div class="form-group">
                        <label for="eventType" class="block text-sm font-medium text-text">Event Type</label>
                        <select id="eventType" v-model="newEvent.type" required
                            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                            <option value="product_sale">Product Verkoop</option>
                            <option value="shift_event">Shift Event</option>
                        </select>
                    </div>

                    <!-- Shift Configuration (only for shift events) -->
                    <div v-if="newEvent.type === 'shift_event'" class="space-y-3">
                        <h4 class="text-md font-medium text-text">Shifts Configureren</h4>

                        <div v-for="(shift, index) in newEvent.shifts" :key="index"
                            class="border border-gray-200 rounded-lg p-3 space-y-2">
                            <div class="flex justify-between items-center">
                                <span class="font-medium">Shift {{ index + 1 }}</span>
                                <button type="button" @click="removeShift(index)"
                                    class="text-red-500 hover:text-red-700" :disabled="newEvent.shifts.length === 1">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M6 18L18 6M6 6l12 12"></path>
                                    </svg>
                                </button>
                            </div>

                            <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                <input v-model="shift.name" placeholder="Shift naam (bijv. 17:00-18:00)" required
                                    class="px-2 py-1 border border-gray-300 rounded text-sm" />
                                <input v-model="shift.startTime" type="time" required
                                    class="px-2 py-1 border border-gray-300 rounded text-sm" />
                                <input v-model="shift.endTime" type="time" required
                                    class="px-2 py-1 border border-gray-300 rounded text-sm" />
                            </div>

                            <input v-model.number="shift.maxCapacity" type="number" min="1" placeholder="Max capaciteit"
                                required class="w-full px-2 py-1 border border-gray-300 rounded text-sm" />
                        </div>

                        <button type="button" @click="addShift"
                            class="w-full bg-gray-200 text-gray-700 px-3 py-2 rounded hover:bg-gray-300 transition duration-300">
                            + Shift Toevoegen
                        </button>
                    </div>

                    <button type="submit" :disabled="loading"
                        class="w-full bg-primary text-white px-4 py-2 rounded hover:bg-green-700 disabled:bg-gray-400 transition duration-300">
                        {{ loading ? 'Event aanmaken...' : 'Event Aanmaken' }}
                    </button>
                </form>
            </div>

            <!-- Events List -->
            <div>
                <h3 class="text-lg font-medium mb-4">Bestaande Events</h3>
                <div class="space-y-3 max-h-96 overflow-y-auto">
                    <div v-for="event in events" :key="event.id"
                        class="border border-gray-200 rounded-lg p-4 space-y-2">
                        <div class="flex justify-between items-start">
                            <div class="flex-1">
                                <h4 class="font-medium text-text">{{ event.name }}</h4>
                                <p class="text-sm text-gray-600">{{ event.description }}</p>

                                <!-- Event Type & Status Badges -->
                                <div class="flex items-center space-x-2 mt-2">
                                    <span class="text-xs px-2 py-1 rounded-full"
                                        :class="event.type === 'shift_event' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'">
                                        {{ event.type === 'shift_event' ? 'Shift Event' : 'Product Verkoop' }}
                                    </span>
                                    <span class="text-xs px-2 py-1 rounded-full"
                                        :class="event.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'">
                                        {{ event.isActive ? 'Actief' : 'Inactief' }}
                                    </span>
                                </div>

                                <!-- Shifts Info for Shift Events -->
                                <div v-if="event.type === 'shift_event' && event.shifts" class="mt-2">
                                    <p class="text-xs text-gray-500">
                                        {{ event.shifts.length }} shift{{ event.shifts.length !== 1 ? 's' : '' }}
                                    </p>
                                </div>
                            </div>

                            <div class="flex space-x-1">
                                <button @click="toggleEventStatus(event.id, !event.isActive)"
                                    class="text-sm px-2 py-1 rounded transition duration-300"
                                    :class="event.isActive ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'">
                                    {{ event.isActive ? 'Deactiveren' : 'Activeren' }}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div v-if="events.length === 0" class="text-center text-gray-500 py-8">
                        Geen events gevonden.
                    </div>
                </div>
            </div>
        </div>

        <!-- Confirmation Modal -->
        <ConfirmationModal v-model="confirmation.isOpen.value" :title="confirmation.config.value.title"
            :message="confirmation.config.value.message" :type="confirmation.config.value.type"
            :confirm-text="confirmation.config.value.confirmText" :cancel-text="confirmation.config.value.cancelText"
            @confirm="confirmation.confirm" @cancel="confirmation.cancel" @close="confirmation.close" />
    </div>
</template>

<script setup>
import { ref } from 'vue';
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
</script>
