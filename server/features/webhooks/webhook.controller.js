// server/features/webhooks/webhook.controller.js
const BaseController = require("../../core/controllers/base.controller");
const stripeService = require("../../core/services/stripe.service");
const firebaseService = require("../../core/services/firebase-cached.service");
const gmailService = require("../../core/services/google-apis/gmail.service");
const EmailTemplates = require("../../utils/email-templates");
const {
  OrderFields,
  OrderItemFields,
  createOrderData,
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
          // Send payment success email if payment intent has metadata with session ID
          await this.handlePaymentIntentSucceeded(event);
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

      console.log("[DEBUG WEBHOOK] Session metadata:", {
        eventId: session.metadata?.eventId,
        hasItemsMetadata: !!session.metadata?.items,
        originalItemsCount: originalItems.length,
        originalItems: originalItems.map((item) => ({
          productId: item.productId,
          shiftId: item.shiftId,
          quantity: item.quantity,
        })),
      });

      // 4. Transform session line items to order items with shift information
      const orderItems = this._transformLineItemsToOrderItems(
        session.line_items.data,
        originalItems
      );

      console.log(
        "[DEBUG WEBHOOK] Transformed order items:",
        orderItems.map((item) => ({
          productName: item.productName,
          shiftId: item.shiftId,
          quantity: item.quantity,
        }))
      );

      // 5. Get eventId from metadata
      const eventId = session.metadata?.eventId || "";

      console.log("[DEBUG WEBHOOK] Order data being sent to Firebase:", {
        orderId: session.id,
        userId: user.id,
        eventId: eventId,
        itemsWithShifts: orderItems.filter((item) => item.shiftId).length,
        totalItems: orderItems.length,
      });

      // 6. Save order to Firebase using the updated createOrder method
      await firebaseService.createOrder({
        orderId: session.id,
        userId: user.id,
        items: orderItems,
        amountTotal: this._convertCentsToEuros(session.amount_total),
        currency: session.currency.toUpperCase(),
        paymentMethod: PAYMENT_METHODS.STRIPE,
        eventId: eventId,
      });

      this._logAction("Order uploaded to Firebase", {
        sessionId: session.id,
      });

      // 7. Prepare order data for email using the same structure as stored in Firebase
      const emailOrderData = {
        orderId: session.id,
        [OrderFields.USER_ID]: user.id,
        [OrderFields.AMOUNT_TOTAL]: this._convertCentsToEuros(
          session.amount_total
        ),
        [OrderFields.CURRENCY]: session.currency.toUpperCase(),
        [OrderFields.PAYMENT_METHOD]: PAYMENT_METHODS.STRIPE,
        [OrderFields.EVENT_ID]: eventId,
        items: orderItems,
      };

      await this.sendOrderConfirmationEmail(user, emailOrderData, session);

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
   * Handle successful payment intent
   */
  async handlePaymentIntentSucceeded(event) {
    try {
      const paymentIntent = event.data.object;

      // Try to find the related checkout session from payment intent metadata
      if (paymentIntent.metadata && paymentIntent.metadata.sessionId) {
        const sessionId = paymentIntent.metadata.sessionId;
      } else {
        this._logAction("No session ID found in payment intent metadata", {
          paymentIntentId: paymentIntent.id,
        });
      }
    } catch (error) {
      this._logAction("Error handling payment intent succeeded", {
        error: error.message,
      });
    }
  }

  /**
   * Send order confirmation email to customer
   * @private
   */
  async sendOrderConfirmationEmail(user, orderData, stripeSession) {
    try {
      // Check if Gmail service is authenticated
      const isAuthenticated = await gmailService.isAuthenticated();
      if (!isAuthenticated) {
        this._logAction("Gmail service not authenticated - skipping email", {
          orderId: orderData.orderId,
        });
        return;
      }

      // Generate email content using EmailTemplates utility (returns enhanced email data)
      const emailData = EmailTemplates.generateOrderConfirmationEmail(
        user,
        orderData,
        stripeSession
      );

      // Send email via Gmail service with enhanced headers and formatting
      await gmailService.sendEmail(
        user.email,
        emailData.subject,
        {
          html: emailData.html,
          text: emailData.text,
        },
        {
          from: emailData.from,
          headers: emailData.headers,
        }
      );

      this._logAction("Order confirmation email sent successfully", {
        orderId: orderData.orderId,
        userEmail: user.email,
      });
    } catch (error) {
      // Log error but don't throw - email failure shouldn't block order processing
      this._logAction("Failed to send order confirmation email", {
        orderId: orderData.orderId,
        userEmail: user.email,
        error: error.message,
      });
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
   * Convert cents to euros as a number (not string)
   * @private
   */
  _convertCentsToEuros(amountInCents) {
    return (
      Math.round((amountInCents / CURRENCY_CONVERSION.CENTS_TO_EUROS) * 100) /
      100
    );
  }

  /**
   * Handle Gmail OAuth2 callback - simplified
   */
  async handleGmailCallback(req, res) {
    this._logAction("Received Gmail OAuth2 callback");

    try {
      const { code, error } = req.query;

      if (error) {
        this._logAction("Gmail OAuth2 Error", { error });
        return res.redirect(
          `http://localhost:5173/admin?gmail_error=${encodeURIComponent(error)}`
        );
      }

      if (!code) {
        return res.redirect(
          `http://localhost:5173/admin?gmail_error=${encodeURIComponent(
            "No authorization code received"
          )}`
        );
      }

      // Exchange code for tokens and validate email
      const result = await gmailService.exchangeCodeForTokens(code);

      this._logAction("Gmail OAuth2 successful", {
        email: result.email,
      });

      // Redirect back to admin with success
      return res.redirect("http://localhost:5173/admin?gmail_success=true");
    } catch (err) {
      this._logAction("Gmail OAuth2 callback error", { error: err.message });
      return res.redirect(
        `http://localhost:5173/admin?gmail_error=${encodeURIComponent(
          err.message
        )}`
      );
    }
  }
}

module.exports = new WebhookController();
