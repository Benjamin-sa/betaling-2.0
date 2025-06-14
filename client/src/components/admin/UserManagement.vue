<template>
    <div class="bg-cardBackground rounded-lg shadow-lg p-6">
        <h2 class="text-2xl font-semibold text-primary mb-4">Gebruikers Beheren</h2>
        <div class="space-y-4">
            <div v-for="user in users" :key="user.firebase_uid"
                class="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                <div class="flex-1">
                    <h3 class="text-lg font-semibold text-primary">{{ user.email }}</h3>
                    <p class="text-sm text-gray-600">Firebase UID: {{ user.firebase_uid }}</p>
                    <p class="text-sm text-gray-600">Stripe Customer ID: {{ user.stripe_customer_id }}</p>
                    <p class="text-sm font-medium" :class="user.is_admin ? 'text-green-600' : 'text-gray-500'">
                        {{ user.is_admin ? 'Administrator' : 'Gewone gebruiker' }}
                    </p>
                </div>
                <div class="flex space-x-2">
                    <button v-if="!user.is_admin" @click="makeAdmin(user.firebase_uid)"
                        class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition duration-300">
                        Maak Admin
                    </button>
                    <button v-if="user.is_admin" @click="removeAdmin(user.firebase_uid)"
                        class="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition duration-300">
                        Verwijder Admin
                    </button>
                    <button @click="deleteUser(user.firebase_uid)"
                        class="bg-secondary text-white px-3 py-1 rounded hover:bg-red-700 transition duration-300">
                        Verwijder Gebruiker
                    </button>
                </div>
            </div>
            <div v-if="users.length === 0" class="text-center text-gray-500 py-8">
                Geen gebruikers gevonden.
            </div>
        </div>
    </div>
</template>

<script setup>
import { useNotificationStore } from '@/stores/notifications';
import { useConfirmation } from '@/composables/useConfirmation';
import { apiClient } from '@/services/api';

const notifications = useNotificationStore();
const confirmation = useConfirmation();

const props = defineProps({
    users: {
        type: Array,
        default: () => []
    }
});

const emit = defineEmits(['users-updated']);

const deleteUser = async (firebaseUid) => {
    try {
        await confirmation.confirmDelete('deze gebruiker');

        await apiClient.deleteUser(firebaseUid);
        emit('users-updated');
        notifications.success('Verwijderd!', 'Gebruiker is succesvol verwijderd.');
    } catch (error) {
        if (error.name !== 'UserCancelledError') {
            console.error('Error deleting user:', error);
            notifications.error('Gebruiker verwijderen mislukt', 'Er is een fout opgetreden bij het verwijderen van de gebruiker.');
        }
    }
};

const removeAdmin = async (firebaseUid) => {
    try {
        await confirmation.show({
            title: 'Admin rechten verwijderen',
            message: 'Weet je zeker dat je de admin rechten wilt verwijderen van deze gebruiker?',
            type: 'warning',
            confirmText: 'Rechten verwijderen',
            cancelText: 'Annuleren'
        });

        await apiClient.removeAdmin(firebaseUid);
        emit('users-updated');
        notifications.success('Rechten aangepast', 'Admin rechten zijn succesvol verwijderd.');
    } catch (error) {
        if (error.name !== 'UserCancelledError') {
            console.error('Error removing admin:', error);
            notifications.error('Rechten aanpassen mislukt', 'Er is een fout opgetreden bij het verwijderen van admin rechten.');
        }
    }
};

const makeAdmin = async (firebaseUid) => {
    try {
        await confirmation.show({
            title: 'Admin rechten toekennen',
            message: 'Weet je zeker dat je deze gebruiker admin rechten wilt geven?',
            type: 'info',
            confirmText: 'Admin maken',
            cancelText: 'Annuleren'
        });

        await apiClient.makeUserAdmin(firebaseUid);
        emit('users-updated');
        notifications.success('Admin aangemaakt', 'Gebruiker heeft nu admin rechten.');
    } catch (error) {
        if (error.name !== 'UserCancelledError') {
            console.error('Error making user admin:', error);
            notifications.error('Admin aanmaken mislukt', 'Er is een fout opgetreden bij het maken van de gebruiker tot admin.');
        }
    }
};
</script>
