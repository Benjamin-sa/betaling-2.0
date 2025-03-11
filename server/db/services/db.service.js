const database = require('..');

// Generic database service to simplify CRUD operations
class DbService {
  // Get database instance
  static get db() {
    return database.instance;
  }

  // Get all records from a table
  static getAll(table, orderBy = null) {
    return new Promise((resolve, reject) => {
      let query = `SELECT * FROM ${table}`;
      
      if (orderBy) {
        query += ` ORDER BY ${orderBy}`;
      }
      
      this.db.all(query, [], (err, rows) => {
        if (err) {
          console.error(`Database error getting all from ${table}:`, err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get a single record by ID
  static getById(table, idField, id) {
    return new Promise((resolve, reject) => {
      const query = `SELECT * FROM ${table} WHERE ${idField} = ?`;
      
      this.db.get(query, [id], (err, row) => {
        if (err) {
          console.error(`Database error getting ${table} by ID:`, err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Run a custom query with parameters
  static query(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  // Get a single row from a custom query
  static queryOne(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database query error:', err);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  // Insert a new record
  static create(table, data) {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      const placeholders = keys.map(() => '?').join(', ');
      
      const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
      
      this.db.run(query, values, function(err) {
        if (err) {
          console.error(`Database error creating record in ${table}:`, err);
          reject(err);
        } else {
          resolve({ 
            id: this.lastID,
            changes: this.changes 
          });
        }
      });
    });
  }

  // Update a record
  static update(table, idField, id, data) {
    return new Promise((resolve, reject) => {
      const keys = Object.keys(data);
      const values = Object.values(data);
      
      const setClause = keys.map(key => `${key} = ?`).join(', ');
      const query = `UPDATE ${table} SET ${setClause} WHERE ${idField} = ?`;
      
      this.db.run(query, [...values, id], function(err) {
        if (err) {
          console.error(`Database error updating record in ${table}:`, err);
          reject(err);
        } else {
          resolve({ 
            changes: this.changes,
            notFound: this.changes === 0
          });
        }
      });
    });
  }

  // Delete a record
  static delete(table, idField, id) {
    return new Promise((resolve, reject) => {
      const query = `DELETE FROM ${table} WHERE ${idField} = ?`;
      
      this.db.run(query, [id], function(err) {
        if (err) {
          console.error(`Database error deleting from ${table}:`, err);
          reject(err);
        } else {
          resolve({ 
            changes: this.changes,
            notFound: this.changes === 0
          });
        }
      });
    });
  }

  // Transaction support
  static beginTransaction() {
    return new Promise((resolve, reject) => {
      this.db.run('BEGIN TRANSACTION', err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static commit() {
    return new Promise((resolve, reject) => {
      this.db.run('COMMIT', err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  static rollback() {
    return new Promise((resolve, reject) => {
      this.db.run('ROLLBACK', err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

module.exports = DbService;
