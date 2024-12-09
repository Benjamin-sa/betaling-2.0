// server/db/migrations.js
const { DatabaseError } = require('./errors');
const path = require('path');

const migrations = [{
  name: '001_init',
  up: `
    -- Create migrations table first
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    -- Create users table
    CREATE TABLE IF NOT EXISTS users (
      firebase_uid TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      stripe_customer_id TEXT UNIQUE,
      is_admin INTEGER DEFAULT 0
    );

    -- Create products table  
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      image BLOB,
      image_type TEXT,
      stripe_product_id TEXT UNIQUE,
      stripe_price_id TEXT UNIQUE,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);
    CREATE INDEX IF NOT EXISTS idx_products_stripe ON products(stripe_product_id);
  `,
  name: '002_create_orders_tables',
  up: `
    -- Create orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_total REAL NOT NULL,
      currency TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(firebase_uid)
    );

    -- Create order_items table
    CREATE TABLE IF NOT EXISTS order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id TEXT NOT NULL,
      product_name TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      amount_total REAL NOT NULL,
      unit_price REAL NOT NULL,
      FOREIGN KEY(order_id) REFERENCES orders(id)
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
    CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
  `
}];

class Migrations {
  constructor(db) {
    this.db = db;
  }

  async runMigrations() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Start transaction
        this.db.run('BEGIN TRANSACTION');

        console.log('Checking migrations...');
        
        // Get executed migrations
        this.db.all('SELECT name FROM migrations', [], (err, executedMigrations) => {
          if (err && !err.message.includes('no such table')) {
            this.db.run('ROLLBACK');
            reject(new DatabaseError('Failed to check migrations', err));
            return;
          }

          const executed = new Set(executedMigrations?.map(m => m.name) || []);

          // Run pending migrations
          migrations.forEach(migration => {
            if (!executed.has(migration.name)) {
              console.log(`Running migration: ${migration.name}`);
              
              this.db.exec(migration.up, (err) => {
                if (err) {
                  this.db.run('ROLLBACK');
                  reject(new DatabaseError(`Failed to run migration ${migration.name}`, err));
                  return;
                }

                // Track executed migration
                this.db.run(
                  'INSERT INTO migrations (name) VALUES (?)',
                  [migration.name],
                  (err) => {
                    if (err) {
                      this.db.run('ROLLBACK');
                      reject(new DatabaseError(`Failed to track migration ${migration.name}`, err));
                      return;
                    }
                    console.log(`Completed migration: ${migration.name}`);
                  }
                );
              });
            }
          });

          // Commit transaction
          this.db.run('COMMIT', (err) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(new DatabaseError('Failed to commit migrations', err));
              return;
            }
            console.log('All migrations completed successfully');
            resolve();
          });
        });
      });
    });
  }
}

module.exports = Migrations;