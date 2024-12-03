const fs = require('fs').promises;
const path = require('path');

class StorageService {
  constructor() {
    this.dataFile = path.join(__dirname, '../../data/products.json');
    this.uploadsDir = path.join(__dirname, '../../public/uploads');
    this.ensureDirectories();
  }

  async ensureDirectories() {
    try {
      await fs.mkdir(path.dirname(this.dataFile), { recursive: true });
      await fs.mkdir(this.uploadsDir, { recursive: true });
      
      // Create products.json if it doesn't exist
      try {
        await fs.access(this.dataFile);
      } catch {
        await fs.writeFile(this.dataFile, JSON.stringify({ products: [] }));
      }
    } catch (error) {
      console.error('Error creating directories:', error);
    }
  }

  async uploadImage(file) {
    try {
      const uniqueFilename = `${Date.now()}-${file.originalname}`;
      const filePath = path.join(this.uploadsDir, uniqueFilename);
      
      await fs.writeFile(filePath, file.buffer);
      return `/uploads/${uniqueFilename}`;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  }

  async getAllProducts() {
    const data = await fs.readFile(this.dataFile, 'utf8');
    return JSON.parse(data).products;
  }

  async saveProduct(productData) {
    const data = await this.getAllProducts();
    const products = data || [];
    
    // Add new product with ID
    const newProduct = {
      id: productData.stripeProductId,
      ...productData,
      createdAt: new Date().toISOString()
    };
    
    products.push(newProduct);
    await fs.writeFile(this.dataFile, JSON.stringify({ products }, null, 2));
    return newProduct;
  }

  async deleteProduct(productId) {
    const data = await this.getAllProducts();
    const productIndex = data.findIndex(p => p.id === productId);
    
    if (productIndex === -1) {
      throw new Error('Product not found');
    }

    const product = data[productIndex];

    // Delete image file
    if (product.imageUrl) {
      const filePath = path.join(this.uploadsDir, path.basename(product.imageUrl));
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.error('Error deleting image file:', error);
      }
    }

    // Remove product from array
    data.splice(productIndex, 1);
    await fs.writeFile(this.dataFile, JSON.stringify({ products: data }, null, 2));
    
    return product;
  }

  async getProduct(productId) {
    const data = await this.getAllProducts();
    return data.find(p => p.id === productId);
  }
}

module.exports = new StorageService();