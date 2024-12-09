// services/webhook.service.js
const mailService = require('./mail.service');


// webhook.service.js
class WebhookService {
  async handleCheckoutSession(session) {
    try {
      console.log('Processing checkout session:', session.id);

      if (!session.customer_details?.email) {
        throw new Error('Customer email not found in session');
      }

      if (!session.line_items?.data?.length) {
        throw new Error('No line items found in session');
      }

      const order = this.createOrderFromSession(session);
      await this.sendOrderConfirmationEmail(order, session.customer_details);
      console.log(`Order confirmation email sent to ${session.customer_details.email}`);
    } catch (error) {
      console.error('Error processing checkout session:', error);
      throw error;
    }
  }
  createOrderFromSession(session) {

    if (!session.line_items || !session.line_items.data) {
      throw new Error('No line items found in session');
    }
    const orderItems = session.line_items.data.map(item => ({
      description: item.description,
      quantity: item.quantity,
      amount: (item.amount_total / 100).toFixed(2),
      unit_price: (item.price.unit_amount / 100).toFixed(2)
    }));

    return {
      id: session.id,
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