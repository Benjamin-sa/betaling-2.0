// server/features/events/event.routes.js
const express = require("express");
const eventController = require("./event.controller");
const { authenticate, authorizeAdmin } = require("../../middleware/auth");

const router = express.Router();

// Public routes
router.get("/active", (req, res) => eventController.getActiveEvents(req, res));

router.get("/:eventId/availability", (req, res) =>
  eventController.getEventShiftAvailability(req, res)
);

// Get shift information by ID (public route since it's for displaying order info)
router.get("/:eventId/shifts/:shiftId", (req, res) =>
  eventController.getShiftById(req, res)
);

// Admin-only routes
router.get("/", authenticate, authorizeAdmin, (req, res) =>
  eventController.getAllEvents(req, res)
);
router.post("/", authenticate, authorizeAdmin, (req, res) =>
  eventController.createEvent(req, res)
);
router.put("/:eventId", authenticate, authorizeAdmin, (req, res) =>
  eventController.updateEvent(req, res)
);
router.patch("/:eventId/status", authenticate, authorizeAdmin, (req, res) =>
  eventController.toggleEventStatus(req, res)
);
router.delete("/:eventId", authenticate, authorizeAdmin, (req, res) =>
  eventController.deleteEvent(req, res)
);

// Shift management routes
router.post("/:eventId/shifts", authenticate, authorizeAdmin, (req, res) =>
  eventController.addShift(req, res)
);
router.patch(
  "/:eventId/shifts/:shiftId",
  authenticate,
  authorizeAdmin,
  (req, res) => eventController.updateShift(req, res)
);

module.exports = router;
