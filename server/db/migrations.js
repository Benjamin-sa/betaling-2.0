// server/db/migrations.js
const { DatabaseError } = require("./errors");
const path = require("path");

const migrations = [
  {
    name: "001_init",
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
  `,
  },
  {
    name: "002_create_orders_tables",
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
  `,
  },
  {
    name: "003_create_settings_table",
    up: `
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    -- Insert or update default settings
    INSERT OR REPLACE INTO settings (key, value) VALUES ('manual_payments_enabled', 'false');
  `,
  },
  {
    name: "004_add_payment_status_to_orders",
    up: `
    -- Add payment method and manual payment confirmation columns to orders table
    ALTER TABLE orders ADD COLUMN payment_method TEXT DEFAULT 'stripe' CHECK(payment_method IN ('stripe', 'manual'));
    ALTER TABLE orders ADD COLUMN manual_payment_confirmed_at TIMESTAMP;
    ALTER TABLE orders ADD COLUMN manual_payment_confirmed_by TEXT REFERENCES users(firebase_uid);

    -- Create index for payment method
    CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
  `,
  },
  {
    name: "005_add_scout_management_tables",
    up: `
    -- Lid (Member) table
    CREATE TABLE IF NOT EXISTS Lid (
      LidID INTEGER PRIMARY KEY,
      Voornaam TEXT,
      Achternaam TEXT,
      Geboortedatum DATE,
      Allergieën TEXT,
      Dieetwensen TEXT,
      Tak TEXT,
      Telefoonnummer TEXT,
      Is_Actief BOOLEAN,
      Lidmaatschap_Datum DATE
    );
    
    -- Leiding (specialisatie van Lid)
    CREATE TABLE Leiding (
      LidID INTEGER PRIMARY KEY,
      Is_Groepsleiding BOOLEAN,
      Is_Hopman BOOLEAN,
      FOREIGN KEY (LidID) REFERENCES Lid(LidID)
    );
    
    -- Ouder (specifiek type gebruiker)
    CREATE TABLE Ouder (
      OuderID INTEGER PRIMARY KEY,
      firebase_uid TEXT UNIQUE,
      FOREIGN KEY (firebase_uid) REFERENCES users(firebase_uid)
    );

    -- Koppeling tussen leden en ouders
    CREATE TABLE Lid_Ouder (
      LidID INTEGER,
      OuderID INTEGER,
      PRIMARY KEY (LidID, OuderID),
      FOREIGN KEY (LidID) REFERENCES Lid(LidID),
      FOREIGN KEY (OuderID) REFERENCES Ouder(OuderID)
    );

    -- Kampen
    CREATE TABLE IF NOT EXISTS Kampen (
      KampID INTEGER PRIMARY KEY,
      Startdatum DATE,
      Eindatum DATE,
      Thema TEXT,
      Naam TEXT
    );

    -- Deelname aan kampen
    CREATE TABLE IF NOT EXISTS Deelname (
      LidID INTEGER,
      KampID INTEGER,
      Heeft_Betaald BOOLEAN,
      PRIMARY KEY (LidID, KampID),
      FOREIGN KEY (LidID) REFERENCES Lid(LidID),
      FOREIGN KEY (KampID) REFERENCES Kampen(KampID)
    );


    -- Weien (kamplocaties)
    CREATE TABLE IF NOT EXISTS Weien (
      WeiID INTEGER PRIMARY KEY,
      Naam TEXT,
      Telefoonnummer TEXT,
      Email TEXT,
      Aantal_Hectare REAL,
      Coordinaten TEXT,
      Contactpersoon TEXT
    );

    -- Koppeling tussen kampen en weien
    CREATE TABLE IF NOT EXISTS Kamp_Wei (
      KampID INTEGER,
      WeiID INTEGER,
      Voorgaande_Prijs REAL,
      Ervaring TEXT,
      Thema TEXT,
      Opmerkingen TEXT,
      PRIMARY KEY (KampID, WeiID),
      FOREIGN KEY (KampID) REFERENCES Kampen(KampID),
      FOREIGN KEY (WeiID) REFERENCES Weien(WeiID)
    );

    -- Recepten
    CREATE TABLE Recept (
      ReceptID INTEGER PRIMARY KEY,
      Naam TEXT,
      Heeft_Vega_Optie BOOLEAN,
      Allergieën TEXT,
      Moeilijkheidsgraad TEXT,
      Bereidingstijd INTEGER,
      Opmerkingen TEXT
    );

    -- Ingredienten (Ingredients) table
    CREATE TABLE IF NOT EXISTS Ingredienten (
      IngredientBasisID INTEGER PRIMARY KEY AUTOINCREMENT,
      Naam TEXT NOT NULL UNIQUE,
      Eenheid_Standaard TEXT,
      Categorie TEXT
    );

    -- Recept_Ingredienten relatie tabel
    CREATE TABLE IF NOT EXISTS Recept_Ingredienten (
      IngredientID INTEGER PRIMARY KEY AUTOINCREMENT,
      ReceptID INTEGER NOT NULL,
      IngredientBasisID INTEGER NOT NULL,
      Hoeveelheid REAL,
      Eenheid TEXT,
      FOREIGN KEY (ReceptID) REFERENCES Recept(ReceptID) ON DELETE CASCADE,
      FOREIGN KEY (IngredientBasisID) REFERENCES Ingredienten(IngredientBasisID)
);

    -- Maaltijden
    CREATE TABLE Maaltijden (
      MaaltijdID INTEGER PRIMARY KEY,
      Datum DATE,
      Soort_Maaltijd TEXT,
      Aantal_Eters INTEGER,
      Aantal_Porties_Gegeten INTEGER
      );

      CREATE TABLE Maaltijd_Kamp (
    MaaltijdID INTEGER,
    KampID INTEGER,
    PRIMARY KEY (MaaltijdID, KampID),
    FOREIGN KEY (MaaltijdID) REFERENCES Maaltijden(MaaltijdID),
    FOREIGN KEY (KampID) REFERENCES Kampen(KampID)
  );

    -- Maaltijd Deelnemers (wie eet welke maaltijd)
  CREATE TABLE Maaltijd_Deelnemers (
    MaaltijdID INTEGER,
    LidID INTEGER,
    Aanwezig BOOLEAN DEFAULT TRUE,
    Speciale_Wensen TEXT,
    PRIMARY KEY (MaaltijdID, LidID),
    FOREIGN KEY (MaaltijdID) REFERENCES Maaltijden(MaaltijdID),
    FOREIGN KEY (LidID) REFERENCES Lid(LidID)
  );
  
    -- Maaltijd Recept (welke recepten worden gebruikt voor welke maaltijd)
    CREATE TABLE Maaltijd_Recept (
    MaaltijdID INTEGER,
    ReceptID INTEGER,
    Is_Hoofdrecept BOOLEAN DEFAULT TRUE,
    Aantal_Porties INTEGER,
    Opmerkingen TEXT,
    PRIMARY KEY (MaaltijdID, ReceptID),
    FOREIGN KEY (MaaltijdID) REFERENCES Maaltijden(MaaltijdID),
    FOREIGN KEY (ReceptID) REFERENCES Recept(ReceptID)
  );

    -- Bereidingsteam
    CREATE TABLE Bereidingsteam (
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
    
    -- Create index for faster lookups
    CREATE INDEX IF NOT EXISTS idx_recept_ingredienten_receptid ON Recept_Ingredienten(ReceptID);

  `,
  },
  {
    name: "006_add_material_types",
    up: `
    -- Create MaterialTypes table with predefined types
    CREATE TABLE IF NOT EXISTS MaterialTypes (
      TypeID INTEGER PRIMARY KEY AUTOINCREMENT,
      Naam TEXT NOT NULL UNIQUE
    );
    
    -- Insert predefined material types
    INSERT OR IGNORE INTO MaterialTypes (Naam) VALUES 
      ('Tent'),
      ('Shelter'),
      ('Materiaaltent'),
      ('Hamer'),
      ('Bijl'),
      ('Pickhouweel'),
      ('Zaag'),
      ('Kookgerief'),
      ('Anders');
      
    -- Add foreign key to Materialen table (keep existing data intact)
    ALTER TABLE Materialen ADD COLUMN TypeID INTEGER REFERENCES MaterialTypes(TypeID);
    
    -- Add index for TypeID
    CREATE INDEX IF NOT EXISTS idx_materialen_typeid ON Materialen(TypeID);
  `,
  },
  ];

