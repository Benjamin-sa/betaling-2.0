import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationStore = defineStore("notifications", () => {
  const notifications = ref([]);
  let notificationId = 0;

  // Notification types
  const TYPES = {
    SUCCESS: "success",
    ERROR: "error",
    WARNING: "warning",
    INFO: "info",
  };

  // Default durations (in milliseconds)
  const DEFAULT_DURATIONS = {
    [TYPES.SUCCESS]: 4000,
    [TYPES.ERROR]: 6000,
    [TYPES.WARNING]: 5000,
    [TYPES.INFO]: 4000,
  };

  /**
   * Add a notification
   * @param {Object} notification - The notification object
   * @param {string} notification.type - Type of notification (success, error, warning, info)
   * @param {string} notification.title - Title of the notification
   * @param {string} notification.message - Message content
   * @param {number} notification.duration - Duration in ms (optional, uses default based on type)
   * @param {boolean} notification.persistent - If true, notification won't auto-dismiss
   */
  const addNotification = (notification) => {
    const id = ++notificationId;
    const newNotification = {
      id,
      type: notification.type || TYPES.INFO,
      title: notification.title || "",
      message: notification.message || "",
      duration:
        notification.duration ||
        DEFAULT_DURATIONS[notification.type] ||
        DEFAULT_DURATIONS[TYPES.INFO],
      persistent: notification.persistent || false,
      timestamp: Date.now(),
    };

    notifications.value.push(newNotification);

    // Auto-remove notification after duration (unless persistent)
    if (!newNotification.persistent) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  };

  /**
   * Remove a notification by ID
   * @param {number} id - The notification ID
   */
  const removeNotification = (id) => {
    const index = notifications.value.findIndex((n) => n.id === id);
    if (index > -1) {
      notifications.value.splice(index, 1);
    }
  };

  /**
   * Clear all notifications
   */
  const clearAll = () => {
    notifications.value = [];
  };

  // Basic notification methods
  const success = (title, message, options = {}) => {
    return addNotification({
      type: TYPES.SUCCESS,
      title,
      message,
      ...options,
    });
  };

  const error = (title, message, options = {}) => {
    return addNotification({
      type: TYPES.ERROR,
      title,
      message,
      ...options,
    });
  };

  const warning = (title, message, options = {}) => {
    return addNotification({
      type: TYPES.WARNING,
      title,
      message,
      ...options,
    });
  };

  const info = (title, message, options = {}) => {
    return addNotification({
      type: TYPES.INFO,
      title,
      message,
      ...options,
    });
  };

  return {
    notifications,
    TYPES,
    addNotification,
    removeNotification,
    clearAll,
    success,
    error,
    warning,
    info,
  };
});
