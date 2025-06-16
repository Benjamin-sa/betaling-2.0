// server/core/services/firebase/firebase-email-log.service.js
const FirebaseBaseService = require("./firebase-base.service");
const {
  EmailLogFields,
  createEmailLogData,
} = require("../../../models/webstore.model");

/**
 * Firebase Email Log Service
 * Handles all email log related database operations
 */
class FirebaseEmailLogService extends FirebaseBaseService {
  constructor() {
    super();
    this.collection = this._getCollection("emailLogs");
  }

  /**
   * Create a new email log entry
   * @param {Object} logData - Email log data
   * @returns {Promise<Object>} Created email log data with ID
   */
  async createEmailLog(logData) {
    const emailLogData = createEmailLogData(logData);
    const docRef = await this.collection.add(emailLogData);
    return { id: docRef.id, ...emailLogData };
  }

  /**
   * Get recent email logs with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Email logs with pagination info
   */
  async getEmailLogs(options = {}) {
    const {
      limit = 100,
      page = 1,
      status = null, // Filter by status (sent, failed, skipped)
      orderBy = EmailLogFields.SENT_AT,
      orderDirection = "desc",
    } = options;

    let query = this.collection;

    // Apply status filter if provided
    if (status) {
      query = query.where(EmailLogFields.STATUS, "==", status);
    }

    // Apply ordering
    query = query.orderBy(orderBy, orderDirection);

    // Get total count for pagination
    const totalSnapshot = await query.get();
    const totalCount = totalSnapshot.size;

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      query = query.offset(offset);
    }
    query = query.limit(limit);

    const snapshot = await query.get();
    const emailLogs = snapshot.docs.map((doc) => this._docToObject(doc));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
      emailLogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext,
        hasPrev,
      },
    };
  }

  /**
   * Get email logs by order ID
   * @param {string} orderId - Order ID
   * @returns {Promise<Array>} Array of email logs for the order
   */
  async getEmailLogsByOrderId(orderId) {
    const snapshot = await this.collection
      .where(EmailLogFields.ORDER_ID, "==", orderId)
      .orderBy(EmailLogFields.SENT_AT, "desc")
      .get();

    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Get email delivery statistics
   * @returns {Promise<Object>} Email delivery statistics
   */
  async getEmailStatistics() {
    const snapshot = await this.collection.get();
    const logs = snapshot.docs.map((doc) => this._docToObject(doc));

    const stats = {
      total: logs.length,
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    logs.forEach((log) => {
      switch (log[EmailLogFields.STATUS]) {
        case "sent":
          stats.sent++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "skipped":
          stats.skipped++;
          break;
      }
    });

    // Calculate success rate
    stats.successRate =
      stats.total > 0 ? Math.round((stats.sent / stats.total) * 100) : 0;

    return stats;
  }
}

module.exports = new FirebaseEmailLogService();
