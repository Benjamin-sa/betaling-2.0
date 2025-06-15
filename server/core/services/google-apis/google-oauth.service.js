// server/core/services/google-oauth.service.js
const { google } = require("googleapis");
const { admin } = require("../../../config/firebaseAdmin");

/**
 * Centralized Google OAuth2 Service
 *
 * This service consolidates all Google OAuth2 operations for Gmail, Drive, and other Google services.
 * It provides unified token management, caching, and authentication handling.
 *
 * Features:
 * - Single OAuth2 client instance
 * - Centralized token storage and management
 * - Unified caching strategy
 * - Consistent error handling
 * - Support for multiple Google services
 */
class GoogleOAuth2Service {
  constructor() {
    this.oauth2Client = null;
    this.db = admin.firestore();

    // Configuration constants
    this.CONFIG = {
      COLLECTION_NAME: "google_oauth_tokens",
      TOKEN_DOC_ID: "service_account",
      ALLOWED_EMAIL: "groepsleiding@lodlavki.be",
      SCOPES: [
        "https://www.googleapis.com/auth/gmail.send",
        "https://www.googleapis.com/auth/userinfo.email",
        "https://www.googleapis.com/auth/drive.file",
      ],
    };

    // Persistent cache - clears only when tokens change
    this.cache = {
      refreshToken: null,
      userEmail: null,
      createdAt: null,
      isAuthenticated: false,
      isCached: false, // Track if we have valid cached data
    };

    this.initializeOAuth2Client();
  }

