// server/controllers/product.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");
const stripeService = require("../../core/services/stripe.service");
const firebaseStorageService = require("../../core/services/firebase-storage.service");
const {
  ProductFields,
  createProductData,
  createProductUpdateData,
} = require("../../models/webstore.model");

// Product-specific error messages
const PRODUCT_ERROR_MESSAGES = {
  FETCH_PRODUCTS_FAILED: "Failed to fetch products",
  CREATE_PRODUCT_FAILED: "Failed to create product",
  DELETE_PRODUCT_FAILED: "Failed to delete product",
  PRODUCT_NOT_FOUND: "Product not found",
};

class ProductController extends BaseController {
  /**
   * Clean up resources on failure
   */
  async _cleanupResources(imageUrls, stripeProductId = null) {
    const cleanupPromises = [];

    // Handle both single imageUrl (string) and multiple imageUrls (array)
    if (imageUrls) {
      const urlsToDelete = Array.isArray(imageUrls) ? imageUrls : [imageUrls];

      urlsToDelete.forEach((imageUrl) => {
        if (imageUrl) {
          cleanupPromises.push(
            firebaseStorageService
              .deleteImage(imageUrl)
              .catch((error) =>
                console.error("Failed to cleanup uploaded image:", error)
              )
          );
        }
      });
    }

    if (stripeProductId) {
      cleanupPromises.push(
        stripeService
          .deactivateProduct(stripeProductId)
          .catch((error) =>
            console.error("Failed to cleanup Stripe product:", error)
          )
      );
    }

    await Promise.all(cleanupPromises);
  }

