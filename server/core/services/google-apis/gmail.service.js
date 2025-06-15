// server/core/services/gmail.service.js
const { google } = require("googleapis");
const googleOAuth2Service = require("./google-oauth.service");

class GmailService {
  constructor() {
    this.gmail = null;
    this.isInitialized = false;
  }

  /**
   * Initialize Gmail API client using centralized OAuth2 service
   */
  async initialize() {
    try {
      const oauth2Client = await googleOAuth2Service.getAuthenticatedClient();

      if (!oauth2Client) {
        console.log("⚠️ Gmail service not authenticated");
        this.isInitialized = false;
        return false;
      }

      this.gmail = google.gmail({ version: "v1", auth: oauth2Client });
      this.isInitialized = true;
      console.log("✅ Gmail service initialized");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Gmail service:", error.message);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if Gmail service is authenticated and ready
   */
  async isAuthenticated() {
    // First check if OAuth2 service is authenticated
    if (!googleOAuth2Service.isAuthenticated()) {
      return false;
    }

    // Initialize if not already done
    if (!this.isInitialized) {
      await this.initialize();
    }

    return this.isInitialized;
  }

  /**
   * Send email using Gmail API with enhanced deliverability headers
   */
  async sendEmail(to, subject, content, options = {}) {
    if (!(await this.isAuthenticated())) {
      throw new Error(
        "Gmail not authenticated. Please complete OAuth2 flow first."
      );
    }

    console.log("📧 Sending email via Gmail API to:", to);

    if (!to || !subject || !content) {
      throw new Error(
        "To, subject, and content are required to send an email."
      );
    }

    try {
      let email;

      // Get enhanced headers and from address
      const fromAddress = options.from || this._getDefaultFromAddress();
      const enhancedHeaders = this._getEnhancedHeaders(
        options.headers || {},
        subject
      );

      // Build base headers
      const baseHeaders = [
        `From: ${fromAddress}`,
        `To: ${to}`,
        `Subject: ${subject}`,
        ...Object.entries(enhancedHeaders).map(
          ([key, value]) => `${key}: ${value}`
        ),
      ];

      // Check if content is an object with html and text properties (multipart email)
      if (typeof content === "object" && content.html && content.text) {
        // Create multipart email (HTML + plain text)
        const boundary = `scouts_webshop_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}`;

        email = [
          ...baseHeaders,
          `Content-Type: multipart/alternative; boundary="${boundary}"`,
          "",
          `--${boundary}`,
          `Content-Type: text/plain; charset=utf-8`,
          `Content-Transfer-Encoding: 7bit`,
          "",
          content.text,
          "",
          `--${boundary}`,
          `Content-Type: text/html; charset=utf-8`,
          `Content-Transfer-Encoding: 7bit`,
          "",
          content.html,
          "",
          `--${boundary}--`,
        ].join("\n");
      } else {
        // Single content type (assume HTML if it contains HTML tags, otherwise plain text)
        const isHtml = typeof content === "string" && content.includes("<html");

        email = [
          ...baseHeaders,
          `Content-Type: ${isHtml ? "text/html" : "text/plain"}; charset=utf-8`,
          "",
          content,
        ].join("\n");
      }

      // Encode email in base64
      const encodedMessage = Buffer.from(email)
        .toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/, "");

      // Send email
      const response = await this.gmail.users.messages.send({
        userId: "me",
        requestBody: {
          raw: encodedMessage,
        },
      });

      console.log("✅ Email sent successfully");
      return response.data;
    } catch (error) {
      // Handle token refresh errors
      if (error.message && error.message.includes("invalid_grant")) {
        console.error("❌ Gmail tokens expired - re-authentication required");
        throw new Error(
          "Gmail tokens expired. Please re-authenticate in admin panel."
        );
      }

      console.error("❌ Error sending email:", error.message);
      throw error;
    }
  }

  /**
   * Get current authentication status
   */
  async getAuthStatus() {
    try {
      const authStatus = await googleOAuth2Service.getAuthStatus();

      return {
        authenticated: authStatus.authenticated && this.isInitialized,
        hasToken: authStatus.hasToken,
        email: authStatus.email,
        createdAt: authStatus.createdAt,
        allowedEmail: authStatus.allowedEmail,
      };
    } catch (error) {
      console.error("❌ Error getting Gmail auth status:", error.message);
      return {
        authenticated: false,
        error: error.message,
      };
    }
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthUrl() {
    return googleOAuth2Service.generateAuthUrl();
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code) {
    return await googleOAuth2Service.exchangeCodeForTokens(code);
  }

  /**
   * Force reload token from storage and reinitialize
   */
  async reloadToken() {
    console.log("🔄 Reloading Gmail token...");
    this.isInitialized = false;
    this.gmail = null;

    const success = await googleOAuth2Service.reloadToken();
    if (success) {
      await this.initialize();
    }

    return this.isInitialized;
  }

  /**
   * Get enhanced email headers for better deliverability
   * @private
   */
  _getEnhancedHeaders(customHeaders = {}, subject = "") {
    const userEmail = process.env.GMAIL_USER_EMAIL || "noreply@lodlavki.be";
    const domain = userEmail.split("@")[1] || "lodlavki.be";
    const timestamp = Date.now();

    return {
      "MIME-Version": "1.0",
      "Message-ID": `<${timestamp}-${Math.random()
        .toString(36)
        .substr(2, 9)}@${domain}>`,
      "Return-Path": userEmail,
      "Reply-To": userEmail,
      "List-Unsubscribe": `<mailto:unsubscribe@${domain}?subject=Unsubscribe>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      "X-Priority": "3",
      "X-MSMail-Priority": "Normal",
      "X-Mailer": "Lodlavki Webshop System v1.0",
      "X-Auto-Response-Suppress": "OOF, AutoReply",
      Precedence: "bulk",
      "X-SES-Configuration-Set": "default",
      "X-Entity-Ref-ID": `lodlavki-webshop-${timestamp}`,
      ...customHeaders,
    };
  }

  /**
   * Get properly formatted default From address
   * @private
   */
  _getDefaultFromAddress() {
    const fromName = process.env.GMAIL_FROM_NAME || "Lodlavki Webshop";
    const fromEmail = process.env.GMAIL_USER_EMAIL || "noreply@lodlavki.be";
    return `"${fromName}" <${fromEmail}>`;
  }
}

module.exports = new GmailService();
