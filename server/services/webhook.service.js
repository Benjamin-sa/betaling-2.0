// services/webhook.service.js
const mailService = require('./mail.service');
const userService = require('./user.service');

class WebhookService {


  async handleCheckoutSession(session) {
    try {
      // Get customer details
      const customer = await userService.getUserByStripeId(session.customer);
      if (!customer) {
        throw new Error('Customer not found');
      }

      // Format order items for email
      const orderItems = session.line_items.data.map(item => ({
        description: item.description,
        quantity: item.quantity,
        amount: (item.amount_total / 100).toFixed(2) // Convert cents to euros
      }));

      // Create order object for email
      const order = {
        id: session.id,
        items: orderItems,
        amount_total: (session.amount_total / 100).toFixed(2)
      };

      // Send confirmation email
      await mailService.sendOrderConfirmation(order, {
        email: customer.email,
        name: customer.name || customer.email
      });

    } catch (error) {
      console.error('Error handling checkout session:', error);
      throw error;
    }
  }
}

module.exports = new WebhookService();