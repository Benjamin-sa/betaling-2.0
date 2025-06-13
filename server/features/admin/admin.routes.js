const express = require("express");
const router = express.Router();
const { authenticate, authorizeAdmin } = require("../../middleware/auth");
const adminController = require("./admin.controller");

// Get all orders with items
router.get(
  "/orders",
  authenticate,
  authorizeAdmin,
  adminController.getAllOrders
);

// Get all users
router.get("/users", authenticate, authorizeAdmin, adminController.getAllUsers);

// Make a user admin
router.post(
  "/make-admin",
  authenticate,
  authorizeAdmin,
  adminController.makeUserAdmin
);

// Remove admin privileges from a user
router.post(
  "/remove-admin",
  authenticate,
  authorizeAdmin,
  adminController.removeUserAdmin
);

// Delete a user
router.delete(
  "/users/:firebaseUid",
  authenticate,
  authorizeAdmin,
  adminController.deleteUser
);

module.exports = router;
