<template>
    <div class="bg-white rounded-2xl shadow-lg border border-gray-200">
        <!-- Header -->
        <div class="bg-gradient-to-r from-primary to-secondary px-4 sm:px-6 lg:px-8 py-4 sm:py-6 rounded-t-2xl">
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2">Gebruikers Beheren</h2>
            <p class="text-sm sm:text-base text-emerald-100">Beheer admin rechten en gebruikersaccounts</p>
        </div>

        <!-- Content -->
        <div class="p-4 sm:p-6 lg:p-8">
            <!-- Search/Filter Section -->
            <div v-if="!loading && users.length > 0" class="mb-6">
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6">
                    <div class="flex flex-col sm:flex-row gap-4">
                        <!-- Search Input -->
                        <div class="flex-1">
                            <label for="user-search" class="block text-sm font-medium text-gray-700 mb-2">
                                Zoeken naar gebruikers
                            </label>
                            <div class="relative">
                                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <input
                                    id="user-search"
                                    v-model="searchQuery"
                                    type="text"
                                    placeholder="Zoek op email, Firebase UID of Stripe Customer ID..."
                                    class="w-full pl-10 pr-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200"
                                />
                                <button
                                    v-if="searchQuery"
                                    @click="searchQuery = ''"
                                    class="absolute inset-y-0 right-0 pr-3 flex items-center"
                                >
                                    <svg class="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        <!-- Filter Options -->
                        <div class="sm:w-48">
                            <label for="admin-filter" class="block text-sm font-medium text-gray-700 mb-2">
                                Filter op rol
                            </label>
                            <select
                                id="admin-filter"
                                v-model="adminFilter"
                                class="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200 bg-white appearance-none cursor-pointer"
                            >
                                <option value="all">Alle gebruikers</option>
                                <option value="admin">Alleen admins</option>
                                <option value="user">Alleen gebruikers</option>
                            </select>
                        </div>
                    </div>

                    <!-- Results Summary -->
                    <div class="mt-4 flex items-center justify-between text-sm text-gray-600">
                        <div>
                            {{ filteredUsers.length }} van {{ users.length }} gebruikers
                            <span v-if="searchQuery || adminFilter !== 'all'" class="font-medium">
                                (gefilterd)
                            </span>
                        </div>
                        <button
                            v-if="searchQuery || adminFilter !== 'all'"
                            @click="clearFilters"
                            class="text-primary hover:text-primary-dark font-medium transition-colors"
                        >
                            Filters wissen
                        </button>
                    </div>
                </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-12 sm:py-16">
                <div
                    class="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-primary bg-white transition ease-in-out duration-150">
                    <svg class="animate-spin -ml-1 mr-3 h-4 w-4 sm:h-5 sm:w-5 text-primary"
                        xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                    Gebruikers laden...
                </div>
            </div>

            <div v-else-if="filteredUsers.length > 0" class="space-y-3 sm:space-y-4">
                <div v-for="user in filteredUsers" :key="user.id"
                    class="bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div class="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                        <!-- User Info -->
                        <div class="flex-1 space-y-2">
                            <div class="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                                <div
                                    class="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center mx-auto sm:mx-0">
                                    <svg class="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                </div>
                                <div class="text-center sm:text-left">
                                    <h3 class="text-lg sm:text-xl font-bold text-gray-900 break-all">{{ user.email }}
                                    </h3>
                                    <div class="flex items-center justify-center sm:justify-start space-x-2">
                                        <span :class="[
                                            'inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium',
                                            user.isAdmin
                                                ? 'bg-success-bg text-success border border-success/20'
                                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                                        ]">
                                            <svg v-if="user.isAdmin" class="w-3 h-3 sm:w-4 sm:h-4 mr-1" fill="none"
                                                stroke="currentColor" viewBox="0 0 24 24">
                                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {{ user.isAdmin ? 'Administrator' : 'Gebruiker' }}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <!-- User Details -->
                            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 text-sm">
                                <div class="bg-white rounded-xl p-3 border border-gray-200">
                                    <span class="font-medium text-gray-500">Firebase UID</span>
                                    <p class="text-gray-900 font-mono text-xs break-all">{{ user.id }}</p>
                                </div>
                                <div class="bg-white rounded-xl p-3 border border-gray-200">
                                    <span class="font-medium text-gray-500">Stripe Customer</span>
                                    <p class="text-gray-900 font-mono text-xs break-all">{{ user.stripeCustomerId ||
                                        'Niet gevonden' }}</p>
                                </div>
                            </div>
                        </div>

                        <!-- Action Buttons -->
                        <div class="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:ml-6">
                            <button v-if="!user.isAdmin" @click="makeAdmin(user.id)"
                                class="bg-gradient-to-r from-primary to-secondary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-sm sm:text-base">
                                <div class="flex items-center justify-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <span class="hidden sm:inline">Maak Admin</span>
                                    <span class="sm:hidden">Admin</span>
                                </div>
                            </button>

                            <button v-if="user.isAdmin" @click="removeAdmin(user.id)"
                                class="bg-white text-warning border-2 border-warning px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-warning hover:text-white transition-all duration-200 text-sm sm:text-base">
                                <div class="flex items-center justify-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M20 12H4" />
                                    </svg>
                                    <span class="hidden sm:inline">Verwijder Admin</span>
                                    <span class="sm:hidden">Remove</span>
                                </div>
                            </button>

                            <button @click="deleteUser(user.id)"
                                class="bg-white text-error border-2 border-error px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-semibold hover:bg-error hover:text-white transition-all duration-200 text-sm sm:text-base">
                                <div class="flex items-center justify-center space-x-2">
                                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span class="hidden sm:inline">Verwijder</span>
                                    <span class="sm:hidden">Delete</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Empty State -->
            <div v-else-if="users.length === 0" class="text-center py-12 sm:py-16">
                <div
                    class="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5 0a4 4 0 11-8 0" />
                    </svg>
                </div>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Geen gebruikers gevonden</h3>
                <p class="text-sm sm:text-base text-gray-600">Er zijn nog geen gebruikers geregistreerd in het systeem.
                </p>
            </div>

            <!-- No Search Results -->
            <div v-else class="text-center py-12 sm:py-16">
                <div
                    class="w-16 h-16 sm:w-24 sm:h-24 mx-auto mb-4 sm:mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                    <svg class="w-8 h-8 sm:w-12 sm:h-12 text-gray-400" fill="none" stroke="currentColor"
                        viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <h3 class="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Geen resultaten gevonden</h3>
                <p class="text-sm sm:text-base text-gray-600">
                    Geen gebruikers gevonden die voldoen aan je zoekcriteria.
                </p>
                <button
                    @click="clearFilters"
                    class="mt-4 text-primary hover:text-primary-dark font-medium transition-colors"
                >
                    Alle gebruikers tonen
                </button>
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
import { ref, onMounted, computed } from 'vue';
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmation } from '@/composables/useConfirmation';
import { apiClient } from '@/services/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';

