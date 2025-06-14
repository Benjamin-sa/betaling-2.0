import { ref, watch } from "vue";
import { STORAGE_KEYS, DEBOUNCE_TIMINGS } from "@/config/constants";

/**
 * Composable for managing localStorage with debouncing and reactive updates
 * @param {string} baseKey - Base key for localStorage (will be prefixed with event ID)
 * @param {any} defaultValue - Default value to return if no stored value exists
 * @param {number} debounceMs - Debounce time in milliseconds for saving
 */
export function useLocalStorage(
  baseKey,
  defaultValue = {},
  debounceMs = DEBOUNCE_TIMINGS.LOCAL_STORAGE_SAVE
) {
  const data = ref(defaultValue);
  let saveTimeout = null;

  /**
   * Get the full storage key for a specific event
   * @param {string} eventId - Event ID to create specific key
   * @returns {string} Full storage key
   */
  const getStorageKey = (eventId) => {
    if (!eventId) return null;
    return `${baseKey}_${eventId}`;
  };

  /**
   * Load data from localStorage for a specific event
   * @param {string} eventId - Event ID to load data for
   */
  const loadFromStorage = (eventId) => {
    const key = getStorageKey(eventId);
    if (!key) {
      data.value = defaultValue;
      return;
    }

    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        data.value = JSON.parse(stored);
      } else {
        data.value = defaultValue;
      }
    } catch (error) {
      console.warn(`Failed to load ${baseKey} from localStorage:`, error);
      data.value = defaultValue;
    }
  };

  /**
   * Save data to localStorage with debouncing
   * @param {string} eventId - Event ID to save data for
   * @param {any} valueToSave - Value to save (optional, uses current data if not provided)
   */
  const saveToStorage = (eventId, valueToSave = null) => {
    const key = getStorageKey(eventId);
    if (!key) return;

    // Clear previous timeout
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }

    // Debounce the save operation
    saveTimeout = setTimeout(() => {
      try {
        const dataToSave = valueToSave !== null ? valueToSave : data.value;
        localStorage.setItem(key, JSON.stringify(dataToSave));
      } catch (error) {
        console.warn(`Failed to save ${baseKey} to localStorage:`, error);
      }
    }, debounceMs);
  };

  /**
   * Clear data for a specific event
   * @param {string} eventId - Event ID to clear data for
   */
  const clearStorage = (eventId) => {
    const key = getStorageKey(eventId);
    if (!key) return;

    try {
      localStorage.removeItem(key);
      data.value = defaultValue;
    } catch (error) {
      console.warn(`Failed to clear ${baseKey} from localStorage:`, error);
    }
  };

  /**
   * Update a specific property in the data object
   * @param {string} property - Property to update
   * @param {any} value - New value
   * @param {string} eventId - Event ID to save for
   */
  const updateProperty = (property, value, eventId) => {
    if (typeof data.value === "object" && data.value !== null) {
      data.value[property] = value;
      saveToStorage(eventId);
    }
  };

  /**
   * Clear all timeout operations (useful for cleanup)
   */
  const cleanup = () => {
    if (saveTimeout) {
      clearTimeout(saveTimeout);
      saveTimeout = null;
    }
  };

  return {
    data,
    loadFromStorage,
    saveToStorage,
    clearStorage,
    updateProperty,
    cleanup,
  };
}

/**
 * Specific composable for managing product quantities
 * @returns {object} Quantities management functions and data
 */
export function useQuantitiesStorage() {
  const storage = useLocalStorage(STORAGE_KEYS.QUANTITIES, {});

  const initializeQuantities = (products, eventId) => {
    storage.loadFromStorage(eventId);

    // Ensure all products have a quantity entry
    const newQuantities = {};
    products.forEach((product) => {
      newQuantities[product.id] = storage.data.value[product.id] || 0;
    });
    storage.data.value = newQuantities;
    storage.saveToStorage(eventId);
  };

  const updateQuantity = (productId, quantity, eventId) => {
    storage.updateProperty(productId, Math.max(0, quantity), eventId);
  };

  return {
    quantities: storage.data,
    initializeQuantities,
    updateQuantity,
    loadQuantities: storage.loadFromStorage,
    saveQuantities: storage.saveToStorage,
    clearQuantities: storage.clearStorage,
    cleanup: storage.cleanup,
  };
}

/**
 * Specific composable for managing selected shifts
 * @returns {object} Shifts management functions and data
 */
