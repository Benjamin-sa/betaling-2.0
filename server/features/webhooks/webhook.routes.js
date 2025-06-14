// server/features/webhooks/webhook.routes.js
const express = require("express");
const router = express.Router();
const webhookController = require("./webhook.controller");

// Stripe webhook endpoint
router.post("/stripe", express.raw({ type: "application/json" }), (req, res) =>
  webhookController.handleStripeWebhook(req, res)
);

module.exports = router;
