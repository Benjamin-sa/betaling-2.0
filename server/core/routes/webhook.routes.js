// webhook.routes.js
const express = require("express");
const router = express.Router();
const webhookRoutes = require("../../features/webhooks/webhook.routes");

// Mount webhook feature routes
router.use("/", webhookRoutes);

module.exports = router;
