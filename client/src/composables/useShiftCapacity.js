// client/src/composables/useShiftCapacity.js
import { ref, computed, watch } from "vue";
import { apiClient } from "@/services/api";
import { useNotificationStore } from "../stores/notifications";

/**
 * Composable for efficient shift capacity checking and validation
 * Minimizes API calls and provides real-time capacity updates
 */
export function useShiftCapacity() {
  const notifications = useNotificationStore();

  // Reactive state
  const capacityCache = ref(new Map());
  const loading = ref(false);
  const lastCheck = ref(new Map());

  // Cache TTL in milliseconds (5 minutes)
  const CACHE_TTL = 5 * 60 * 1000;

  /**
   * Check if cached data is still valid
   * @param {string} key - Cache key
   * @returns {boolean} True if cache is valid
   */
  const isCacheValid = (key) => {
    const lastCheckTime = lastCheck.value.get(key);
    if (!lastCheckTime) return false;
    return Date.now() - lastCheckTime < CACHE_TTL;
  };

  /**
   * Get capacity data from cache or API
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @param {number} quantity - Requested quantity
   * @returns {Promise<Object>} Capacity check result
   */
  const checkShiftCapacity = async (eventId, shiftId, quantity = 1) => {
    const cacheKey = `${eventId}:${shiftId}:${quantity}`;

    // Return cached data if valid
    if (isCacheValid(cacheKey)) {
      return capacityCache.value.get(cacheKey);
    }

    try {
      loading.value = true;
      const response = await apiClient.checkShiftCapacity(
        eventId,
        shiftId,
        quantity
      );

      // Cache the result
      capacityCache.value.set(cacheKey, response.capacity);
      lastCheck.value.set(cacheKey, Date.now());

      return response.capacity;
    } catch (error) {
      console.error("Failed to check shift capacity:", error);
      notifications.error(
        "Capaciteit controleren mislukt",
        "Probeer het opnieuw."
      );
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Batch check capacity for multiple shifts
   * Optimized for checkout validation
   * @param {Array} shiftRequests - Array of {eventId, shiftId, quantity} objects
   * @returns {Promise<Object>} Batch capacity check results
   */
  const batchCheckShiftCapacity = async (shiftRequests) => {
    try {
      loading.value = true;
      const response = await apiClient.batchCheckShiftCapacity(shiftRequests);

      // Cache individual results
      if (response.results?.capacityChecks) {
        response.results.capacityChecks.forEach((result) => {
          if (result.success) {
            const cacheKey = `${result.shiftId}:${result.requestedQuantity}`;
            capacityCache.value.set(cacheKey, result);
            lastCheck.value.set(cacheKey, Date.now());
          }
        });
      }

      return response.results;
    } catch (error) {
      console.error("Failed to batch check shift capacity:", error);
      notifications.error(
        "Capaciteit controleren mislukt",
        "Probeer het opnieuw."
      );
      throw error;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Validate cart items against shift capacity
   * @param {string} eventId - Event ID
   * @param {Array} cartItems - Cart items with shiftId and quantity
   * @returns {Promise<Object>} Validation result
   */
  const validateCartCapacity = async (eventId, cartItems) => {
    // Group items by shift
    const shiftRequests = new Map();

    cartItems.forEach((item) => {
      if (item.shiftId && item.quantity > 0) {
        const current = shiftRequests.get(item.shiftId) || {
          eventId,
          shiftId: item.shiftId,
          quantity: 0,
        };
        current.quantity += item.quantity;
        shiftRequests.set(item.shiftId, current);
      }
    });

    if (shiftRequests.size === 0) {
      return { success: true, message: "Geen shift validatie vereist" };
    }

    const batchResult = await batchCheckShiftCapacity(
      Array.from(shiftRequests.values())
    );

    if (!batchResult.allCanBook) {
      const failedShifts = batchResult.failedChecks.map((check) => ({
        shiftId: check.shiftId,
        requested: check.requestedQuantity,
        available: check.available || 0,
        reason: check.error || "Onvoldoende capaciteit",
      }));

      return {
        success: false,
        message: "Een of meer tijdsloten zijn vol",
        failedShifts,
        details: batchResult,
      };
    }

    return {
      success: true,
      message: "Alle tijdsloten hebben voldoende capaciteit",
      details: batchResult,
    };
  };

  /**
   * Get cached capacity for a shift (non-blocking)
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @param {number} quantity - Requested quantity
   * @returns {Object|null} Cached capacity data or null
   */
  const getCachedCapacity = (eventId, shiftId, quantity = 1) => {
    const cacheKey = `${eventId}:${shiftId}:${quantity}`;

    if (isCacheValid(cacheKey)) {
      return capacityCache.value.get(cacheKey);
    }

    return null;
  };

  /**
   * Invalidate cache for specific shift
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   */
  const invalidateShiftCache = (eventId, shiftId) => {
    const keysToDelete = [];

    for (const [key] of capacityCache.value) {
      if (key.startsWith(`${eventId}:${shiftId}:`)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach((key) => {
      capacityCache.value.delete(key);
      lastCheck.value.delete(key);
    });
  };

  /**
   * Clear all cached data
   */
  const clearCache = () => {
    capacityCache.value.clear();
    lastCheck.value.clear();
  };

  /**
   * Pre-check capacity when user changes quantities
   * Provides real-time feedback without blocking UI
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @param {number} quantity - New quantity
   * @returns {Promise<Object>} Capacity status
   */
  const preCheckCapacity = async (eventId, shiftId, quantity) => {
    if (quantity <= 0) {
      return { canBook: true, available: Infinity };
    }

    try {
      const capacity = await checkShiftCapacity(eventId, shiftId, quantity);
      return {
        canBook: capacity.canBook,
        available: capacity.available,
        isFull: capacity.isFull,
        willBeFull: capacity.willBeFull,
        currentAttendees: capacity.currentAttendees,
        maxCapacity: capacity.maxCapacity,
      };
    } catch (error) {
      // Return optimistic result on error to not block user
      return { canBook: true, available: 999, error: true };
    }
  };

  // Computed properties
  const cacheSize = computed(() => capacityCache.value.size);
  const isLoading = computed(() => loading.value);

  return {
    // Methods
    checkShiftCapacity,
    batchCheckShiftCapacity,
    validateCartCapacity,
    getCachedCapacity,
    invalidateShiftCache,
    clearCache,
    preCheckCapacity,

    // State
    loading: isLoading,
    cacheSize,

    // Cache management
    isCacheValid,
    CACHE_TTL,
  };
}

/**
 * Reactive shift capacity checker for specific shift
 * Automatically updates when quantity changes
 * @param {Ref} eventId - Reactive event ID
 * @param {Ref} shiftId - Reactive shift ID
 * @param {Ref} quantity - Reactive quantity
 * @returns {Object} Reactive capacity state
 */
export function useReactiveShiftCapacity(eventId, shiftId, quantity) {
  const { checkShiftCapacity, getCachedCapacity } = useShiftCapacity();

  const capacityData = ref(null);
  const loading = ref(false);
  const error = ref(null);

  // Computed availability status
  const availabilityStatus = computed(() => {
    if (!capacityData.value) return "unknown";

    if (capacityData.value.isFull) return "full";
    if (capacityData.value.willBeFull) return "almost-full";
    if (capacityData.value.available < 5) return "low";
    return "available";
  });

  const statusMessages = computed(() => {
    const status = availabilityStatus.value;
    const data = capacityData.value;

    if (!data)
      return { message: "Capaciteit wordt gecontroleerd...", color: "gray" };

    switch (status) {
      case "full":
        return {
          message: "Dit tijdslot is vol",
          color: "red",
          icon: "🚫",
        };
      case "almost-full":
        return {
          message: `Nog ${data.available} plekken beschikbaar`,
          color: "orange",
          icon: "⚠️",
        };
      case "low":
        return {
          message: `Nog ${data.available} plekken beschikbaar`,
          color: "yellow",
          icon: "🟡",
        };
      case "available":
        return {
          message: `${data.available} plekken beschikbaar`,
          color: "green",
          icon: "✅",
        };
      default:
        return { message: "Capaciteit onbekend", color: "gray" };
    }
  });

  // Watch for changes and update capacity
  watch(
    [eventId, shiftId, quantity],
    async ([newEventId, newShiftId, newQuantity]) => {
      if (!newEventId || !newShiftId || newQuantity <= 0) {
        capacityData.value = null;
        return;
      }

      // Check cache first
      const cached = getCachedCapacity(newEventId, newShiftId, newQuantity);
      if (cached) {
        capacityData.value = cached;
        return;
      }

      // Fetch from API
      try {
        loading.value = true;
        error.value = null;
        capacityData.value = await checkShiftCapacity(
          newEventId,
          newShiftId,
          newQuantity
        );
      } catch (err) {
        error.value = err;
        console.error("Shift capacity check failed:", err);
      } finally {
        loading.value = false;
      }
    },
    { deep: true, immediate: true }
  );

  return {
    capacityData,
    loading,
    error,
    availabilityStatus,
    statusMessages,
    canBook: computed(() => capacityData.value?.canBook ?? true),
    available: computed(() => capacityData.value?.available ?? 0),
    isFull: computed(() => capacityData.value?.isFull ?? false),
  };
}
