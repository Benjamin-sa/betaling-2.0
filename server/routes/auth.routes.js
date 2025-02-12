// server/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const admin = require('../config/firebaseAdmin');
const stripeService = require('../services/stripe.service');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const userService = require('../services/user.service');
const authService = require('../services/auth.service');

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

    // Send verification email
    try {
      await sendVerificationEmailToUser(email);
    } catch (emailError) {
      console.error('Verification email error:', emailError);
      // Continue execution - user is created but email failed
    }

    res.status(201).json({ message: 'User registered successfully', user });

  
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ error: error.message });
    }
  });

  // Keep existing send-verification-email endpoint for manual resends
router.post('/send-verification-email', authenticate, async (req, res) => {
  try {
    await sendVerificationEmailToUser(req.user.email);
    res.status(200).json({ message: 'Verificatie-email verstuurd' });
  } catch (error) {
    console.error('Error sending verification email:', error);
    res.status(500).json({ error: 'Interne serverfout' });
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
        stripeCustomerId: customer.id,
        is_admin: false
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

// Add manual user creation route
router.post('/create-manual-user', authenticate, authorizeAdmin, async (req, res) => {
  const { email, firebaseUid, stripeCustomerId } = req.body;

  try {
    // Validate inputs
    if (!email || !firebaseUid || !stripeCustomerId) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByFirebaseId(firebaseUid);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create user in database
    const user = await userService.createUser({
      firebaseUid,
      email,
      stripeCustomerId,
      is_admin: 0
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    console.error('Manual user creation error:', error);
    res.status(500).json({ error: 'Failed to create user' });
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

router.post('/remove-admin', authenticate, authorizeAdmin, async (req, res) => {
  const { userId } = req.body;

  try {
    await userService.removeUserAdmin(userId);
    res.json({ message: 'Admin privileges removed successfully' });
  } catch (error) {
    console.error('Remove Admin error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.get('/admin-status', authenticate, async (req, res) => {
  const firebase_uid = req.user.uid;
  const email = req.user.email;

  try {
    let user = await userService.getUserByFirebaseId(firebase_uid);
    
    if (!user) {
      // User exists in Firebase but not in our database
      // Create Stripe customer and add user to database
      try {
        const customer = await stripeService.createCustomer(email, firebase_uid);
        console.log(`Stripe customer created for user ${firebase_uid}: ${customer.id}`);

        user = await userService.createUser({
          firebaseUid: firebase_uid,
          email,
          stripeCustomerId: customer.id,
          is_admin: false
        });

        console.log('User automatically created during admin status check');
      } catch (createError) {
        console.error('Error creating user during admin status check:', createError);
        return res.status(500).json({ 
          error: 'Failed to create user',
          isAdmin: false 
        });
      }
    }

    res.json({ isAdmin: !!user.is_admin }); // Convert to boolean
  } catch (error) {
    console.error('Admin status error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      isAdmin: false 
    });
  }
});

// Helper function to send verification email
const sendVerificationEmailToUser = async (email) => {
  const verificationLink = await admin.auth().generateEmailVerificationLink(email);
  await authService.sendVerificationEmail({ email }, verificationLink);
};

module.exports = router;