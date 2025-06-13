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
      [ProductFields.STRIPE_PRODUCT_ID]:
        productData[ProductFields.STRIPE_PRODUCT_ID],
      [ProductFields.STRIPE_PRICE_ID]:
        productData[ProductFields.STRIPE_PRICE_ID] || "",
      [ProductFields.IMAGE]: productData[ProductFields.IMAGE_URL] || "",
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

    return snapshot.docs.map((doc) => this._docToObject(doc));
  }
}

module.exports = new FirebaseService();
