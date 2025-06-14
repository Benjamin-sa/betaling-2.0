<template>
  <div class="pt-24 pb-8 px-4 sm:pt-28 sm:pb-12 min-h-screen bg-gray-50">
    <!-- Admin Dashboard with Tab Layout -->
    <AdminTabs :events="events" @events-updated="loadEvents" @products-updated="loadProducts" />

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
import AdminTabs from '@/components/admin/AdminTabs.vue';

const confirmation = useConfirmation();
const events = ref([]);

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
  loadEvents();
});
</script>
