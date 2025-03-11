const DbService = require('../db/services/db.service');

class UserService {
  /**
   * Creates a new user in the database.
   *
   * @param {Object} user - The user object.
   * @param {string} user.firebaseUid - The Firebase UID of the user.
   * @param {string} user.email - The email of the user.
   * @param {string} user.stripeCustomerId - The Stripe customer ID of the user.
   * @param {number} [user.isAdmin=0] - Indicates if the user is an admin (0 for false, 1 for true).
   * @returns {Promise<Object>} A promise that resolves to the created user object.
   */
  async createUser({ firebaseUid, email, stripeCustomerId, isAdmin = 0 }) {
    try {
      const data = {
        firebase_uid: firebaseUid,
        email,
        stripe_customer_id: stripeCustomerId,
        is_admin: isAdmin
      };
      
      await DbService.create('users', data);
      return { firebaseUid, email, stripeCustomerId, isAdmin };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a user from the database by their Firebase UID.
   *
   * @param {string} firebaseUid - The Firebase UID of the user to retrieve.
   * @returns {Promise<Object>} A promise that resolves to the user object if found, or rejects with an error.
   */
  async getUserByFirebaseId(firebaseUid) {
    return DbService.getById('users', 'firebase_uid', firebaseUid);
  }

  /**
   * Retrieves a user from the database by their email.
   *
   * @param {string} email - The email of the user to retrieve.
   * @returns {Promise<Object>} A promise that resolves to the user object if found, or null.
   */
  async getUserByEmail(email) {
    try {
      return await DbService.queryOne('SELECT * FROM users WHERE email = ?', [email]);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a user from the database by their Stripe customer ID.
   *
   * @param {string} stripeCustomerId - The Stripe customer ID of the user.
   * @returns {Promise<Object>} A promise that resolves to the user object if found, or rejects with an error.
   */
  async getUserByStripeId(stripeCustomerId) {
    console.log(stripeCustomerId);
    return DbService.queryOne('SELECT * FROM users WHERE stripe_customer_id = ?', [stripeCustomerId]);
  }

  /**
   * Promotes a user to an admin by updating the `is_admin` field in the database.
   *
   * @param {string} firebaseUid - The Firebase UID of the user to be promoted.
   * @returns {Promise<{ success: boolean }>} A promise that resolves with an object indicating success.
   * @throws {Error} If there is an error during the database operation.
   */
  async makeUserAdmin(firebaseUid) {
    try {
      await DbService.update('users', 'firebase_uid', firebaseUid, { is_admin: 1 });
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Checks if a user is an admin based on their Firebase UID.
   *
   * @param {string} firebaseUid - The Firebase UID of the user.
   * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the user is an admin.
   */
  async isUserAdmin(firebaseUid) {
    try {
      const row = await DbService.queryOne('SELECT is_admin FROM users WHERE firebase_uid = ?', [firebaseUid]);
      return row ? !!row.is_admin : false;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all users from the database.
   * 
   * @returns {Promise<Array>} A promise that resolves to an array of user objects.
   */
  async getAllUsers() {
    return DbService.query('SELECT firebase_uid, email, is_admin FROM users');
  }

  /**
   * Delete a user from the database.
   * 
   * @param {string} firebaseUid - The Firebase UID of the user to delete.
   * @returns {Promise<void>} A promise that resolves when the user is deleted.
   */
  async deleteUser(firebaseUid) {
    return DbService.delete('users', 'firebase_uid', firebaseUid);
  }

  /**
   * Remove admin privileges from a user.
   * 
   * @param {string} firebaseUid - The Firebase UID of the user.
   * @returns {Promise<void>} A promise that resolves when admin privileges are removed.
   */
  async removeUserAdmin(firebaseUid) {
    return DbService.update('users', 'firebase_uid', firebaseUid, { is_admin: 0 });
  }
}

module.exports = new UserService();