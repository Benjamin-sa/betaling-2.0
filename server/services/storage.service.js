// server/services/storage.service.js
const admin = require("../config/firebaseAdmin");
const { v4: uuidv4 } = require("uuid");

class StorageService {
  constructor() {
    this.db = admin.firestore();
  }

  async uploadImage(file, productId) {
    try {
      const imageBuffer = file.buffer;
      const imageType = file.mimetype;

      await this.db
        .collection("products")
        .doc(productId)
        .update({
          image: imageBuffer.toString("base64"),
          imageType: imageType,
        });

      return productId;
    } catch (error) {
      throw error;
    }
  }
  async getAllProducts() {
    try {
      const snapshot = await this.db.collection("products").get();
      const products = [];

      snapshot.forEach((doc) => {
        const data = doc.data();
        products.push({
          id: doc.id,
          name: data.name,
          description: data.description,
          price: data.price,
          stripe_product_id: data.stripeProductId,
          stripe_price_id: data.stripePriceId,
          created_at: data.createdAt,
          requires_timeslot: data.requiresTimeslot,
          imageUrl: `/api/products/${doc.id}/image`,
        });
      });

      return products;
    } catch (error) {
      throw error;
    }
  }

  async getProduct(productId) {
    try {
      const doc = await this.db.collection("products").doc(productId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        price: data.price,
        stripe_product_id: data.stripeProductId,
        stripe_price_id: data.stripePriceId,
        created_at: data.createdAt,
        requires_timeslot: data.requiresTimeslot,
        imageUrl: `/api/products/${doc.id}/image`,
      };
    } catch (error) {
      throw error;
    }
  }

  async getProductImage(productId) {
    try {
      const doc = await this.db.collection("products").doc(productId).get();

      if (!doc.exists) {
        return null;
      }

      const data = doc.data();
      return {
        image: data.image,
        image_type: data.imageType,
      };
    } catch (error) {
      throw error;
    }
  }

  async saveProduct({
    name,
    description,
    price,
    image,
    imageType,
    stripeProductId,
    stripePriceId,
    requiresTimeslot,
  }) {
    try {
      const id = uuidv4();

      await this.db
        .collection("products")
        .doc(id)
        .set({
          name,
          description,
          price,
          image,
          imageType,
          stripeProductId,
          stripePriceId,
          requiresTimeslot: requiresTimeslot ? true : false,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        id,
        name,
        description,
        price,
        imageUrl: `/api/products/${id}/image`,
        stripeProductId,
        stripePriceId,
        requiresTimeslot: requiresTimeslot ? true : false,
      };
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      await this.db.collection("products").doc(productId).delete();
      return { id: productId };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = new StorageService();
