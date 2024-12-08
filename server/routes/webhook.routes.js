// routes/webhook.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const webhookService = require('../services/webhook.service');

router.post('/stripe',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];

    try {
      // Use stripeService to construct event
      const event = await stripeService.constructWebhookEvent(req.body, signature);

      switch (event.type) {
        case 'checkout.session.completed':
          try {
            // Use stripeService to retrieve session with line items
            const session = await stripeService.getCheckoutSession(event.data.object.id);
            const lineItems = await stripeService.getSessionLineItems(session.id);
            
            // Add line items to session object
            session.line_items = lineItems;
            
            await webhookService.handleCheckoutSession(session);
            console.log(`Checkout completed: ${session.id}`);
          } catch (error) {
            console.error('Checkout session handling error:', error);
            throw error;
          }
          break;

        case 'payment_intent.succeeded':
          try {
            await webhookService.handlePaymentSuccess(event.data.object);
            console.log(`Payment succeeded: ${event.data.object.id}`);
          } catch (error) {
            console.error('Payment success handling error:', error);
            throw error;
          }
          break;

        default:
          console.log(`Unhandled event type: ${event.type}`);
      }

      res.json({ received: true });
    } catch (err) {
      console.error('Webhook Error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

module.exports = router;