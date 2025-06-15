// server/core/services/firebase/firebase-product.service.js
const FirebaseBaseService = require("./firebase-base.service");
const { ProductFields } = require("../../../models/webstore.model");

/**
 * Firebase Product Service
 * Handles all product-related database operations
 */
class FirebaseProductService extends FirebaseBaseService {
  constructor() {
    super();
    this.collection = this._getCollection("products");
  }

  /**
   * Create a new product
   * @param {Object} productData - Product data (already validated by factory function)
   * @returns {Promise<Object>} Created product data with ID
   * @throws {Error} If stripeProductId is missing
   */
  async createProduct(productData) {
    if (!productData[ProductFields.STRIPE_PRODUCT_ID]) {
      throw new Error("stripeProductId is required");
    }

    const id = productData[ProductFields.STRIPE_PRODUCT_ID];
    await this.collection.doc(id).set(productData);
    return { id, ...productData };
  }

  /**
   * Get product by ID
   * @param {string} productId - Product ID
   * @returns {Promise<Object|null>} Product data or null
   */
  async getProduct(productId) {
    const doc = await this.collection.doc(productId).get();
    return this._docToObject(doc);
  }

  /**
   * Get all products
   * @returns {Promise<Array>} Array of product data
   */
  async getAllProducts() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Get products by event ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of product data for the event
   */
  async getProductsByEvent(eventId) {
    const snapshot = await this.collection
      .where(ProductFields.EVENT_ID, "==", eventId)
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Update product data
   * @param {string} productId - Product ID
   * @param {Object} updateData - Data to update
   * @returns {Promise<Object>} Success result
   */
  async updateProduct(productId, updateData) {
    await this.collection.doc(productId).update({
      ...updateData,
      updatedAt: this._getServerTimestamp(),
    });
    return { success: true };
  }

  /**
   * Delete a product
   * @param {string} productId - Product ID
   * @returns {Promise<Object>} Deleted product ID
   */
  async deleteProduct(productId) {
    await this.collection.doc(productId).delete();
    return { id: productId };
  }

  /**
   * Check if product exists
   * @param {string} productId - Product ID
   * @returns {Promise<boolean>} True if product exists
   */
  async productExists(productId) {
    const doc = await this.collection.doc(productId).get();
    return doc.exists;
  }

  /**
   * Get products that require timeslot selection
   * @returns {Promise<Array>} Array of products requiring timeslots
   */
  async getTimeslotProducts() {
    const snapshot = await this.collection
      .where(ProductFields.REQUIRES_TIMESLOT, "==", true)
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Get products by event that require timeslots
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of timeslot products for the event
   */
  async getTimeslotProductsByEvent(eventId) {
    const snapshot = await this.collection
      .where(ProductFields.EVENT_ID, "==", eventId)
      .where(ProductFields.REQUIRES_TIMESLOT, "==", true)
      .get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }
}

module.exports = new FirebaseProductService();
