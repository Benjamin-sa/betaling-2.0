// server/routes/checkout.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const { authenticate } = require('../middleware/auth');

router.post('/', authenticate, async (req, res) => {
  try {
    const { items } = req.body;
    const userId = req.user.uid;

    const session = await stripeService.createCheckoutSession(items, userId);
    
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;