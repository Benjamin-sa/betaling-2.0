const db = require('../db').instance;

class UserService {
  constructor() {
    this.db = db;
  }

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
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO users (firebase_uid, email, stripe_customer_id, is_admin) 
         VALUES (?, ?, ?, ?)`,
        [firebaseUid, email, stripeCustomerId, isAdmin],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ firebaseUid, email, stripeCustomerId, isAdmin });
        }
      );
    });
  }

  /**
   * Retrieves a user from the database by their Firebase UID.
   *
   * @param {string} firebaseUid - The Firebase UID of the user to retrieve.
   * @returns {Promise<Object>} A promise that resolves to the user object if found, or rejects with an error.
   */
  async getUserByFirebaseId(firebaseUid) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE firebase_uid = ?`,
        [firebaseUid],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  /**
   * Retrieves a user from the database by their Stripe customer ID.
   *
   * @param {string} stripeCustomerId - The Stripe customer ID of the user.
   * @returns {Promise<Object>} A promise that resolves to the user object if found, or rejects with an error.
   */
  async getUserByStripeId(stripeCustomerId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM users WHERE stripe_customer_id = ?`,
        [stripeCustomerId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  /**
   * Promotes a user to an admin by updating the `is_admin` field in the database.
   *
   * @param {string} firebaseUid - The Firebase UID of the user to be promoted.
   * @returns {Promise<{ success: boolean }>} A promise that resolves with an object indicating success.
   * @throws {Error} If there is an error during the database operation.
   */
  async makeUserAdmin(firebaseUid) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET is_admin = 1 WHERE firebase_uid = ?`,
        [firebaseUid],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve({ success: true });
        }
      );
    });
  }


    /**
     * Checks if a user is an admin based on their Firebase UID.
     *
     * @param {string} firebaseUid - The Firebase UID of the user.
     * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the user is an admin.
     */
    async isUserAdmin(firebaseUid) {
      return new Promise((resolve, reject) => {
        this.db.get(
          `SELECT is_admin FROM users WHERE firebase_uid = ?`,
          [firebaseUid],
          (err, row) => {
            if (err) {
              reject(err);
              return;
            }
            resolve(row ? !!row.is_admin : false);
          }
        );
      });
    }


  /**
   * Deactivates a user by setting their active status to 0.
   *
   * @param {number} userId - The ID of the user to deactivate.
   * @returns {Promise<Object>} A promise that resolves to an object indicating success.
   * @throws {Error} If there is an error during the database operation.
   */
  async deactivateUser(userId) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `UPDATE users SET active = 0 WHERE id = ?`,
        [userId],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ success: true });
        }
      );
    });
  }
}

module.exports = new UserService();