// server/services/order.service.js
const db = require('../db').instance;

class OrderService {
  async getAllOrdersWithItems() {
    return new Promise((resolve, reject) => {
      db.all(
        `
        SELECT 
          orders.id AS order_id, 
          orders.created_at, 
          orders.time_slot,
          users.email, 
          order_items.product_name, 
          order_items.quantity, 
          order_items.amount_total
        FROM orders
        JOIN users ON orders.user_id = users.firebase_uid
        JOIN order_items ON orders.id = order_items.order_id
        ORDER BY orders.created_at DESC
        `,
        [],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  // Save order and order items to the database
  async createOrder(order) {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        // Start transaction
        db.run('BEGIN TRANSACTION');

        // Insert order
        db.run(
          `INSERT INTO orders (id, user_id, amount_total, currency) VALUES (?, ?, ?, ?)`,
          [order.id, order.user_id, order.amount_total, order.currency],
          (err) => {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }

            // Insert order items
            const stmt = db.prepare(
              `INSERT INTO order_items (order_id, product_name, quantity, amount_total, unit_price) VALUES (?, ?, ?, ?, ?)`
            );

            for (const item of order.items) {
              stmt.run(
                [order.id, item.description, item.quantity, item.amount, item.unit_price],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    stmt.finalize();
                    reject(err);
                    return;
                  }
                }
              );
            }

            stmt.finalize((err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }

              // Commit transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  reject(err);
                  return;
                }
                resolve();
              });
            });
          }
        );
      });
    });
  }
}

module.exports = new OrderService();