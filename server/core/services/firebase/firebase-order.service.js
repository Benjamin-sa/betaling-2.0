// server/core/services/firebase/firebase-order.service.js
const FirebaseBaseService = require("./firebase-base.service");
const {
  OrderFields,
  OrderItemFields,
  createOrderData,
  createOrderItemData,
} = require("../../../models/webstore.model");

/**
 * Firebase Order Service
 * Handles all order-related database operations
 */
class FirebaseOrderService extends FirebaseBaseService {
  constructor() {
    super();
    this.collection = this._getCollection("orders");
  }

  /**
   * Create a new order with items
   * @param {Object} orderData - Order creation data
   * @param {string} orderData.orderId - Order ID
   * @param {string} orderData.userId - User ID
   * @param {Array} orderData.items - Array of order items
   * @param {number} orderData.amountTotal - Total amount
   * @param {string} [orderData.currency="EUR"] - Currency
   * @param {string} [orderData.paymentMethod="stripe"] - Payment method
   * @param {string} [orderData.eventId=""] - Event ID
   * @returns {Promise<Object>} Created order data with ID
   */
  async createOrder({
    orderId,
    userId,
    items,
    amountTotal,
    currency = "EUR",
    paymentMethod = "stripe",
    eventId = "",
  }) {
    const batch = this._createBatch();

    // Create order document using factory function
    const orderRef = this.collection.doc(orderId);
    const orderData = createOrderData({
      [OrderFields.USER_ID]: userId,
      [OrderFields.AMOUNT_TOTAL]: amountTotal,
      [OrderFields.CURRENCY]: currency,
      [OrderFields.PAYMENT_METHOD]: paymentMethod,
      [OrderFields.EVENT_ID]: eventId,
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

  /**
   * Get orders for a specific user
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Array of orders with items
   */
  async getUserOrders(userId) {
    const snapshot = await this.collection
      .where(OrderFields.USER_ID, "==", userId)
      .orderBy(OrderFields.CREATED_AT, "desc")
      .get();

    return await this._enrichOrdersWithItems(snapshot.docs);
  }

  /**
   * Get all orders with items
   * @returns {Promise<Array>} Array of all orders with items
   */
  async getAllOrdersWithItems() {
    const snapshot = await this.collection
      .orderBy(OrderFields.CREATED_AT, "desc")
      .get();

    return await this._enrichOrdersWithItems(snapshot.docs);
  }

  /**
   * Get orders by event ID
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of orders for the event
   */
  async getOrdersByEvent(eventId) {
    const snapshot = await this.collection
      .where(OrderFields.EVENT_ID, "==", eventId)
      .get();

    return snapshot.docs.map((doc) => this._docToObject(doc));
  }

  /**
   * Check if a shift has existing orders
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @returns {Promise<boolean>} True if shift has orders
   */
  async checkShiftHasOrders(eventId, shiftId) {
    const ordersSnapshot = await this.collection
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

  /**
   * Get filtered orders with pagination, sorting, and search (OPTIMIZED)
   * @param {Object} filters - Filter criteria
   * @param {Object} options - Pagination and sorting options
   * @returns {Promise<Object>} Filtered orders with pagination info
   */
  async getFilteredOrders(filters = {}, options = {}) {
    const {
      sortBy = OrderFields.CREATED_AT,
      sortOrder = "desc",
      page = 1,
      limit = 50,
    } = options;

    // Get total count for pagination
    const totalCount = await this._getFilteredOrderCount(filters);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    // Build and execute query for current page
    let query = this._buildOrderQuery(filters);
    query = query.orderBy(sortBy, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    if (offset > 0) {
      const skipQuery = this._buildOrderQuery(filters)
        .orderBy(sortBy, sortOrder)
        .limit(offset);
      const skipSnapshot = await skipQuery.get();

      if (skipSnapshot.docs.length > 0) {
        const lastDoc = skipSnapshot.docs[skipSnapshot.docs.length - 1];
        query = query.startAfter(lastDoc);
      }
    }

    query = query.limit(limit);
    const ordersSnapshot = await query.get();

    // Enrich orders with items and user data
    const orders = ordersSnapshot.docs.map((doc) => this._docToObject(doc));
    const enrichedOrders = await this._enrichOrdersEfficiently(
      orders,
      filters.search,
      filters
    );

    return {
      orders: enrichedOrders,
      totalCount,
      totalPages,
      hasNext,
      hasPrev,
    };
  }

  /**
   * Get order statistics for analytics
   * @param {Object} filters - Filter criteria
   * @returns {Promise<Object>} Order statistics
   */
  async getOrderStatistics(filters = {}) {
    let query = this.collection;

    // Apply same filters as getFilteredOrders
    if (filters.eventId) {
      query = query.where(OrderFields.EVENT_ID, "==", filters.eventId);
    }
    if (filters.dateFrom) {
      const fromDate = this._toFirestoreTimestamp(filters.dateFrom);
      query = query.where(OrderFields.CREATED_AT, ">=", fromDate);
    }
    if (filters.dateTo) {
      const toDate = this._toFirestoreTimestamp(filters.dateTo);
      query = query.where(OrderFields.CREATED_AT, "<=", toDate);
    }

    const snapshot = await query.get();
    const orders = snapshot.docs.map((doc) => this._docToObject(doc));

    return this._calculateOrderStatistics(orders);
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  /**
   * Build Firestore query with smart index strategy
   * @private
   */
  _buildOrderQuery(filters) {
    let query = this.collection;

    // Use only ONE primary filter + date range to minimize indexes needed
    if (filters.eventId) {
      query = query.where(OrderFields.EVENT_ID, "==", filters.eventId);
      query = this._addDateFilters(query, filters);
    } else if (filters.userId) {
      query = query.where(OrderFields.USER_ID, "==", filters.userId);
      query = this._addDateFilters(query, filters);
    } else if (filters.paymentMethod) {
      query = query.where(
        OrderFields.PAYMENT_METHOD,
        "==",
        filters.paymentMethod
      );
      query = this._addDateFilters(query, filters);
    } else {
      query = this._addDateFilters(query, filters);
    }

    return query;
  }

  /**
   * Add date filters to query
   * @private
   */
  _addDateFilters(query, filters) {
    if (filters.dateFrom) {
      const fromDate = this._toFirestoreTimestamp(filters.dateFrom);
      query = query.where(OrderFields.CREATED_AT, ">=", fromDate);
    }
    if (filters.dateTo) {
      const toDate = this._toFirestoreTimestamp(filters.dateTo);
      query = query.where(OrderFields.CREATED_AT, "<=", toDate);
    }
    return query;
  }

  /**
   * Get count of filtered orders
   * @private
   */
  async _getFilteredOrderCount(filters) {
    const query = this._buildOrderQuery(filters);
    const snapshot = await query.get();
    return snapshot.size;
  }

  /**
   * Enrich orders with items subcollection
   * @private
   */
  async _enrichOrdersWithItems(orderDocs) {
    return await Promise.all(
      orderDocs.map(async (doc) => {
        const orderData = this._docToObject(doc);
        const itemsSnapshot = await doc.ref.collection("items").get();
        const items = itemsSnapshot.docs.map((itemDoc) =>
          this._docToObject(itemDoc)
        );

        return { ...orderData, items };
      })
    );
  }

  /**
   * Efficiently enrich orders with related data
   * @private
   */
  async _enrichOrdersEfficiently(
    orders,
    searchTerm = null,
    clientFilters = {}
  ) {
    if (orders.length === 0) return [];

    // Batch fetch user data
    const uniqueUserIds = [...new Set(orders.map((order) => order.userId))];
    const userDataMap = await this._batchFetchByIds("users", uniqueUserIds);

    // Batch fetch order items
    const orderIds = orders.map((order) => order.id);
    const itemsMap = await this._batchFetchOrderItems(orderIds);

    // Combine all data
    let enrichedOrders = orders.map((order) => {
      const user = userDataMap[order.userId];
      const items = itemsMap[order.id] || [];

      return {
        ...order,
        items,
        userEmail: user ? user.email : "Unknown",
        userName: user ? user.email.split("@")[0] : "Unknown",
      };
    });

    // Apply client-side filters for complex combinations
    enrichedOrders = this._applyClientSideFilters(
      enrichedOrders,
      clientFilters
    );

    // Apply search filter
    if (searchTerm) {
      enrichedOrders = this._applySearchFilter(enrichedOrders, searchTerm);
    }

    return enrichedOrders;
  }

  /**
   * Batch fetch all order items efficiently
   * @private
   */
  async _batchFetchOrderItems(orderIds) {
    if (orderIds.length === 0) return {};

    const itemsMap = {};
    const itemsPromises = orderIds.map(async (orderId) => {
      const itemsSnapshot = await this.collection
        .doc(orderId)
        .collection("items")
        .get();

      itemsMap[orderId] = itemsSnapshot.docs.map((doc) =>
        this._docToObject(doc)
      );
    });

    await Promise.all(itemsPromises);
    return itemsMap;
  }

  /**
   * Apply client-side filters for complex combinations
   * @private
   */
  _applyClientSideFilters(orders, clientFilters) {
    let filtered = orders;

    if (clientFilters.paymentMethod && clientFilters.eventId) {
      filtered = filtered.filter(
        (order) => order.paymentMethod === clientFilters.paymentMethod
      );
    }

    if (
      clientFilters.userId &&
      (clientFilters.eventId || clientFilters.paymentMethod)
    ) {
      filtered = filtered.filter(
        (order) => order.userId === clientFilters.userId
      );
    }

    return filtered;
  }

  /**
   * Apply search filter to orders
   * @private
   */
  _applySearchFilter(orders, searchTerm) {
    const searchLower = searchTerm.toLowerCase();
    return orders.filter((order) => {
      const searchableText = [
        order.id,
        order.userEmail,
        order.userName,
        ...order.items.map((item) => item.productName),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(searchLower);
    });
  }

  /**
   * Calculate order statistics
   * @private
   */
  _calculateOrderStatistics(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce(
      (sum, order) => sum + (order.amountTotal || 0),
      0
    );
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by payment method
    const paymentMethods = orders.reduce((acc, order) => {
      const method = order.paymentMethod || "unknown";
      if (!acc[method]) acc[method] = { count: 0, revenue: 0 };
      acc[method].count++;
      acc[method].revenue += order.amountTotal || 0;
      return acc;
    }, {});

    // Group by event
    const eventStats = orders.reduce((acc, order) => {
      const eventId = order.eventId || "no-event";
      if (!acc[eventId]) acc[eventId] = { count: 0, revenue: 0 };
      acc[eventId].count++;
      acc[eventId].revenue += order.amountTotal || 0;
      return acc;
    }, {});

    return {
      summary: {
        totalOrders,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      },
      paymentMethods,
      eventStats,
    };
  }
}

module.exports = new FirebaseOrderService();
