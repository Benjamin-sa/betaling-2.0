// server/controllers/auth.controller.js
const BaseController = require("../../core/controllers/base.controller");
const admin = require("../../config/firebaseAdmin");
const stripeService = require("../../core/services/stripe.service");
const firebaseService = require("../../core/services/firebase-cached.service");
const { UserFields, createUserData } = require("../../models/webstore.model");

// Auth-specific error messages
const AUTH_ERROR_MESSAGES = {
  REGISTRATION_FAILED: "Registration failed",
  USER_CREATION_FAILED: "Failed to create user",
  AUTHENTICATION_FAILED: "Authentication failed",
  INVALID_CREDENTIALS: "Invalid email or password",
};

class AuthController extends BaseController {
  /**
   * Register user with email and password
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async register(req, res) {
    await this._handleAsync(this._registerHandler, req, res);
  }

  /**
   * Internal handler for user registration
   * @private
   */
  async _registerHandler(req, res) {
    const { email, password } = req.body;

    // Basic validation for auth-specific fields
    if (!email || !password) {
      return this._sendErrorResponse(
        res,
        "Email and password are required",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("User registration attempt", { email });

    // 1. Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({ email, password });

    // 2. Create Stripe customer
    const customer = await stripeService.findOrCreateCustomer(
      email,
      userRecord.uid
    );

    // 3. Create user in database using factory function
    const userData = createUserData({
      [UserFields.FIREBASE_UID]: userRecord.uid,
      [UserFields.EMAIL]: email,
      [UserFields.STRIPE_CUSTOMER_ID]: customer.id,
      [UserFields.IS_ADMIN]: false,
    });
    const user = await firebaseService.createUser(userData);

    this._logAction("User registered successfully", { userId: userRecord.uid });
    this._sendSuccessResponse(
      res,
      { user },
      "User registered successfully",
      this.HTTP_STATUS.CREATED
    );
  }

  /**
   * Ensure user exists in database (create if doesn't exist)
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async ensureUser(req, res) {
    await this._handleAsync(this._ensureUserHandler, req, res);
  }

  /**
   * Internal handler for ensuring user exists
   * @private
   */
  async _ensureUserHandler(req, res) {
    const firebaseUid = req.user.uid;
    const email = req.user.email;

    // Auth middleware already validates req.user, so uid and email are guaranteed to exist
    this._logAction("Ensuring user exists", { firebaseUid, email });

    // 1. Check if user already exists in database
    let user = await firebaseService.getUser(firebaseUid);

    if (!user) {
      // 2. User doesn't exist, create with Stripe customer using factory function
      const customer = await stripeService.findOrCreateCustomer(
        email,
        firebaseUid
      );
      const userData = createUserData({
        [UserFields.FIREBASE_UID]: firebaseUid,
        [UserFields.EMAIL]: email,
        [UserFields.STRIPE_CUSTOMER_ID]: customer.id,
        [UserFields.IS_ADMIN]: false,
      });
      user = await firebaseService.createUser(userData);

      this._logAction("Created new user in database", { firebaseUid });
    }

    this._sendSuccessResponse(res, { user }, "User authenticated successfully");
  }

  /**
   * Get admin status for current user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAdminStatus(req, res) {
    await this._handleAsync(this._getAdminStatusHandler, req, res);
  }

  /**
   * Internal handler for getting admin status
   * @private
   */
  async _getAdminStatusHandler(req, res) {
    const firebaseUid = req.user.uid;

    // Auth middleware already validates req.user.uid
    this._logAction("Getting admin status", { firebaseUid });

    // Use cached admin status check
    const isAdmin = await firebaseService.isUserAdmin(firebaseUid);

    this._sendSuccessResponse(res, { isAdmin });
  }
}

module.exports = new AuthController();
