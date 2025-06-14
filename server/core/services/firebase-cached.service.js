// server/core/services/firebase-cached.service.js
const firebaseService = require("./firebase.service");
const cacheService = require("./cache.service");

/**
 * Simple cached wrapper for Firebase service
 * Focus: Reduce Firebase reads/writes with basic caching
 */
class CachedFirebaseService {
  constructor() {
    this.firebase = firebaseService;
    this.cache = cacheService;
  }

  // Pass-through helper
  _docToObject(doc) {
    return this.firebase._docToObject(doc);
  }

  // ============================================================================
  // USER OPERATIONS WITH CACHING
  // ============================================================================

  async createUser(userData) {
    const result = await this.firebase.createUser(userData);

    // Only clear the "all users" list since it's now outdated
    this.cache.del("users", "all");

    // Cache the new user in multiple ways to prevent future Firebase reads
    if (result?.id) {
      this.cache.set("users", result.id, result);

      // Also cache by Stripe ID if available to prevent duplicate Firebase reads
      if (result.stripeCustomerId) {
        this.cache.set("users", `stripe:${result.stripeCustomerId}`, result);
      }
    }

    return result;
  }

  async getUser(firebaseUid) {
    return await this.cache.getOrSet("users", firebaseUid, async () => {
      const result = await this.firebase.getUser(firebaseUid);

      // Cross-cache by Stripe ID to prevent future Firebase reads
      if (result?.stripeCustomerId) {
        this.cache.set("users", `stripe:${result.stripeCustomerId}`, result);
      }

      return result;
    });
  }

  async getUserByStripeId(stripeCustomerId) {
    const cacheKey = `stripe:${stripeCustomerId}`;
    return await this.cache.getOrSet("users", cacheKey, async () => {
      const result = await this.firebase.getUserByStripeId(stripeCustomerId);

      // Cross-cache by Firebase UID to prevent future Firebase reads
      if (result?.id) {
        this.cache.set("users", result.id, result);
      }

      return result;
    });
  }

  async updateUserAdmin(firebaseUid, isAdmin) {
    const result = await this.firebase.updateUserAdmin(firebaseUid, isAdmin);

    // Clear ALL possible cache entries for this user to prevent stale data
    this.cache.del("users", firebaseUid);
    this.cache.del("adminStatus", firebaseUid);
    this.cache.del("users", "all");

    // Also clear Stripe-based cache if we can find the user's Stripe ID
    const cachedUser = this.cache.get("users", firebaseUid);
    if (cachedUser?.stripeCustomerId) {
      this.cache.del("users", `stripe:${cachedUser.stripeCustomerId}`);
    }

    return result;
  }

  async getAllUsers() {
    return await this.cache.getOrSet("users", "all", async () => {
      const users = await this.firebase.getAllUsers();

      // Cross-cache all individual users to prevent future Firebase reads
      if (users && Array.isArray(users)) {
        users.forEach((user) => {
          if (user?.id) {
            this.cache.set("users", user.id, user);
            // Also cache by Stripe ID if available
            if (user.stripeCustomerId) {
              this.cache.set("users", `stripe:${user.stripeCustomerId}`, user);
            }
          }
        });
      }

      return users;
    });
  }

  async deleteUser(firebaseUid) {
    // Get user data before deletion to clear all cache entries
    const userToDelete = this.cache.get("users", firebaseUid);

    const result = await this.firebase.deleteUser(firebaseUid);

    // Clear ALL possible cache entries for this user
    this.cache.del("users", firebaseUid);
    this.cache.del("adminStatus", firebaseUid);
    this.cache.del("users", "all");

    // Also clear Stripe-based cache if available
    if (userToDelete?.stripeCustomerId) {
      this.cache.del("users", `stripe:${userToDelete.stripeCustomerId}`);
    }

    return result;
  }

  // ============================================================================
  // PRODUCT OPERATIONS WITH CACHING
  // ============================================================================

  async createProduct(productData) {
    const result = await this.firebase.createProduct(productData);

    // Only clear the "all products" list since it's now outdated
    this.cache.del("products", "all");

    return result;
  }

  async getProduct(productId) {
    return await this.cache.getOrSet("products", productId, async () => {
      return await this.firebase.getProduct(productId);
    });
  }

  async getAllProducts() {
    return await this.cache.getOrSet("products", "all", async () => {
      const products = await this.firebase.getAllProducts();

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
    const result = await this.firebase.deleteProduct(productId);

    // Clear specific product caches
    this.cache.del("products", productId);
    this.cache.del("products", "all"); // All products list is also outdated

    return result;
  }

  // ============================================================================
  // ORDER OPERATIONS WITH CACHING
  // ============================================================================

  async createOrder(orderData) {
    const result = await this.firebase.createOrder(orderData);

    // Only clear the specific user's orders cache
    if (orderData.userId) {
      this.cache.del("orders", `user:${orderData.userId}`);
    }
    // Skip clearing "all orders" - let admin fetch fresh each time

    return result;
  }

  async getUserOrders(userId) {
    const cacheKey = `user:${userId}`;
    return await this.cache.getOrSet("orders", cacheKey, async () => {
      return await this.firebase.getUserOrders(userId);
    });
  }

  async getAllOrdersWithItems() {
    // Don't cache "all orders" - always fetch fresh for admin
    // Orders change frequently and are rarely accessed
    return await this.firebase.getAllOrdersWithItems();
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
    const result = await this.firebase.createEvent(eventData);

    // Clear events cache since new event created
    this.cache.delByType("events");

    return result;
  }

  async getAllEvents() {
    return await this.cache.getOrSet("events", "all", async () => {
      return await this.firebase.getAllEvents();
    });
  }

  async getActiveEvents() {
    return await this.cache.getOrSet("events", "active", async () => {
      return await this.firebase.getActiveEvents();
    });
  }

  async getEvent(eventId) {
    return await this.cache.getOrSet("events", eventId, async () => {
      return await this.firebase.getEvent(eventId);
    });
  }

  async updateEvent(eventId, updateData) {
    const result = await this.firebase.updateEvent(eventId, updateData);

    // Clear all event caches since we updated an event
    this.cache.delByType("events");

    return result;
  }

  async deleteEvent(eventId) {
    const result = await this.firebase.deleteEvent(eventId);

    // Clear all event caches
    this.cache.delByType("events");

    return result;
  }

  async getProductsByEvent(eventId) {
    return await this.cache.getOrSet(
      "products",
      `event:${eventId}`,
      async () => {
        return await this.firebase.getProductsByEvent(eventId);
      }
    );
  }

  async getEventShiftAvailability(eventId) {
    // Don't cache availability as it changes frequently
    return await this.firebase.getEventShiftAvailability(eventId);
  }

  clearCache() {
    this.cache.flush();
  }

  clearCacheType(type) {
    return this.cache.delByType(type);
  }
}

module.exports = new CachedFirebaseService();
