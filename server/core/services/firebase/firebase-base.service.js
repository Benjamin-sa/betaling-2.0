// server/core/services/firebase/firebase-base.service.js
const { admin } = require("../../../config/firebaseAdmin");

/**
 * Base Firebase service with common utilities
 * All domain-specific services extend this base class
 */
class FirebaseBaseService {
  constructor() {
    this.db = admin.firestore();
  }

  /**
   * Helper method to convert Firestore document to object with ID
   * @param {Object} doc - Firestore document
   * @returns {Object|null} Document data with ID or null if doesn't exist
   */
  _docToObject(doc) {
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  /**
   * Convert date string to Firestore Timestamp
   * @param {string} dateString - Date string
   * @returns {Object} Firestore Timestamp
   */
  _toFirestoreTimestamp(dateString) {
    return admin.firestore.Timestamp.fromDate(new Date(dateString));
  }

  /**
   * Get server timestamp for Firestore
   * @returns {Object} Firestore server timestamp
   */
  _getServerTimestamp() {
    return admin.firestore.FieldValue.serverTimestamp();
  }

  /**
   * Batch fetch documents by IDs (max 10 per batch due to Firestore 'in' limit)
   * @param {string} collectionName - Collection name
   * @param {Array<string>} ids - Document IDs
   * @returns {Object} Map of ID -> document data
   */
  async _batchFetchByIds(collectionName, ids) {
    if (ids.length === 0) return {};

    const resultMap = {};
    const batches = [];

    // Split into batches of 10 (Firestore 'in' query limit)
    for (let i = 0; i < ids.length; i += 10) {
      batches.push(ids.slice(i, i + 10));
    }

    await Promise.all(
      batches.map(async (batch) => {
        const snapshot = await this.db
          .collection(collectionName)
          .where(admin.firestore.FieldPath.documentId(), "in", batch)
          .get();

        snapshot.docs.forEach((doc) => {
          resultMap[doc.id] = this._docToObject(doc);
        });
      })
    );

    return resultMap;
  }

  /**
   * Get collection reference
   * @param {string} collectionName - Collection name
   * @returns {Object} Firestore collection reference
   */
  _getCollection(collectionName) {
    return this.db.collection(collectionName);
  }

  /**
   * Create a batch write operation
   * @returns {Object} Firestore batch
   */
  _createBatch() {
    return this.db.batch();
  }

  /**
   * Run a Firestore transaction
   * @param {Function} updateFunction - Transaction update function
   * @returns {Promise} Transaction result
   */
  async _runTransaction(updateFunction) {
    return this.db.runTransaction(updateFunction);
  }
}

module.exports = FirebaseBaseService;
