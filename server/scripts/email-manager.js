// server/scripts/email-manager.js
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const nodemailer = require("nodemailer");
const { google } = require("googleapis");

/**
 * Complete Email Management Script
 * Handles OAuth2 setup, App Password setup, and email testing
 * 
 * Usage:
 * npm run email-setup         - Generate OAuth2 authorization URL  
 * npm run email-token CODE    - Exchange authorization code for refresh token
 * npm run email-simple        - Test with App Password (simpler for Google Workspace)
 * npm run email-test          - Test email configuration (OAuth2)
 */

class EmailManager {
  constructor() {
    this.oauth2Client = null;
    this.initializeOAuth2Client();
  }

  initializeOAuth2Client() {
    // Validate required environment variables
    const requiredVars = ["GMAIL_CLIENT_ID", "GMAIL_CLIENT_SECRET"];
    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log("❌ Missing environment variables:");
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log("\nPlease check your .env file in /server/.env");
      process.exit(1);
    }

    // Create OAuth2 client
    const baseUrl = process.env.APP_URL || "http://localhost:3000";
    const redirectUri = `${baseUrl}/api/webhooks/gmail/callback`;

    this.oauth2Client = new google.auth.OAuth2(
      process.env.GMAIL_CLIENT_ID,
      process.env.GMAIL_CLIENT_SECRET,
      redirectUri
    );

