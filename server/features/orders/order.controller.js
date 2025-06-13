// server/controllers/order.controller.js
const firebaseService = require("../../core/services/firebase.service");
const stripeService = require("../../core/services/stripe.service");
class OrderController {
  /**
   * Get all orders for the authenticated user
   */
  async getUserOrders(req, res) {
    try {
      const userId = req.user.uid;
      const orders = await firebaseService.getUserOrders(userId);

      res.json({ orders });
    } catch (error) {
      console.error("Error fetching user orders:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async createCheckoutSession(req, res) {
    try {
      const { items } = req.body;
      const userId = req.user.uid;
      console.log("Creating checkout session for user:", userId);
      const user = await firebaseService.getUser(userId);
      console.log("Creating checkout session for user:", user);
      const session = await stripeService.createCheckoutSession(
        items,
        userId,
        user.stripeCustomerId
      );

      res.json({ sessionId: session.id });
    } catch (error) {
      console.error("Checkout session error:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new OrderController();
