const admin = require("../../config/firebaseAdmin");
const {
  ProductFields,
  UserFields,
  OrderFields,
  OrderItemFields,
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
    const userData = {
      [UserFields.FIREBASE_UID]: firebaseUid,
      [UserFields.EMAIL]: email,
      [UserFields.STRIPE_CUSTOMER_ID]: stripeCustomerId,
      [UserFields.IS_ADMIN]: isAdmin,
      [UserFields.CREATED_AT]: admin.firestore.FieldValue.serverTimestamp(),
    };
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
    if (!productData[ProductFields.STRIPE_PRODUCT_ID]) {
      throw new Error("stripeProductId is required");
    }

    const id = productData[ProductFields.STRIPE_PRODUCT_ID];
    const product = {
      [ProductFields.NAME]: productData[ProductFields.NAME],
      [ProductFields.DESCRIPTION]: productData[ProductFields.DESCRIPTION],
      [ProductFields.PRICE]: productData[ProductFields.PRICE],
      [ProductFields.EVENT_ID]: productData[ProductFields.EVENT_ID],
      [ProductFields.STRIPE_PRODUCT_ID]:
        productData[ProductFields.STRIPE_PRODUCT_ID],
      [ProductFields.STRIPE_PRICE_ID]:
        productData[ProductFields.STRIPE_PRICE_ID] || "",
      [ProductFields.IMAGE]: productData[ProductFields.IMAGE] || "",
      [ProductFields.REQUIRES_TIMESLOT]:
        productData[ProductFields.REQUIRES_TIMESLOT] || false,
      [ProductFields.CREATED_AT]: admin.firestore.FieldValue.serverTimestamp(),
    };

    await this.db.collection("products").doc(id).set(product);
    return { id, ...product };
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

    // Create order document
    const orderRef = this.db.collection("orders").doc(orderId);
    const orderData = {
      [OrderFields.USER_ID]: userId,
      [OrderFields.AMOUNT_TOTAL]: amountTotal,
      [OrderFields.CURRENCY]: currency,
      [OrderFields.PAYMENT_METHOD]: paymentMethod,
      [OrderFields.MANUAL_PAYMENT_CONFIRMED_AT]: null,
      [OrderFields.MANUAL_PAYMENT_CONFIRMED_BY]: "",
      [OrderFields.CREATED_AT]: admin.firestore.FieldValue.serverTimestamp(),
    };
    batch.set(orderRef, orderData);

    // Add order items as subcollection
    items.forEach((item) => {
      const itemRef = orderRef.collection("items").doc();
      const itemData = {
        [OrderItemFields.PRODUCT_NAME]: item.description || item.productName,
        [OrderItemFields.QUANTITY]: item.quantity,
        [OrderItemFields.AMOUNT_TOTAL]: item.amount || item.amountTotal,
        [OrderItemFields.UNIT_PRICE]: item.unit_price || item.unitPrice,
      };
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
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  async getActiveEvents() {
    const snapshot = await this.db
      .collection("events")
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
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
      .where("eventId", "==", eventId)
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
}

module.exports = new FirebaseService();
