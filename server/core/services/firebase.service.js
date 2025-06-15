const admin = require("../../config/firebaseAdmin");
const {
  ProductFields,
  UserFields,
  OrderFields,
  OrderItemFields,
  EventFields,
  createUserData,
  createOrderData,
  createOrderItemData,
} = require("../../models/webstore.model");

class FirebaseService {
  constructor() {
    this.db = admin.firestore();
  }

  // Helper method to convert document to object with ID
  _docToObject(doc) {
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  // User operations
  async createUser({ firebaseUid, email, stripeCustomerId, isAdmin = false }) {
    const userData = createUserData({
      [UserFields.FIREBASE_UID]: firebaseUid,
      [UserFields.EMAIL]: email,
      [UserFields.STRIPE_CUSTOMER_ID]: stripeCustomerId,
      [UserFields.IS_ADMIN]: isAdmin,
    });

    await this.db.collection("users").doc(firebaseUid).set(userData);
    return { id: firebaseUid, ...userData };
  }

  async getUser(firebaseUid) {
    const doc = await this.db.collection("users").doc(firebaseUid).get();
    return this._docToObject(doc);
  }

  async getUserByStripeId(stripeCustomerId) {
    const snapshot = await this.db
      .collection("users")
      .where(UserFields.STRIPE_CUSTOMER_ID, "==", stripeCustomerId)
      .limit(1)
      .get();
    return snapshot.empty ? null : this._docToObject(snapshot.docs[0]);
  }

  async updateUserAdmin(firebaseUid, isAdmin) {
    await this.db
      .collection("users")
      .doc(firebaseUid)
      .update({
        [UserFields.IS_ADMIN]: isAdmin,
      });
    return { success: true };
  }

  async getAllUsers() {
    const snapshot = await this.db.collection("users").get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  async deleteUser(firebaseUid) {
    await this.db.collection("users").doc(firebaseUid).delete();
  }

  // Product operations
  async createProduct(productData) {
    // Product data is already validated and formatted by the factory function
    if (!productData[ProductFields.STRIPE_PRODUCT_ID]) {
      throw new Error("stripeProductId is required");
    }

    const id = productData[ProductFields.STRIPE_PRODUCT_ID];
    await this.db.collection("products").doc(id).set(productData);
    return { id, ...productData };
  }

  async getProduct(productId) {
    const doc = await this.db.collection("products").doc(productId).get();
    return this._docToObject(doc);
  }

  async getAllProducts() {
    const snapshot = await this.db.collection("products").get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  async deleteProduct(productId) {
    await this.db.collection("products").doc(productId).delete();
    return { id: productId };
  }

  // Order operations
  async createOrder({
    orderId,
    userId,
    items,
    amountTotal,
    currency = "EUR",
    paymentMethod = "stripe",
  }) {
    const batch = this.db.batch();

    // Create order document using factory function
    const orderRef = this.db.collection("orders").doc(orderId);
    const orderData = createOrderData({
      [OrderFields.USER_ID]: userId,
      [OrderFields.AMOUNT_TOTAL]: amountTotal,
      [OrderFields.CURRENCY]: currency,
      [OrderFields.PAYMENT_METHOD]: paymentMethod,
    });
    batch.set(orderRef, orderData);

    // Add order items as subcollection using factory function
    items.forEach((item) => {
      const itemRef = orderRef.collection("items").doc();
      const itemData = createOrderItemData({
        [OrderItemFields.PRODUCT_NAME]: item.description || item.productName,
        [OrderItemFields.QUANTITY]: item.quantity,
        [OrderItemFields.AMOUNT_TOTAL]: item.amount || item.amountTotal,
        [OrderItemFields.UNIT_PRICE]: item.unit_price || item.unitPrice,
        [OrderItemFields.SHIFT_ID]: item.shiftId || "",
      });
      batch.set(itemRef, itemData);
    });

    await batch.commit();
    return { id: orderId, ...orderData };
  }

  async getUserOrders(userId) {
    const snapshot = await this.db
      .collection("orders")
      .where(OrderFields.USER_ID, "==", userId)
      .orderBy(OrderFields.CREATED_AT, "desc")
      .get();

    // Fetch orders with their items subcollection
    const ordersWithItems = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const orderData = this._docToObject(doc);

        // Fetch items subcollection for this order
        const itemsSnapshot = await doc.ref.collection("items").get();
        const items = itemsSnapshot.docs.map((itemDoc) =>
          this._docToObject(itemDoc)
        );

        return {
          ...orderData,
          items,
        };
      })
    );

    return ordersWithItems;
  }

