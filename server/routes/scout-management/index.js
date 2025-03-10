const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Import all scout management routes
const ouderRoutes = require('./ouder.routes');
const kampRoutes = require('./kamp.routes');
const weiRoutes = require('./wei.routes');
const materiaalRoutes = require('./materiaal.routes');
const receptenRoutes = require('./recepten.routes');
const maaltijdRoutes = require('./maaltijd.routes');
const lidRoutes = require('./lid.routes');
const leidingRoutes = require('./leiding.routes');

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
router.use('/leiding', leidingRoutes);

module.exports = router;
