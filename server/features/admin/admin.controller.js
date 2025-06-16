// server/controllers/admin.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");
const gmailService = require("../../core/services/google-apis/gmail.service");
const googleOAuth2Service = require("../../core/services/google-apis/google-oauth.service");
const driveImageManager = require("../../core/services/google-apis/driveImageManager.service");
const { admin } = require("../../config/firebaseAdmin");

class AdminController extends BaseController {
  /**
   * Get all orders with items
   */
  async getAllOrders(req, res) {
    await this._handleAsync(this._getAllOrdersHandler, req, res);
  }

  /**
   * Internal handler for getting all orders
   * @private
   */
  async _getAllOrdersHandler(req, res) {
    this._logAction("Fetching all orders");
    const orders = await firebaseService.getAllOrdersWithItems();
    this._sendSuccessResponse(res, { orders });
  }

  /**
   * Get all users - return complete user data for admin
   */
  async getAllUsers(req, res) {
    await this._handleAsync(this._getAllUsersHandler, req, res);
  }

  /**
   * Internal handler for getting all users
   * @private
   */
  async _getAllUsersHandler(req, res) {
    this._logAction("Fetching all users");
    const users = await firebaseService.getAllUsers();
    this._sendSuccessResponse(res, { users });
  }

  /**
   * Grant admin privileges to a user
   */
  async makeUserAdmin(req, res) {
    await this._handleAsync(this._makeUserAdminHandler, req, res);
  }

