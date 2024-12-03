// routes/checkout.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');

router.post('/create-session', async (req, res) => {
  try {
    const session = await stripeService.createCheckoutSession(req.body.items);
    res.json({ id: session.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;