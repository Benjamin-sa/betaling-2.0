// server/services/backup.service.js
const admin = require('../config/firebaseAdmin');
const db = require('../db').instance;

class BackupService {
  constructor() {
    this.firestore = admin.firestore();
  }

  async backupToFirestore() {
    try {
      // Get all data from SQLite
      const users = await this.getAllUsers();
      const products = await this.getAllProducts();

      // Save to Firestore
      const backupRef = this.firestore.collection('backups').doc(new Date().toISOString());
      await backupRef.set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        users,
        products
      });

      console.log('Backup completed successfully');
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }

  async restoreFromFirestore() {
    try {
      // Get latest backup
      const backupsRef = this.firestore.collection('backups');
      const snapshot = await backupsRef
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.log('No backup found');
        return;
      }

      const backup = snapshot.docs[0].data();

      // Restore users
      for (const user of backup.users) {
        await db.run(
          `INSERT OR REPLACE INTO users (
            firebase_uid, email, stripe_customer_id, is_admin
          ) VALUES (?, ?, ?, ?)`,
          [user.firebase_uid, user.email, user.stripe_customer_id, user.is_admin]
        );
      }

      // Restore products
      for (const product of backup.products) {
        await db.run(
          `INSERT OR REPLACE INTO products (
            id, name, description, price, image, image_type,
            stripe_product_id, stripe_price_id, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id,
            product.name, 
            product.description,
            product.price,
            product.image,
            product.image_type,
            product.stripe_product_id,
            product.stripe_price_id,
            product.created_at
          ]
        );
      }

      console.log('Restore completed successfully');
    } catch (error) {
      console.error('Restore failed:', error);
    }
  }

  async getAllUsers() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM users', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getAllProducts() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
}

module.exports = new BackupService();