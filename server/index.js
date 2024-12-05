const express = require('express');
const cors = require('cors');
const database = require('./db');
const path = require('path');
const backUp = require('./services/backup.service');
const Migrations = require('./db/migrations');

async function startServer() {
  try {
    // Connect to database
    await database.connect();

    // Run migrations
    const migrations = new Migrations(database.instance);
    await migrations.runMigrations();

    // Restore data from latest backup if database is empty
    const isEmpty = await checkIfDatabaseIsEmpty();
    if (isEmpty) {
      await BackupService.restoreFromFirestore();
    }

    const app = express();
    const port = process.env.PORT || 3000;

    // Middleware
    app.use(cors());
    app.use(express.json());

    // Routes
    app.use('/api/products', require('./routes/product.routes'));
    app.use('/api/checkout', require('./routes/checkout.routes'));
    app.use('/api/auth', require('./routes/auth.routes'));
    app.use('/api/orders', require('./routes/order.routes'));


    // Serve static files from the client/dist directory
    app.use(express.static(path.join(__dirname, '../client/dist')));

    // Handle SPA (Single Page Application) routing
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
    });

    // Schedule regular backups (every 4 hours)
    setInterval(() => {
      BackupService.backupToFirestore();
    }, 4 * 60 * 60 * 1000);


    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });




    // Handle shutdown
    process.on('SIGINT', async () => {
      try {
        await backUp.backupToFirestore();
        await database.close();
        process.exit(0);
      } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

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