// server/routes/webshop/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate } = require("../../middleware/auth");

// Get user orders stripe
router.get("/", authenticate, orderController.getUserOrders);

router.post("/checkout", authenticate, orderController.createCheckoutSession);

module.exports = router;
