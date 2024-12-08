// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const stripeService = require('../services/stripe.service');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const userService = require('../services/user.service');


// registreer een nieuwe gebruiker
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // Creëer gebruiker met Firebase Admin
      const userRecord = await admin.auth().createUser({
        email,
        password
      });

      // Maak een Stripe klant aan
      const customer = await stripeService.createCustomer(email, userRecord.uid);
  
      // Voeg gebruiker toe aan database
    const user = await userService.createUser({
      firebaseUid: userRecord.uid,
      email: email,
      stripeCustomerId: customer.id
    });

    res.status(201).json({ message: 'User registered successfully', user });

  
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });


  // Nieuwe route om ervoor te zorgen dat de gebruiker in de database bestaat
router.post('/ensure-user', authenticate, async (req, res) => {
  const firebaseUid = req.user.uid;
  const email = req.user.email;

  try {
    // Controleer of de gebruiker al in de database bestaat
    let user = await userService.getUserByFirebaseId(firebaseUid);

    if (!user) {
      // Gebruiker bestaat niet, maak een nieuwe Stripe-klant aan
      const customer = await stripeService.createCustomer(email, firebaseUid);
      console.log(`Stripe-klant aangemaakt voor gebruiker ${firebaseUid}: ${customer.id}`);

      // Voeg gebruiker toe aan database
      user = await userService.createUser({
        firebaseUid,
        email,
        stripeCustomerId: customer.id
      });

      res.status(201).json({ message: 'User created successfully', user });
    } else {
      // Gebruiker bestaat al
      res.status(200).json({ message: 'User already exists', user });
    }
  } catch (error) {
    console.error('Error ensuring user exists:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Maak een gebruiker admin
router.post('/make-admin', authenticate, authorizeAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    await userService.makeUserAdmin(userId);
    res.json({ message: 'User has been granted admin privileges' });
  } catch (error) {
    console.error('Make Admin error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/admin-status', authenticate, async (req, res) => {
  const firebase_uid = req.user.uid;

  try {
    const user = await userService.getUserByFirebaseId(firebase_uid);
    res.json({ isAdmin: user.is_admin });
  } catch (error) {
    console.error('Admin status error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;