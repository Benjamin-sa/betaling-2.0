require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./db');
const Migrations = require('./db/migrations');
const path = require('path');
const BackupService = require('./services/backup.service'); // Import the class

async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Run migrations
    const migrations = new Migrations(database.instance);
    await migrations.runMigrations();

    // Instantiate BackupService
    const backupService = new BackupService();

    // Restore data from latest backup if database is empty
    const isEmpty = await checkIfDatabaseIsEmpty();
    if (isEmpty) {
      await backupService.restoreFromFirestore();
    }

    const app = express();
    const port = process.env.PORT || 3000;

    // Middleware setup
    app.use(cors());
    // Important: Use raw body parser for webhook route
    app.use('/webhook/stripe', express.raw({type: 'application/json'}));
    // Parse JSON bodies for all other routes
    app.use(express.json());

    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Routes
    app.use('/api/products', require('./routes/product.routes'));
    app.use('/api/checkout', require('./routes/checkout.routes'));
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/orders', require('./routes/order.routes'));
    app.use('/webhook', require('./routes/webhook.routes'));
    app.use('/api/admin', require('./routes/admin.routes'));

    // Handle SPA routing - must be after API routes
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist/index.html'));
    });

    // Schedule regular backups (every 8 hours)
    setInterval(() => {
      backupService.backupToFirestore(); // Use the instance
    }, 8 * 60 * 60 * 1000);

    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    if (process.env.NODE_ENV === 'production') {
      // Handle shutdown
      process.on('SIGINT', async () => {
        try {
          await backupService.backupToFirestore(); // Use the instance
          await database.close();
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      });
    }
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function checkIfDatabaseIsEmpty() {
  return new Promise((resolve, reject) => {
    database.instance.get(
      'SELECT COUNT(*) as count FROM users',
      (err, row) => {
        if (err) reject(err);
        else resolve(row.count === 0);
      }
    );
  });
}

startServer();