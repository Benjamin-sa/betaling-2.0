const { firestore } = require("../../../config/firebaseAdmin");

/**
 * Firebase Settings Service
 * Handles application settings with fallback to safe defaults
 */
class FirebaseSettingsService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  /**
   * Get Firestore collection with lazy initialization
   * @private
   */
  getCollection() {
    if (!firestore) {
      throw new Error("Firestore is not initialized");
    }
    return firestore.collection("settings");
  }

  /**
   * Get Stripe mode setting with safe fallback
   * @returns {Promise<string>} 'test' or 'live', defaults to 'test'
   */
  async getStripeMode() {
    try {
      const cached = this.getCachedSetting("stripe_mode");
      if (cached !== null) {
        return cached;
      }

      const collection = this.getCollection();
      const doc = await collection.doc("stripe_config").get();

      if (!doc.exists) {
        // Safe fallback: default to test mode
        const defaultMode = "test";
        this.setCachedSetting("stripe_mode", defaultMode);
        return defaultMode;
      }

      const mode = doc.data().mode || "test"; // Safe fallback
      this.setCachedSetting("stripe_mode", mode);
      return mode;
    } catch (error) {
      console.error("Error getting Stripe mode, using safe fallback:", error);
      return "test"; // Safe fallback on any error
    }
  }

  /**
   * Set Stripe mode (test/live)
   * @param {string} mode - 'test' or 'live'
   * @param {string} userId - User who made the change
   * @returns {Promise<void>}
   */
  async setStripeMode(mode, userId) {
    try {
      if (mode !== "test" && mode !== "live") {
        throw new Error('Invalid mode. Must be "test" or "live"');
      }

      const now = new Date();
      const collection = this.getCollection();

      await collection.doc("stripe_config").set(
        {
          mode,
          lastSwitchedAt: now,
          lastSwitchedBy: userId,
          updatedAt: now,
        },
        { merge: true }
      );

      // Clear cache
      this.cache.delete("stripe_mode");

      console.log(`Stripe mode switched to ${mode} by ${userId}`);
    } catch (error) {
      console.error("Error setting Stripe mode:", error);
      throw error;
    }
  }

  /**
   * Get cached setting
   * @private
   */
  getCachedSetting(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.value;
    }
    return null;
  }

  /**
   * Set cached setting
   * @private
   */
  setCachedSetting(key, value) {
    this.cache.set(key, {
      value,
      timestamp: Date.now(),
    });
  }

  /**
   * Clear all cached settings
   */
  clearCache() {
    this.cache.clear();
  }
}

module.exports = new FirebaseSettingsService();
