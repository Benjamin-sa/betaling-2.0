<template>
    <div v-if="selectedEvent" class="bg-gradient-to-br from-gray-50 to-white mt-24">
        <div class="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
            <!-- Header -->
            <div class="text-center mb-16">
                <div
                    class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary/10 text-primary border border-primary/20 mb-6">
                    <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Event Details
                </div>

                <h2 class="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
                    {{ selectedEvent.name }}
                </h2>

                <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    {{ selectedEvent.description }}
                </p>
            </div>

            <!-- Event Type Specific Content -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <!-- Content Section -->
                <div class="space-y-8">
                    <!-- Shift Event Details -->
                    <div v-if="selectedEvent.type === 'shift_event'">
                        <div class="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                            <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <svg class="w-6 h-6 mr-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd"
                                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                                        clip-rule="evenodd" />
                                </svg>
                                Beschikbare Tijdslots
                            </h3>

                            <div class="space-y-4">
                                <div v-for="shift in activeShifts" :key="shift.id"
                                    class="flex items-center justify-between p-4 bg-gradient-to-r from-primary/5 to-green-600/5 rounded-xl border border-primary/10">
                                    <div>
                                        <h4 class="font-semibold text-gray-900">{{ shift.name }}</h4>
                                        <p class="text-gray-600">{{ shift.startTime }} - {{ shift.endTime }}</p>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm text-gray-600">Capaciteit</div>
                                        <div class="font-bold text-primary">{{ shift.maxCapacity }} personen</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- General Event Info -->
                    <div v-else>
                        <div class="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                            <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                                <svg class="w-6 h-6 mr-3 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                                </svg>
                                Product Verkoop
                            </h3>
                            <p class="text-gray-600 text-lg leading-relaxed">
                                Ontdek onze selectie van hoogwaardige producten. Alle opbrengsten gaan naar onze
                                scoutswerking
                                en helpen ons om geweldige activiteiten en kampen te organiseren voor onze leden.
                            </p>
                        </div>
                    </div>
                </div>

                <!-- Visual Section -->
                <div class="lg:pl-8">
                    <!-- Scouts Image/Logo -->
                    <div class="relative">
                        <div
                            class="aspect-square bg-gradient-to-br from-primary/10 to-green-600/10 rounded-3xl overflow-hidden shadow-2xl">
                            <img src="/src/assets/logo.png" alt="Scouts Lod Lavki Logo"
                                class="w-full h-full object-contain p-12" />
                        </div>

                        <!-- Floating Elements -->
                        <div
                            class="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-br from-primary/20 to-green-600/20 rounded-full blur-xl">
                        </div>
                        <div
                            class="absolute -bottom-6 -left-6 w-32 h-32 bg-gradient-to-br from-green-600/20 to-primary/20 rounded-full blur-xl">
                        </div>
                    </div>

                    <!-- Scout Values -->
                    <div class="mt-8 grid grid-cols-2 gap-4">
                        <div
                            class="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-100">
                            <div class="text-2xl font-bold text-primary">100%</div>
                            <div class="text-sm text-gray-600">Voor onze scouts</div>
                        </div>

                        <div
                            class="bg-white/80 backdrop-blur-sm rounded-xl p-4 text-center shadow-lg border border-gray-100">
                            <div class="text-2xl font-bold text-green-600">❤️</div>
                            <div class="text-sm text-gray-600">Met passie</div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Call to Action -->
            <div class="text-center mt-16">
                <div class="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 max-w-2xl mx-auto">
                    <h3 class="text-2xl font-bold text-gray-900 mb-4">Steun onze scouts!</h3>
                    <p class="text-gray-600 mb-6">
                        Alle opbrengsten van {{ selectedEvent.name.toLowerCase() }} gaan rechtstreeks naar onze
                        scoutswerking.
                        Met jouw steun kunnen we geweldige activiteiten en onvergetelijke kampen organiseren.
                    </p>

                    <button @click="scrollToProducts"
                        class="inline-flex items-center px-8 py-4 bg-gradient-to-r from-primary to-green-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M5 10l7-7m0 0l7 7m-7-7v18" />
                        </svg>
                        Naar boven scrollen
                    </button>
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
        default: null
    }
});

const activeShifts = computed(() => {
    if (!props.selectedEvent?.shifts) return [];
    return props.selectedEvent.shifts.filter(shift => shift.isActive);
});

const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
        productsSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
};
</script>
