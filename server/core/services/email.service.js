// server/core/services/email.service.js
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const path = require("path");

// Only configure dotenv if not already configured
if (!process.env.GMAIL_CLIENT_ID) {
  require("dotenv").config({ path: path.join(__dirname, "../../.env") });
}

class EmailService {
  constructor() {
    this.oauth2Client = null;
    this.transporter = null;
    this.isConfigured = false;
    this.initializeGmailClient();
  }

  /**
   * Initialize Gmail OAuth2 client
   */
  initializeGmailClient() {
    try {
      // Check if basic OAuth2 credentials are present (for setup)
      const basicRequiredVars = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"];

      const missingBasicVars = basicRequiredVars.filter(
        (varName) => !process.env[varName]
      );

      if (missingBasicVars.length > 0) {
        console.warn(
          `Email service not configured. Missing basic environment variables: ${missingBasicVars.join(
            ", "
          )}`
        );
        return;
      }

      // Get the redirect URL from environment or construct it
      const baseUrl =
        process.env.APP_URL ||
        process.env.VITE_APP_URL ||
        "http://localhost:3000";
      const redirectUri = `${baseUrl}/api/webhooks/gmail/callback`;

      // Create OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        process.env.GMAIL_CLIENT_ID,
        process.env.GMAIL_CLIENT_SECRET,
        redirectUri
      );

      // Set refresh token if available (for production use)
      if (process.env.GMAIL_REFRESH_TOKEN) {
        this.oauth2Client.setCredentials({
          refresh_token: process.env.GMAIL_REFRESH_TOKEN,
        });

        // Check if user email is also configured
        if (process.env.GMAIL_USER_EMAIL) {
          this.isConfigured = true;
          console.log("Email service initialized successfully");
        } else {
          console.warn(
            "Email service partially configured. Missing GMAIL_USER_EMAIL"
          );
        }
      } else {
        console.log("Email service OAuth2 client created (ready for setup)");
      }
    } catch (error) {
      console.error("Failed to initialize email service:", error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Get access token and create transporter
   */
  async getTransporter() {
    if (!this.isConfigured) {
      throw new Error("Email service is not properly configured");
    }

    try {
      // Get access token
      const { token: accessToken } = await this.oauth2Client.getAccessToken();

      // Create transporter with OAuth2
      this.transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: "OAuth2",
          user: process.env.GMAIL_USER_EMAIL,
          clientId: process.env.GMAIL_CLIENT_ID,
          clientSecret: process.env.GMAIL_CLIENT_SECRET,
          refreshToken: process.env.GMAIL_REFRESH_TOKEN,
          accessToken: accessToken,
        },
      });

      return this.transporter;
    } catch (error) {
      console.error("Failed to create email transporter:", error.message);
      throw error;
    }
  }

  /**
   * Send order confirmation email
   * @param {string} sessionId - Stripe session ID
   * @returns {Object} Result object with success status
   */
  async sendOrderConfirmationEmail(sessionId) {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    try {
      // Get transporter
      const transporter = await this.getTransporter();

      // For now, send a basic confirmation email
      // In the future, this can be enhanced with order details
      const mailOptions = {
        from: process.env.GMAIL_USER_EMAIL,
        to: process.env.GMAIL_USER_EMAIL, // For now, send to admin email
        subject: "Nieuwe bestelling ontvangen - Scoutswinkel",
        html: `
          <h2>Nieuwe bestelling ontvangen</h2>
          <p>Er is een nieuwe bestelling geplaatst via de Scoutswinkel.</p>
          <p><strong>Sessie ID:</strong> ${sessionId}</p>
          <p>Bekijk de volledige orderdetails in het admin panel.</p>
          <br>
          <p>Met vriendelijke groet,<br>Scoutswinkel Systeem</p>
        `,
      };

      // Send email
      const result = await transporter.sendMail(mailOptions);

      console.log(
        "Order confirmation email sent successfully:",
        result.messageId
      );

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Failed to send order confirmation email:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send test email to verify configuration
   * @returns {Object} Result object with success status
   */
  async sendTestEmail() {
    if (!this.isConfigured) {
      return {
        success: false,
        error: "Email service not configured",
      };
    }

    try {
      const transporter = await this.getTransporter();

      const mailOptions = {
        from: process.env.GMAIL_USER_EMAIL,
        to: process.env.GMAIL_USER_EMAIL,
        subject: "Scoutswinkel Email Test",
        html: `
          <h2>Email Test Succesvol</h2>
          <p>De email configuratie werkt correct!</p>
          <p>Tijd: ${new Date().toLocaleString("nl-NL")}</p>
        `,
      };

      const result = await transporter.sendMail(mailOptions);

      return {
        success: true,
        messageId: result.messageId,
      };
    } catch (error) {
      console.error("Test email failed:", error.message);

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Check if email service is properly configured
   * @returns {boolean} Configuration status
   */
  isEmailConfigured() {
    return this.isConfigured;
  }

  /**
   * Exchange authorization code for tokens (used by OAuth2 callback)
   * @param {string} authCode - Authorization code from Google OAuth2
   * @returns {Object} Token information
   */
  async exchangeCodeForTokens(authCode) {
    if (!this.oauth2Client) {
      throw new Error("OAuth2 client not initialized");
    }

    try {
      const { tokens } = await this.oauth2Client.getToken(authCode);

      console.log("\n🎉 Gmail OAuth2 tokens received!");
      console.log("📧 Add this refresh token to your .env file:");
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);

      // Optionally set the credentials for immediate use
      if (tokens.refresh_token) {
        this.oauth2Client.setCredentials({
          refresh_token: tokens.refresh_token,
        });
      }

      return tokens;
    } catch (error) {
      console.error("Failed to exchange code for tokens:", error.message);
      throw error;
    }
  }

  /**
   * Generate OAuth2 authorization URL for Gmail setup
   * @returns {string} Authorization URL
   */
  generateAuthUrl() {
    if (!this.oauth2Client) {
      this.initializeGmailClient();
    }

    if (!this.oauth2Client) {
      throw new Error(
        "OAuth2 client not initialized. Check your CLIENT_ID and CLIENT_SECRET."
      );
    }

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
      prompt: "consent", // Force consent screen to get refresh token
    });
  }
}

module.exports = new EmailService();
