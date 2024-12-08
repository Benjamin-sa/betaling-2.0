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
      const event = await stripeService.constructWebhookEvent(req.body, signature);

      switch (event.type) {
        // Successful checkout
        case 'checkout.session.completed':
          try {
            const session = await stripe.checkout.sessions.retrieve(
              event.data.object.id,
              { expand: ['line_items'] }
            );
            await webhookService.handleCheckoutSession(session);
            console.log(`Checkout completed: ${session.id}`);
          } catch (error) {
            console.error('Checkout session handling error:', error);
            throw error;
          }
          break;

        // Default case for unhandled events
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