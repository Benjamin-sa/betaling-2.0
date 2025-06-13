// server/services/imageManager.service.js
const imageStorageApp = require("../../config/firebaseImages");
const { v4: uuidv4 } = require("uuid");

class ImageManagerService {
  constructor() {
    // Get the storage bucket from the images Firebase app
    this.bucket = imageStorageApp.storage().bucket();
  }

  /**
   * Upload an image to Firebase Storage and return the public URL
   * @param {Buffer} imageBuffer - The image file buffer
   * @param {string} originalName - Original filename
   * @param {string} mimeType - MIME type of the image
   * @param {string} folder - Optional folder path (e.g., 'products', 'users')
   * @returns {Promise<string>} - Public URL of the uploaded image
   */
  async uploadImage(imageBuffer, originalName, mimeType, folder = "images") {
    try {
      // Generate unique filename
      const fileExtension = originalName.split(".").pop();
      const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;

      // Create file reference in bucket
      const file = this.bucket.file(uniqueFileName);

      // Upload the file
      await file.save(imageBuffer, {
        metadata: {
          contentType: mimeType,
          metadata: {
            originalName: originalName,
            uploadedAt: new Date().toISOString(),
          },
        },
        public: true, // Make the file publicly accessible
      });

      // Make the file public and get the public URL
      await file.makePublic();

      // Return the public URL
      const publicUrl = `https://storage.googleapis.com/${this.bucket.name}/${uniqueFileName}`;

      console.log(`Image uploaded successfully: ${publicUrl}`);
      return publicUrl;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw new Error(`Failed to upload image: ${error.message}`);
    }
  }

  /**
   * Delete an image from Firebase Storage
   * @param {string} imageUrl - The public URL of the image to delete
   * @returns {Promise<boolean>} - Success status
   */
  async deleteImage(imageUrl) {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split("/");
      const fileName = urlParts[urlParts.length - 1];
      const folderName = urlParts[urlParts.length - 2];
      const filePath = `${folderName}/${fileName}`;

      // Delete the file
      await this.bucket.file(filePath).delete();

      console.log(`Image deleted successfully: ${filePath}`);
      return true;
    } catch (error) {
      console.error("Error deleting image:", error);
      throw new Error(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Check if the service is properly configured
   * @returns {boolean} - Configuration status
   */
  isConfigured() {
    try {
      return this.bucket && this.bucket.name;
    } catch (error) {
      return false;
    }
  }
}

// Export singleton instance
module.exports = new ImageManagerService();
