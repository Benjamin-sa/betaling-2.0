// services/webhook.service.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class WebhookService {
  constructEvent(payload, signature) {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  }

  async handleCheckoutSession(session) {
    console.log('Payment successful:', session);
    // Add additional payment success handling logic here
  }
}

module.exports = new WebhookService();