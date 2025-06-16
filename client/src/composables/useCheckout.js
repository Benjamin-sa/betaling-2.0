import { ref } from "vue";
import { apiClient } from "@/services/api";
import { useAuthStore } from "@/stores/auth";
import { useNotificationStore } from "@/stores/notifications";
import { useStripe } from "./useStripe";
import { useProductManager } from "./useProductManager";
import { useShiftCapacity } from "./useShiftCapacity";
import {
  EVENT_TYPES,
  ERROR_MESSAGES,
  NOTIFICATION_TITLES,
} from "@/config/constants";

/**
 * Composable for handling checkout operations
 * @param {Ref} products - Reactive reference to products array
 * @param {Ref} cartItems - Reactive reference to cart items array
 * @param {Ref} selectedEvent - Reactive reference to selected event
 * @returns {object} Checkout functionality and loading state
 */
export function useCheckout(products, cartItems, selectedEvent) {
  const auth = useAuthStore();
  const notifications = useNotificationStore();
  const { redirectToCheckout } = useStripe();
  const { validateCartCapacity } = useShiftCapacity();

  const loading = ref(false);

  /**
   * Get validation errors for checkout
   * @returns {string|null} Error message or null if valid
   */
  const getCheckoutValidationError = () => {
    const selectedItems = cartItems.value.filter((item) => item.quantity > 0);

    if (selectedItems.length === 0) {
      return ERROR_MESSAGES.NO_PRODUCTS_SELECTED;
    }

    // Check for mixed Stripe modes (test and live products in same cart)
    const productModes = selectedItems
      .map((item) => {
        const product = products.value.find((p) => p.id === item.productId);
        return product?.isTestMode;
      })
      .filter((mode) => mode !== undefined);

    if (productModes.length > 0) {
      const hasTestMode = productModes.some((mode) => mode === true);
      const hasLiveMode = productModes.some((mode) => mode === false);

      if (hasTestMode && hasLiveMode) {
        return ERROR_MESSAGES.MIXED_STRIPE_MODES_ERROR;
      }
    }

    if (selectedEvent?.value?.type === EVENT_TYPES.SHIFT_EVENT) {
      const hasTimeslotRequiredProductsWithoutShifts = selectedItems.some(
        (item) => {
          const product = products.value.find((p) => p.id === item.productId);
          return product?.requiresTimeslot === true && !item.shiftId;
        }
      );

      if (hasTimeslotRequiredProductsWithoutShifts) {
        return ERROR_MESSAGES.TIMESLOT_REQUIRED;
      }

      // Allow multiple shifts - no validation needed anymore
      // The new system supports checkout with products from different shifts
    }

    return null;
  };

  /**
   * Prepare product items for checkout
   * @returns {Array} Array of product items for checkout
   */
  const prepareProductItemsForCheckout = () => {
    const selectedItems = cartItems.value.filter((item) => item.quantity > 0);

    return selectedItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
      shiftId: item.shiftId,
      type: "product",
    }));
  };

  /**
   * Handle the complete checkout process
   * @returns {Promise<void>}
   */
  const handleCheckout = async () => {
    loading.value = true;

    try {
      // Check authentication
      if (!auth.token) {
        notifications.warning(
          NOTIFICATION_TITLES.AUTH_ERROR,
          ERROR_MESSAGES.AUTH_REQUIRED
        );
        return;
      }

      // Validate cart items
      const validationError = getCheckoutValidationError();
      if (validationError) {
        notifications.warning(
          NOTIFICATION_TITLES.VALIDATION_ERROR,
          validationError
        );
        return;
      }

      // OPTIMIZED: Validate shift capacity before proceeding to Stripe
      if (selectedEvent.value?.type === EVENT_TYPES.SHIFT_EVENT) {
        const selectedItems = cartItems.value.filter(
          (item) => item.quantity > 0
        );
        const capacityValidation = await validateCartCapacity(
          selectedEvent.value.id,
          selectedItems
        );

        if (!capacityValidation.success) {
          const failedShifts = capacityValidation.failedShifts || [];
          const shiftDetails = failedShifts
            .map(
              (shift) =>
                `${shift.shiftId}: ${shift.requested} gevraagd, ${shift.available} beschikbaar`
            )
            .join("; ");

          notifications.error(
            "Tijdslot Vol",
            `Onvoldoende capaciteit: ${shiftDetails}`
          );
          return;
        }
      }

      // Prepare checkout data
      const productItems = prepareProductItemsForCheckout();
      const eventId = selectedEvent.value.id;

      // Create checkout session
      const response = await apiClient.createCheckoutSession(
        productItems,
        eventId
      );

      // Redirect to Stripe checkout
      await redirectToCheckout(response.sessionId);
    } catch (error) {
      console.error("Error during checkout:", error);
      notifications.error(
        NOTIFICATION_TITLES.CHECKOUT_ERROR,
        error.message || ERROR_MESSAGES.CHECKOUT_ERROR
      );
    } finally {
      loading.value = false;
    }
  };

  /**
   * Get information about shifts in the cart
   * @returns {object} Information about shifts in cart
   */
  const getShiftInformation = () => {
    const selectedItems = cartItems.value.filter((item) => item.quantity > 0);
    const shiftGroups = {};
    const shiftsWithProducts = [];

    selectedItems.forEach((item) => {
      const product = products.value.find((p) => p.id === item.productId);
      if (product) {
        const shiftId = item.shiftId || "no-shift";

        if (!shiftGroups[shiftId]) {
          shiftGroups[shiftId] = [];
        }

        shiftGroups[shiftId].push({
          ...product,
          quantity: item.quantity,
          shiftId: item.shiftId,
        });
      }
    });

    // Convert to array for easier handling
    Object.keys(shiftGroups).forEach((shiftId) => {
      if (shiftId === "no-shift") {
        // Products without shifts
        shiftsWithProducts.push({
          shiftId: null,
          shiftName: "Geen tijdslot",
          products: shiftGroups[shiftId],
          totalItems: shiftGroups[shiftId].reduce(
            (sum, p) => sum + p.quantity,
            0
          ),
          totalPrice: shiftGroups[shiftId].reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
          ),
        });
      } else {
        // Products with shifts
        const shift = selectedEvent.value?.shifts?.find(
          (s) => s.id === shiftId
        );
        shiftsWithProducts.push({
          shiftId,
          shiftName: shift
            ? `${shift.name} (${shift.startTime} - ${shift.endTime})`
            : "Onbekend tijdslot",
          products: shiftGroups[shiftId],
          totalItems: shiftGroups[shiftId].reduce(
            (sum, p) => sum + p.quantity,
            0
          ),
          totalPrice: shiftGroups[shiftId].reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
          ),
        });
      }
    });

    return {
      hasMultipleShifts: shiftsWithProducts.length > 1,
      shiftsWithProducts,
      totalShifts: shiftsWithProducts.length,
    };
  };

  return {
    loading,
    handleCheckout,
    getShiftInformation,
  };
}
