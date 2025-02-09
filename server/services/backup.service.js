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
      const orders = await this.getAllOrders();
      const orderItems = await this.getAllOrderItems();

      // Save to Firestore
      const backupRef = this.firestore.collection('backups').doc(new Date().toISOString());
      await backupRef.set({
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        users,
        products,
        orders,
        orderItems
      });

      console.log('Backup completed successfully');
    } catch (error) {
      console.error('Backup failed:', error);
    }
  }

  async restoreFromFirestore() {
    try {
      const snapshot = await this.firestore.collection('backups')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.log('No backup found');
        return;
      }

      const backup = snapshot.docs[0].data();

      // Restore users first
      for (const user of backup.users) {
        await db.run(
          `INSERT OR REPLACE INTO users (
            firebase_uid, email, stripe_customer_id, is_admin
          ) VALUES (?, ?, ?, ?)`,
          [user.firebase_uid, user.email, user.stripe_customer_id, user.is_admin]
        );
      }

      // Then restore products
      for (const product of backup.products) {
        await db.run(
          `INSERT OR REPLACE INTO products (
            id, name, description, price, image, image_type,
            stripe_product_id, stripe_price_id, requires_timeslot, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.id,
            product.name, 
            product.description,
            product.price,
            product.image,
            product.image_type,
            product.stripe_product_id,
            product.stripe_price_id,
            product.requires_timeslot,
            product.created_at
          ]
        );
      }

      // Then restore orders
      if (backup.orders) {
        for (const order of backup.orders) {
          await db.run(
            `INSERT OR REPLACE INTO orders (
              id, user_id, amount_total, currency, time_slot, created_at
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              order.id,
              order.user_id,
              order.amount_total,
              order.currency,
              order.time_slot,
              order.created_at
            ]
          );
        }
      }

      // Finally restore order items
      if (backup.orderItems) {
        for (const item of backup.orderItems) {
          await db.run(
            `INSERT OR REPLACE INTO order_items (
              id, order_id, product_name, quantity, amount_total, unit_price
            ) VALUES (?, ?, ?, ?, ?, ?)`,
            [
              item.id,
              item.order_id,
              item.product_name,
              item.quantity,
              item.amount_total,
              item.unit_price
            ]
          );
        }
      }

      console.log('Restore completed successfully');
    } catch (error) {
      console.error('Restore failed:', error);
    }
  }

  async getAllOrderItems() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM order_items', [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }

  async getAllOrders() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM orders', [], (err, rows) => {
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