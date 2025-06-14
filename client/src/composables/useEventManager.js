import { ref, computed } from "vue";
import { apiClient } from "@/services/api";
import { useNotificationStore } from "@/stores/notifications";
import {
  EVENT_TYPES,
  ERROR_MESSAGES,
  NOTIFICATION_TITLES,
} from "@/config/constants";

/**
 * Composable for managing events and event-related operations
 * @returns {object} Event management functions and reactive state
 */
export function useEventManager() {
  const notifications = useNotificationStore();

  // State
  const activeEvents = ref([]);
  const selectedEventId = ref(null);
  const loading = ref(false);

  // Computed
  const selectedEvent = computed(() => {
    return (
      activeEvents.value.find((event) => event.id === selectedEventId.value) ||
      null
    );
  });

  const hasMultipleEvents = computed(() => {
    return activeEvents.value.length > 1;
  });

  const shouldShowEventSelector = computed(() => {
    return activeEvents.value.length > 1;
  });

  /**
   * Load all active events from the API
   * @returns {Promise<void>}
   */
  const loadActiveEvents = async () => {
    loading.value = true;
    try {
      const data = await apiClient.getActiveEvents();
      activeEvents.value = data.events;

      // Auto-select the first active event if available and none is selected
      if (activeEvents.value.length > 0 && !selectedEventId.value) {
        selectedEventId.value = activeEvents.value[0].id;
      }
    } catch (error) {
      console.error("Error loading active events:", error);
      notifications.error(
        NOTIFICATION_TITLES.LOAD_ERROR,
        ERROR_MESSAGES.LOAD_EVENTS_ERROR
      );
      activeEvents.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Select a specific event
   * @param {string} eventId - ID of the event to select
   */
  const selectEvent = (eventId) => {
    if (selectedEventId.value !== eventId) {
      selectedEventId.value = eventId;
    }
  };

  /**
   * Clear event selection
   */
  const clearEventSelection = () => {
    selectedEventId.value = null;
  };

  /**
   * Get event by ID
   * @param {string} eventId - Event ID to find
   * @returns {object|null} Event object or null if not found
   */
  const getEventById = (eventId) => {
    return activeEvents.value.find((event) => event.id === eventId) || null;
  };

  /**
   * Check if an event is a shift event
   * @param {object} event - Event object to check
   * @returns {boolean} True if it's a shift event
   */
  const isShiftEvent = (event = null) => {
    const eventToCheck = event || selectedEvent.value;
    return eventToCheck?.type === EVENT_TYPES.SHIFT_EVENT;
  };

  /**
   * Get available shifts for current selected event
   * @returns {Array} Array of active shifts
   */
  const getAvailableShifts = () => {
    if (!selectedEvent.value?.shifts) return [];
    return selectedEvent.value.shifts.filter((shift) => shift.isActive);
  };

  return {
    // State
    activeEvents,
    selectedEventId,
    selectedEvent,
    loading,

    // Computed
    hasMultipleEvents,
    shouldShowEventSelector,

    // Actions
    loadActiveEvents,
    selectEvent,
    clearEventSelection,
    getEventById,
    isShiftEvent,
    getAvailableShifts,
  };
}
