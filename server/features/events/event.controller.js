// server/features/events/event.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");
const {
  createEventData,
  validateShifts,
  EventFields,
  validateShiftData,
} = require("../../models/webstore.model");

class EventController extends BaseController {
  /**
   * Get all events (admin only)
   */
  async getAllEvents(req, res) {
    await this._handleAsync(this._getAllEventsHandler, req, res);
  }

  /**
   * Internal handler for getting all events
   * @private
   */
  async _getAllEventsHandler(req, res) {
    this._logAction("Fetching all events");
    const events = await firebaseService.getAllEvents();
    this._sendSuccessResponse(res, { events });
  }

  /**
   * Get active events (public)
   */
  async getActiveEvents(req, res) {
    await this._handleAsync(this._getActiveEventsHandler, req, res);
  }

  /**
   * Internal handler for getting active events
   * @private
   */
  async _getActiveEventsHandler(req, res) {
    this._logAction("Fetching active events");
    const events = await firebaseService.getActiveEvents();
    this._sendSuccessResponse(res, { events });
  }

  /**
   * Create a new event (admin only)
   */
  async createEvent(req, res) {
    await this._handleAsync(this._createEventHandler, req, res);
  }

  /**
   * Internal handler for creating events
   * @private
   */
  async _createEventHandler(req, res) {
    const { name, description, type, shifts } = req.body;

    // Validate event type
    if (!["product_sale", "shift_event"].includes(type)) {
      return this._sendErrorResponse(
        res,
        "Event type must be 'product_sale' or 'shift_event'",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // For shift events, validate shifts using factory function
    if (type === "shift_event") {
      try {
        validateShifts(shifts);
      } catch (error) {
        return this._sendErrorResponse(
          res,
          error.message,
          this.HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Create event data using factory function with validation
    const eventData = createEventData({
      [EventFields.NAME]: name,
      [EventFields.DESCRIPTION]: description,
      [EventFields.TYPE]: type,
      [EventFields.ISACTIVE]: false, // Events start inactive
      [EventFields.CREATED_BY]: req.user.uid,
      [EventFields.SHIFTS]: type === "shift_event" ? shifts : [],
    });

    this._logAction("Creating new event", { name, type });
    const eventId = await firebaseService.createEvent(eventData);

    this._sendSuccessResponse(
      res,
      { eventId, event: { id: eventId, ...eventData } },
      "Event created successfully"
    );
  }

  /**
   * Update an event (admin only)
   */
  async updateEvent(req, res) {
    await this._handleAsync(this._updateEventHandler, req, res);
  }

  /**
   * Internal handler for updating events
   * @private
   */
  async _updateEventHandler(req, res) {
    const { eventId } = req.params;
    const updateData = req.body;

    // Don't allow changing event type after creation
    if (updateData.type) {
      return this._sendErrorResponse(
        res,
        "Event type cannot be changed after creation",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Updating event", { eventId });
    await firebaseService.updateEvent(eventId, updateData);

    this._sendSuccessResponse(res, {}, "Event updated successfully");
  }

  /**
   * Toggle event active status (admin only)
   */
  async toggleEventStatus(req, res) {
    await this._handleAsync(this._toggleEventStatusHandler, req, res);
  }

  /**
   * Internal handler for toggling event status
   * @private
   */
  async _toggleEventStatusHandler(req, res) {
    const { eventId } = req.params;
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return this._sendErrorResponse(
        res,
        "isActive must be a boolean value",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Toggling event status", { eventId, isActive });
    await firebaseService.updateEvent(eventId, { isActive });

    this._sendSuccessResponse(
      res,
      {},
      `Event ${isActive ? "activated" : "deactivated"} successfully`
    );
  }

  /**
   * Delete an event (admin only)
   */
  async deleteEvent(req, res) {
    await this._handleAsync(this._deleteEventHandler, req, res);
  }

  /**
   * Internal handler for deleting events
   * @private
   */
  async _deleteEventHandler(req, res) {
    const { eventId } = req.params;

    // Check if event has associated products
    const products = await firebaseService.getProductsByEvent(eventId);
    if (products && products.length > 0) {
      return this._sendErrorResponse(
        res,
        "Cannot delete event with associated products. Delete products first.",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Deleting event", { eventId });
    await firebaseService.deleteEvent(eventId);

    this._sendSuccessResponse(res, {}, "Event deleted successfully");
  }

  /**
   * Get event shift availability (for shift events)
   */
  async getEventShiftAvailability(req, res) {
    await this._handleAsync(this._getEventShiftAvailabilityHandler, req, res);
  }

  /**
   * Internal handler for getting shift availability
   * @private
   */
  async _getEventShiftAvailabilityHandler(req, res) {
    const { eventId } = req.params;

    this._logAction("Fetching event shift availability", { eventId });
    const availability = await firebaseService.getEventShiftAvailability(
      eventId
    );

    this._sendSuccessResponse(res, { availability });
  }

  /**
   * Add a new shift to an existing event (admin only)
   */
  async addShift(req, res) {
    await this._handleAsync(this._addShiftHandler, req, res);
  }

  /**
   * Internal handler for adding shifts
   * @private
   */
  async _addShiftHandler(req, res) {
    const { eventId } = req.params;
    const { name, startTime, endTime, maxCapacity } = req.body;

    // Validate event exists and is a shift event
    const event = await firebaseService.getEvent(eventId);
    if (!event) {
      return this._sendErrorResponse(
        res,
        "Event not found",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    if (event.type !== "shift_event") {
      return this._sendErrorResponse(
        res,
        "Can only add shifts to shift events",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Generate new shift ID
    const shiftId =
      "shift-" + Date.now() + "-" + Math.random().toString(36).substr(2, 9);

    // Create new shift data
    const newShift = {
      id: shiftId,
      name,
      startTime,
      endTime,
      maxCapacity: parseInt(maxCapacity),
      isActive: true,
    };

    // Validate shift data
    try {
      validateShiftData(newShift);
    } catch (error) {
      return this._sendErrorResponse(
        res,
        error.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Add shift to event
    const updatedShifts = [...(event.shifts || []), newShift];

    this._logAction("Adding new shift to event", { eventId, shiftId, name });
    await firebaseService.updateEvent(eventId, { shifts: updatedShifts });

    this._sendSuccessResponse(
      res,
      { shift: newShift },
      "Shift added successfully"
    );
  }

  /**
   * Update an existing shift (admin only)
   */
  async updateShift(req, res) {
    await this._handleAsync(this._updateShiftHandler, req, res);
  }

  /**
   * Internal handler for updating shifts
   * @private
   */
  async _updateShiftHandler(req, res) {
    const { eventId, shiftId } = req.params;
    const { name, startTime, endTime, maxCapacity } = req.body;

    // Validate event exists and is a shift event
    const event = await firebaseService.getEvent(eventId);
    if (!event) {
      return this._sendErrorResponse(
        res,
        "Event not found",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    if (event.type !== "shift_event") {
      return this._sendErrorResponse(
        res,
        "Event is not a shift event",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Find the shift to update
    const shiftIndex = event.shifts?.findIndex((s) => s.id === shiftId);
    if (shiftIndex === -1 || shiftIndex === undefined) {
      return this._sendErrorResponse(
        res,
        "Shift not found",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if shift has existing orders (safety check)
    const hasOrders = await firebaseService.checkShiftHasOrders(
      eventId,
      shiftId
    );
    if (hasOrders && maxCapacity) {
      // If reducing capacity, check current bookings
      const availability = await firebaseService.getEventShiftAvailability(
        eventId
      );
      const shiftAvailability = availability.find((a) => a.shiftId === shiftId);

      if (
        shiftAvailability &&
        parseInt(maxCapacity) < shiftAvailability.occupied
      ) {
        return this._sendErrorResponse(
          res,
          `Cannot reduce capacity below current bookings (${shiftAvailability.occupied})`,
          this.HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    // Create updated shift data
    const updatedShift = {
      ...event.shifts[shiftIndex],
      ...(name && { name }),
      ...(startTime && { startTime }),
      ...(endTime && { endTime }),
      ...(maxCapacity && { maxCapacity: parseInt(maxCapacity) }),
    };

    // Validate updated shift data
    try {
      validateShiftData(updatedShift);
    } catch (error) {
      return this._sendErrorResponse(
        res,
        error.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Update shifts array
    const updatedShifts = [...event.shifts];
    updatedShifts[shiftIndex] = updatedShift;

    this._logAction("Updating shift", { eventId, shiftId, name });
    await firebaseService.updateEvent(eventId, { shifts: updatedShifts });

    this._sendSuccessResponse(
      res,
      { shift: updatedShift },
      "Shift updated successfully"
    );
  }

  /**
   * Get shift information by event ID and shift ID
   */
  async getShiftById(req, res) {
    await this._handleAsync(this._getShiftByIdHandler, req, res);
  }

  /**
   * Internal handler for getting shift by ID
   * @private
   */
  async _getShiftByIdHandler(req, res) {
    const { eventId, shiftId } = req.params;

    if (!eventId || !shiftId) {
      return this._sendErrorResponse(
        res,
        "Event ID and Shift ID are required",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Fetching shift information", { eventId, shiftId });

    const shift = await firebaseService.getShiftById(eventId, shiftId);

    if (!shift) {
      return this._sendErrorResponse(
        res,
        "Shift not found",
        this.HTTP_STATUS.NOT_FOUND
      );
    }

    this._sendSuccessResponse(res, { shift });
  }
}

module.exports = new EventController();
