// server/routes/order.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const userService = require('../services/user.service');
const db = require('../db').instance;
const { authenticate } = require('../middleware/auth');

// Haal bestellingen (Checkout Sessions) van de huidige gebruiker op
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.uid;

  try {
    // Haal de gebruiker op uit de SQLite database
    const user = await userService.getUserByFirebaseId(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { stripe_customer_id: stripeCustomerId } = user;
    if (!stripeCustomerId) {
      return res.status(404).json({ error: 'Stripe customer ID not found for user' });
    }

    // Haal Checkout Sessions van Stripe op
    const sessions = await stripeService.getCustomerCheckoutSessions(stripeCustomerId);

    
    res.json({ orders: sessions });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Haal line items op voor een specifieke Checkout Session
router.get('/session/:sessionId/line-items', authenticate, async (req, res) => {
  const { sessionId } = req.params;
  const userId = req.user.uid;

  try {
    // get user from SQLite database
    const user = await userService.getUserByFirebaseId(userId);

    const stripeCustomerId  = user.stripe_customer_id;
    if (!stripeCustomerId) {
      return res.status(404).json({ error: 'Stripe customer ID not found for user' });
    }

    // Haal de Checkout Session op
    const session = await stripeService.getCheckoutSession(sessionId);
    if (!session || session.customer !== stripeCustomerId) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Haal line items op
    const lineItems = await stripeService.getSessionLineItems(sessionId);
    res.json({ data: lineItems });
  } catch (error) {
    console.error('Error fetching line items:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get timeslot availability
router.get('/timeslots/availability', async (req, res) => {
  try {
    const FIXED_TIME_SLOTS = ['18:00-19:30', '19:30-21:00'];
    const MAX_ORDERS_PER_SLOT = 120;

    const availability = {};
    
    for (const slot of FIXED_TIME_SLOTS) {
      const result = await new Promise((resolve, reject) => {
        db.get(
          `SELECT COALESCE(SUM(oi.quantity), 0) as total_menus
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           WHERE o.time_slot = ?
           AND oi.product_name LIKE '%spaghetti%'`,  
          [slot],
          (err, row) => {
            if (err) reject(err);
            else resolve(row);
          }
        );
      });
      
      availability[slot] = MAX_ORDERS_PER_SLOT - (result.total_menus || 0);
    }

    res.json({ availability });

  } catch (error) {
    console.error('Error checking timeslot availability:', error);
    res.status(500).json({ error: 'Error checking timeslot availability' });
  }
});

module.exports = router;