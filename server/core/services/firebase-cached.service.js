// server/core/services/firebase-cached.service.js
const firebaseUserService = require("./firebase/firebase-user.service");
const firebaseProductService = require("./firebase/firebase-product.service");
const firebaseOrderService = require("./firebase/firebase-order.service");
const firebaseEventService = require("./firebase/firebase-event.service");
const firebaseShiftCounterService = require("./firebase/firebase-shift-counter.service");
const firebaseEmailLogService = require("./firebase/firebase-email-log.service");
const firebaseSettingsService = require("./firebase/firebase-settings.service");
const cacheService = require("./cache.service");

/**
 * Cached wrapper for Firebase domain services
 * Focus: Reduce Firebase reads/writes with basic caching
 */
class CachedFirebaseService {
  constructor() {
    // Assign domain services
    this.users = firebaseUserService;
    this.products = firebaseProductService;
    this.orders = firebaseOrderService;
    this.events = firebaseEventService;
    this.shiftCounters = firebaseShiftCounterService;
    this.emailLogs = firebaseEmailLogService;
    this.settings = firebaseSettingsService;
    this.cache = cacheService;
    this.emailLogs = firebaseEmailLogService;
  }

  // Pass-through helper
  _docToObject(doc) {
    return this.users._docToObject(doc);
  }

  // ============================================================================
  // USER OPERATIONS WITH CACHING
  // ============================================================================

  async createUser(userData) {
    const result = await this.users.createUser(userData);

    // Only clear the "all users" list since it's now outdated
    this.cache.del("users", "all");

    // Cache the new user by Firebase UID only
    if (result?.id) {
      this.cache.set("users", result.id, result);
    }

    return result;
  }

  async getUser(firebaseUid) {
    return await this.cache.getOrSet("users", firebaseUid, async () => {
      return await this.users.getUser(firebaseUid);
    });
  }

  async getUserByStripeId(stripeCustomerId) {
    const cacheKey = `stripe:${stripeCustomerId}`;
    return await this.cache.getOrSet("users", cacheKey, async () => {
      return await this.users.getUserByStripeId(stripeCustomerId);
    });
  }

  async updateUserAdmin(firebaseUid, isAdmin) {
    const result = await this.users.updateUserAdmin(firebaseUid, isAdmin);

    // Clear only essential cache entries
    this.cache.del("users", firebaseUid);
    this.cache.del("adminStatus", firebaseUid);
    this.cache.del("users", "all");

    return result;
  }

  async getAllUsers() {
    return await this.cache.getOrSet("users", "all", async () => {
      return await this.users.getAllUsers();
    });
  }

  async deleteUser(firebaseUid) {
    const result = await this.users.deleteUser(firebaseUid);

    // Clear essential cache entries
    this.cache.del("users", firebaseUid);
    this.cache.del("adminStatus", firebaseUid);
    this.cache.del("users", "all");

    return result;
  }

  // ============================================================================
  // PRODUCT OPERATIONS WITH CACHING
  // ============================================================================

  async createProduct(productData) {
    const result = await this.products.createProduct(productData);

    // Clear the "all products" list since it's now outdated
    this.cache.del("products", "all");

    // Also clear the event-specific cache if the product has an eventId
    if (productData && productData.eventId) {
      this.cache.del("products", `event:${productData.eventId}`);
    }

    return result;
  }

  async getProduct(productId) {
    return await this.cache.getOrSet("products", productId, async () => {
      return await this.products.getProduct(productId);
    });
  }

  async getAllProducts() {
    return await this.cache.getOrSet("products", "all", async () => {
      const products = await this.products.getAllProducts();

      // Cross-cache all individual products to prevent future Firebase reads
      if (products && Array.isArray(products)) {
        products.forEach((product) => {
          if (product?.id) {
            this.cache.set("products", product.id, product);
          }
        });
      }

      return products;
    });
  }

  async deleteProduct(productId) {
    // Get product data before deletion to clear event-specific cache
    const productToDelete = await this.getProduct(productId);

    const result = await this.products.deleteProduct(productId);

    // Clear specific product caches
    this.cache.del("products", productId);
    this.cache.del("products", "all"); // All products list is also outdated

    // Also clear the event-specific cache if the product had an eventId
    if (productToDelete && productToDelete.eventId) {
      this.cache.del("products", `event:${productToDelete.eventId}`);
    }

    return result;
  }

