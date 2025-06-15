// server/core/services/firebase/firebase-user.service.js
const FirebaseBaseService = require("./firebase-base.service");
const {
  UserFields,
  createUserData,
} = require("../../../models/webstore.model");

/**
 * Firebase User Service
 * Handles all user-related database operations
 */
class FirebaseUserService extends FirebaseBaseService {
  constructor() {
    super();
    this.collection = this._getCollection("users");
  }

  /**
   * Create a new user
   * @param {Object} userData - User data
   * @param {string} userData.firebaseUid - Firebase UID
   * @param {string} userData.email - User email
   * @param {string} userData.stripeCustomerId - Stripe customer ID
   * @param {boolean} [userData.isAdmin=false] - Admin status
   * @returns {Promise<Object>} Created user data with ID
   */
  async createUser({ firebaseUid, email, stripeCustomerId, isAdmin = false }) {
    const userData = createUserData({
      [UserFields.FIREBASE_UID]: firebaseUid,
      [UserFields.EMAIL]: email,
      [UserFields.STRIPE_CUSTOMER_ID]: stripeCustomerId,
      [UserFields.IS_ADMIN]: isAdmin,
    });

    await this.collection.doc(firebaseUid).set(userData);
    return { id: firebaseUid, ...userData };
  }

  /**
   * Get user by Firebase UID
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<Object|null>} User data or null
   */
  async getUser(firebaseUid) {
    const doc = await this.collection.doc(firebaseUid).get();
    return this._docToObject(doc);
  }

  /**
   * Get user by Stripe customer ID
   * @param {string} stripeCustomerId - Stripe customer ID
   * @returns {Promise<Object|null>} User data or null
   */
  async getUserByStripeId(stripeCustomerId) {
    const snapshot = await this.collection
      .where(UserFields.STRIPE_CUSTOMER_ID, "==", stripeCustomerId)
      .limit(1)
      .get();

    return snapshot.empty ? null : this._docToObject(snapshot.docs[0]);
  }

  /**
   * Update user admin status
   * @param {string} firebaseUid - Firebase UID
   * @param {boolean} isAdmin - Admin status
   * @returns {Promise<Object>} Success result
   */
  async updateUserAdmin(firebaseUid, isAdmin) {
    await this.collection.doc(firebaseUid).update({
      [UserFields.IS_ADMIN]: isAdmin,
    });
    return { success: true };
  }

  /**
   * Get all users
   * @returns {Promise<Array>} Array of user data
   */
  async getAllUsers() {
    const snapshot = await this.collection.get();
    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Delete a user
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<void>}
   */
  async deleteUser(firebaseUid) {
    await this.collection.doc(firebaseUid).delete();
  }

  /**
   * Check if user is admin
   * @param {string} firebaseUid - Firebase UID
   * @returns {Promise<boolean>} Admin status
   */
  async isUserAdmin(firebaseUid) {
    const user = await this.getUser(firebaseUid);
    return user ? user.isAdmin || false : false;
  }

  /**
   * Batch fetch multiple users by IDs
   * @param {Array<string>} userIds - Array of Firebase UIDs
   * @returns {Promise<Object>} Map of userID -> user data
   */
  async batchFetchUsers(userIds) {
    return await this._batchFetchByIds("users", userIds);
  }
}

module.exports = new FirebaseUserService();