const notifications = useNotificationStore();
const confirmation = useConfirmation();

const emit = defineEmits(['users-updated']);

const loading = ref(false);
const users = ref([]);
const searchQuery = ref('');
const adminFilter = ref('all');

// Computed property for filtered users
const filteredUsers = computed(() => {
    let filtered = users.value;

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase();
        filtered = filtered.filter(user => 
            user.email.toLowerCase().includes(query) ||
            user.id.toLowerCase().includes(query) ||
            (user.stripeCustomerId && user.stripeCustomerId.toLowerCase().includes(query))
        );
    }

    // Filter by admin status
    if (adminFilter.value !== 'all') {
        filtered = filtered.filter(user => {
            if (adminFilter.value === 'admin') {
                return user.isAdmin;
            } else if (adminFilter.value === 'user') {
                return !user.isAdmin;
            }
            return true;
        });
    }

    return filtered;
});

const clearFilters = () => {
    searchQuery.value = '';
    adminFilter.value = 'all';
};

const loadUsers = async () => {
    try {
        loading.value = true;
        const data = await apiClient.getAdminUsers();
        users.value = data.users;
    } catch (error) {
        console.error('Error loading users:', error);
        notifications.error('Gebruikers laden mislukt', 'Er is een fout opgetreden bij het laden van de gebruikers.');
    } finally {
        loading.value = false;
    }
};

const makeAdmin = async (userId) => {
    try {
        await confirmation.show({
            title: 'Admin rechten toewijzen',
            message: 'Weet je zeker dat je deze gebruiker admin rechten wilt geven?',
            type: 'info',
            confirmText: 'Ja, maak admin',
            cancelText: 'Annuleren'
        });

        await apiClient.makeUserAdmin(userId);
        await loadUsers(); // Reload users
        emit('users-updated');
        notifications.success('Admin aangemaakt', 'Gebruiker heeft nu admin rechten.');
    } catch (error) {
        if (error.name !== 'UserCancelledError') {
            console.error('Error making user admin:', error);
            notifications.error('Admin aanmaken mislukt', 'Er is een fout opgetreden bij het maken van de gebruiker tot admin.');
        }
    }
};

const removeAdmin = async (userId) => {
    try {
        await confirmation.show({
            title: 'Admin rechten verwijderen',
            message: 'Weet je zeker dat je de admin rechten van deze gebruiker wilt verwijderen?',
            type: 'warning',
            confirmText: 'Ja, verwijder admin',
            cancelText: 'Annuleren'
        });

        await apiClient.removeAdmin(userId);
        await loadUsers(); // Reload users
        emit('users-updated');
        notifications.success('Admin rechten verwijderd', 'Gebruiker heeft geen admin rechten meer.');
    } catch (error) {
        if (error.name !== 'UserCancelledError') {
            console.error('Error removing admin:', error);
            notifications.error('Admin verwijderen mislukt', 'Er is een fout opgetreden bij het verwijderen van admin rechten.');
        }
    }
};

const deleteUser = async (userId) => {
    try {
        await confirmation.confirmDelete('deze gebruiker');

        await apiClient.deleteUser(userId);
        await loadUsers(); // Reload users
        emit('users-updated');
        notifications.success('Verwijderd!', 'Gebruiker is succesvol verwijderd.');
    } catch (error) {
        if (error.name !== 'UserCancelledError') {
            console.error('Error deleting user:', error);
            notifications.error('Verwijderen mislukt', 'Er is een fout opgetreden bij het verwijderen van de gebruiker.');
        }
    }
};

onMounted(() => {
    loadUsers();
});
</script>
