const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Import all scout management routes
const ouderRoutes = require('./leden/ouder.routes');
const kampRoutes = require('./kamp/kamp.routes');
const weiRoutes = require('./kamp/wei.routes');
const materiaalRoutes = require('./materiaal.routes');
const receptenRoutes = require('./kamp/recepten.routes');
const maaltijdRoutes = require('./kamp/maaltijd.routes');
const lidRoutes = require('./leden/lid.routes');

// Apply authentication and admin authorization middleware to all scout management routes
router.use(authenticate);
router.use(authorizeAdmin);

// Use the scout management routes
router.use('/ouders', ouderRoutes);
router.use('/kampen', kampRoutes);
router.use('/weien', weiRoutes);
router.use('/materialen', materiaalRoutes);
router.use('/recepten', receptenRoutes);
router.use('/maaltijden', maaltijdRoutes);
router.use('/leden', lidRoutes);

module.exports = router;
