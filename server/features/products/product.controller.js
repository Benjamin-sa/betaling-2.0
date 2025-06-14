// server/controllers/product.controller.js
const BaseController = require("../../core/controllers/base.controller");
const firebaseService = require("../../core/services/firebase-cached.service");
const stripeService = require("../../core/services/stripe.service");
const imageManager = require("../../core/services/imageManager.service");
const { ProductFields } = require("../../models/webstore.model");

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
  async _cleanupResources(imageUrl, stripeProductId = null) {
    const cleanupPromises = [];

    if (imageUrl) {
      cleanupPromises.push(
        imageManager
          .deleteImage(imageUrl)
          .catch((error) =>
            console.error("Failed to cleanup uploaded image:", error)
          )
      );
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
    const image = req.file;

    // Validate required fields
    const validation = this._validateRequiredFields(req.body, [
      "name",
      "price",
      "eventId",
    ]);
    if (!validation.isValid) {
      return this._sendErrorResponse(
        res,
        validation.message,
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify event exists
    const event = await firebaseService.getEvent(eventId);
    if (!event) {
      return this._sendErrorResponse(
        res,
        "Event not found",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate requiresTimeslot based on event type
    const requiresTimeslotBool = requiresTimeslot === "true" || requiresTimeslot === true;
    
    if (event.type === "shift_event" && requiresTimeslotBool) {
      // For shift events: products with requiresTimeslot=true are valid (they MUST have shifts)
    } else if (event.type === "shift_event" && !requiresTimeslotBool) {
      // For shift events: products with requiresTimeslot=false are also valid
    } else if (event.type === "product_sale" && requiresTimeslotBool) {
      // For product_sale events: products with requiresTimeslot=true are NOT allowed
      return this._sendErrorResponse(
        res,
        "Products in product_sale events cannot require timeslots",
        this.HTTP_STATUS.BAD_REQUEST
      );
    }
    // For product_sale events with requiresTimeslot=false: always valid

    this._logAction("Creating new product", { name, price, eventId });

    let imageUrl = null;
    let stripeProduct = null;

    try {
      // 1. Upload image if provided
      if (image) {
        imageUrl = await this._uploadProductImage(image);
      }

      // 2. Create product in Stripe
      stripeProduct = await stripeService.createProduct({
        name,
        description,
        price,
        imageUrl,
      });

      // 3. Create product data for database
      const productData = this._createProductData(
        name,
        description,
        price,
        eventId,
        imageUrl,
        stripeProduct,
        requiresTimeslot
      );

      // 4. Save to Firebase
      const productId = await firebaseService.createProduct(productData);

      this._logAction("Product created successfully", { productId });
      this._sendSuccessResponse(
        res,
        { productId, product: productData },
        this.SUCCESS_MESSAGES.CREATED,
        this.HTTP_STATUS.CREATED
      );
    } catch (error) {
      this._logAction("Product creation failed, cleaning up resources", {
        error: error.message,
      });

      // Cleanup on failure
      await this._cleanupResources(imageUrl, stripeProduct?.product?.id);
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
    const validation = this._validateRequiredFields(req.params, ["productId"]);
    if (!validation.isValid) {
      return this._sendErrorResponse(
        res,
        validation.message,
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

    // 3. Delete image if exists
    if (product.image) {
      await this._deleteProductImage(product.image);
    }

    // 4. Delete from Firebase
    await firebaseService.deleteProduct(productId);

    this._logAction("Product deleted successfully", { productId });
    this._sendSuccessResponse(res, {}, this.SUCCESS_MESSAGES.DELETED);
  }

  /**
   * Upload product image with error handling
   * @private
   */
  async _uploadProductImage(image) {
    return await imageManager.uploadImage(
      image.buffer,
      image.originalname,
      image.mimetype,
      "products"
    );
  }

  /**
   * Delete product image with error handling
   * @private
   */
  async _deleteProductImage(image) {
    try {
      await imageManager.deleteImage(image);
      this._logAction("Product image deleted successfully");
    } catch (imageError) {
      this._logAction("Error deleting product image", {
        error: imageError.message,
      });
      // Continue with product deletion even if image deletion fails
    }
  }

  /**
   * Create product data object with proper field mapping
   * @private
   */
  _createProductData(
    name,
    description,
    price,
    eventId,
    imageUrl,
    stripeResult,
    requiresTimeslot = false
  ) {
    return {
      [ProductFields.NAME]: name,
      [ProductFields.DESCRIPTION]: description,
      [ProductFields.PRICE]: parseFloat(price),
      [ProductFields.EVENT_ID]: eventId,
      [ProductFields.IMAGE]: imageUrl,
      [ProductFields.STRIPE_PRODUCT_ID]: stripeResult.product.id,
      [ProductFields.STRIPE_PRICE_ID]: stripeResult.price.id,
      [ProductFields.REQUIRES_TIMESLOT]:
        requiresTimeslot === "true" || requiresTimeslot === true,
      [ProductFields.CREATED_AT]: new Date().toISOString(),
    };
  }
}

module.exports = new ProductController();
