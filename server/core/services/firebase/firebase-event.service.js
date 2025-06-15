// server/core/services/firebase/firebase-event.service.js
const FirebaseBaseService = require("./firebase-base.service");
const { EventFields } = require("../../../models/webstore.model");

/**
 * Firebase Event Service
 * Handles all event-related database operations
 */
class FirebaseEventService extends FirebaseBaseService {
  constructor() {
    super();
    this.collection = this._getCollection("events");
  }

  /**
   * Create a new event
   * @param {Object} eventData - Event data
   * @returns {Promise<string>} Created event ID
   */
  async createEvent(eventData) {
    const docRef = await this.collection.add({
      ...eventData,
      createdAt: this._getServerTimestamp(),
    });
    return docRef.id;
  }

  /**
   * Get all events (ordered by creation date, newest first)
   * @returns {Promise<Array>} Array of event data
   */
  async getAllEvents() {
    const snapshot = await this.collection
      .orderBy(EventFields.CREATED_AT, "desc")
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Get active events only
   * @returns {Promise<Array>} Array of active event data
   */
  async getActiveEvents() {
    const snapshot = await this.collection
      .where(EventFields.ISACTIVE, "==", true)
      .orderBy(EventFields.CREATED_AT, "desc")
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Get event by ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Object|null>} Event data or null
   */
  async getEvent(eventId) {
    const doc = await this.collection.doc(eventId).get();
    return this._docToObject(doc);
  }

  /**
   * Update event data
   * @param {string} eventId - Event ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<void>}
   */
  async updateEvent(eventId, updateData) {
    await this.collection.doc(eventId).update({
      ...updateData,
      updatedAt: this._getServerTimestamp(),
    });
  }

  /**
   * Delete an event
   * @param {string} eventId - Event ID
   * @returns {Promise<void>}
   */
  async deleteEvent(eventId) {
    await this.collection.doc(eventId).delete();
  }

  /**
   * Get shift information by event ID and shift ID
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @returns {Promise<Object|null>} Shift data with time information
   */
  async getShiftById(eventId, shiftId) {
    if (!eventId || !shiftId) return null;

    try {
      const event = await this.getEvent(eventId);
      if (!event || !event.shifts || !Array.isArray(event.shifts)) {
        return null;
      }

      const shift = event.shifts.find((s) => s.id === shiftId);
      if (!shift) return null;

      return {
        id: shift.id,
        name: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        maxCapacity: shift.maxCapacity,
        eventId: eventId,
        eventName: event.name,
      };
    } catch (error) {
      console.warn(
        `Failed to fetch shift ${shiftId} from event ${eventId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Get event shift availability
   * @param {string} eventId - Event ID
   * @param {Array} orders - Array of orders for this event
   * @returns {Promise<Array>} Array of shift availability data
   * @throws {Error} If event is not found or not a shift event
   */
  async getEventShiftAvailability(eventId, orders = []) {
    const event = await this.getEvent(eventId);
    if (!event || event.type !== "shift_event") {
      throw new Error("Event not found or not a shift event");
    }

    // Calculate availability for each shift
    const availability = event.shifts.map((shift) => {
      const shiftOrders = orders.filter((order) => order.shiftId === shift.id);
      const occupied = shiftOrders.length;
      const available = Math.max(0, shift.maxCapacity - occupied);

      return {
        shiftId: shift.id,
        shiftName: shift.name,
        timeSlot: `${shift.startTime}-${shift.endTime}`,
        maxCapacity: shift.maxCapacity,
        occupied,
        available,
        isFull: available === 0,
      };
    });

    return availability;
  }

  /**
   * Check if event exists
   * @param {string} eventId - Event ID
   * @returns {Promise<boolean>} True if event exists
   */
  async eventExists(eventId) {
    const doc = await this.collection.doc(eventId).get();
    return doc.exists;
  }

  /**
   * Get events by type
   * @param {string} eventType - Event type (e.g., 'shift_event', 'regular_event')
   * @returns {Promise<Array>} Array of events matching the type
   */
  async getEventsByType(eventType) {
    const snapshot = await this.collection
      .where(EventFields.TYPE, "==", eventType)
      .orderBy(EventFields.CREATED_AT, "desc")
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Get active events by type
   * @param {string} eventType - Event type
   * @returns {Promise<Array>} Array of active events matching the type
   */
  async getActiveEventsByType(eventType) {
    const snapshot = await this.collection
      .where(EventFields.TYPE, "==", eventType)
      .where(EventFields.ISACTIVE, "==", true)
      .orderBy(EventFields.CREATED_AT, "desc")
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }
}

module.exports = new FirebaseEventService();