  /**
   * Initialize OAuth2 client with environment variables
   * @private
   */
  async initializeOAuth2Client() {
    try {
      // Validate required environment variables
      const requiredVars = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"];
      const missingVars = requiredVars.filter(
        (varName) => !process.env[varName]
      );

      if (missingVars.length > 0) {
        console.warn(
          `❌ Google OAuth2 not configured. Missing: ${missingVars.join(", ")}`
        );
        return;
      }

      // Construct redirect URI
      const baseUrl = process.env.APP_URL || "http://localhost:3000";
      const redirectUri = `${baseUrl}/api/webhooks/gmail/callback`;

      // Create OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        redirectUri
      );

      // Load existing refresh token
      await this.loadStoredToken();

      console.log("✅ Google OAuth2 service initialized");
    } catch (error) {
      console.error(
        "❌ Failed to initialize Google OAuth2 service:",
        error.message
      );
    }
  }

  /**
   * Load stored refresh token from Firestore with persistent caching
   * @returns {Promise<boolean>} Success status
   */
  async loadStoredToken() {
    try {
      // Return cached data if available
      if (this.cache.isCached) {
        if (this.cache.refreshToken) {
          this.oauth2Client.setCredentials({
            refresh_token: this.cache.refreshToken,
          });
        }
        console.log("✅ Google OAuth2 token loaded from cache");
        return this.cache.refreshToken !== null;
      }

      // Fetch from Firestore
      const doc = await this.db
        .collection(this.CONFIG.COLLECTION_NAME)
        .doc(this.CONFIG.TOKEN_DOC_ID)
        .get();

      if (!doc.exists) {
        console.log("⚠️ No Google OAuth2 token found in Firestore");
        this._updateCache(null, null, null);
        return false;
      }

      const tokenData = doc.data();
      const { refresh_token, user_email, created_at } = tokenData;

      // Validate email restriction
      if (user_email !== this.CONFIG.ALLOWED_EMAIL) {
        console.warn(`❌ Invalid email in stored token: ${user_email}`);
        this._updateCache(null, null, null);
        return false;
      }

      // Set credentials and update cache
      if (refresh_token) {
        this.oauth2Client.setCredentials({ refresh_token });
        this._updateCache(refresh_token, user_email, created_at);
        console.log("✅ Google OAuth2 token loaded from Firestore");
        return true;
      }

      this._updateCache(null, null, null);
      return false;
    } catch (error) {
      console.error("❌ Failed to load stored token:", error.message);
      this._clearCache();
      return false;
    }
  }

  /**
   * Store refresh token in Firestore
   * @param {string} refreshToken - OAuth2 refresh token
   * @param {string} userEmail - Authenticated user email
   * @returns {Promise<boolean>} Success status
   */
  async storeRefreshToken(refreshToken, userEmail) {
    try {
      // Validate email restriction
      if (userEmail !== this.CONFIG.ALLOWED_EMAIL) {
        console.warn(`❌ Only ${this.CONFIG.ALLOWED_EMAIL} can authenticate`);
        return false;
      }

      if (!refreshToken) {
        console.warn("❌ No refresh token provided");
        return false;
      }

      const tokenData = {
        refresh_token: refreshToken,
        user_email: userEmail,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Store in Firestore
      await this.db
        .collection(this.CONFIG.COLLECTION_NAME)
        .doc(this.CONFIG.TOKEN_DOC_ID)
        .set(tokenData);

      // Update cache immediately
      this._updateCache(refreshToken, userEmail, tokenData.created_at);

      console.log("✅ Google OAuth2 refresh token stored successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to store refresh token:", error.message);
      this._clearCache();
      return false;
    }
  }

  /**
   * Generate OAuth2 authorization URL
   * @returns {string} Authorization URL
   */
  generateAuthUrl() {
    if (!this.oauth2Client) {
      throw new Error(
        "OAuth2 client not initialized. Check your configuration."
      );
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: this.CONFIG.SCOPES,
      prompt: "consent", // Force consent to get refresh token
    });
  }

  /**
   * Exchange authorization code for tokens and validate email
   * @param {string} authCode - Authorization code from OAuth2 callback
   * @returns {Promise<{success: boolean, email: string}>} Exchange result
   */
  async exchangeCodeForTokens(authCode) {
    try {
      if (!this.oauth2Client) {
        throw new Error("OAuth2 client not initialized");
      }

      // Exchange code for tokens
      const { tokens } = await this.oauth2Client.getToken(authCode);

      // Get user info to validate email
      const tempClient = new google.auth.OAuth2();
      tempClient.setCredentials(tokens);
      const oauth2 = google.oauth2({ version: "v2", auth: tempClient });
      const userInfo = await oauth2.userinfo.get();
      const userEmail = userInfo.data.email;

      // Validate email restriction
      if (userEmail !== this.CONFIG.ALLOWED_EMAIL) {
        throw new Error(
          `Only ${this.CONFIG.ALLOWED_EMAIL} can authenticate this service.`
        );
      }

      // Set credentials for immediate use
      this.oauth2Client.setCredentials(tokens);

      // Store refresh token if available
      if (tokens.refresh_token) {
        await this.storeRefreshToken(tokens.refresh_token, userEmail);
      } else {
        console.warn(
          "⚠️ No refresh token received - using existing stored token"
        );
      }

      return { success: true, email: userEmail };
    } catch (error) {
      console.error("❌ Failed to exchange code for tokens:", error.message);
      throw error;
    }
  }

  /**
   * Get authenticated OAuth2 client for use by other services
   * @returns {Promise<google.auth.OAuth2|null>} Authenticated client or null
   */
  async getAuthenticatedClient() {
    try {
      if (!this.isAuthenticated()) {
        console.log("⚠️ OAuth2 client not authenticated");
        return null;
      }

      // Ensure we have fresh access token
      await this.ensureValidTokens();
      return this.oauth2Client;
    } catch (error) {
      console.error("❌ Failed to get authenticated client:", error.message);
      return null;
    }
  }

  /**
   * Check if the service is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return (
      this.oauth2Client &&
      this.oauth2Client.credentials &&
      this.oauth2Client.credentials.refresh_token &&
      this.cache.isCached &&
      this.cache.refreshToken !== null
    );
  }

  /**
   * Ensure we have valid access tokens, refresh if needed
   * @private
   */
  async ensureValidTokens() {
    try {
      if (
        !this.oauth2Client.credentials.access_token ||
        this.isTokenExpired()
      ) {
        console.log("🔄 Refreshing access token...");
        const { credentials } = await this.oauth2Client.refreshAccessToken();
        this.oauth2Client.setCredentials(credentials);
        console.log("✅ Access token refreshed");
      }
    } catch (error) {
      console.error("❌ Failed to refresh access token:", error.message);
      throw error;
    }
  }

  /**
   * Check if the current access token is expired
   * @private
   */
  isTokenExpired() {
    const credentials = this.oauth2Client.credentials;
    if (!credentials.expiry_date) return false;

    // Check if token expires within the next 5 minutes
    const expiryTime = new Date(credentials.expiry_date);
    const now = new Date();
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000);

    return expiryTime <= fiveMinutesFromNow;
  }

  /**
   * Force reload tokens from storage
   * @returns {Promise<boolean>} Success status
   */
  async reloadToken() {
    console.log("🔄 Reloading Google OAuth2 tokens...");
    this._clearCache();

    if (this.oauth2Client) {
      this.oauth2Client.setCredentials({});
    }

    const success = await this.loadStoredToken();
    return success;
  }

  /**
   * Get comprehensive authentication status
   * @returns {Promise<Object>} Status information
   */
  async getAuthStatus() {
    try {
      // Use cached status if available
      if (this.cache.isCached) {
        return {
          authenticated: this.isAuthenticated(),
          hasToken: this.cache.refreshToken !== null,
          email: this.cache.userEmail,
          createdAt: this.cache.createdAt,
          allowedEmail: this.CONFIG.ALLOWED_EMAIL,
        };
      }

      // Force load from storage if not cached
      await this.loadStoredToken();

      return {
        authenticated: this.isAuthenticated(),
        hasToken: this.cache.refreshToken !== null,
        email: this.cache.userEmail,
        createdAt: this.cache.createdAt,
        allowedEmail: this.CONFIG.ALLOWED_EMAIL,
      };
    } catch (error) {
      console.error("❌ Failed to get auth status:", error.message);
      return {
        authenticated: false,
        hasToken: false,
        email: null,
        createdAt: null,
        allowedEmail: this.CONFIG.ALLOWED_EMAIL,
        error: error.message,
      };
    }
  }

  /**
   * Delete stored refresh token
   * @returns {Promise<boolean>} Success status
   */
  async deleteRefreshToken() {
    try {
      await this.db
        .collection(this.CONFIG.COLLECTION_NAME)
        .doc(this.CONFIG.TOKEN_DOC_ID)
        .delete();

      this._clearCache();

      if (this.oauth2Client) {
        this.oauth2Client.setCredentials({});
      }

      console.log("✅ Google OAuth2 refresh token deleted");
      return true;
    } catch (error) {
      console.error("❌ Failed to delete refresh token:", error.message);
      return false;
    }
  }

  /**
   * Update cache with new token data
   * @private
   */
  _updateCache(refreshToken, userEmail, createdAt) {
    this.cache.refreshToken = refreshToken;
    this.cache.userEmail = userEmail;
    this.cache.createdAt = createdAt;
    this.cache.isAuthenticated = refreshToken !== null;
    this.cache.isCached = true;
  }

  /**
   * Clear cache
   * @private
   */
  _clearCache() {
    this.cache.refreshToken = null;
    this.cache.userEmail = null;
    this.cache.createdAt = null;
    this.cache.isAuthenticated = false;
    this.cache.isCached = false;
  }

  /**
   * Get service configuration
   * @returns {Object} Configuration object
   */
  getConfig() {
    return { ...this.CONFIG };
  }

  /**
   * Convert document to object with ID
   * @private
   */
  _docToObject(doc) {
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }
}

// Export singleton instance
module.exports = new GoogleOAuth2Service();