export function useShiftsStorage() {
  const storage = useLocalStorage(STORAGE_KEYS.SHIFTS, []);

  const updateShifts = (shifts, eventId) => {
    storage.data.value = shifts;
    storage.saveToStorage(eventId);
  };

  return {
    selectedShifts: storage.data,
    updateShifts,
    loadShifts: storage.loadFromStorage,
    saveShifts: storage.saveToStorage,
    clearShifts: storage.clearStorage,
    cleanup: storage.cleanup,
  };
}

/**
 * Specific composable for managing product-shift selections
 * @returns {object} Product-shift management functions and data
 */
export function useProductShiftStorage() {
  const storage = useLocalStorage(STORAGE_KEYS.PRODUCT_SHIFTS, {});

  const updateProductShift = (productId, shiftId, eventId) => {
    if (shiftId) {
      storage.updateProperty(productId, shiftId, eventId);
    } else {
      // Remove the property if shiftId is empty
      delete storage.data.value[productId];
      storage.saveToStorage(eventId);
    }
  };

  const initializeProductShiftSelection = (products, eventId) => {
    storage.loadFromStorage(eventId);

    // Clean up selections for products that no longer exist
    const productIds = products.map((p) => p.id);
    const currentSelections = { ...storage.data.value };

    Object.keys(currentSelections).forEach((productId) => {
      if (!productIds.includes(productId)) {
        delete storage.data.value[productId];
      }
    });

    storage.saveToStorage(eventId);
  };

  return {
    productShiftSelection: storage.data,
    updateProductShift,
    initializeProductShiftSelection,
    loadProductShiftSelection: storage.loadFromStorage,
    saveProductShiftSelection: storage.saveToStorage,
    clearProductShiftSelection: storage.clearStorage,
    cleanup: storage.cleanup,
  };
}

/**
 * Specific composable for managing cart items (product-shift combinations)
 * @returns {object} Cart items management functions and data
 */
export function useCartItemsStorage() {
  const storage = useLocalStorage(STORAGE_KEYS.CART_ITEMS, []);

  /**
   * Add or update a cart item
   * @param {string} productId - Product ID
   * @param {string|null} shiftId - Shift ID (null for products without shifts)
   * @param {number} quantity - Quantity to set
   * @param {string} eventId - Event ID
   */
  const updateCartItem = (productId, shiftId, quantity, eventId) => {
    const items = [...storage.data.value];
    const existingIndex = items.findIndex(
      (item) => item.productId === productId && item.shiftId === shiftId
    );

    if (quantity <= 0) {
      // Remove item if quantity is 0 or less
      if (existingIndex >= 0) {
        items.splice(existingIndex, 1);
      }
    } else {
      // Add or update item
      if (existingIndex >= 0) {
        items[existingIndex].quantity = quantity;
      } else {
        items.push({ productId, shiftId, quantity });
      }
    }

    storage.data.value = items;
    storage.saveToStorage(eventId);
  };

  /**
   * Get quantity for a specific product-shift combination
   * @param {string} productId - Product ID
   * @param {string|null} shiftId - Shift ID
   * @returns {number} Quantity
   */
  const getCartItemQuantity = (productId, shiftId = null) => {
    const item = storage.data.value.find(
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
    return storage.data.value
      .filter((item) => item.productId === productId)
      .reduce((sum, item) => sum + item.quantity, 0);
  };

  /**
   * Clear all cart items
   * @param {string} eventId - Event ID
   */
  const clearCart = (eventId) => {
    storage.data.value = [];
    storage.saveToStorage(eventId);
  };

  /**
   * Initialize cart items for an event
   * @param {Array} products - Available products
   * @param {string} eventId - Event ID
   */
  const initializeCartItems = (products, eventId) => {
    storage.loadFromStorage(eventId);

    // Clean up cart items for products that no longer exist
    const productIds = products.map((p) => p.id);
    const validItems = storage.data.value.filter((item) =>
      productIds.includes(item.productId)
    );

    if (validItems.length !== storage.data.value.length) {
      storage.data.value = validItems;
      storage.saveToStorage(eventId);
    }
  };

  return {
    cartItems: storage.data,
    updateCartItem,
    getCartItemQuantity,
    getTotalProductQuantity,
    clearCart,
    initializeCartItems,
    loadCartItems: storage.loadFromStorage,
    saveCartItems: storage.saveToStorage,
    clearCartItems: storage.clearStorage,
    cleanup: storage.cleanup,
  };
}
