// server/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const authController = require("./auth.controller");

// register user with email and password
router.post("/register", (req, res) => authController.register(req, res));

// Nieuwe route om ervoor te zorgen dat de gebruiker in de database bestaat
router.post("/ensure-user", authenticate, (req, res) =>
  authController.ensureUser(req, res)
);

router.get("/admin-status", authenticate, (req, res) =>
  authController.getAdminStatus(req, res)
);

module.exports = router;
