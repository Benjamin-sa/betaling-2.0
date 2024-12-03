// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const stripeService = require('../services/stripe.service');
const { authenticate, authorizeAdmin } = require('../middleware/auth');


// Register a new user
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    
    try {
      // Creëer gebruiker met Firebase Admin
      const userRecord = await admin.auth().createUser({
        email,
        password
      });
      console.log(`Gebruiker aangemaakt: ${userRecord.uid}`);
  
      // Maak een Stripe klant aan
      const customer = await stripeService.createCustomer(email, userRecord.uid);
      console.log(`Stripe klant aangemaakt voor gebruiker ${userRecord.uid}: ${customer.id}`);
  
      // Sla gebruiker op in Firestore
      await admin.firestore().collection('users').doc(userRecord.uid).set({
        email,
        isAdmin: false,
        stripeCustomerId: customer.id,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`Firestore gebruiker aangemaakt voor ${userRecord.uid}`);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });

// Make a user an admin
router.post('/make-admin', authenticate, authorizeAdmin, async (req, res) => {
  const { email } = req.body;

  try {
    const usersRef = admin.firestore().collection('users');
    const snapshot = await usersRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = snapshot.docs[0];
    await userDoc.ref.update({ isAdmin: true });

    res.json({ message: `${email} has been granted admin privileges.` });
  } catch (error) {
    console.error('Make Admin error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;