    console.log("✅ OAuth2 client initialized");
    console.log(`📍 Redirect URI: ${redirectUri}`);
  }

  /**
   * Generate OAuth2 authorization URL
   */
  generateAuthUrl() {
    console.log("\n🔧 Gmail OAuth2 Setup - Step 1\n");
    
    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/gmail.send"],
      prompt: "consent", // Force consent screen to get refresh token
    });

    console.log("⚠️  IMPORTANT: Make sure this redirect URI is added to your Google Cloud Console!\n");
    console.log("1. Visit this URL in your browser:");
    console.log(`   ${authUrl}\n`);
    console.log("2. Authorize the application");
    console.log("3. You'll be redirected to your callback URL with a 'code' parameter");
    console.log("4. Copy the 'code' value and run:");
    console.log(`   node scripts/email-manager.js token YOUR_AUTH_CODE\n`);
    
    return authUrl;
  }

  /**
   * Exchange authorization code for refresh token
   */
  async exchangeCodeForToken(authCode) {
    console.log("\n🔧 Gmail OAuth2 Setup - Step 2\n");
    console.log(`🔑 Exchanging authorization code: ${authCode.substring(0, 20)}...\n`);

    try {
      const { tokens } = await this.oauth2Client.getToken(authCode);

      console.log("🎉 Success! OAuth2 tokens received!");
      console.log("\n📧 Add this to your .env file:");
      console.log(`GMAIL_REFRESH_TOKEN=${tokens.refresh_token}\n`);

      if (tokens.access_token) {
        console.log("✅ Access token also received (temporary)");
      }

      // Set credentials for immediate testing
      this.oauth2Client.setCredentials({
        refresh_token: tokens.refresh_token,
      });

      console.log("\n💡 You can now test email sending with:");
      console.log("   node scripts/email-manager.js test\n");

      return tokens;
    } catch (error) {
      console.error("❌ Failed to exchange code for tokens:", error.message);
      
      if (error.message.includes("invalid_grant")) {
        console.log("\n💡 Possible issues:");
        console.log("   - Authorization code expired (try generating a new one)");
        console.log("   - Authorization code already used");
        console.log("   - Redirect URI mismatch in Google Cloud Console");
      }
      
      throw error;
    }
  }

  /**
   * Test email configuration and send test email
   */
  async testEmailConfiguration() {
    console.log("\n📧 Testing Email Configuration...\n");

    // Check all required environment variables
    const requiredVars = [
      "GMAIL_CLIENT_ID",
      "GMAIL_CLIENT_SECRET", 
      "GMAIL_REFRESH_TOKEN",
      "GMAIL_USER_EMAIL"
    ];

    const missingVars = requiredVars.filter(varName => !process.env[varName]);
    
    if (missingVars.length > 0) {
      console.log("❌ Missing environment variables:");
      missingVars.forEach(varName => console.log(`   - ${varName}`));
      console.log("\nPlease complete OAuth2 setup first:");
      console.log("   node scripts/email-manager.js setup");
      return;
    }

    console.log("✅ All environment variables found");
    console.log(`📧 Testing with email: ${process.env.GMAIL_USER_EMAIL}`);

    try {
      // Set refresh token
      this.oauth2Client.setCredentials({
        refresh_token: process.env.GMAIL_REFRESH_TOKEN,
      });

      console.log("✅ OAuth2 credentials set");

      // Get access token
      console.log("🔑 Getting access token...");
      const { token: accessToken } = await this.oauth2Client.getAccessToken();
      console.log("✅ Access token obtained");

      // Create email transporter
      console.log("📮 Creating email transporter...");
      const transporter = nodemailer.createTransport({
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

      console.log("✅ Email transporter created");

      // Send test email
      console.log("📤 Sending test email...");
      const result = await transporter.sendMail({
        from: `"${process.env.GMAIL_FROM_NAME || 'Scoutswinkel'}" <${process.env.GMAIL_USER_EMAIL}>`,
        to: process.env.GMAIL_USER_EMAIL,
        subject: "🧪 Scoutswinkel Email Test - " + new Date().toLocaleString("nl-NL"),
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">✅ Email Test Succesvol!</h2>
            <p>De email configuratie werkt correct voor de Scoutswinkel applicatie.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #374151;">Test Details:</h3>
              <p><strong>Tijd:</strong> ${new Date().toLocaleString("nl-NL")}</p>
              <p><strong>Van:</strong> ${process.env.GMAIL_USER_EMAIL}</p>
              <p><strong>OAuth2 Client ID:</strong> ${process.env.GMAIL_CLIENT_ID.substring(0, 20)}...</p>
            </div>
            
            <p style="color: #6b7280; font-size: 14px;">
              Dit is een automatische test van de Scoutswinkel email service.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            <p style="color: #10b981; font-weight: bold;">🎉 Email systeem is klaar voor gebruik!</p>
          </div>
        `,
      });

      console.log("✅ Test email sent successfully!");
      console.log(`📧 Message ID: ${result.messageId}`);
      console.log(`📬 Email sent to: ${process.env.GMAIL_USER_EMAIL}`);
      console.log("\n🎉 Email configuration is working perfectly!");

    } catch (error) {
      console.log("❌ Test email failed:");
      console.log(`   Error: ${error.message}`);
      
      if (error.message.includes("invalid_grant")) {
        console.log("\n💡 Tip: Your refresh token might be expired.");
        console.log("   Run: node scripts/email-manager.js setup");
      } else if (error.message.includes("Invalid login")) {
        console.log("\n💡 Possible issues:");
        console.log("   - Gmail account doesn't allow OAuth2 apps");
        console.log("   - Wrong email address in GMAIL_USER_EMAIL");
        console.log("   - OAuth2 credentials don't match the email account");
      }
      
      throw error;
    }
  }

  /**
   * Display help information
   */
  showHelp() {
    console.log("\n📧 Email Manager - Complete Email Setup Tool\n");
    console.log("Available commands:");
    console.log("  setup  - Generate OAuth2 authorization URL");
    console.log("  token  - Exchange authorization code for refresh token");
    console.log("  test   - Test email configuration");
    console.log("  help   - Show this help message\n");
    console.log("Usage examples:");
    console.log("  node scripts/email-manager.js setup");
    console.log("  node scripts/email-manager.js token 4/1AX4XfWjcb...");
    console.log("  node scripts/email-manager.js test\n");
    console.log("Environment variables needed:");
    console.log("  GMAIL_CLIENT_ID      - OAuth2 client ID from Google Console");
    console.log("  GMAIL_CLIENT_SECRET  - OAuth2 client secret from Google Console");
    console.log("  GMAIL_REFRESH_TOKEN  - Generated refresh token (via token command)");
    console.log("  GMAIL_USER_EMAIL     - Gmail address to send emails from");
    console.log("  GMAIL_FROM_NAME      - Display name for outgoing emails (optional)\n");
  }
}

// Main execution
async function main() {
  const emailManager = new EmailManager();
  const command = process.argv[2];
  const argument = process.argv[3];

  try {
    switch (command) {
      case "setup":
        emailManager.generateAuthUrl();
        break;
        
      case "token":
        if (!argument) {
          console.log("❌ Please provide the authorization code:");
          console.log("   node scripts/email-manager.js token YOUR_AUTH_CODE");
          process.exit(1);
        }
        await emailManager.exchangeCodeForToken(argument);
        break;
        
      case "test":
        await emailManager.testEmailConfiguration();
        break;
        
      case "help":
      case "--help":
      case "-h":
        emailManager.showHelp();
        break;
        
      default:
        console.log("❌ Unknown command:", command || "(none)");
        emailManager.showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = EmailManager;
