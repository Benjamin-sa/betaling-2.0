const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all kampen (camps)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all('SELECT * FROM Kampen', [], (err, rows) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json(rows);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get kamp by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get('SELECT * FROM Kampen WHERE KampID = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Kamp not found' });
      }
      res.json(row);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get participants of a camp
router.get('/:id/deelnemers', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT l.*, d.Heeft_Betaald 
       FROM Lid l
       JOIN Deelname d ON l.LidID = d.LidID
       WHERE d.KampID = ?`,
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

// Create new kamp
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Startdatum, Eindatum } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Kampen (Startdatum, Eindatum) VALUES (?, ?)',
      [Startdatum, Eindatum],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ id: this.lastID, message: 'Kamp created successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update kamp
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Startdatum, Eindatum } = req.body;
    const kampId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Kampen SET Startdatum = ?, Eindatum = ? WHERE KampID = ?',
      [Startdatum, Eindatum, kampId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Kamp not found' });
        }
        
        res.json({ message: 'Kamp updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add participant to camp
router.post('/:id/deelnemer/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Heeft_Betaald } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Deelname (KampID, LidID, Heeft_Betaald) VALUES (?, ?, ?)',
      [req.params.id, req.params.lidId, Heeft_Betaald ? 1 : 0],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ message: 'Deelnemer added successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update payment status of participant
router.put('/:id/deelnemer/:lidId/betaling', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Heeft_Betaald } = req.body;
    
    const db = database.instance;
    db.run(
      'UPDATE Deelname SET Heeft_Betaald = ? WHERE KampID = ? AND LidID = ?',
      [Heeft_Betaald ? 1 : 0, req.params.id, req.params.lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Deelnemer not found' });
        }
        
        res.json({ message: 'Payment status updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
