// server/db/errors.js
class DatabaseError extends Error {
  constructor(message, error) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = error;
  }
}

module.exports = {
  DatabaseError
};