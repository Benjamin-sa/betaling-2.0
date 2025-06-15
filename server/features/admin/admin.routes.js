const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../../middleware/auth");
const adminController = require("./admin.controller");
const cacheController = require("./cache.controller");

// Get all orders with items
router.get("/orders", authenticate, authorizeAdmin, (req, res) =>
  adminController.getAllOrders(req, res)
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

// Gmail setup route - generates OAuth2 authorization URL
router.get("/gmail/setup", authenticate, authorizeAdmin, (req, res) =>
  adminController.setupGmail(req, res)
);

// Cache management routes (basic only)
router.get("/cache/stats", authenticate, authorizeAdmin, (req, res) =>
  cacheController.getCacheStats(req, res)
);

router.post("/cache/clear", authenticate, authorizeAdmin, (req, res) =>
  cacheController.clearAllCache(req, res)
);

router.post("/cache/clear/:type", authenticate, authorizeAdmin, (req, res) =>
  cacheController.clearCacheType(req, res)
);

module.exports = router;
