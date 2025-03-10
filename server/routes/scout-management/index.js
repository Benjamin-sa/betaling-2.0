const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Import all scout management routes
const lidRoutes = require('./lid.routes');
const leidingRoutes = require('./leiding.routes');
const ouderRoutes = require('./ouder.routes');
const kampRoutes = require('./kamp.routes');
const weiRoutes = require('./wei.routes');
const activiteitRoutes = require('./activiteit.routes');
const materiaalRoutes = require('./materiaal.routes');

// Apply authentication and admin authorization middleware to all scout management routes
router.use(authenticate);
router.use(authorizeAdmin);

// Mount routes
router.use('/leden', lidRoutes);
router.use('/leiding', leidingRoutes);
router.use('/ouders', ouderRoutes);
router.use('/kampen', kampRoutes);
router.use('/weien', weiRoutes);
router.use('/activiteiten', activiteitRoutes);
router.use('/materialen', materiaalRoutes);

module.exports = router;
