// server/features/admin/cache.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");

class CacheController extends BaseController {
  /**
   * Get cache statistics
   */
  async getCacheStats(req, res) {
    await this._handleAsync(this._getCacheStatsHandler, req, res);
  }

  async _getCacheStatsHandler(req, res) {
    this._logAction("Fetching cache statistics");
    const stats = firebaseService.getCacheStats();
    this._sendSuccessResponse(res, { stats });
  }

  /**
   * Clear all caches
   */
  async clearAllCache(req, res) {
    await this._handleAsync(this._clearAllCacheHandler, req, res);
  }

  async _clearAllCacheHandler(req, res) {
    this._logAction("Clearing all caches");
    firebaseService.clearCache();
    this._sendSuccessResponse(res, {}, "All caches cleared successfully");
  }

  /**
   * Clear specific cache type
   */
  async clearCacheType(req, res) {
    await this._handleAsync(this._clearCacheTypeHandler, req, res);
  }

  async _clearCacheTypeHandler(req, res) {
    const { type } = req.params;

    const validTypes = ["products", "users", "orders", "adminStatus"];
    if (!validTypes.includes(type)) {
      return this._sendErrorResponse(
        res,
        `Invalid cache type. Valid types: ${validTypes.join(", ")}`,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Clearing cache type", { type });
    const count = firebaseService.clearCacheType(type);
    this._sendSuccessResponse(
      res,
      { cleared: count },
      `Cleared ${count} cache entries of type: ${type}`
    );
  }
}

module.exports = new CacheController();
