const admin = require("../config/firebaseAdmin");

class UserService {
  constructor() {
    this.db = admin.firestore();
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
    try {
      await this.db
        .collection("users")
        .doc(firebaseUid)
        .set({
          email,
          stripeCustomerId,
          isAdmin: isAdmin === 1,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

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
    try {
      const doc = await this.db.collection("users").doc(firebaseUid).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        firebase_uid: firebaseUid,
        email: data.email,
        stripe_customer_id: data.stripeCustomerId,
        is_admin: data.isAdmin ? 1 : 0,
      };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a user from the database by their email.
   *
   * @param {string} email - The email of the user to retrieve.
   * @returns {Promise<Object>} A promise that resolves to the user object if found, or null.
   */
  async getUserByEmail(email) {
    try {
      const snapshot = await this.db
        .collection("users")
        .where("email", "==", email)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        firebase_uid: doc.id,
        email: data.email,
        stripe_customer_id: data.stripeCustomerId,
        is_admin: data.isAdmin ? 1 : 0,
      };
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
    try {
      const snapshot = await this.db
        .collection("users")
        .where("stripeCustomerId", "==", stripeCustomerId)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      const data = doc.data();
      return {
        firebase_uid: doc.id,
        email: data.email,
        stripe_customer_id: data.stripeCustomerId,
        is_admin: data.isAdmin ? 1 : 0,
      };
    } catch (error) {
      throw error;
    }
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
      await this.db.collection("users").doc(firebaseUid).update({
        isAdmin: true,
      });
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
      const doc = await this.db.collection("users").doc(firebaseUid).get();

      if (!doc.exists) {
        return false;
      }

      const data = doc.data();
      return !!data.isAdmin;
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
    try {
      const snapshot = await this.db.collection("users").get();
      const users = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        users.push({
          firebase_uid: doc.id,
          email: data.email,
          is_admin: data.isAdmin ? 1 : 0,
        });
      });

      return users;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a user from the database.
   *
   * @param {string} firebaseUid - The Firebase UID of the user to delete.
   * @returns {Promise<void>} A promise that resolves when the user is deleted.
   */
  async deleteUser(firebaseUid) {
    try {
      await this.db.collection("users").doc(firebaseUid).delete();
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove admin privileges from a user.
   *
   * @param {string} firebaseUid - The Firebase UID of the user.
   * @returns {Promise<void>} A promise that resolves when admin privileges are removed.
   */
  async removeUserAdmin(firebaseUid) {
    try {
      await this.db.collection("users").doc(firebaseUid).update({
        isAdmin: false,
      });
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new UserService();
