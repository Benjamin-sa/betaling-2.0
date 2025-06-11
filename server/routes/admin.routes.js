const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../middleware/auth");
const orderService = require("../services/order.service");
const userService = require("../services/user.service");
const admin = require("../config/firebaseAdmin");
const DbService = require("../db/services/db.service");

// Get all orders with items
router.get("/orders", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const orders = await orderService.getAllOrdersWithItems();
    res.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Get all users
router.get("/users", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await userService.getAllUsers();
    res.json({
      users: users.map((user) => ({
        firebase_uid: user.firebase_uid,
        email: user.email,
        is_admin: user.is_admin === 1,
      })),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// Delete a user
router.delete(
  "/users/:firebaseUid",
  authenticate,
  authorizeAdmin,
  async (req, res) => {
    const { firebaseUid } = req.params;

    try {
      try {
        // Try to delete user from Firebase Auth
        await admin.auth().deleteUser(firebaseUid);
      } catch (firebaseError) {
        // Log the error but continue if user not found in Firebase
        console.log("Firebase user not found:", firebaseError.message);
      }

      // Delete user from SQLite database regardless of Firebase result
      await userService.deleteUser(firebaseUid);

      res.json({ message: "User deleted from database successfully" });
    } catch (error) {
      console.error("Error deleting user from database:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get settings
router.get("/settings", authenticate, async (req, res) => {
  console.log("Fetching settings");
  try {
    const settings = await DbService.queryOne(
      "SELECT value FROM settings WHERE key = ?",
      ["manual_payments_enabled"]
    );

    console.log("Settings fetched:", settings);
    res.json({
      manualPaymentsEnabled: settings?.value === "true",
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

module.exports = router;
