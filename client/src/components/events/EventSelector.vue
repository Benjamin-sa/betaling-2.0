<template>
    <div class="mb-12">
        <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <!-- Header -->
            <div class="bg-gradient-to-r from-primary to-green-600 px-8 py-6">
                <h2 class="text-2xl font-bold text-white flex items-center">
                    <svg class="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Kies je Event
                </h2>
                <p class="text-green-100 mt-2">Er zijn meerdere events beschikbaar - kies er één</p>
            </div>

            <!-- Content -->
            <div class="p-8">
                <!-- Event Selector -->
                <div class="space-y-6">
                    <div class="flex flex-col lg:flex-row lg:items-center gap-6">
                        <div class="flex-1">
                            <label for="event-select" class="block text-sm font-semibold text-gray-700 mb-3">
                                Beschikbare Events:
                            </label>
                            <div class="relative">
                                <select id="event-select" :value="selectedEventId"
                                    @change="$emit('update:selectedEventId', $event.target.value)"
                                    class="w-full px-4 py-3 text-lg border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none cursor-pointer">
                                    <option value="">-- Kies een event --</option>
                                    <option v-for="event in activeEvents" :key="event.id" :value="event.id">
                                        {{ event.name }}
                                    </option>
                                </select>
                                <div class="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                                    <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        <!-- Event Count Badge -->
                        <div v-if="activeEvents.length > 0" class="flex-shrink-0">
                            <div
                                class="bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium border border-primary/20">
                                {{ activeEvents.length }} event{{ activeEvents.length !== 1 ? 's' : '' }} beschikbaar
                            </div>
                        </div>
                    </div>

                    <!-- Selected Event Info -->
                    <div v-if="selectedEvent" class="relative">
                        <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200">
                            <!-- Event Header -->
                            <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                <div>
                                    <h3 class="text-xl font-bold text-gray-900 mb-2">{{ selectedEvent.name }}</h3>
                                    <p class="text-gray-600 leading-relaxed">{{ selectedEvent.description }}</p>
                                </div>

                                <!-- Event Type Badge -->
                                <div class="flex-shrink-0">
                                    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                                        :class="selectedEvent.type === 'shift_event'
                                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                            : 'bg-green-100 text-green-800 border border-green-200'">
                                        <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path v-if="selectedEvent.type === 'shift_event'"
                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" />
                                            <path v-else
                                                d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                        </svg>
                                        {{ selectedEvent.type === 'shift_event' ? 'Shift Event' : 'Product Verkoop' }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    activeEvents: {
        type: Array,
        required: true
    },
    selectedEventId: {
        type: String,
        default: null
    },
    selectedEvent: {
        type: Object,
        default: null
    }
});

defineEmits(['update:selectedEventId']);
</script>
