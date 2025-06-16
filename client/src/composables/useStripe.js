import { loadStripe } from "@stripe/stripe-js";
import { ref, reactive } from "vue";
import { ERROR_MESSAGES } from "@/config/constants";
import { apiClient } from "@/services/api";

/**
 * Composable for managing Stripe integration with dynamic key loading
 * @returns {object} Stripe functionality and loading state
 */
export function useStripe() {
  const loading = ref(false);
  const stripeState = reactive({
    instance: null,
    publicKey: null,
    mode: null,
    initialized: false,
  });

  /**
   * Load current Stripe configuration and initialize Stripe
   * @returns {Promise<object>} Stripe instance
   */
  const initializeStripe = async () => {
    if (stripeState.initialized && stripeState.instance) {
      return stripeState.instance;
    }

    try {
      // Get current Stripe public key from public endpoint (no auth required)
      const response = await apiClient.getStripePublicKey();

      if (response.success && response.data.publicKey) {
        stripeState.publicKey = response.data.publicKey;
        stripeState.mode = response.data.mode;

        // Load Stripe with the current public key
        stripeState.instance = await loadStripe(stripeState.publicKey);
        stripeState.initialized = true;

        console.log(`Stripe initialized in ${stripeState.mode} mode`);
        return stripeState.instance;
      } else {
        throw new Error("Failed to get Stripe public key");
      }
    } catch (error) {
      console.error("Error initializing Stripe:", error);
      throw new Error(ERROR_MESSAGES.STRIPE_LOAD_ERROR);
    }
  };

  /**
   * Refresh Stripe configuration (e.g., after admin mode switch)
   * @returns {Promise<void>}
   */
  const refreshStripeConfig = async () => {
    stripeState.initialized = false;
    stripeState.instance = null;
    await initializeStripe();
  };

  /**
   * Redirect to Stripe checkout
   * @param {string} sessionId - Stripe session ID
   * @throws {Error} If Stripe fails to load or redirect fails
   */
  const redirectToCheckout = async (sessionId) => {
    loading.value = true;

    try {
      const stripe = await initializeStripe();
      if (!stripe) {
        throw new Error(ERROR_MESSAGES.STRIPE_LOAD_ERROR);
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw new Error(error.message);
      }
    } finally {
      loading.value = false;
    }
  };

  return {
    loading,
    stripeState,
    initializeStripe,
    refreshStripeConfig,
    redirectToCheckout,
  };
}
