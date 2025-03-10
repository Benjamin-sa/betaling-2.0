// webhook.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../../services/stripe.service');

router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  console.log('Received webhook request');
  const sig = req.headers['stripe-signature'];

  try {
    await stripeService.handleWebhookEvent(req.body, sig);
    res.json({ received: true });
  } catch (err) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;