<template>
  <div class="py-4 px-4 sm:py-8">
    <h1 class="text-2xl sm:text-3xl font-bold text-center text-text">Admin Dashboard</h1>

    <!-- Event Management Section -->
    <div class="mt-4 sm:mt-8">
      <EventManagement :events="events" @events-updated="loadEvents" />
    </div>

    <!-- Product Management Section -->
    <div class="mt-8">
      <ProductManagement :events="events" @products-updated="loadProducts" />
    </div>

    <!-- Users Management Section -->
    <div class="mt-8">
      <UserManagement :users="users" @users-updated="loadUsers" />
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal v-model="confirmation.isOpen.value" :title="confirmation.config.value.title"
      :message="confirmation.config.value.message" :type="confirmation.config.value.type"
      :confirm-text="confirmation.config.value.confirmText" :cancel-text="confirmation.config.value.cancelText"
      @confirm="confirmation.confirm" @cancel="confirmation.cancel" @close="confirmation.close" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useConfirmation } from '@/composables/useConfirmation';
import { apiClient } from '@/services/api';
import ConfirmationModal from '@/components/ui/ConfirmationModal.vue';
import EventManagement from '@/components/admin/EventManagement.vue';
import ProductManagement from '@/components/admin/ProductManagement.vue';
import UserManagement from '@/components/admin/UserManagement.vue';

const confirmation = useConfirmation();
const users = ref([]);
const events = ref([]);

const loadUsers = async () => {
  try {
    const data = await apiClient.getAdminUsers();
    users.value = data.users;
  } catch (error) {
    console.error('Error loading users:', error);
  }
};

const loadEvents = async () => {
  try {
    const data = await apiClient.getEvents();
    events.value = data.events;
  } catch (error) {
    console.error('Error loading events:', error);
  }
};

const loadProducts = async () => {
  // This is just to trigger a refresh in ProductManagement component
  // The actual loading is handled by the component itself
};

onMounted(() => {
  loadUsers();
  loadEvents();
});
</script>
