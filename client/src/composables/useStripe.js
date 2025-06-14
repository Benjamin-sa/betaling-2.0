import { loadStripe } from "@stripe/stripe-js";
import { ref } from "vue";
import { STRIPE_CONFIG, ERROR_MESSAGES } from "@/config/constants";

/**
 * Composable for managing Stripe integration
 * @returns {object} Stripe functionality and loading state
 */
export function useStripe() {
  const loading = ref(false);
  const stripePromise = loadStripe(STRIPE_CONFIG.PUBLIC_KEY);

  /**
   * Redirect to Stripe checkout
   * @param {string} sessionId - Stripe session ID
   * @throws {Error} If Stripe fails to load or redirect fails
   */
  const redirectToCheckout = async (sessionId) => {
    loading.value = true;

    try {
      const stripe = await stripePromise;
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
    redirectToCheckout,
  };
}
