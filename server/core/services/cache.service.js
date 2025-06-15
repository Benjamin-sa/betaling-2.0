// server/core/services/cache.service.js
const NodeCache = require("node-cache");

/**
 * Simple cache service for reducing Firebase reads/writes
 * No TTL - cache never expires, only cleared manually on updates
 * Perfect for low traffic websites
 */
class CacheService {
  constructor() {
    // Simple cache with no TTL
    this.cache = new NodeCache({
      stdTTL: 0, // No expiration
      useClones: false,
    });

    // Simple cache configuration - only prefixes now
    this.cacheConfig = {
      products: { prefix: "products:" },
      users: { prefix: "users:" },
      orders: { prefix: "orders:" },
      adminStatus: { prefix: "admin:" },
      events: { prefix: "events:" },
      shifts: { prefix: "shifts:" },
      orderStats: { prefix: "orderStats:" },
      shiftAttendance: { prefix: "shiftAttendance:" },
      shiftCapacity: { prefix: "shiftCapacity:" },
    };

    // Basic stats
    this.stats = { hits: 0, misses: 0 };
  }

  /**
   * Generate cache key with prefix
   */
  _generateKey(type, identifier) {
    const config = this.cacheConfig[type];
    if (!config) throw new Error(`Unknown cache type: ${type}`);
    return `${config.prefix}${identifier}`;
  }

  /**
   * Get value from cache
   */
  get(type, identifier) {
    const key = this._generateKey(type, identifier);
    const value = this.cache.get(key);

    if (value !== undefined) {
      this.stats.hits++;
      return value;
    }

    this.stats.misses++;
    return null;
  }

  /**
   * Set value in cache (no TTL)
   */
  set(type, identifier, value) {
    const key = this._generateKey(type, identifier);
    return this.cache.set(key, value);
  }

  /**
   * Delete specific cache entry
   */
  del(type, identifier) {
    const key = this._generateKey(type, identifier);
    return this.cache.del(key);
  }

  /**
   * Delete all cache entries of a specific type
   */
  delByType(type) {
    const config = this.cacheConfig[type];
    if (!config) throw new Error(`Unknown cache type: ${type}`);

    const keys = this.cache.keys();
    const keysToDelete = keys.filter((key) => key.startsWith(config.prefix));

    if (keysToDelete.length > 0) {
      this.cache.del(keysToDelete);
    }

    return keysToDelete.length;
  }

  /**
   * Cache-aside pattern: get from cache or execute function and cache result
   */
  async getOrSet(type, identifier, fetchFunction) {
    const cached = this.get(type, identifier);
    if (cached !== null) return cached;

    try {
      const result = await fetchFunction();
      if (result !== null && result !== undefined) {
        this.set(type, identifier, result);
      }
      return result;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get basic cache statistics
   */
  getStats() {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      hit_ratio: total > 0 ? this.stats.hits / total : 0,
      cache_size: this.cache.keys().length,
    };
  }

  /**
   * Clear all cache
   */
  flush() {
    this.cache.flushAll();
  }
}

module.exports = new CacheService();