  /**
   * Get all products with proper error handling
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getAllProducts(req, res) {
    await this._handleAsync(this._getAllProductsHandler, req, res);
  }

  /**
   * Internal handler for getting all products
   * @private
   */
  async _getAllProductsHandler(req, res) {
    const { eventId } = req.query;

    this._logAction("Fetching products", { eventId });

    let products;
    if (eventId) {
      // Get products for specific event
      products = await firebaseService.getProductsByEvent(eventId);
    } else {
      // Get all products
      products = await firebaseService.getAllProducts();
    }

    this._sendSuccessResponse(res, { products });
  }
  /**
   * Create a new product with proper validation and error handling
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async createProduct(req, res) {
    await this._handleAsync(this._createProductHandler, req, res);
  }

  /**
   * Internal handler for creating products
   * @private
   */
  async _createProductHandler(req, res) {
    const { name, description, price, eventId, requiresTimeslot } = req.body;
    const images = req.files; // Changed from req.file to req.files for multiple images

    this._logAction("Creating new product", {
      name,
      price,
      eventId,
      imageCount: images ? images.length : 0,
    });

    // Get event data for validation
    const event = await firebaseService.getEvent(eventId);
    if (!event) {
      return this._sendErrorResponse(
        res,
        "Event not found",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    let imageUrls = [];
    let stripeProduct = null;

    try {
      // 1. Upload images if provided
      if (images && images.length > 0) {
        this._logAction("Uploading product images", { count: images.length });
        imageUrls = await this._uploadProductImages(images);
      }

      // 2. Create product in Stripe (use first image as main image for Stripe)
      const mainImageUrl = imageUrls.length > 0 ? imageUrls[0] : null;
      stripeProduct = await stripeService.createProduct({
        name,
        description,
        price,
        imageUrl: mainImageUrl,
      });

      // 3. Create product data using factory function with validation
      const productData = createProductData(
        {
          [ProductFields.NAME]: name,
          [ProductFields.DESCRIPTION]: description,
          [ProductFields.PRICE]: price,
          [ProductFields.EVENT_ID]: eventId,
          [ProductFields.IMAGE]: mainImageUrl, // Keep single image field for backward compatibility
          [ProductFields.IMAGES]: imageUrls, // Add new images array field
          [ProductFields.STRIPE_PRODUCT_ID]: stripeProduct.product.id,
          [ProductFields.STRIPE_PRICE_ID]: stripeProduct.price.id,
          [ProductFields.REQUIRES_TIMESLOT]: requiresTimeslot,
          [ProductFields.IS_TEST_MODE]: stripeProduct.isTestMode,
        },
        {
          event, // Pass event for business logic validation
        }
      );

      // 4. Save to Firebase
      const productId = await firebaseService.createProduct(productData);

      this._logAction("Product created successfully", {
        productId,
        imagesUploaded: imageUrls.length,
      });
      this._sendSuccessResponse(
        res,
        { productId, product: productData },
        this.SUCCESS_MESSAGES.CREATED,
        this.HTTP_STATUS.CREATED
      );
    } catch (error) {
      this._logAction("Product creation failed, cleaning up resources", {
        error: error.message,
        imagesToCleanup: imageUrls.length,
      });

      // Cleanup on failure
      await this._cleanupResources(imageUrls, stripeProduct?.product?.id);
      throw error; // Re-throw to be handled by _handleAsync
    }
  }

  /**
   * Delete a product with proper cleanup
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async deleteProduct(req, res) {
    await this._handleAsync(this._deleteProductHandler, req, res);
  }

  /**
   * Internal handler for deleting products
   * @private
   */
  async _deleteProductHandler(req, res) {
    const { productId } = req.params;

    // Validate required fields
    if (!productId) {
      return this._sendErrorResponse(
        res,
        "Product ID is required",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    this._logAction("Deleting product", { productId });

    // 1. Get product details
    const product = await firebaseService.getProduct(productId);
    if (!product) {
      return this._sendErrorResponse(
        res,
        PRODUCT_ERROR_MESSAGES.PRODUCT_NOT_FOUND,
        this.HTTP_STATUS.NOT_FOUND
      );
    }

    // 2. Deactivate in Stripe
    if (product.stripeProductId) {
      await stripeService.deactivateProduct(product.stripeProductId);
    }

    // 3. Delete images if they exist (handle both legacy single image and new images array)
    const imagesToDelete = [];
    if (product.image) {
      imagesToDelete.push(product.image);
    }
    if (product.images && Array.isArray(product.images)) {
      imagesToDelete.push(...product.images);
    }
    
    if (imagesToDelete.length > 0) {
      await this._deleteProductImage(imagesToDelete);
    }

    // 4. Delete from Firebase
    await firebaseService.deleteProduct(productId);

    this._logAction("Product deleted successfully", { productId });
    this._sendSuccessResponse(res, {}, this.SUCCESS_MESSAGES.DELETED);
  }

  /**
   * Upload single product image to Firebase Storage
   * @private
   */
  async _uploadProductImage(image) {
    return await firebaseStorageService.uploadImage(
      image.buffer,
      image.originalname,
      image.mimetype,
      "products"
    );
  }

  /**
   * Upload multiple product images to Firebase Storage
   * @private
   */
  async _uploadProductImages(images) {
    const uploadPromises = images.map((image, index) => {
      // Add index to filename to ensure uniqueness
      const uniqueFilename = `${Date.now()}_${index}_${image.originalname}`;
      return firebaseStorageService.uploadImage(
        image.buffer,
        uniqueFilename,
        image.mimetype,
        "products"
      );
    });

    try {
      const imageUrls = await Promise.all(uploadPromises);
      this._logAction("Multiple product images uploaded successfully", { count: imageUrls.length });
      return imageUrls;
    } catch (error) {
      this._logAction("Error uploading product images", { error: error.message });
      throw error;
    }
  }

  /**
   * Delete product image(s) with error handling
   * @private
   */
  async _deleteProductImage(images) {
    try {
      // Handle both single image (string) and multiple images (array)
      const imagesToDelete = Array.isArray(images) ? images : [images];
      
      const deletePromises = imagesToDelete.map(imageUrl => {
        if (imageUrl) {
          return firebaseStorageService.deleteImage(imageUrl);
        }
      }).filter(Boolean); // Remove null/undefined promises

      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
        this._logAction("Product image(s) deleted successfully", { count: deletePromises.length });
      }
    } catch (imageError) {
      this._logAction("Error deleting product image(s)", {
        error: imageError.message,
      });
      // Continue with product deletion even if image deletion fails
    }
  }
}

module.exports = new ProductController();
