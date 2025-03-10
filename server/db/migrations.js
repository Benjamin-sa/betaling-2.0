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
      requires_timeslot INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Create indexes
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_stripe ON users(stripe_customer_id);
    CREATE INDEX IF NOT EXISTS idx_products_stripe ON products(stripe_product_id);
  `
}, {
  name: '002_create_orders_tables',
  up: `
    -- Create orders table
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      amount_total REAL NOT NULL,
      currency TEXT NOT NULL,
      time_slot TEXT,
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
}, {
  name: '003_create_settings_table',
  up: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Insert or update default settings
    INSERT OR REPLACE INTO settings (key, value) VALUES ('manual_payments_enabled', 'false');
  `
}, {
  name: '004_add_payment_status_to_orders',
  up: `
    -- Add payment method and manual payment confirmation columns to orders table
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'stripe' CHECK(payment_method IN ('stripe', 'manual'));
    ALTER TABLE orders ADD COLUMN manual_payment_confirmed_at TIMESTAMP;
    ALTER TABLE orders ADD COLUMN manual_payment_confirmed_by TEXT REFERENCES users(firebase_uid);

    -- Create index for payment method
    CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
  `
}, {
  name: '005_add_scout_management_tables',
  up: `
    -- Lid (Member) table
    CREATE TABLE IF NOT EXISTS Lid (
      LidID INTEGER PRIMARY KEY,
      Geboortedatum DATE,
      Allergieën TEXT,
      Dieetwensen TEXT,
      Tak TEXT,
      Telefoonnummer TEXT,
      Is_Actief BOOLEAN,
      Lidmaatschap_Datum DATE
    );
    
    -- Leiding (Leaders) table - specialized Lid
    CREATE TABLE IF NOT EXISTS Leiding (
      LidID INTEGER PRIMARY KEY,
      Is_Groepsleiding BOOLEAN,
      Is_Hopman BOOLEAN,
      FOREIGN KEY (LidID) REFERENCES Lid(LidID)
    );
    
    -- Ouder (Parent) table - using the existing users table
    CREATE TABLE IF NOT EXISTS Ouder (
      OuderID INTEGER PRIMARY KEY,
      firebase_uid TEXT UNIQUE,
      FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid)
    );

    -- Lid-Ouder relationship
    CREATE TABLE IF NOT EXISTS Lid_Ouder (
      LidID INTEGER,
      OuderID INTEGER,
      PRIMARY KEY (LidID, OuderID),
      FOREIGN KEY (LidID) REFERENCES Lid(LidID),
      FOREIGN KEY (OuderID) REFERENCES Ouder(OuderID)
    );

    -- Kampen (Camps) table
    CREATE TABLE IF NOT EXISTS Kampen (
      KampID INTEGER PRIMARY KEY,
      Startdatum DATE,
      Eindatum DATE
    );

    -- Weien (Fields/Meadows) table
    CREATE TABLE IF NOT EXISTS Weien (
      WeiID INTEGER PRIMARY KEY,
      Naam TEXT,
      Telefoonnummer TEXT,
      Email TEXT,
      Aantal_Hectare REAL,
      Contactpersoon TEXT
    );

    -- Kamp-Wei relationship
    CREATE TABLE IF NOT EXISTS Kamp_Wei (
      KampID INTEGER,
      WeiID INTEGER,
      Voorgaande_Prijs REAL,
      Ervaring TEXT,
      Opmerkingen TEXT,
      PRIMARY KEY (KampID, WeiID),
      FOREIGN KEY (KampID) REFERENCES Kampen(KampID),
      FOREIGN KEY (WeiID) REFERENCES Weien(WeiID)
    );

    -- Deelname (Participation) table
    CREATE TABLE IF NOT EXISTS Deelname (
      LidID INTEGER,
      KampID INTEGER,
      Heeft_Betaald BOOLEAN,
      PRIMARY KEY (LidID, KampID),
      FOREIGN KEY (LidID) REFERENCES Lid(LidID),
      FOREIGN KEY (KampID) REFERENCES Kampen(KampID)
    );

    -- Recept (Recipe) table
    CREATE TABLE IF NOT EXISTS Recept (
      ReceptID INTEGER PRIMARY KEY,
      Naam TEXT,
      Ingrediënten TEXT,
      Heeft_Vega_Optie BOOLEAN,
      Allergieën TEXT,
      Moeilijkheidsgraad TEXT,
      Bereidingstijd INTEGER,
      Opmerkingen TEXT
    );

    -- Maaltijden (Meals) relationship entity
    CREATE TABLE IF NOT EXISTS Maaltijden (
      MaaltijdID INTEGER PRIMARY KEY,
      Datum DATE,
      Soort_Maaltijd TEXT,
      Aantal_Eters INTEGER,
      KampID INTEGER,
      ReceptID INTEGER,
      Aantal_Porties_Gegeten INTEGER,
      FOREIGN KEY (KampID) REFERENCES Kampen(KampID),
      FOREIGN KEY (ReceptID) REFERENCES Recept(ReceptID)
    );

    -- Bereidingsteam (Meal preparation team)
    CREATE TABLE IF NOT EXISTS Bereidingsteam (
      MaaltijdID INTEGER,
      LidID INTEGER,
      PRIMARY KEY (MaaltijdID, LidID),
      FOREIGN KEY (MaaltijdID) REFERENCES Maaltijden(MaaltijdID),
      FOREIGN KEY (LidID) REFERENCES Lid(LidID)
    );

    -- Materialen (Materials) table
    CREATE TABLE IF NOT EXISTS Materialen (
      MateriaalID INTEGER PRIMARY KEY,
      Naam TEXT,
      Type TEXT,
      Aantal INTEGER,
      Aanschafdatum DATE,
      Status TEXT
    );

    -- Tenten (Tents) specialization of Materialen
    CREATE TABLE IF NOT EXISTS Tenten (
      MateriaalID INTEGER PRIMARY KEY,
      Tentpalen_In_Orde BOOLEAN,
      FOREIGN KEY (MateriaalID) REFERENCES Materialen(MateriaalID)
    );

    -- Kamp-Materiaal relationship (used by)
    CREATE TABLE IF NOT EXISTS Kamp_Materiaal (
      KampID INTEGER,
      MateriaalID INTEGER,
      PRIMARY KEY (KampID, MateriaalID),
      FOREIGN KEY (KampID) REFERENCES Kampen(KampID),
      FOREIGN KEY (MateriaalID) REFERENCES Materialen(MateriaalID)
    );

    -- Activiteiten (Activities) table
    CREATE TABLE IF NOT EXISTS Activiteiten (
      ActiviteitenID INTEGER PRIMARY KEY,
      Datum DATE,
      Locatie TEXT
    );

    -- Activiteit-Lid participation
    CREATE TABLE IF NOT EXISTS Activiteit_Lid (
      ActiviteitenID INTEGER,
      LidID INTEGER,
      PRIMARY KEY (ActiviteitenID, LidID),
      FOREIGN KEY (ActiviteitenID) REFERENCES Activiteiten(ActiviteitenID),
      FOREIGN KEY (LidID) REFERENCES Lid(LidID)
    );

    -- Activiteit-Materiaal relationship
    CREATE TABLE IF NOT EXISTS Activiteit_Materiaal (
      ActiviteitenID INTEGER,
      MateriaalID INTEGER,
      PRIMARY KEY (ActiviteitenID, MateriaalID),
      FOREIGN KEY (ActiviteitenID) REFERENCES Activiteiten(ActiviteitenID),
      FOREIGN KEY (MateriaalID) REFERENCES Materialen(MateriaalID)
    );

    -- Scout-specific products table
    CREATE TABLE IF NOT EXISTS Scout_Producten (
      ProductID INTEGER PRIMARY KEY,
      product_id TEXT UNIQUE,
      Naam TEXT,
      Beschrijving TEXT,
      FOREIGN KEY (product_id) REFERENCES products(id)
    );

    -- Connection between parents (users) and orders
    CREATE TABLE IF NOT EXISTS Ouder_Bestelling (
      OuderID INTEGER,
      order_id TEXT,
      PRIMARY KEY (OuderID, order_id),
      FOREIGN KEY (OuderID) REFERENCES Ouder(OuderID),
      FOREIGN KEY (order_id) REFERENCES orders(id)
    );
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
  
        // First create migrations table explicitly
        this.db.run(`
          CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `, (err) => {
          if (err) {
            this.db.run('ROLLBACK');
            reject(new DatabaseError('Failed to create migrations table', err));
            return;
          }
  
          console.log('Checking migrations...');
          
          // Get executed migrations
          this.db.all('SELECT name FROM migrations', [], (err, executedMigrations) => {
            if (err) {
              this.db.run('ROLLBACK');
              reject(new DatabaseError('Failed to check migrations', err));
              return;
            }
  
            const executed = new Set(executedMigrations?.map(m => m.name) || []);
  
            // Run pending migrations in sequence
            let chain = Promise.resolve();
            
            migrations.forEach(migration => {
              if (!executed.has(migration.name)) {
                chain = chain.then(() => {
                  return new Promise((resolveExec, rejectExec) => {
                    console.log(`Running migration: ${migration.name}`);
                    
                    this.db.exec(migration.up, (err) => {
                      if (err) {
                        rejectExec(new DatabaseError(`Failed to run migration ${migration.name}`, err));
                        return;
                      }
  
                      // Track executed migration
                      this.db.run(
                        'INSERT INTO migrations (name) VALUES (?)',
                        [migration.name],
                        (err) => {
                          if (err) {
                            rejectExec(new DatabaseError(`Failed to track migration ${migration.name}`, err));
                            return;
                          }
                          console.log(`Completed migration: ${migration.name}`);
                          resolveExec();
                        }
                      );
                    });
                  });
                });
              }
            });
  
            // After all migrations complete
            chain
              .then(() => {
                this.db.run('COMMIT', (err) => {
                  if (err) {
                    this.db.run('ROLLBACK');
                    reject(new DatabaseError('Failed to commit migrations', err));
                    return;
                  }
                  console.log('All migrations completed successfully');
                  resolve();
                });
              })
              .catch(err => {
                this.db.run('ROLLBACK');
                reject(err);
              });
          });
        });
      });
    });
  }
}

module.exports = Migrations;