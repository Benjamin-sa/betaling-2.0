// server/routes/webshop/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate } = require("../../middleware/auth");

// Get user orders stripe
router.get("/", authenticate, (req, res) =>
  orderController.getUserOrders(req, res)
);

router.post("/checkout", authenticate, (req, res) =>
  orderController.createCheckoutSession(req, res)
);

module.exports = router;
