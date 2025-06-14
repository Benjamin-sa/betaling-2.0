// server/features/events/event.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");

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

    const validation = this._validateRequiredFields(req.body, [
      "name",
      "description",
      "type",
    ]);
    if (!validation.isValid) {
      return this._sendErrorResponse(
        res,
        validation.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate event type
    if (!["product_sale", "shift_event"].includes(type)) {
      return this._sendErrorResponse(
        res,
        "Event type must be 'product_sale' or 'shift_event'",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // For shift events, validate shifts
    if (type === "shift_event") {
      if (!shifts || !Array.isArray(shifts) || shifts.length === 0) {
        return this._sendErrorResponse(
          res,
          "Shift events must have at least one shift",
          this.HTTP_STATUS.BAD_REQUEST
        );
      }

      // Validate each shift
      for (const shift of shifts) {
        const shiftValidation = this._validateRequiredFields(shift, [
          "name",
          "startTime",
          "endTime",
          "maxCapacity",
        ]);
        if (!shiftValidation.isValid) {
          return this._sendErrorResponse(
            res,
            `Invalid shift data: ${shiftValidation.message}`,
            this.HTTP_STATUS.BAD_REQUEST
          );
        }
      }
    }

    const eventData = {
      name,
      description,
      type,
      isActive: false, // Events start inactive
      createdAt: new Date().toISOString(),
      createdBy: req.user.uid,
      shifts: type === "shift_event" ? shifts : [],
    };

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

    const validation = this._validateRequiredFields(req.params, ["eventId"]);
    if (!validation.isValid) {
      return this._sendErrorResponse(
        res,
        validation.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

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

    const validation = this._validateRequiredFields(req.params, ["eventId"]);
    if (!validation.isValid) {
      return this._sendErrorResponse(
        res,
        validation.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

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

    const validation = this._validateRequiredFields(req.params, ["eventId"]);
    if (!validation.isValid) {
      return this._sendErrorResponse(
        res,
        validation.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

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

    const validation = this._validateRequiredFields(req.params, ["eventId"]);
    if (!validation.isValid) {
      return this._sendErrorResponse(
        res,
        validation.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Fetching event shift availability", { eventId });
    const availability = await firebaseService.getEventShiftAvailability(
      eventId
    );

    this._sendSuccessResponse(res, { availability });
  }
}

module.exports = new EventController();
