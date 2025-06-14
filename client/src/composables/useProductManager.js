import { ref, computed } from "vue";
import { apiClient } from "@/services/api";
import { useNotificationStore } from "@/stores/notifications";
import {
  ERROR_MESSAGES,
  NOTIFICATION_TITLES,
  EVENT_TYPES,
} from "@/config/constants";

/**
 * Composable for managing products and product-related operations
 * @param {Ref} cartItems - Reactive reference to cart items array
 * @param {Ref} selectedEvent - Reactive reference to selected event
 * @returns {object} Product management functions and reactive state
 */
export function useProductManager(cartItems = null, selectedEvent = null) {
  const notifications = useNotificationStore();

  // State
  const products = ref([]);
  const loading = ref(false);

  /**
   * Load products for a specific event
   * @param {string} eventId - Event ID to load products for
   * @returns {Promise<void>}
   */
  const loadProductsForEvent = async (eventId) => {
    if (!eventId) {
      products.value = [];
      return;
    }

    loading.value = true;
    try {
      const data = await apiClient.getProducts(eventId);
      products.value = data.products;
    } catch (error) {
      console.error("Error loading products:", error);
      notifications.error(
        NOTIFICATION_TITLES.LOAD_ERROR,
        ERROR_MESSAGES.LOAD_PRODUCTS_ERROR
      );
      products.value = [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Handle image error for a product
   * @param {object} product - Product object with image error
   */
  const handleImageError = (product) => {
    // Simply remove the imageUrl without any error handling visual feedback
    product.imageUrl = null;
  };

  /**
   * Get product by ID
   * @param {string} productId - Product ID to find
   * @returns {object|null} Product object or null if not found
   */
  const getProductById = (productId) => {
    return products.value.find((product) => product.id === productId) || null;
  };

  /**
   * Clear all products
   */
  const clearProducts = () => {
    products.value = [];
  };

  // ===== VALIDATION & CALCULATION FUNCTIONS =====
  // (Integrated from useProductValidation)

  /**
   * Get products that have been selected (quantity > 0)
   */
  const selectedProducts = computed(() => {
    if (!cartItems?.value) return [];

    const selectedItems = cartItems.value.filter((item) => item.quantity > 0);
    const productsMap = new Map();

    selectedItems.forEach((item) => {
      const product = products.value.find((p) => p.id === item.productId);
      if (product) {
        const key = `${item.productId}_${item.shiftId || "no-shift"}`;
        productsMap.set(key, {
          ...product,
          quantity: item.quantity,
          shiftId: item.shiftId,
          cartItemKey: key,
        });
      }
    });

    return Array.from(productsMap.values());
  });

  /**
   * Check if any selected products require timeslots
   */
  const hasTimeslotRequiredProducts = computed(() => {
    return selectedProducts.value.some(
      (product) => product.requiresTimeslot === true
    );
  });

  /**
   * Check if user has selected any products
   */
  const hasSelectedProducts = computed(() => {
    if (!cartItems?.value) return false;
    return cartItems.value.some((item) => item.quantity > 0);
  });

  /**
   * Check if any selected products require timeslots but don't have shifts selected
   */
  const hasTimeslotRequiredProductsWithoutShifts = computed(() => {
    if (!selectedEvent?.value) return false;
    if (selectedEvent.value?.type !== EVENT_TYPES.SHIFT_EVENT) return false;

    return selectedProducts.value.some(
      (product) => product.requiresTimeslot === true && !product.shiftId
    );
  });

  /**
   * Validate if cart has valid items for checkout
   * For shift events: products requiring timeslots must have shifts selected
   * For regular events: just need products
   */
  const hasValidCartItems = computed(() => {
    if (!hasSelectedProducts.value) return false;

    if (selectedEvent?.value?.type === EVENT_TYPES.SHIFT_EVENT) {
      // Check if any products requiring timeslots don't have shifts selected
      return !hasTimeslotRequiredProductsWithoutShifts.value;
    } else {
      // For regular events, only need products
      return hasSelectedProducts.value;
    }
  });

  /**
   * Get validation errors for checkout
   * @returns {string|null} Error message or null if valid
   */
  const getCheckoutValidationError = () => {
    if (!hasSelectedProducts.value) {
      return ERROR_MESSAGES.NO_PRODUCTS_SELECTED;
    }

    if (selectedEvent?.value?.type === EVENT_TYPES.SHIFT_EVENT) {
      if (hasTimeslotRequiredProductsWithoutShifts.value) {
        return ERROR_MESSAGES.TIMESLOT_REQUIRED;
      }
    }

    return null;
  };

  /**
   * Prepare product items for checkout
   * @returns {Array} Array of product items for checkout
   */
  const prepareProductItemsForCheckout = () => {
    return selectedProducts.value.map((product) => ({
      productId: product.id,
      quantity: product.quantity,
      shiftId: product.shiftId,
      type: "product",
    }));
  };

  /**
   * Calculate total price for selected products
   */
  const totalPrice = computed(() => {
    if (!cartItems?.value) return 0;
    return selectedProducts.value.reduce((sum, product) => {
      return sum + product.price * product.quantity;
    }, 0);
  });

  /**
   * Calculate total number of items
   */
  const totalItems = computed(() => {
    if (!cartItems?.value) return 0;
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0);
  });

  /**
   * Get quantity for a specific product-shift combination
   * @param {string} productId - Product ID
   * @param {string|null} shiftId - Shift ID (null for products without shifts)
   * @returns {number} Quantity
   */
  const getProductQuantity = (productId, shiftId = null) => {
    if (!cartItems?.value) return 0;
    const item = cartItems.value.find(
      (item) => item.productId === productId && item.shiftId === shiftId
    );
    return item ? item.quantity : 0;
  };

  /**
   * Get total quantity for a product across all shifts
   * @param {string} productId - Product ID
   * @returns {number} Total quantity
   */
  const getTotalProductQuantity = (productId) => {
    if (!cartItems?.value) return 0;
    return cartItems.value
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    // State
    products,
    loading,

    // Product Management Actions
    loadProductsForEvent,
    handleImageError,
    getProductById,
    clearProducts,

    // Validation & Calculations
    selectedProducts,
    hasTimeslotRequiredProducts,
    hasTimeslotRequiredProductsWithoutShifts,
    hasSelectedProducts,
    hasValidCartItems,
    totalPrice,
    totalItems,
    getCheckoutValidationError,
    prepareProductItemsForCheckout,

    // Cart Item Helpers
    getProductQuantity,
    getTotalProductQuantity,
  };
}
