// server/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const orderService = require('../services/order.service');
const userService = require('../services/user.service');
const admin = require('../config/firebaseAdmin');

// Get all orders with items
router.get('/orders', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersWithItems();
    res.json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all users
router.get('/users', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({ 
      users: users.map(user => ({
        firebase_uid: user.firebase_uid,
        email: user.email,
        is_admin: user.is_admin === 1
      }))
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Delete a user
router.delete('/users/:firebaseUid', authenticate, authorizeAdmin, async (req, res) => {
  const { firebaseUid } = req.params;

  try {
    // Delete user from Firebase Auth
    await admin.auth().deleteUser(firebaseUid);

    // Delete user from SQLite database
    await userService.deleteUser(firebaseUid);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;