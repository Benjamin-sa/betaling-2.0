// server/core/services/firebase-storage.service.js
const { bucket } = require("../../config/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

/**
 * Firebase Storage Image Manager Service
 * Provides image upload/download functionality using Firebase Storage
 * Replaces the Google Drive image manager with a simpler, more integrated solution
 */
class FirebaseStorageService {
  constructor() {
    this.isInitialized = false;
    this.storageBucket = bucket;
    this.FOLDER_STRUCTURE = {
      products: "images/products",
      events: "images/events",
      general: "images/general",
    };

    this.initialize();
  }

  /**
   * Initialize Firebase Storage service
   */
  async initialize() {
    try {
      // Test bucket access
      await this.storageBucket.exists();
      this.isInitialized = true;
      console.log("✅ Firebase Storage service initialized successfully");
      return true;
    } catch (error) {
      console.error("❌ Failed to initialize Firebase Storage:", error.message);
      this.isInitialized = false;
      return false;
    }
  }

  /**
   * Check if the service is ready to use
   * @returns {boolean} - Service readiness status
   */
  isAuthenticated() {
    return this.isInitialized;
  }

  /**
   * Upload an image to Firebase Storage and return a public URL
   * @param {Buffer} imageBuffer - The image file buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - MIME type of the image
   * @param {string} folder - Optional folder path (e.g., 'products', 'events')
   * @returns {Promise<string>} - Public URL for the uploaded image
   */
  async uploadImage(imageBuffer, originalName, mimeType, folder = "products") {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Firebase Storage service not initialized");
      }

      // Validate folder
      const folderPath =
        this.FOLDER_STRUCTURE[folder] || this.FOLDER_STRUCTURE.general;

      // Generate unique filename with proper extension
      const fileExtension = path.extname(originalName).toLowerCase();
      const baseName = path.basename(originalName, fileExtension);
      const uniqueFileName = `${baseName}_${uuidv4()}${fileExtension}`;
      const filePath = `${folderPath}/${uniqueFileName}`;

      console.log(
        `📤 Uploading image: ${uniqueFileName} (${imageBuffer.length} bytes)`
      );

      // Create file reference
      const file = this.storageBucket.file(filePath);

      // Upload the file
      await file.save(imageBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: originalName,
            uploadedAt: new Date().toISOString(),
            folder: folder,
          },
        },
        public: true, // Make file publicly accessible
        resumable: false, // Use simple upload for images
      });

      // Make the file publicly readable
      await file.makePublic();

      // Generate public URL
      const publicUrl = `https://storage.googleapis.com/${this.storageBucket.name}/${filePath}`;

      console.log(`✅ Image uploaded successfully: ${uniqueFileName}`);
      console.log(`🔗 Public URL: ${publicUrl}`);

      return publicUrl;
    } catch (error) {
      console.error("❌ Error uploading image to Firebase Storage:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete an image from Firebase Storage
   * @param {string} imageUrl - The Firebase Storage image URL or file path
   * @returns {Promise<boolean>} - Success status
   */
  async deleteImage(imageUrl) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Firebase Storage service not initialized");
      }

      let filePath;

      // Extract file path from URL
      if (imageUrl.includes("storage.googleapis.com")) {
        // Extract path from public URL
        // Format: https://storage.googleapis.com/bucket-name/path/to/file
        const urlParts = imageUrl.split(`${this.storageBucket.name}/`);
        if (urlParts.length === 2) {
          filePath = urlParts[1];
        }
      } else if (imageUrl.includes("firebasestorage.googleapis.com")) {
        // Handle Firebase Storage URLs
        // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile?alt=media&token=...
        const match = imageUrl.match(/\/o\/(.+?)\?/);
        if (match) {
          filePath = decodeURIComponent(match[1]);
        }
      } else {
        // Assume it's already a file path
        filePath = imageUrl;
      }

      if (!filePath) {
        throw new Error("Could not extract file path from URL");
      }

      console.log(`🗑️ Deleting image: ${filePath}`);

      // Delete the file
      const file = this.storageBucket.file(filePath);
      await file.delete();

      console.log(`✅ Image deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      console.error("❌ Error deleting image from Firebase Storage:", error);

      // If file doesn't exist, consider it a success
      if (error.code === 404 || error.message.includes("No such object")) {
        console.log("ℹ️ Image file not found, considering deletion successful");
        return true;
      }

      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - Configuration status
   */
  isConfigured() {
    return this.isInitialized;
  }

  /**
   * Get service status for debugging
   * @returns {object} - Service status
   */
  async getStatus() {
    try {
      const [bucketExists] = await this.storageBucket.exists();

      return {
        initialized: this.isInitialized,
        authenticated: this.isInitialized,
        bucketName: this.storageBucket.name,
        bucketExists: bucketExists,
        folders: this.FOLDER_STRUCTURE,
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
   * List images in a specific folder (for admin/debugging)
   * @param {string} folder - Folder name ('products', 'events', etc.)
   * @param {number} limit - Maximum number of files to return
   * @returns {Promise<Array>} - Array of file information
   */
  async listImages(folder = "products", limit = 100) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Firebase Storage service not initialized");
      }

      const folderPath =
        this.FOLDER_STRUCTURE[folder] || this.FOLDER_STRUCTURE.general;

      const [files] = await this.storageBucket.getFiles({
        prefix: folderPath + "/",
        maxResults: limit,
      });

      const imageList = files.map((file) => ({
        name: file.name,
        publicUrl: `https://storage.googleapis.com/${this.storageBucket.name}/${file.name}`,
        created: file.metadata.timeCreated,
        size: file.metadata.size,
        contentType: file.metadata.contentType,
      }));

      return imageList;
    } catch (error) {
      console.error("❌ Error listing images:", error);
      throw new Error(`Failed to list images: ${error.message}`);
    }
  }

  /**
   * Get image metadata
   * @param {string} imageUrl - The image URL
   * @returns {Promise<object>} - Image metadata
   */
  async getImageMetadata(imageUrl) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("Firebase Storage service not initialized");
      }

      // Extract file path from URL (same logic as deleteImage)
      let filePath;
      if (imageUrl.includes("storage.googleapis.com")) {
        const urlParts = imageUrl.split(`${this.storageBucket.name}/`);
        if (urlParts.length === 2) {
          filePath = urlParts[1];
        }
      } else {
        filePath = imageUrl;
      }

      if (!filePath) {
        throw new Error("Could not extract file path from URL");
      }

      const file = this.storageBucket.file(filePath);
      const [metadata] = await file.getMetadata();

      return {
        name: metadata.name,
        size: metadata.size,
        contentType: metadata.contentType,
        created: metadata.timeCreated,
        updated: metadata.updated,
        publicUrl: `https://storage.googleapis.com/${this.storageBucket.name}/${filePath}`,
      };
    } catch (error) {
      console.error("❌ Error getting image metadata:", error);
      throw new Error(`Failed to get image metadata: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new FirebaseStorageService();
