require('dotenv').config();
const express = require('express');
const cors = require('cors');
const database = require('./db');
const Migrations = require('./db/migrations');
const path = require('path');


// Add HTTPS enforcement middleware
const enforceHttps = (req, res, next) => {
  const shouldForceHttps = process.env.NODE_ENV === 'production' || process.env.FORCE_HTTPS === 'true';
  
  if (shouldForceHttps) {
    if (req.headers['x-forwarded-proto'] !== 'https') {
      // Handle both social media browsers and regular browsers
      return res.redirect(301, `https://${req.headers.host}${req.url}`);
    }
  }
  next();
};


async function startServer() {
  try {
    // Connect to database
    await database.connect();

    const backupService = require('./services/backup.service');


    // Run migrations
    const migrations = new Migrations(database.instance);
    await migrations.runMigrations();


    // Restore data from latest backup if database is empty
    const isEmpty = await checkIfDatabaseIsEmpty();
    if (isEmpty) {
      await backupService.restoreFromFirestore();
    }

    const app = express();
    const port = process.env.PORT || 3000;

    app.use(enforceHttps);


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
      backupService.backupToFirestore();
    }, 2 * 60 * 60 * 1000);


    // Start server
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
    
    if (process.env.NODE_ENV === 'production' || process.env.NODE_ENV === 'test') {
      // Handle shutdown for SIGINT and SIGTERM
      const handleShutdown = async (signal) => {
        console.log(`Received ${signal}. Shutting down...`);
        try {
          await backupService.backupToFirestore(); 
          await database.close();
          console.log('Server shut down successfully.');
          process.exit(0);
        } catch (error) {
          console.error('Error during shutdown:', error);
          process.exit(1);
        }
      };
    
      process.on('SIGINT', () => handleShutdown('SIGINT'));
      process.on('SIGTERM', () => handleShutdown('SIGTERM'));
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