  // ============================================================================
  // ORDER OPERATIONS WITH CACHING
  // ============================================================================

  async createOrder(orderData) {
    console.log("[DEBUG] Creating order with data:", {
      eventId: orderData.eventId,
      itemsCount: orderData.items?.length,
      items: orderData.items?.map((item) => ({
        productName: item.productName,
        shiftId: item.shiftId,
        quantity: item.quantity,
      })),
    });

    const result = await this.orders.createOrder(orderData);

    // Update shift counters for capacity tracking (optimized)
    if (orderData.items) {
      const shiftUpdates = new Map();

      // Group items by shift to batch counter updates
      orderData.items.forEach((item) => {
        if (item.shiftId) {
          console.log("[DEBUG] Found item with shiftId:", {
            productName: item.productName,
            shiftId: item.shiftId,
            quantity: item.quantity,
          });
          const current = shiftUpdates.get(item.shiftId) || 0;
          shiftUpdates.set(item.shiftId, current + (item.quantity || 1));
        } else {
          console.log("[DEBUG] Item without shiftId:", {
            productName: item.productName,
            hasShiftId: !!item.shiftId,
          });
        }
      });

      console.log(
        "[DEBUG] Shift updates to process:",
        Array.from(shiftUpdates.entries())
      );

      // Update shift counters in parallel (non-blocking for order creation)
      if (shiftUpdates.size > 0) {
        console.log(
          "[DEBUG] Processing shift counter updates for event:",
          orderData.eventId
        );

        const counterPromises = Array.from(shiftUpdates.entries()).map(
          ([shiftId, quantity]) => {
            console.log("[DEBUG] Updating counter for shift:", {
              shiftId,
              quantity,
            });
            return this.shiftCounters
              .incrementShiftCounter(orderData.eventId, shiftId, quantity)
              .then((newCount) => {
                console.log("[DEBUG] Counter updated successfully:", {
                  shiftId,
                  newCount,
                });
                return newCount;
              })
              .catch((error) => {
                console.error(
                  `[ERROR] Failed to update shift counter for ${shiftId}:`,
                  error
                );
                // Don't throw - order is already created, counter update is optimization
              });
          }
        );

        // Execute in background - don't block order creation
        Promise.all(counterPromises).then(() => {
          console.log("[DEBUG] All counter updates completed, clearing caches");
          // Clear related caches after successful counter updates
          this.cache.del("shiftAttendance", `overview:${orderData.eventId}`);

          shiftUpdates.forEach((_, shiftId) => {
            this.cache.del("shiftCapacity", `${orderData.eventId}:${shiftId}`);
          });
        });
      } else {
        console.log(
          "[DEBUG] No shift updates needed - no items with shiftId found"
        );
      }
    }

    // Only clear the specific user's orders cache
    if (orderData.userId) {
      this.cache.del("orders", `user:${orderData.userId}`);
    }
    // Skip clearing "all orders" - let admin fetch fresh each time

    return result;
  }

  async getUserOrders(userId) {
    // Don't cache user orders as they need real-time event/shift enrichment
    // and order status might change frequently
    return await this.orders.getUserOrders(userId);
  }

  async getAllOrdersWithItems() {
    // Don't cache "all orders" - always fetch fresh for admin
    // Orders change frequently and are rarely accessed
    return await this.orders.getAllOrdersWithItems();
  }

  async getFilteredOrders(filters, options) {
    // Don't cache filtered orders as they are highly dynamic
    // and filters can be very specific
    return await this.orders.getFilteredOrders(filters, options);
  }

  async getOrderStatistics(filters) {
    // Cache statistics for a short time (5 minutes) as they're expensive to calculate
    const cacheKey = `stats:${JSON.stringify(filters)}`;
    const cached = this.cache.get("orderStats", cacheKey);
    if (cached) return cached;

    const stats = await this.orders.getOrderStatistics(filters);
    this.cache.set("orderStats", cacheKey, stats, 5 * 60); // 5 minute cache
    return stats;
  }

  // ============================================================================
  // ADMIN STATUS WITH CACHING (most important for reducing reads)
  // ============================================================================

