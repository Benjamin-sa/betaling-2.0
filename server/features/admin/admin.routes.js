const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../../middleware/auth");
const adminController = require("./admin.controller");

// Get all orders with items
router.get("/orders", authenticate, authorizeAdmin, (req, res) =>
  adminController.getAllOrders(req, res)
);

// Get filtered orders with pagination and search
router.get("/orders/filtered", authenticate, authorizeAdmin, (req, res) =>
  adminController.getOrdersWithFilters(req, res)
);

// Get order statistics
router.get("/orders/statistics", authenticate, authorizeAdmin, (req, res) =>
  adminController.getOrderStatistics(req, res)
);

// Email delivery logs routes
router.get("/email-logs", authenticate, authorizeAdmin, (req, res) =>
  adminController.getEmailLogs(req, res)
);

router.get(
  "/email-logs/order/:orderId",
  authenticate,
  authorizeAdmin,
  (req, res) => adminController.getEmailLogsByOrderId(req, res)
);

router.get("/email-logs/statistics", authenticate, authorizeAdmin, (req, res) =>
  adminController.getEmailStatistics(req, res)
);

// Stripe configuration routes (SUPER ADMIN ONLY)
router.get("/stripe/config", authenticate, authorizeAdmin, (req, res) =>
  adminController.getStripeConfig(req, res)
);

router.post("/stripe/switch-mode", authenticate, authorizeAdmin, (req, res) =>
  adminController.switchStripeMode(req, res)
);

// Public Stripe configuration (for frontend initialization)
router.get("/stripe/public-key", (req, res) =>
  adminController.getStripePublicKey(req, res)
);

// Get all users
router.get("/users", authenticate, authorizeAdmin, (req, res) =>
  adminController.getAllUsers(req, res)
);

// Make a user admin
router.post("/make-admin", authenticate, authorizeAdmin, (req, res) =>
  adminController.makeUserAdmin(req, res)
);

// Remove admin privileges from a user
router.post("/remove-admin", authenticate, authorizeAdmin, (req, res) =>
  adminController.removeUserAdmin(req, res)
);

// Delete a user
router.delete("/users/:firebaseUid", authenticate, authorizeAdmin, (req, res) =>
  adminController.deleteUser(req, res)
);

// Unified Google Services routes (recommended)
router.get("/google/status", authenticate, authorizeAdmin, (req, res) =>
  adminController.getGoogleAuthStatus(req, res)
);

router.get("/google/setup", authenticate, authorizeAdmin, (req, res) =>
  adminController.setupGoogleAuth(req, res)
);

router.post("/google/reload-tokens", authenticate, authorizeAdmin, (req, res) =>
  adminController.reloadGoogleTokens(req, res)
);

module.exports = router;