class Migrations {
  constructor(db) {
    this.db = db;
  }

  async runMigrations() {
    return new Promise((resolve, reject) => {
      this.db.serialize(() => {
        // Start transaction
        this.db.run("BEGIN TRANSACTION");

        // First create migrations table explicitly
        this.db.run(
          `
          CREATE TABLE IF NOT EXISTS migrations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `,
          (err) => {
            if (err) {
              this.db.run("ROLLBACK");
              reject(
                new DatabaseError("Failed to create migrations table", err)
              );
              return;
            }

            console.log("Checking migrations...");

            // Get executed migrations
            this.db.all(
              "SELECT name FROM migrations",
              [],
              (err, executedMigrations) => {
                if (err) {
                  this.db.run("ROLLBACK");
                  reject(new DatabaseError("Failed to check migrations", err));
                  return;
                }

                const executed = new Set(
                  executedMigrations?.map((m) => m.name) || []
                );

                // Run pending migrations in sequence
                let chain = Promise.resolve();

                migrations.forEach((migration) => {
                  if (!executed.has(migration.name)) {
                    chain = chain.then(() => {
                      return new Promise((resolveExec, rejectExec) => {
                        console.log(`Running migration: ${migration.name}`);

                        this.db.exec(migration.up, (err) => {
                          if (err) {
                            rejectExec(
                              new DatabaseError(
                                `Failed to run migration ${migration.name}`,
                                err
                              )
                            );
                            return;
                          }

                          // Track executed migration
                          this.db.run(
                            "INSERT INTO migrations (name) VALUES (?)",
                            [migration.name],
                            (err) => {
                              if (err) {
                                rejectExec(
                                  new DatabaseError(
                                    `Failed to track migration ${migration.name}`,
                                    err
                                  )
                                );
                                return;
                              }
                              console.log(
                                `Completed migration: ${migration.name}`
                              );
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
                    this.db.run("COMMIT", (err) => {
                      if (err) {
                        this.db.run("ROLLBACK");
                        reject(
                          new DatabaseError("Failed to commit migrations", err)
                        );
                        return;
                      }
                      console.log("All migrations completed successfully");
                      resolve();
                    });
                  })
                  .catch((err) => {
                    this.db.run("ROLLBACK");
                    reject(err);
                  });
              }
            );
          }
        );
      });
    });
  }
}

module.exports = Migrations;
