// server/routes/checkout.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const storageService = require('../services/storage.service');
const { authenticate } = require('../middleware/auth');
const db = require('../db').instance;


router.post('/', authenticate, async (req, res) => {
  try {
    const { items, timeSlot } = req.body;
    const userId = req.user.uid;

    // Haal alle producten op uit de lokale opslag
    const products = await storageService.getAllProducts();

    // Map producten op basis van hun ID
    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    // Check if any product requires a time slot
    const requiresTimeSlot = items.some(item => productMap[item.productId].requires_timeslot);

    if (requiresTimeSlot && !timeSlot) {
      return res.status(400).json({ error: 'A time slot is required for this order.' });
    }

    const session = await stripeService.createCheckoutSession(items, userId, timeSlot);

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Checkout session error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/manual-order', authenticate, async (req, res) => {
  const { items, timeSlot } = req.body;
  const userId = req.user.uid;
  const orderId = `manual-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Start transaction
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', err => err ? reject(err) : resolve());
    });

    try {
      // Calculate total amount
      const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

      // Insert order
      await new Promise((resolve, reject) => {
        db.run(
          `INSERT INTO orders (
            id, user_id, amount_total, currency, time_slot, 
            payment_method, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
          [orderId, userId, totalAmount, 'EUR', timeSlot, 'manual'],
          err => err ? reject(err) : resolve()
        );
      });

      // Insert order items
      for (const item of items) {
        await new Promise((resolve, reject) => {
          db.run(
            `INSERT INTO order_items (
              order_id, product_name, quantity, amount_total, unit_price
            ) VALUES (?, ?, ?, ?, ?)`,
            [
              orderId,
              item.name,
              item.quantity,
              item.price * item.quantity,
              item.price
            ],
            err => err ? reject(err) : resolve()
          );
        });
      }

      // Commit transaction
      await new Promise((resolve, reject) => {
        db.run('COMMIT', err => err ? reject(err) : resolve());
      });

      // Get the created order with items
      const order = await new Promise((resolve, reject) => {
        db.get(
          `SELECT 
            o.*,
            GROUP_CONCAT(json_object(
              'id', oi.id,
              'description', oi.product_name,
              'quantity', oi.quantity,
              'amount_total', oi.amount_total,
              'unit_price', oi.unit_price
            )) as items
           FROM orders o
           JOIN order_items oi ON o.id = oi.order_id
           WHERE o.id = ?
           GROUP BY o.id`,
          [orderId],
          (err, row) => err ? reject(err) : resolve(row)
        );
      });

      res.json({
        success: true,
        order: {
          id: order.id,
          created: new Date(order.created_at).getTime() / 1000,
          amount_total: order.amount_total,
          currency: order.currency,
          status: 'pending',
          metadata: {
            timeSlot: order.time_slot
          },
          payment_details: {
            method: 'manual',
            confirmed_at: null,
            confirmed_by: null
          },
          items: JSON.parse(`[${order.items}]`)
        }
      });

    } catch (error) {
      // Rollback on error
      await new Promise(resolve => {
        db.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    console.error('Error creating manual order:', error);
    res.status(500).json({ error: 'Failed to create manual order' });
  }
});

module.exports = router;