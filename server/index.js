require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./db');
const Migrations = require('./db/migrations');


async function startServer() {
  try {
    // Connect to database
    await database.connect();

    const BackupService = require('./services/backup.service');


    // Run migrations
    const migrations = new Migrations(database.instance);
    await migrations.runMigrations();

    const backUp = require('./services/backup.service');

    // Restore data from latest backup if database is empty
    const isEmpty = await checkIfDatabaseIsEmpty();
    if (isEmpty) {
      await backUp.restoreFromFirestore();
    }

    const app = express();
    const port = process.env.PORT || 3000;

    // Middleware setup
    app.use(cors());
    // Important: Use raw body parser for webhook route
    app.use('/webhook/stripe', express.raw({type: 'application/json'}));
    // Parse JSON bodies for all other routes
    app.use(express.json());

    // Routes
    app.use('/api/products', require('./routes/product.routes'));
    app.use('/api/checkout', require('./routes/checkout.routes'));
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/orders', require('./routes/order.routes'));
    app.use('/webhook', require('./routes/webhook.routes'));

    // Schedule regular backups (every 4 hours)
    setInterval(() => {
      backUp.backupToFirestore();
    }, 4 * 60 * 60 * 1000);


    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    
    if (process.env.NODE_ENV === 'production') {
    // Handle shutdown
    process.on('SIGINT', async () => {
      try {
        await BackupService.backupToFirestore();
        await database.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });}

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