// server/controllers/admin.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");
const emailService = require("../../core/services/email.service");
const admin = require("../../config/firebaseAdmin");

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
   * Setup Gmail OAuth2 - generate authorization URL
   */
  async setupGmail(req, res) {
    await this._handleAsync(this._setupGmailHandler, req, res);
  }

  /**
   * Internal handler for Gmail setup
   * @private
   */
  async _setupGmailHandler(req, res) {
    this._logAction("Generating Gmail OAuth2 authorization URL");

    try {
      // Check if CLIENT_ID and CLIENT_SECRET are configured
      if (!process.env.GMAIL_CLIENT_ID || !process.env.GMAIL_CLIENT_SECRET) {
        return this._sendErrorResponse(
          res,
          "Gmail Client ID and Client Secret must be configured in environment variables",
          this.HTTP_STATUS.BAD_REQUEST
        );
      }

      // Generate authorization URL
      const authUrl = emailService.generateAuthUrl();

      this._logAction("Gmail authorization URL generated");

      this._sendSuccessResponse(res, {
        authUrl,
        callbackUrl: `${
          process.env.APP_URL || process.env.VITE_APP_URL
        }/api/webhooks/gmail/callback`,
        message:
          "Visit the authUrl to authorize Gmail access. After authorization, you'll be redirected back to configure your refresh token.",
      });
    } catch (error) {
      this._logAction("Failed to generate Gmail authorization URL", {
        error: error.message,
      });

      return this._sendErrorResponse(
        res,
        `Gmail setup failed: ${error.message}`,
        this.HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }
}

module.exports = new AdminController();
