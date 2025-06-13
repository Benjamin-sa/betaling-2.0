// server/controllers/product.controller.js
const firebaseService = require("../../core/services/firebase.service");
const stripeService = require("../../core/services/stripe.service");
const imageManager = require("../../core/services/imageManager.service");

class ProductController {
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
   * Get all products
   */
  async getAllProducts(req, res) {
    try {
      const products = await firebaseService.getAllProducts();

      res.json({ products });
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ error: "Failed to fetch products" });
    }
  }
  /**
   * Create a new product
   */
  async createProduct(req, res) {
    const { name, description, price } = req.body;
    const image = req.file;
    let imageUrl = null;
    let stripeProduct = null;

    try {
      // Validate input
      if (!name || !price) {
        return res.status(400).json({ error: "Naam en prijs zijn verplicht." });
      }

      // Upload image if provided
      if (image) {
        imageUrl = await imageManager.uploadImage(
          image.buffer,
          image.originalname,
          image.mimetype,
          "products"
        );
      }

      // Create product in Stripe
      const stripeResult = await stripeService.createProduct({
        name,
        description,
        price,
        imageUrl,
      });

      const stripeProduct = stripeResult.product;
      const stripePrice = stripeResult.price;

      // Save product to Firebase
      const savedProduct = await firebaseService.createProduct({
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        stripeProductId: stripeProduct.id,
        stripePriceId: stripePrice.id,
      });

      // Success response
      res.status(201).json({
        product: {
          ...savedProduct,
        },
      });
    } catch (error) {
      console.error("Error creating product:", error);

      // Cleanup resources on any failure
      await this._cleanupResources(imageUrl, stripeProduct?.id);

      // Return appropriate error response
      if (error.message?.includes("upload")) {
        return res.status(500).json({ error: "Failed to upload image" });
      } else if (error.message?.includes("Stripe")) {
        return res.status(500).json({
          error:
            "Er is een fout opgetreden bij het aanmaken van het product in Stripe.",
        });
      } else {
        return res.status(500).json({
          error: "Er is een fout opgetreden bij het toevoegen van het product.",
        });
      }
    }
  }

  /**
   * Delete a product
   */
  async deleteProduct(req, res) {
    try {
      const { productId } = req.params;

      // First get the product to get Stripe ID and image URL
      const product = await firebaseService.getProduct(productId);
      if (!product) {
        return res.status(404).json({ error: "Product niet gevonden." });
      }

      // Deactivate product in Stripe first
      await stripeService.deactivateProduct(product.stripeProductId);

      // Delete image from storage if it exists
      if (product.imageUrl) {
        try {
          await imageManager.deleteImage(product.imageUrl);
          console.log("Product image deleted successfully");
        } catch (imageError) {
          console.error("Error deleting product image:", imageError);
          // Continue with product deletion even if image deletion fails
        }
      }

      // Then delete from Firebase
      const result = await firebaseService.deleteProduct(productId);

      res.json({
        message: "Product succesvol verwijderd uit Firebase, Stripe en opslag.",
        product: result,
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({
        error: "Er is een fout opgetreden bij het verwijderen van het product.",
      });
    }
  }
}

module.exports = new ProductController();
