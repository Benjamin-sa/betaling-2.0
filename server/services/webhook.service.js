// services/webhook.service.js
const userService = require("./user.service");
const db = require("../db").instance;
// webhook.service.js
class WebhookService {
  // Handle incoming Stripe webhook events for successful checkout sessions
  async handleCheckoutSession(session) {
    try {
      console.log("Processing checkout session:", session.id);

      if (!session.customer_details?.email) {
        throw new Error("Customer email not found in session");
      }

      if (!session.line_items?.data?.length) {
        throw new Error("No line items found in session");
      }

      const order = await this.createOrderFromSession(session);
    } catch (error) {
      console.error("Error processing checkout session:", error);
      throw error;
    }
  }

  async createOrderFromSession(session) {
    // Get user by Stripe customer ID
    let user;

    if (session.customer) {
      console.log("Getting user by Stripe ID:", session.customer);
      user = await userService.getUserByStripeId(session.customer);
    }

    if (!user && session.customer_details?.email) {
      console.log("Getting user by email:", session.customer_details.email);
      user = await userService.getUserByEmail(session.customer_details.email);
    }

    if (!user) {
      throw new Error("User not found for the given customer information");
    }

    const orderItems = session.line_items.data.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amount: (item.amount_total / 100).toFixed(2),
      unit_price: (item.price.unit_amount / 100).toFixed(2),
    }));

    // Create order object
    return {
      id: session.id,
      user_id: user.firebase_uid,
      items: orderItems,
      amount_total: (session.amount_total / 100).toFixed(2),
      currency: session.currency.toUpperCase(),
      time_slot: timeSlot || null, // Allow null for orders without time slot
    };
  }
}

module.exports = new WebhookService();
