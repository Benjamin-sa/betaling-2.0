const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all ouders (parents)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT o.*, u.email 
       FROM Ouder o 
       JOIN users u ON o.firebase_uid = u.firebase_uid`,
      [],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ouder by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get(
      `SELECT o.*, u.email 
       FROM Ouder o 
       JOIN users u ON o.firebase_uid = u.firebase_uid 
       WHERE o.OuderID = ?`,
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
          return res.status(404).json({ error: 'Ouder not found' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get children of a parent
router.get('/:id/kinderen', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT l.* 
       FROM Lid l
       JOIN Lid_Ouder lo ON l.LidID = lo.LidID
       WHERE lo.OuderID = ?`,
      [req.params.id],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new ouder
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { firebase_uid } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Ouder (firebase_uid) VALUES (?)',
      [firebase_uid],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ id: this.lastID, message: 'Ouder created successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Link child to parent
router.post('/:id/kind/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'INSERT INTO Lid_Ouder (OuderID, LidID) VALUES (?, ?)',
      [req.params.id, req.params.lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ message: 'Kind linked to ouder successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove link between child and parent
router.delete('/:id/kind/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'DELETE FROM Lid_Ouder WHERE OuderID = ? AND LidID = ?',
      [req.params.id, req.params.lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Relation not found' });
        }
        
        res.json({ message: 'Relation removed successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
