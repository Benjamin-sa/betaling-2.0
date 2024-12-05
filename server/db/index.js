// server/db/index.js
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const { DatabaseError } = require('./errors');

class Database {
  constructor() {
    // Gebruik /tmp directory voor Heroku's ephemeral filesystem
    this.dbPath = process.env.NODE_ENV === 'production' 
      ? path.join('/tmp', 'database.sqlite')
      : path.join(__dirname, 'database.sqlite');
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(this.dbPath, (err) => {
        if (err) {
          reject(new DatabaseError('Failed to connect to database', err));
          return;
        }
        console.log('Connected to SQLite database', this.dbPath);
        resolve();
      });
    });
  }

  async close() {
    if (this.db) {
      return new Promise((resolve, reject) => {
        this.db.close((err) => {
          if (err) {
            reject(new DatabaseError('Failed to close database', err));
            return;
          }
          console.log('Database connection closed');
          resolve();
        });
      });
    }
  }

  get instance() {
    if (!this.db) {
      throw new DatabaseError('Database not initialized. Call connect() first.');
    }
    return this.db;
  }
}

module.exports = new Database();