  async getAllOrdersWithItems() {
    const snapshot = await this.db
      .collection("orders")
      .orderBy(OrderFields.CREATED_AT, "desc")
      .get();

    // Fetch orders with their items subcollection
    const ordersWithItems = await Promise.all(
      snapshot.docs.map(async (doc) => {
        const orderData = this._docToObject(doc);

        // Fetch items subcollection for this order
        const itemsSnapshot = await doc.ref.collection("items").get();
        const items = itemsSnapshot.docs.map((itemDoc) =>
          this._docToObject(itemDoc)
        );

        return {
          ...orderData,
          items,
        };
      })
    );

    return ordersWithItems;
  }

  async getOrderBySessionId(sessionId) {
    const snapshot = await this.db.collection("orders").doc(sessionId).get();

    if (!snapshot.exists) {
      return null;
    }

    const orderData = this._docToObject(snapshot);

    // Fetch items subcollection for this order
    const itemsSnapshot = await snapshot.ref.collection("items").get();
    const items = itemsSnapshot.docs.map((itemDoc) =>
      this._docToObject(itemDoc)
    );

    return {
      ...orderData,
      items,
    };
  }

  async getUserById(userId) {
    const snapshot = await this.db.collection("users").doc(userId).get();

    return snapshot.exists ? this._docToObject(snapshot) : null;
  }

  // ============================================================================
  // EVENT OPERATIONS
  // ============================================================================

  async createEvent(eventData) {
    const docRef = await this.db.collection("events").add({
      ...eventData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return docRef.id;
  }

  async getAllEvents() {
    const snapshot = await this.db
      .collection("events")
      .orderBy(EventFields.CREATED_AT, "desc")
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  async getActiveEvents() {
    const snapshot = await this.db
      .collection("events")
      .where(EventFields.ISACTIVE, "==", true)
      .orderBy(EventFields.CREATED_AT, "desc")
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  async getEvent(eventId) {
    const doc = await this.db.collection("events").doc(eventId).get();
    return this._docToObject(doc);
  }

  async updateEvent(eventId, updateData) {
    await this.db
      .collection("events")
      .doc(eventId)
      .update({
        ...updateData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
  }

  async deleteEvent(eventId) {
    await this.db.collection("events").doc(eventId).delete();
  }

  async getProductsByEvent(eventId) {
    const snapshot = await this.db
      .collection("products")
      .where(ProductFields.EVENT_ID, "==", eventId)
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  async getEventShiftAvailability(eventId) {
    // Get the event to check if it's a shift event
    const event = await this.getEvent(eventId);
    if (!event || event.type !== "shift_event") {
      throw new Error("Event not found or not a shift event");
    }

    // Get all orders for this event to calculate availability
    const ordersSnapshot = await this.db
      .collection("orders")
      .where("eventId", "==", eventId)
      .get();

    const orders = ordersSnapshot.docs.map((doc) => this._docToObject(doc));

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
   * Check if a shift has existing orders
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @returns {boolean} True if shift has orders
   */
  async checkShiftHasOrders(eventId, shiftId) {
    const ordersSnapshot = await this.db
      .collection("orders")
      .where("eventId", "==", eventId)
      .get();

    // Check if any order items have this shiftId
    for (const orderDoc of ordersSnapshot.docs) {
      const itemsSnapshot = await orderDoc.ref.collection("items").get();
      const hasShiftItems = itemsSnapshot.docs.some((itemDoc) => {
        const itemData = itemDoc.data();
        return itemData.shiftId === shiftId;
      });

      if (hasShiftItems) {
        return true;
      }
    }

    return false;
  }
}

module.exports = new FirebaseService();
