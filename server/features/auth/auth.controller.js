// server/controllers/auth.controller.js
const admin = require("../../config/firebaseAdmin");
const stripeService = require("../../core/services/stripe.service");
const firebaseService = require("../../core/services/firebase.service");

/**
 * Register user with email and password
 */
const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    // create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
    });

    // create stripe customer
    const customer = await stripeService.findOrCreateCustomer(
      email,
      userRecord.uid
    );

    // Create user in database
    const user = await firebaseService.createUser({
      firebaseUid: userRecord.uid,
      email: email,
      stripeCustomerId: customer.id,
    });

    res.status(201).json({ message: "User registered successfully", user });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(400).json({ error: error.message });
  }
};

/**
 * Ensure user exists in database (create if doesn't exist)
 */
const ensureUser = async (req, res) => {
  const firebaseUid = req.user.uid;
  const email = req.user.email;

  try {
    // Check if user already exists in database
    let user = await firebaseService.getUser(firebaseUid);

    if (!user) {
      // User doesn't exist, check if Stripe customer exists or create new one
      const customer = await stripeService.findOrCreateCustomer(
        email,
        firebaseUid
      );

      // Add user to database
      user = await firebaseService.createUser({
        firebaseUid,
        email,
        stripeCustomerId: customer.id,
        is_admin: false,
      });

      res.status(201).json({ message: "User created successfully", user });
    } else {
      // User already exists
      res.status(200).json({ message: "User already exists", user });
    }
  } catch (error) {
    console.error("Error ensuring user exists:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

/**
 * Get admin status for current user
 */
const getAdminStatus = async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    // Add a slight delay (200ms) to allow previous operations to complete
    await new Promise((resolve) => setTimeout(resolve, 200));

    let user = await firebaseService.getUser(firebase_uid);

    res.json({ isAdmin: user.isAdmin });
  } catch (error) {
    console.error("Admin status error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      isAdmin: false,
    });
  }
};

module.exports = {
  register,
  ensureUser,
  getAdminStatus,
};
