// services/firebase.service.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs').promises;
const serviceAccount = require('./scoutswinkel-firebase-adminsdk-ucote-106bbcc7d0.json');

class FirebaseService {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    this.firestore = admin.firestore();
    this.uploadsDir = path.join(__dirname, '../../public/uploads');
    this.ensureUploadsDir();
  }

  async ensureUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  }

  async uploadImage(file) {
    try {
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadsDir, uniqueFilename);
      
      await fs.writeFile(filePath, file.buffer);
      return `/uploads/${uniqueFilename}`; // Return relative URL
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async saveProduct(productData) {
    return this.firestore
      .collection('products')
      .add({
        name: productData.name,
        description: productData.description,
        price: productData.price,
        imageUrl: productData.imageUrl,
        stripeProductId: productData.stripeProductId,
        stripePriceId: productData.stripePriceId,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
  }

  async deleteProduct(productId) {
    try {
      // Get product data before deletion
      const product = await this.firestore.collection('products').doc(productId).get();
      if (!product.exists) {
        throw new Error('Product not found');
      }
  
      const productData = product.data();
  
      // Delete local image file if exists
      if (productData.imageUrl) {
        const filePath = path.join(this.uploadsDir, path.basename(productData.imageUrl));
        try {
          await fs.unlink(filePath);
        } catch (error) {
          console.error('Error deleting image file:', error);
        }
      }
  
      // Delete Firestore document
      await this.firestore.collection('products').doc(productId).delete();
      
      return productData;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }
}

module.exports = new FirebaseService();