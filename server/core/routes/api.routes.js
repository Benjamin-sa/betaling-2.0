const express = require("express");
const router = express.Router();

// Import feature-based route modules
const authRoutes = require("../../features/auth/auth.routes");
const adminRoutes = require("../../features/admin/admin.routes");
const productRoutes = require("../../features/products/product.routes");
const orderRoutes = require("../../features/orders/order.routes");
const eventRoutes = require("../../features/events/event.routes");
const emailRoutes = require("../../features/emails/email.routes");

// Mount feature routes
router.use("/auth", authRoutes);
router.use("/admin", adminRoutes);
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/events", eventRoutes);
router.use("/emails", emailRoutes);

module.exports = router;