  async isUserAdmin(firebaseUid) {
    return await this.cache.getOrSet("adminStatus", firebaseUid, async () => {
      const user = await this.getUser(firebaseUid);
      return user ? user.isAdmin || false : false;
    });
  }

  // ============================================================================
  // SIMPLE CACHE MANAGEMENT
  // ============================================================================

  getCacheStats() {
    return this.cache.getStats();
  }

  // ============================================================================
  // EVENT OPERATIONS WITH CACHING
  // ============================================================================

  async createEvent(eventData) {
    const result = await this.events.createEvent(eventData);

    // Clear events cache since new event created
    this.cache.delByType("events");

    return result;
  }

  async getAllEvents() {
    return await this.cache.getOrSet("events", "all", async () => {
      return await this.events.getAllEvents();
    });
  }

  async getActiveEvents() {
    return await this.cache.getOrSet("events", "active", async () => {
      return await this.events.getActiveEvents();
    });
  }

  async getEvent(eventId) {
    return await this.cache.getOrSet("events", eventId, async () => {
      return await this.events.getEvent(eventId);
    });
  }

  async updateEvent(eventId, updateData) {
    const result = await this.events.updateEvent(eventId, updateData);

    // Clear all event caches since we updated an event
    this.cache.delByType("events");

    return result;
  }

  async deleteEvent(eventId) {
    const result = await this.events.deleteEvent(eventId);

    // Clear all event caches
    this.cache.delByType("events");

    return result;
  }

  async getProductsByEvent(eventId) {
    return await this.cache.getOrSet(
      "products",
      `event:${eventId}`,
      async () => {
        return await this.products.getProductsByEvent(eventId);
      }
    );
  }

  async getEventShiftAvailability(eventId) {
    // Use optimized counter-based approach for better performance
    try {
      const attendanceOverview = await this.getEventShiftAttendanceOverview(
        eventId
      );

      // Transform to match existing API format
      const availability = attendanceOverview.map((shift) => ({
        shiftId: shift.shiftId,
        shiftName: shift.shiftName,
        timeSlot: `${shift.startTime}-${shift.endTime}`,
        maxCapacity: shift.maxCapacity,
        occupied: shift.currentAttendees,
        available: shift.available,
        isFull: shift.isFull,
      }));

      return availability;
    } catch (error) {
      console.warn(
        "Counter-based availability failed, falling back to order-based calculation:",
        error
      );

      // Fallback to original method if counter service fails
      const orders = await this.orders.getOrdersByEvent(eventId);
      return await this.events.getEventShiftAvailability(eventId, orders);
    }
  }

  async getShiftById(eventId, shiftId) {
    const cacheKey = `${eventId}:${shiftId}`;
    return await this.cache.getOrSet("shifts", cacheKey, async () => {
      return await this.events.getShiftById(eventId, shiftId);
    });
  }

  async checkShiftHasOrders(eventId, shiftId) {
    // Don't cache this as it's used for safety checks and needs to be accurate
    return await this.orders.checkShiftHasOrders(eventId, shiftId);
  }

  // ============================================================================
  // ADMIN STATUS WITH CACHING (most important for reducing reads)
  // ============================================================================

  async isUserAdmin(firebaseUid) {
    return await this.cache.getOrSet("adminStatus", firebaseUid, async () => {
      const user = await this.getUser(firebaseUid);
      return user ? user.isAdmin || false : false;
    });
  }

  // ============================================================================
  // SHIFT CAPACITY OPERATIONS (OPTIMIZED FOR MINIMAL FIREBASE READS)
  // ============================================================================

  /**
   * Efficiently check shift capacity with minimal Firebase reads (1-2 reads max)
   * @param {string} eventId - Event ID
   * @param {string} shiftId - Shift ID
   * @param {number} requestedQuantity - Number of attendees to check for
   * @returns {Promise<Object>} Capacity check result
   */
  async checkShiftCapacity(eventId, shiftId, requestedQuantity = 1) {
    return await this.shiftCounters.checkShiftCapacity(
      eventId,
      shiftId,
      requestedQuantity
    );
  }

