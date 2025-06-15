// server/core/services/firebase/firebase-shift-counter.service.js
const FirebaseBaseService = require("./firebase-base.service");
const admin = require("firebase-admin");

/**
 * Firebase Shift Counter Service
 * Efficiently tracks shift attendance using dedicated counter documents
 * Minimizes Firebase reads for capacity checking
 */
class FirebaseShiftCounterService extends FirebaseBaseService {
  constructor() {
    super();
    this.countersCollection = this._getCollection("shiftCounters");
    this.eventsCollection = this._getCollection("events");
  }

  /**
   * Get or create counter document for a shift
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @returns {Promise<Object>} Counter document data
   */
  async getShiftCounter(eventId, shiftId) {
    const counterId = `${eventId}_${shiftId}`;
    const counterDoc = await this.countersCollection.doc(counterId).get();

    if (!counterDoc.exists) {
      // Initialize counter if it doesn't exist
      const initialData = {
        eventId,
        shiftId,
        attendeeCount: 0,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      await this.countersCollection.doc(counterId).set(initialData);
      return initialData;
    }

    return this._docToObject(counterDoc);
  }

  /**
   * Increment shift attendance counter atomically
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @param {number} quantity - Number of attendees to add
   * @returns {Promise<number>} New attendance count
   */
  async incrementShiftCounter(eventId, shiftId, quantity = 1) {
    const counterId = `${eventId}_${shiftId}`;
    const counterRef = this.countersCollection.doc(counterId);

    return this._runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      const currentCount = doc.exists ? doc.data().attendeeCount : 0;
      const newCount = currentCount + quantity;

      const updateData = {
        eventId,
        shiftId,
        attendeeCount: newCount,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      };

      if (doc.exists) {
        transaction.update(counterRef, updateData);
      } else {
        transaction.set(counterRef, {
          ...updateData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      return newCount;
    });
  }

  /**
   * Decrement shift attendance counter (for cancellations)
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @param {number} quantity - Number of attendees to remove
   * @returns {Promise<number>} New attendance count
   */
  async decrementShiftCounter(eventId, shiftId, quantity = 1) {
    const counterId = `${eventId}_${shiftId}`;
    const counterRef = this.countersCollection.doc(counterId);

    return this._runTransaction(async (transaction) => {
      const doc = await transaction.get(counterRef);
      const currentCount = doc.exists ? doc.data().attendeeCount : 0;
      const newCount = Math.max(0, currentCount - quantity);

      transaction.update(counterRef, {
        attendeeCount: newCount,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      });

      return newCount;
    });
  }

  /**
   * Check if shift has capacity for additional attendees
   * Efficient capacity check with minimal reads (1-2 Firebase reads max)
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @param {number} requestedQuantity - Number of new attendees
   * @returns {Promise<Object>} Capacity check result
   */
  async checkShiftCapacity(eventId, shiftId, requestedQuantity = 1) {
    // Parallel fetch of counter and shift info (2 reads max, often 1 read if cached)
    const [counter, shift] = await Promise.all([
      this.getShiftCounter(eventId, shiftId),
      this.getShiftInfo(eventId, shiftId),
    ]);

    if (!shift) {
      throw new Error(`Shift ${shiftId} not found in event ${eventId}`);
    }

    const currentAttendees = counter.attendeeCount || 0;
    const available = Math.max(0, shift.maxCapacity - currentAttendees);
    const canBook = currentAttendees + requestedQuantity <= shift.maxCapacity;

    return {
      shiftId,
      currentAttendees,
      maxCapacity: shift.maxCapacity,
      available,
      requestedQuantity,
      canBook,
      isFull: available === 0,
      willBeFull: available === requestedQuantity,
    };
  }

  /**
   * Batch check capacity for multiple shifts
   * Optimized for checkout validation with multiple products/shifts
   * @param {Array} shiftRequests - Array of {eventId, shiftId, quantity} objects
   * @returns {Promise<Object>} Batch capacity check results
   */
  async batchCheckShiftCapacity(shiftRequests) {
    const capacityChecks = await Promise.all(
      shiftRequests.map(async ({ eventId, shiftId, quantity }) => {
        try {
          const result = await this.checkShiftCapacity(
            eventId,
            shiftId,
            quantity
          );
          return { success: true, ...result };
        } catch (error) {
          return {
            success: false,
            shiftId,
            error: error.message,
          };
        }
      })
    );

    const allCanBook = capacityChecks.every(
      (check) => check.success && check.canBook
    );
    const failedChecks = capacityChecks.filter(
      (check) => !check.success || !check.canBook
    );

    return {
      allCanBook,
      capacityChecks,
      failedChecks,
      summary: {
        totalShifts: shiftRequests.length,
        availableShifts: capacityChecks.filter((c) => c.success && c.canBook)
          .length,
        fullShifts: capacityChecks.filter((c) => c.success && c.isFull).length,
      },
    };
  }

  /**
   * Get shift information (uses cached event data when possible)
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @returns {Promise<Object>} Shift information
   */
  async getShiftInfo(eventId, shiftId) {
    const eventDoc = await this.eventsCollection.doc(eventId).get();

    if (!eventDoc.exists) {
      return null;
    }

    const eventData = this._docToObject(eventDoc);
    return eventData.shifts?.find((shift) => shift.id === shiftId) || null;
  }

  /**
   * Reconcile counter with actual order data (for data integrity)
   * Should be run periodically or when discrepancies are detected
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @returns {Promise<Object>} Reconciliation result
   */
  async reconcileShiftCounter(eventId, shiftId) {
    // This method involves reading orders but should be used sparingly
    const ordersCollection = this._getCollection("orders");

    // Count actual attendees from orders
    const ordersSnapshot = await ordersCollection
      .where("eventId", "==", eventId)
      .get();

    let actualAttendees = 0;

    for (const orderDoc of ordersSnapshot.docs) {
      const itemsSnapshot = await orderDoc.ref.collection("items").get();

      itemsSnapshot.docs.forEach((itemDoc) => {
        const itemData = itemDoc.data();
        if (itemData.shiftId === shiftId) {
          actualAttendees += itemData.quantity || 1;
        }
      });
    }

    // Update counter to match actual data
    const counterId = `${eventId}_${shiftId}`;
    const counterRef = this.countersCollection.doc(counterId);

    await counterRef.set(
      {
        eventId,
        shiftId,
        attendeeCount: actualAttendees,
        lastReconciled: admin.firestore.FieldValue.serverTimestamp(),
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    return {
      shiftId,
      actualAttendees,
      reconciled: true,
      reconciledAt: new Date().toISOString(),
    };
  }

  /**
   * Get attendance overview for all shifts in an event
   * Efficient method for admin dashboards
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of shift attendance data
   */
  async getEventShiftAttendanceOverview(eventId) {
    const eventDoc = await this.eventsCollection.doc(eventId).get();

    if (!eventDoc.exists) {
      throw new Error(`Event ${eventId} not found`);
    }

    const eventData = this._docToObject(eventDoc);

    if (!eventData.shifts || eventData.shifts.length === 0) {
      return [];
    }

    // Fetch all counters for this event's shifts in parallel
    const counterPromises = eventData.shifts.map((shift) =>
      this.getShiftCounter(eventId, shift.id)
    );

    const counters = await Promise.all(counterPromises);

    return eventData.shifts.map((shift, index) => {
      const counter = counters[index];
      const currentAttendees = counter?.attendeeCount || 0;
      const available = Math.max(0, shift.maxCapacity - currentAttendees);

      return {
        shiftId: shift.id,
        shiftName: shift.name,
        startTime: shift.startTime,
        endTime: shift.endTime,
        maxCapacity: shift.maxCapacity,
        currentAttendees,
        available,
        isFull: available === 0,
        utilizationPercentage: Math.round(
          (currentAttendees / shift.maxCapacity) * 100
        ),
      };
    });
  }

  /**
   * Initialize counters for all shifts in an event
   * Useful when migrating existing events or setting up new events
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of initialized counter IDs
   */
  async initializeEventShiftCounters(eventId) {
    const eventDoc = await this.eventsCollection.doc(eventId).get();

    if (!eventDoc.exists) {
      throw new Error(`Event ${eventId} not found`);
    }

    const eventData = this._docToObject(eventDoc);

    if (!eventData.shifts || eventData.shifts.length === 0) {
      return [];
    }

    const batch = this._createBatch();
    const counterIds = [];

    eventData.shifts.forEach((shift) => {
      const counterId = `${eventId}_${shift.id}`;
      const counterRef = this.countersCollection.doc(counterId);

      batch.set(
        counterRef,
        {
          eventId,
          shiftId: shift.id,
          attendeeCount: 0,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      counterIds.push(counterId);
    });

    await batch.commit();
    return counterIds;
  }
}

module.exports = new FirebaseShiftCounterService();
