// server/routes/checkout.routes.js
const express = require("express");
const router = express.Router();
const stripeService = require("../../services/stripe.service");
const storageService = require("../../services/storage.service");
const { authenticate } = require("../../middleware/auth");
const db = require("../../db").instance;

router.post("/", authenticate, async (req, res) => {
  try {
    const { items, timeSlot } = req.body;
    const userId = req.user.uid;

    // Haal alle producten op uit de lokale opslag
    const products = await storageService.getAllProducts();

    // Map producten op basis van hun ID
    const productMap = products.reduce((map, product) => {
      map[product.id] = product;
      return map;
    }, {});

    // Check if any product requires a time slot
    const requiresTimeSlot = items.some(
      (item) => productMap[item.productId].requires_timeslot
    );

    if (requiresTimeSlot && !timeSlot) {
      return res
        .status(400)
        .json({ error: "A time slot is required for this order." });
    }

    const session = await stripeService.createCheckoutSession(
      items,
      userId,
      timeSlot
    );

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error("Checkout session error:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
