// server/routes/webshop/order.routes.js
const express = require("express");
const router = express.Router();
const orderController = require("./order.controller");
const { authenticate } = require("../../middleware/auth");

// Get user orders
router.get("/", authenticate, (req, res) =>
  orderController.getUserOrders(req, res)
);

// Create checkout session
router.post("/checkout", authenticate, (req, res) =>
  orderController.createCheckoutSession(req, res)
);

// Real-time capacity checking endpoints
router.get("/capacity/:eventId/:shiftId", (req, res) =>
  orderController.checkShiftCapacity(req, res)
);

router.post("/capacity/batch", (req, res) =>
  orderController.batchCheckShiftCapacity(req, res)
);

module.exports = router;