  /**
   * Internal handler for granting admin privileges
   * @private
   */
  async _makeUserAdminHandler(req, res) {
    const { userId } = req.body;

    if (!userId) {
      return this._sendErrorResponse(
        res,
        "userId is required",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Granting admin privileges", { userId });
    await firebaseService.updateUserAdmin(userId, true);
    this._sendSuccessResponse(
      res,
      {},
      "User has been granted admin privileges"
    );
  }

  /**
   * Remove admin privileges from a user
   */
  async removeUserAdmin(req, res) {
    await this._handleAsync(this._removeUserAdminHandler, req, res);
  }

  /**
   * Internal handler for removing admin privileges
   * @private
   */
  async _removeUserAdminHandler(req, res) {
    const { userId } = req.body;

    if (!userId) {
      return this._sendErrorResponse(
        res,
        "userId is required",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Removing admin privileges", { userId });
    await firebaseService.updateUserAdmin(userId, false);
    this._sendSuccessResponse(res, {}, "Admin privileges removed successfully");
  }

  /**
   * Delete a user from both Firebase Auth and database
   */
  async deleteUser(req, res) {
    await this._handleAsync(this._deleteUserHandler, req, res);
  }

  /**
   * Internal handler for deleting users
   * @private
   */
  async _deleteUserHandler(req, res) {
    const { firebaseUid } = req.params;

    this._logAction("Deleting user", { firebaseUid });

    // 1. Attempt to delete from Firebase Auth (non-blocking)
    await this._deleteFromFirebaseAuth(firebaseUid);

    // 2. Delete from database (always execute)
    await firebaseService.deleteUser(firebaseUid);

    this._logAction("User deleted successfully", { firebaseUid });
    this._sendSuccessResponse(res, {}, "User deleted successfully");
  }

  /**
   * Delete user from Firebase Auth with error handling
   * @private
   */
  async _deleteFromFirebaseAuth(firebaseUid) {
    try {
      await admin.auth().deleteUser(firebaseUid);
      this._logAction("Firebase Auth user deleted", { firebaseUid });
    } catch (firebaseError) {
      // Log but don't throw - user might not exist in Firebase Auth
      this._logAction("Firebase user not found", {
        firebaseUid,
        error: firebaseError.message,
      });
    }
  }

  /**
   * Setup Google OAuth2 - generate authorization URL for Gmail and Drive
   */
  async setupGoogleAuth(req, res) {
    await this._handleAsync(this._setupGoogleAuthHandler, req, res);
  }

  /**
   * Internal handler for Google OAuth2 setup
   * @private
   */
  async _setupGoogleAuthHandler(req, res) {
    this._logAction("Setting up Google OAuth2 (Gmail + Drive)");

    try {
      const authUrl = googleOAuth2Service.generateAuthUrl();
      this._logAction("Google authorization URL generated");

      return this._sendSuccessResponse(res, {
        authUrl,
        message:
          "Visit this URL to authorize Google services (Gmail + Drive) access",
        scopes: ["Gmail", "Drive", "User Info"],
      });
    } catch (error) {
      this._logAction("Failed to generate Google authorization URL", {
        error: error.message,
      });

      return this._sendErrorResponse(
        res,
        `Google OAuth2 setup failed: ${error.message}`,
        this.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get comprehensive Google services authentication status
   */
  async getGoogleAuthStatus(req, res) {
    await this._handleAsync(this._getGoogleAuthStatusHandler, req, res);
  }

  /**
   * Internal handler for Google authentication status
   * @private
   */
  async _getGoogleAuthStatusHandler(req, res) {
    this._logAction("Checking Google services authentication status");

    try {
      const [authStatus] = await Promise.all([
        googleOAuth2Service.getAuthStatus(),
      ]);

      const comprehensiveStatus = {
        // Core OAuth2 status
        oauth2: {
          authenticated: authStatus.authenticated,
          hasToken: authStatus.hasToken,
          email: authStatus.email,
          createdAt: authStatus.createdAt,
          allowedEmail: authStatus.allowedEmail,
        },

        // Overall status
        allServicesReady: authStatus.authenticated,
      };

      this._logAction("Google services status retrieved", {
        oauth2Authenticated: authStatus.authenticated,
      });

      return this._sendSuccessResponse(res, comprehensiveStatus);
    } catch (error) {
      this._logAction("Failed to get Google services status", {
        error: error.message,
      });

      return this._sendErrorResponse(
        res,
        `Failed to get Google services status: ${error.message}`,
        this.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get Gmail token status from centralized service
   */
  async getGmailTokenStatus(req, res) {
    await this._handleAsync(this._getGmailTokenStatusHandler, req, res);
  }

  /**
   * Internal handler for Gmail token status using centralized service
   * @private
   */
  async _getGmailTokenStatusHandler(req, res) {
    this._logAction("Getting Google OAuth2 token status");

    try {
      const authStatus = await googleOAuth2Service.getAuthStatus();
      const gmailStatus = await gmailService.getAuthStatus();

      return this._sendSuccessResponse(res, {
        hasToken: authStatus.hasToken,
        email: authStatus.email,
        createdAt: authStatus.createdAt,
        allowedEmail: authStatus.allowedEmail,
        authenticated: gmailStatus.authenticated,
      });
    } catch (error) {
      this._logAction("Failed to get Google OAuth2 token status", {
        error: error.message,
      });

      return this._sendErrorResponse(
        res,
        `Failed to get token status: ${error.message}`,
        this.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Force reload Google OAuth2 tokens for all services
   */
  async reloadGoogleTokens(req, res) {
    await this._handleAsync(this._reloadGoogleTokensHandler, req, res);
  }

  /**
   * Internal handler for reloading Google OAuth2 tokens
   * @private
   */
  async _reloadGoogleTokensHandler(req, res) {
    this._logAction("Reloading Google OAuth2 tokens for all services");

    try {
      // Reload tokens from centralized service
      const success = await googleOAuth2Service.reloadToken();

      // Get updated status for all services
      const [authStatus, gmailStatus, driveStatus] = await Promise.all([
        googleOAuth2Service.getAuthStatus(),
        gmailService.getAuthStatus(),
        driveImageManager.getStatus(),
      ]);

      this._logAction("Google OAuth2 tokens reloaded", {
        success,
        gmailReady: gmailStatus.authenticated,
        driveReady: driveStatus.authenticated,
      });

      return this._sendSuccessResponse(res, {
        success,
        oauth2: {
          authenticated: authStatus.authenticated,
          email: authStatus.email,
        },
        services: {
          gmail: { authenticated: gmailStatus.authenticated },
          drive: {
            authenticated: driveStatus.authenticated,
            initialized: driveStatus.initialized,
          },
        },
        message: success
          ? "Google OAuth2 tokens reloaded successfully for all services"
          : "No valid tokens found - authentication required",
      });
    } catch (error) {
      this._logAction("Failed to reload Google OAuth2 tokens", {
        error: error.message,
      });

      return this._sendErrorResponse(
        res,
        `Failed to reload tokens: ${error.message}`,
        this.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Get all orders with advanced filtering, sorting, and pagination
   */
  async getOrdersWithFilters(req, res) {
    await this._handleAsync(this._getOrdersWithFiltersHandler, req, res);
  }

  /**
   * Internal handler for getting filtered orders
   * @private
   */
  async _getOrdersWithFiltersHandler(req, res) {
    const {
      eventId,
      userId,
      dateFrom,
      dateTo,
      paymentMethod,
      search,
      sortBy = "createdAt",
      sortOrder = "desc",
      page = 1,
      limit = 50,
    } = req.query;

    // Build filters object
    const filters = {};
    if (eventId && eventId !== "all") filters.eventId = eventId;
    if (userId) filters.userId = userId;
    if (paymentMethod && paymentMethod !== "all")
      filters.paymentMethod = paymentMethod;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;
    if (search) filters.search = search.trim();

    // Build options object
    const options = {
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Cap at 100 for performance
    };

    this._logAction("Fetching filtered orders", { filters, options });

    const result = await firebaseService.getFilteredOrders(filters, options);

    this._sendSuccessResponse(res, {
      orders: result.orders,
      pagination: {
        currentPage: options.page,
        totalPages: result.totalPages,
        totalOrders: result.totalCount,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
      filters: filters,
    });
  }

  /**
   * Get order statistics for analytics
   */
  async getOrderStatistics(req, res) {
    await this._handleAsync(this._getOrderStatisticsHandler, req, res);
  }

  /**
   * Internal handler for getting order statistics
   * @private
   */
  async _getOrderStatisticsHandler(req, res) {
    const { eventId, dateFrom, dateTo } = req.query;

    const filters = {};
    if (eventId && eventId !== "all") filters.eventId = eventId;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    this._logAction("Fetching order statistics", { filters });

    const statistics = await firebaseService.getOrderStatistics(filters);
    this._sendSuccessResponse(res, { statistics });
  }

  /**
   * Get all email logs with filtering and pagination
   */
  async getEmailLogs(req, res) {
    await this._handleAsync(this._getEmailLogsHandler, req, res);
  }

  /**
   * Internal handler for getting email logs
   * @private
   */
  async _getEmailLogsHandler(req, res) {
    const {
      status,
      orderId,
      userEmail,
      emailType = "order_confirmation",
      dateFrom,
      dateTo,
      page = 1,
      limit = 50,
    } = req.query;

    // Build filters object
    const filters = {};
    if (status && status !== "all") filters.status = status;
    if (orderId) filters.orderId = orderId;
    if (userEmail) filters.userEmail = userEmail.trim();
    if (emailType && emailType !== "all") filters.emailType = emailType;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    // Build options object
    const options = {
      page: parseInt(page),
      limit: Math.min(parseInt(limit), 100), // Cap at 100 for performance
    };

    this._logAction("Fetching email logs", { filters, options });

    const result = await firebaseService.getEmailLogs(filters, options);

    this._sendSuccessResponse(res, {
      emailLogs: result.logs,
      pagination: {
        currentPage: options.page,
        totalPages: result.totalPages,
        totalLogs: result.totalCount,
        hasNext: result.hasNext,
        hasPrev: result.hasPrev,
      },
      filters: filters,
    });
  }

  /**
   * Get email logs for a specific order
   */
  async getEmailLogsByOrderId(req, res) {
    await this._handleAsync(this._getEmailLogsByOrderIdHandler, req, res);
  }

  /**
   * Internal handler for getting email logs by order ID
   * @private
   */
  async _getEmailLogsByOrderIdHandler(req, res) {
    const { orderId } = req.params;

    if (!orderId) {
      return this._sendErrorResponse(
        res,
        "orderId is required",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Fetching email logs for order", { orderId });

    const logs = await firebaseService.getEmailLogsByOrderId(orderId);
    this._sendSuccessResponse(res, { emailLogs: logs });
  }

  /**
   * Get email delivery statistics
   */
  async getEmailStatistics(req, res) {
    await this._handleAsync(this._getEmailStatisticsHandler, req, res);
  }

  /**
   * Internal handler for getting email statistics
   * @private
   */
  async _getEmailStatisticsHandler(req, res) {
    const { dateFrom, dateTo, emailType = "order_confirmation" } = req.query;

    const filters = {};
    if (emailType && emailType !== "all") filters.emailType = emailType;
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo) filters.dateTo = dateTo;

    this._logAction("Fetching email statistics", { filters });

    const statistics = await firebaseService.getEmailStatistics(filters);
    this._sendSuccessResponse(res, { statistics });
  }

  /**
   * Get current Stripe configuration and mode
   */
  async getStripeConfig(req, res) {
    await this._handleAsync(this._getStripeConfigHandler, req, res);
  }

  /**
   * Internal handler for getting Stripe configuration
   * @private
   */
  async _getStripeConfigHandler(req, res) {
    try {
      const stripeService = require("../../core/services/stripe.service");

      const mode = await firebaseService.getStripeMode();
      const keys = await stripeService.getStripeKeys();

      this._logAction("Fetching Stripe configuration", { mode });

      this._sendSuccessResponse(res, {
        mode,
        publicKey: keys.publicKey,
        hasLiveKeys: !!(
          process.env.STRIPE_SECRET_KEY_LIVE &&
          process.env.STRIPE_PUBLIC_KEY_LIVE
        ),
        hasTestKeys: !!(
          process.env.STRIPE_SECRET_KEY_TEST &&
          process.env.STRIPE_PUBLIC_KEY_TEST
        ),
      });
    } catch (error) {
      this._logAction("Error fetching Stripe configuration", {
        error: error.message,
      });
      this._sendErrorResponse(
        res,
        "Failed to get Stripe configuration",
        this.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * Switch Stripe mode (test/live) - SUPER ADMIN ONLY
   */
  async switchStripeMode(req, res) {
    await this._handleAsync(this._switchStripeModeHandler, req, res);
  }

  /**
   * Get current Stripe public key (PUBLIC ENDPOINT - no auth required)
   */
  async getStripePublicKey(req, res) {
    await this._handleAsync(this._getStripePublicKeyHandler, req, res);
  }

  /**
   * Internal handler for getting Stripe public key
   * @private
   */
  async _getStripePublicKeyHandler(req, res) {
    try {
      const stripeService = require("../../core/services/stripe.service");
      const keys = await stripeService.getStripeKeys();

      this._logAction("Fetching Stripe public key", { mode: keys.mode });

      this._sendSuccessResponse(res, {
        publicKey: keys.publicKey,
        mode: keys.mode,
      });
    } catch (error) {
      this._logAction("Error fetching Stripe public key", {
        error: error.message,
      });
      // Fallback to test key to prevent breaking the app
      this._sendSuccessResponse(res, {
        publicKey: process.env.STRIPE_PUBLIC_KEY_TEST || "",
        mode: "test",
      });
    }
  }

  /**
   * Internal handler for switching Stripe mode
   * @private
   */
  async _switchStripeModeHandler(req, res) {
    const { mode } = req.body;
    const userId = req.user?.email || req.user?.uid || "unknown";

    // Validate mode
    if (!mode || (mode !== "test" && mode !== "live")) {
      return this._sendErrorResponse(
        res,
        'Invalid mode. Must be "test" or "live"',
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Additional security check - ensure user is super admin
    const currentUser = await firebaseService.getUser(req.user.uid);
    if (!currentUser?.isAdmin) {
      return this._sendErrorResponse(
        res,
        "Insufficient permissions",
        this.HTTP_STATUS.FORBIDDEN
      );
    }

    try {
      await firebaseService.setStripeMode(mode, userId);

      this._logAction("Stripe mode switched", { mode, userId });

      this._sendSuccessResponse(res, {
        message: `Stripe mode switched to ${mode}`,
        mode,
      });
    } catch (error) {
      this._logAction("Error switching Stripe mode", {
        error: error.message,
        userId,
      });
      this._sendErrorResponse(
        res,
        "Failed to switch Stripe mode",
        this.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new AdminController();