  /**
   * Batch check capacity for multiple shifts (checkout optimization)
   * @param {Array} shiftRequests - Array of {eventId, shiftId, quantity} objects
   * @returns {Promise<Object>} Batch capacity check results
   */
  async batchCheckShiftCapacity(shiftRequests) {
    return await this.shiftCounters.batchCheckShiftCapacity(shiftRequests);
  }

  /**
   * Get shift attendance overview for admin (cached)
   * @param {string} eventId - Event ID
   * @returns {Promise<Array>} Array of shift attendance data
   */
  async getEventShiftAttendanceOverview(eventId) {
    return await this.cache.getOrSet(
      "shiftAttendance",
      `overview:${eventId}`,
      async () => {
        return await this.shiftCounters.getEventShiftAttendanceOverview(
          eventId
        );
      },
      300 // Cache for 5 minutes - balance between performance and accuracy
    );
  }

  /**
   * Validate shift capacity before checkout (prevents overbooking)
   * @param {string} eventId - Event ID
   * @param {Array} items - Array of cart items with shiftId
   * @returns {Promise<Object>} Validation result
   */
  async validateShiftCapacityForCheckout(eventId, items) {
    // Group items by shift and sum quantities
    const shiftRequests = new Map();

    items.forEach((item) => {
      if (item.shiftId) {
        const current = shiftRequests.get(item.shiftId) || {
          eventId,
          shiftId: item.shiftId,
          quantity: 0,
        };
        current.quantity += item.quantity || 1;
        shiftRequests.set(item.shiftId, current);
      }
    });

    if (shiftRequests.size === 0) {
      return { success: true, message: "No shift validation required" };
    }

    const capacityResult = await this.batchCheckShiftCapacity(
      Array.from(shiftRequests.values())
    );

    if (!capacityResult.allCanBook) {
      const failedShifts = capacityResult.failedChecks.map((check) => ({
        shiftId: check.shiftId,
        requested: check.requestedQuantity,
        available: check.available || 0,
        reason: check.error || "Insufficient capacity",
      }));

      return {
        success: false,
        message: "One or more shifts are at capacity",
        failedShifts,
        details: capacityResult,
      };
    }

    return {
      success: true,
      message: "All shifts have sufficient capacity",
      details: capacityResult,
    };
  }

  // ============================================================================
  // HELPER METHODS (backward compatibility)
  // ============================================================================

  /**
   * Helper method to convert document to object with ID
   * @param {Object} doc - Firestore document
   * @returns {Object|null} Document data with ID or null
   */
  _docToObject(doc) {
    return this.users._docToObject(doc);
  }

  // ============================================================================
  // DIRECT ACCESS TO DOMAIN SERVICES
  // ============================================================================

  /**
   * Get direct access to domain-specific services for advanced usage
   * @returns {Object} Object containing all domain services
   */
  getDomainServices() {
    return {
      users: this.users,
      products: this.products,
      orders: this.orders,
      events: this.events,
    };
  }

  // ============================================================================
  // SIMPLE CACHE MANAGEMENT
  // ============================================================================

  getCacheStats() {
    return this.cache.getStats();
  }

  clearCache() {
    this.cache.flush();
  }

  clearCacheType(type) {
    return this.cache.delByType(type);
  }

  // ============================================================================
  // EMAIL LOG OPERATIONS
  // ============================================================================

  async createEmailLog(logData) {
    return await this.emailLogs.createEmailLog(logData);
  }

  async getEmailLogs(filters = {}, options = {}) {
    return await this.emailLogs.getEmailLogs(filters, options);
  }

  async getEmailLogsByOrderId(orderId) {
    return await this.emailLogs.getEmailLogsByOrderId(orderId);
  }

  async getEmailStatistics(filters = {}) {
    return await this.emailLogs.getEmailStatistics(filters);
  }

  // Settings Service Methods
  /**
   * Get current Stripe mode (test/live)
   * @returns {Promise<string>} Current Stripe mode
   */
  async getStripeMode() {
    return await this.settings.getStripeMode();
  }

  /**
   * Set Stripe mode (test/live)
   * @param {string} mode - 'test' or 'live'
   * @param {string} userId - User who made the change
   * @returns {Promise<void>}
   */
  async setStripeMode(mode, userId) {
    return await this.settings.setStripeMode(mode, userId);
  }
}

module.exports = new CachedFirebaseService();
