// server/routes/order.routes.js
const express = require('express');
const router = express.Router();
const stripeService = require('../services/stripe.service');
const userService = require('../services/user.service');
const db = require('../db').instance;
const { authenticate, authorizeAdmin } = require('../middleware/auth');

// Add this helper function before the routes
const getOrderStatus = (order) => {
  if (order.payment_method === 'stripe') {
    return 'complete';
  }
  return order.manual_payment_confirmed_at ? 'complete' : 'pending';
};

// Get user orders (both Stripe and manual)
router.get('/', authenticate, async (req, res) => {
  const userId = req.user.uid;

  try {
    // Get all orders with their items
    const rows = await new Promise((resolve, reject) => {
      db.all(
        `SELECT 
          o.id,
          o.created_at,
          o.amount_total,
          o.currency,
          o.time_slot,
          o.payment_method,
          o.manual_payment_confirmed_at,
          o.manual_payment_confirmed_by,
          oi.id as item_id,
          oi.product_name,
          oi.quantity,
          oi.amount_total as item_amount,
          oi.unit_price,
          u2.email as confirmed_by_email
        FROM orders o
        JOIN order_items oi ON o.id = oi.order_id
        LEFT JOIN users u2 ON o.manual_payment_confirmed_by = u2.firebase_uid
        WHERE o.user_id = ?
        ORDER BY o.created_at DESC`,
        [userId],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });

    // Group orders and their items
    const groupedOrders = rows.reduce((acc, row) => {
      if (!acc[row.id]) {
        acc[row.id] = {
          id: row.id,
          created: new Date(row.created_at).getTime() / 1000,
          amount_total: row.amount_total,
          currency: row.currency,
          status: getOrderStatus(row),
          metadata: {
            timeSlot: row.time_slot
          },
          payment_details: {
            method: row.payment_method,
            confirmed_at: row.manual_payment_confirmed_at,
            confirmed_by: row.confirmed_by_email
          },
          items: []
        };
      }

      // Add item to order
      acc[row.id].items.push({
        id: row.item_id,
        description: row.product_name,
        quantity: row.quantity,
        amount_total: row.item_amount,
        unit_price: row.unit_price
      });

      return acc;
    }, {});

    // Convert to array and sort
    const processedOrders = Object.values(groupedOrders)
      .sort((a, b) => b.created - a.created);

    res.json({ orders: processedOrders });
  } catch (error) {
    console.error('Error fetching orders:', error);
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

// Confirm manual payment
router.post('/manual-order/:orderId/confirm', authenticate, authorizeAdmin, async (req, res) => {
  const { orderId } = req.params;
  const adminId = req.user.uid;

  try {
    await new Promise((resolve, reject) => {
      db.run(
        `UPDATE orders 
         SET manual_payment_confirmed_at = CURRENT_TIMESTAMP,
             manual_payment_confirmed_by = ?
         WHERE id = ? 
         AND payment_method = 'manual'
         AND manual_payment_confirmed_at IS NULL`,
        [adminId, orderId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }

          // Check if any row was actually updated
          if (this.changes === 0) {
            reject(new Error('Order not found or already confirmed'));
            return;
          }

          resolve();
        }
      );
    });

    // Get the updated order details
    const updatedOrder = await new Promise((resolve, reject) => {
      db.get(
        `SELECT 
          o.*,
          u.email,
          confirmed.email as confirmed_by_email
         FROM orders o
         JOIN users u ON o.user_id = u.firebase_uid
         LEFT JOIN users confirmed ON o.manual_payment_confirmed_by = confirmed.firebase_uid
         WHERE o.id = ?`,
        [orderId],
        (err, row) => {
          if (err) reject(err);
          else if (!row) reject(new Error('Order not found'));
          else resolve(row);
        }
      );
    });

    res.json({
      success: true,
      order: {
        ...updatedOrder,
        payment_status: 'manual_confirmed',
        confirmation_details: {
          confirmed_at: updatedOrder.manual_payment_confirmed_at,
          confirmed_by: updatedOrder.confirmed_by_email
        }
      },
      message: 'Manual payment confirmed successfully'
    });

  } catch (error) {
    console.error('Error confirming manual payment:', error);
    res.status(error.message === 'Order not found or already confirmed' ? 404 : 500)
       .json({ error: error.message || 'Failed to confirm manual payment' });
  }
});

module.exports = router;