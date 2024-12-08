// services/webhook.service.js
const mailService = require('./mail.service');
const userService = require('./user.service');

class WebhookService {


  async handleCheckoutSession(session) {
    try {
      // Get customer details
      const customer = await userService.getUserByStripeId(session.customer);
      
      // Send order confirmation
      await mailService.sendOrderConfirmation(session, customer);
      
      console.log('Order confirmation sent:', session.id);
    } catch (error) {
      console.error('Error handling checkout session:', error);
      throw error;
    }
  }
}

module.exports = new WebhookService();