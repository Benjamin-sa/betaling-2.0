// routes/webhook.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const webhookService = require('../services/webhook.service');

// Important: Use raw body parser for webhook route
router.post('/stripe', 
  express.raw({type: 'application/json'}),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    
    try {
      // Pass raw body buffer to constructEvent
      const event = await stripeService.constructWebhookEvent(req.body, signature);
      
      switch (event.type) {
        case 'checkout.session.completed':
          console.log('checkout.session.completed');
          await webhookService.handleCheckoutSession(event.data.object);
        case 'payment_intent.succeeded':
          console.log('payment_intent.succeeded');
          break;
      }

      res.json({received: true});
    } catch (err) {
      console.error('Webhook Error:', err.message);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

module.exports = router;