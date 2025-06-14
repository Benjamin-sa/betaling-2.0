// server/features/webhooks/webhook.controller.js
const BaseController = require("../../core/controllers/base.controller");
const stripeService = require("../../core/services/stripe.service");
const firebaseService = require("../../core/services/firebase.service");
const {
  OrderFields,
  OrderItemFields,
  createOrderItemData,
} = require("../../models/webstore.model");

// Constants for better maintainability
const STRIPE_EVENT_TYPES = {
  CHECKOUT_SESSION_COMPLETED: "checkout.session.completed",
  PAYMENT_INTENT_SUCCEEDED: "payment_intent.succeeded",
  PAYMENT_INTENT_FAILED: "payment_intent.payment_failed",
};

const PAYMENT_METHODS = {
  STRIPE: "stripe",
  MANUAL: "manual",
};

const CURRENCY_CONVERSION = {
  CENTS_TO_EUROS: 100,
};

class WebhookController extends BaseController {
  /**
   * Handle Stripe webhook events
   */
  async handleStripeWebhook(req, res) {
    this._logAction("Received Stripe webhook request");
    const sig = req.headers["stripe-signature"];

    try {
      // 1. Validate webhook signature and get event
      const event = await stripeService.validateWebhookEvent(req.body, sig);

      // 2. Handle different event types
      await this.processStripeEvent(event);

      res.json({ received: true });
    } catch (err) {
      this._logAction("Stripe Webhook Error", { error: err.message });
      return this._sendErrorResponse(
        res,
        `Webhook Error: ${err.message}`,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }
  }

  /**
   * Process different types of Stripe events
   */
  async processStripeEvent(event) {
    try {
      switch (event.type) {
        case STRIPE_EVENT_TYPES.CHECKOUT_SESSION_COMPLETED:
          await this.handleCheckoutSessionCompleted(event);
          break;

        case STRIPE_EVENT_TYPES.PAYMENT_INTENT_SUCCEEDED:
          this._logAction("Payment succeeded", {
            paymentIntentId: event.data.object.id,
          });
          // Add logic for payment success if needed
          break;

        case STRIPE_EVENT_TYPES.PAYMENT_INTENT_FAILED:
          this._logAction("Payment failed", {
            paymentIntentId: event.data.object.id,
          });
          // Add logic for payment failure if needed
          break;

        default:
          this._logAction("Unhandled Stripe event type", {
            eventType: event.type,
          });
          break;
      }
    } catch (error) {
      this._logAction("Error processing Stripe event", {
        eventType: event.type,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Handle successful checkout session completion
   */
  async handleCheckoutSessionCompleted(event) {
    try {
      // 1. Get full session details with line items
      const session = await stripeService.getCheckoutSession(
        event.data.object.id
      );
      this._logAction("Checkout session completed", { sessionId: session.id });

      // 2. Get user by Stripe customer ID
      let user;
      if (session.customer) {
        this._logAction("Getting user by Stripe ID", {
          stripeCustomerId: session.customer,
        });
        user = await firebaseService.getUserByStripeId(session.customer);
      }

      // Early return if no user found (better error handling)
      if (!user) {
        const errorMessage = `No user found for Stripe customer ID: ${session.customer}`;
        this._logAction("User not found for Stripe customer", {
          stripeCustomerId: session.customer,
        });
        throw new Error(errorMessage);
      }

      // 3. Parse original items from metadata to get shift information
      const originalItems = session.metadata?.items
        ? JSON.parse(session.metadata.items)
        : [];

      // 4. Transform session line items to order items with shift information
      const orderItems = this._transformLineItemsToOrderItems(
        session.line_items.data,
        originalItems
      );

      // 5. Get eventId from metadata (should always be present)
      const eventId = session.metadata?.eventId;

      // 6. Create order data object with proper structure for firebase service
      const orderData = {
        orderId: session.id,
        [OrderFields.USER_ID]: user.id,
        items: orderItems,
        [OrderFields.AMOUNT_TOTAL]: this._convertCentsToEuros(
          session.amount_total
        ),
        [OrderFields.CURRENCY]: session.currency.toUpperCase(),
        [OrderFields.PAYMENT_METHOD]: PAYMENT_METHODS.STRIPE,
        // EventId should always be present from metadata
        [OrderFields.EVENT_ID]: eventId,
      };

      // 6. Save order to Firebase (factory function validation happens inside firebaseService)
      await firebaseService.createOrder(orderData);
      this._logAction("Order uploaded to Firebase", {
        sessionId: session.id,
      });

      this._logAction("Successfully processed checkout session", {
        sessionId: session.id,
      });
    } catch (error) {
      this._logAction("Error handling checkout session completion", {
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Transform Stripe line items to order items with proper field mapping and shift information
   * @private
   */
  _transformLineItemsToOrderItems(lineItemsData, originalItems = []) {
    return lineItemsData.map((lineItem, index) => {
      // Find corresponding original item to get shift information
      const originalItem = originalItems[index];

      return createOrderItemData({
        [OrderItemFields.PRODUCT_NAME]: lineItem.description,
        [OrderItemFields.QUANTITY]: lineItem.quantity,
        [OrderItemFields.AMOUNT_TOTAL]: this._convertCentsToEuros(
          lineItem.amount_total
        ),
        [OrderItemFields.UNIT_PRICE]: this._convertCentsToEuros(
          lineItem.price.unit_amount
        ),
        // Include shift information from original item if available
        [OrderItemFields.SHIFT_ID]: originalItem?.shiftId || "",
      });
    });
  }

  /**
   * Convert cents to euros with proper formatting
   * @private
   */
  _convertCentsToEuros(amountInCents) {
    return (amountInCents / CURRENCY_CONVERSION.CENTS_TO_EUROS).toFixed(2);
  }
}

module.exports = new WebhookController();
