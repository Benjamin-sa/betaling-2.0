// services/webhook.service.js
const firebaseService = require("../../core/services/firebase.service");
// webhook.service.js
class WebhookService {
  /**
   * Handle Stripe webhook events
   * @param {Object} event - The Stripe event object
   */

  async createOrderFromSession(session) {
    // Get user by Stripe customer ID
    let user;

    if (session.customer) {
      console.log("Getting user by Stripe ID:", session.customer);
      user = await firebaseService.getUserByStripeId(session.customer);
    }

    const orderItems = session.line_items.data.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      amount: (item.amount_total / 100).toFixed(2),
      unit_price: (item.price.unit_amount / 100).toFixed(2),
    }));

    // Upload order to Firebase
    const orderData = {
      orderId: session.id,
      userId: user.userId,
      items: orderItems,
      amountTotal: (session.amount_total / 100).toFixed(2),
      currency: session.currency.toUpperCase(),
    };

    await firebaseService.createOrder(orderData);
    console.log("Order uploaded to Firebase:", session.id);
  }
}

module.exports = new WebhookService();
