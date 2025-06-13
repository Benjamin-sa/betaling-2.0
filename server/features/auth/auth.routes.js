// server/routes/auth.routes.js
const express = require("express");
const router = express.Router();
const { authenticate } = require("../../middleware/auth");
const authController = require("./auth.controller");

// register user with email and password
router.post("/register", authController.register);

// Nieuwe route om ervoor te zorgen dat de gebruiker in de database bestaat
router.post("/ensure-user", authenticate, authController.ensureUser);

router.get("/admin-status", authenticate, authController.getAdminStatus);

module.exports = router;
