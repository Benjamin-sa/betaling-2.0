// services/webhook.service.js
const mailService = require('./mail.service');
const orderService = require('./order.service');
const userService = require('./user.service');
// webhook.service.js
class WebhookService {
  
  // Handle incoming Stripe webhook events for successful checkout sessions
  async handleCheckoutSession(session) {
    try {
      console.log('Processing checkout session:', session.id);

      if (!session.customer_details?.email) {
        throw new Error('Customer email not found in session');
      }

      if (!session.line_items?.data?.length) {
        throw new Error('No line items found in session');
      }
      const order = await this.createOrderFromSession(session);


       // Save order to the database
       await orderService.createOrder(order);
      // Send order confirmation email
      await this.sendOrderConfirmationEmail(order, session.customer_details);
      console.log(`Order confirmation email sent to ${session.customer_details.email}`);
    } catch (error) {
      console.error('Error processing checkout session:', error);
      throw error;
    }
  }
  async createOrderFromSession(session) {
    // Get user by Stripe customer ID
    let user;

 
    if (session.customer) {
      // Fetch user by Stripe customer ID
      console.log('Getting user by Stripe ID:', session.customer);
      user = await userService.getUserByStripeId(session.customer);
    }

    if (!user && session.customer_details?.email) {
      // Fallback to fetching user by email
      console.log('Getting user by email:', session.customer_details.email);
      user = await userService.getUserByEmail(session.customer_details.email);
    }

    if (!user) {
      throw new Error('User not found for the given customer information');
    }
    const orderItems = session.line_items.data.map(item => ({
      description: item.description,
      quantity: item.quantity,
      amount: (item.amount_total / 100).toFixed(2),
      unit_price: (item.price.unit_amount / 100).toFixed(2)
    }));

    return {
      id: session.id,
      user_id: user.firebase_uid,
      items: orderItems,
      amount_total: (session.amount_total / 100).toFixed(2),
      currency: session.currency.toUpperCase()
    };
  }

  async sendOrderConfirmationEmail(order, customerDetails) {
    await mailService.sendOrderConfirmation(order, {
      email: customerDetails.email,
      name: customerDetails.name || customerDetails.email,
      address: customerDetails.address
    });
    
    console.log(`Order confirmation email sent to ${customerDetails.email}`);
  }
}

module.exports = new WebhookService();