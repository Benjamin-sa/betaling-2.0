// server/services/storage.service.js
const db = require('../db');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  constructor() {
    this.db = db.instance;
  }

  async uploadImage(file, productId) {
    return new Promise((resolve, reject) => {
      const imageBuffer = file.buffer;
      const imageType = file.mimetype;

      this.db.run(
        `UPDATE products SET image = ?, imageType = ? WHERE id = ?`,
        [imageBuffer, imageType, productId],
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(productId);
        }
      );
    });
  }
  async getAllProducts() {
    return new Promise((resolve, reject) => {
      this.db.all(
        `SELECT id, name, description, price, stripe_product_id, stripe_price_id, created_at 
         FROM products`,
        [],
        (err, rows) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(rows.map(row => ({
            ...row,
            imageUrl: `/api/products/${row.id}/image`
          })));
        }
      );
    });
  }

  async getProduct(productId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT * FROM products WHERE id = ?`,
        [productId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          if (row) {
            resolve({
              ...row,
              imageUrl: `/api/products/${row.id}/image`
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  }

  async getProductImage(productId) {
    return new Promise((resolve, reject) => {
      this.db.get(
        `SELECT image, image_type FROM products WHERE id = ?`,
        [productId],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(row);
        }
      );
    });
  }

  async saveProduct({ name, description, price, image, imageType, stripeProductId, stripePriceId }) {
    return new Promise((resolve, reject) => {
      const id = uuidv4();

      this.db.run(
        `INSERT INTO products (
          id, name, description, price, image, image_type,
          stripe_product_id, stripe_price_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, name, description, price, image, imageType, stripeProductId, stripePriceId],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({
            id,
            name,
            description,
            price,
            imageUrl: `/api/products/${id}/image`,
            stripeProductId,
            stripePriceId
          });
        }
      );
    });
  }

  async deleteProduct(productId) {
    return new Promise((resolve, reject) => {
      // Hard delete by removing the row
      this.db.run(
        `DELETE FROM products WHERE id = ?`,
        [productId],
        function (err) {
          if (err) {
            reject(err);
            return;
          }
          resolve({ id: productId });
        }
      );
    });
  }



}

module.exports = new StorageService();