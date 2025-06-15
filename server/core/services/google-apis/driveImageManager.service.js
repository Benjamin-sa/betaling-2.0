// server/core/services/driveImageManager.service.js
const { google } = require("googleapis");
const googleOAuth2Service = require("./google-oauth.service");
const { v4: uuidv4 } = require("uuid");
const { Readable } = require("stream");
const path = require("path");

/**
 * Google Drive Image Manager Service
 * Uses the centralized Google OAuth2 service to manage images in Google Drive
 * Provides similar functionality to Firebase Storage but using Google Drive
 */
class DriveImageManagerService {
  constructor() {
    this.drive = null;
    this.isInitialized = false;
    this.FOLDER_NAME = "Scoutswinkel Images"; // Main folder for all images
    this.folderId = null; // Will be set after creating/finding the folder
  }

  /**
   * Initialize Drive API client using centralized OAuth2 service
   */
  async initialize() {
    try {
      const oauth2Client = await googleOAuth2Service.getAuthenticatedClient();

      if (!oauth2Client) {
        console.log("⚠️ Drive service not authenticated");
        this.isInitialized = false;
        return false;
      }

      // Test if the token has Drive scope by attempting to access Drive
      try {
        this.drive = google.drive({ version: "v3", auth: oauth2Client });
        await this.drive.about.get({ fields: "user" });

        this.isInitialized = true;
        console.log("✅ Drive Image Manager service initialized");

        // Initialize the main folder
        await this.ensureMainFolder();
        return true;
      } catch (scopeError) {
        if (scopeError.message.includes("insufficient authentication scopes")) {
          console.log(
            "⚠️ Current token doesn't have Drive scope. Re-authentication required."
          );
          console.log(
            "💡 Run the Gmail setup again to get a token with Drive permissions."
          );
          this.isInitialized = false;
          return false;
        }
        throw scopeError;
      }
    } catch (error) {
      console.error(
        "❌ Failed to initialize Drive Image Manager:",
        error.message
      );
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if Drive service is authenticated and ready
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
   * Ensure the main "Scoutswinkel Images" folder exists
   */
  async ensureMainFolder() {
    try {
      if (!this.isInitialized) {
        throw new Error("Drive service not initialized");
      }

      // Search for existing folder
      const response = await this.drive.files.list({
        q: `name='${this.FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        this.folderId = response.data.files[0].id;
        console.log(
          `✅ Found existing folder: ${this.FOLDER_NAME} (${this.folderId})`
        );
      } else {
        // Create the main folder
        const folderMetadata = {
          name: this.FOLDER_NAME,
          mimeType: "application/vnd.google-apps.folder",
        };

        const folder = await this.drive.files.create({
          resource: folderMetadata,
          fields: "id",
        });

        this.folderId = folder.data.id;
        console.log(
          `✅ Created main folder: ${this.FOLDER_NAME} (${this.folderId})`
        );
      }
    } catch (error) {
      console.error("❌ Failed to ensure main folder:", error.message);
      throw error;
    }
  }

  /**
   * Get or create a subfolder for organizing images
   * @param {string} folderName - Name of the subfolder (e.g., 'products', 'events')
   * @returns {Promise<string>} - Folder ID
   */
  async ensureSubfolder(folderName) {
    try {
      if (!this.folderId) {
        throw new Error("Main folder not initialized");
      }

      // Search for existing subfolder
      const response = await this.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and '${this.folderId}' in parents and trashed=false`,
        fields: "files(id, name)",
      });

      if (response.data.files.length > 0) {
        return response.data.files[0].id;
      } else {
        // Create the subfolder
        const folderMetadata = {
          name: folderName,
          mimeType: "application/vnd.google-apps.folder",
          parents: [this.folderId],
        };

        const folder = await this.drive.files.create({
          resource: folderMetadata,
          fields: "id",
        });

        console.log(`✅ Created subfolder: ${folderName} (${folder.data.id})`);
        return folder.data.id;
      }
    } catch (error) {
      console.error(
        `❌ Failed to ensure subfolder ${folderName}:`,
        error.message
      );
      throw error;
    }
  }

  /**
   * Upload an image to Google Drive and return a shareable URL
   * @param {Buffer} imageBuffer - The image file buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - MIME type of the image
   * @param {string} folder - Optional folder path (e.g., 'products', 'events')
   * @returns {Promise<string>} - Shareable URL for public access
   */
  async uploadImage(imageBuffer, originalName, mimeType, folder = "products") {
    try {
      if (!(await this.isAuthenticated())) {
        throw new Error("Drive service not authenticated");
      }

      // Get or create subfolder
      const subfolderId = await this.ensureSubfolder(folder);

      // Generate unique filename with proper extension
      const fileExtension = path.extname(originalName).toLowerCase();
      const baseName = path.basename(originalName, fileExtension);
      const uniqueFileName = `${baseName}_${uuidv4()}${fileExtension}`;

      // Upload file metadata
      const fileMetadata = {
        name: uniqueFileName,
        parents: [subfolderId],
      };

      console.log(
        `📤 Uploading file: ${uniqueFileName} (${imageBuffer.length} bytes)`
      );

      // Create a readable stream from the buffer
      const bufferStream = Readable.from(imageBuffer);

      const media = {
        mimeType: mimeType,
        body: bufferStream,
      };

      // Upload the file
      const file = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: "id, name, webViewLink, webContentLink",
      });

      // Make the file publicly viewable
      await this.drive.permissions.create({
        fileId: file.data.id,
        resource: {
          role: "reader",
          type: "anyone",
        },
      });

      // Generate direct image URL that works with <img> tags
      // Use the direct download format which works better for embedding
      const imageUrl = `https://lh3.googleusercontent.com/d/${file.data.id}`;

      console.log(`✅ Image uploaded successfully: ${uniqueFileName}`);
      console.log(`📎 File ID: ${file.data.id}`);
      console.log(`🔗 Public URL: ${imageUrl}`);
      console.log(
        `🔗 Fallback URL: https://drive.google.com/uc?export=download&id=${file.data.id}`
      );

      return imageUrl;
    } catch (error) {
      console.error("❌ Error uploading image to Drive:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete an image from Google Drive
   * @param {string} imageUrl - The Drive image URL or file ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteImage(imageUrl) {
    try {
      if (!(await this.isAuthenticated())) {
        throw new Error("Drive service not authenticated");
      }

      let fileId;

      // Extract file ID from URL
      if (imageUrl.includes("drive.google.com/uc")) {
        const match = imageUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
        }
      } else if (imageUrl.includes("drive.google.com/file/d/")) {
        const match = imageUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (match) {
          fileId = match[1];
        }
      } else {
        // Assume it's already a file ID
        fileId = imageUrl;
      }

      if (!fileId) {
        throw new Error("Could not extract file ID from URL");
      }

      // Delete the file
      await this.drive.files.delete({
        fileId: fileId,
      });

      console.log(`✅ Image deleted successfully: ${fileId}`);
      return true;
    } catch (error) {
      console.error("❌ Error deleting image from Drive:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - Configuration status
   */
  isConfigured() {
    return this.isInitialized && this.folderId !== null;
  }

  /**
   * Get service status for debugging
   * @returns {object} - Service status
   */
  async getStatus() {
    try {
      const authStatus = await googleOAuth2Service.getAuthStatus();

      return {
        initialized: this.isInitialized,
        authenticated: authStatus.authenticated,
        email: authStatus.email,
        mainFolderId: this.folderId,
        folderName: this.FOLDER_NAME,
      };
    } catch (error) {
      return {
        initialized: false,
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
   * Reload the service with fresh token
   */
  async reloadToken() {
    try {
      this.isInitialized = false;
      this.folderId = null;
      this.drive = null;

      const success = await googleOAuth2Service.reloadToken();
      if (success) {
        await this.initialize();
      }

      return this.isInitialized;
    } catch (error) {
      console.error("❌ Failed to reload Drive token:", error.message);
      return false;
    }
  }
}

// Export singleton instance
module.exports = new DriveImageManagerService();
