const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all leden (members)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all('SELECT * FROM Lid', [], (err, rows) => {
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

// Get lid by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get('SELECT * FROM Lid WHERE LidID = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Lid not found' });
      }
      res.json(row);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new lid
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Geboortedatum, Allergieën, Dieetwensen, Tak, Telefoonnummer, Is_Actief, Lidmaatschap_Datum } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Lid (Geboortedatum, Allergieën, Dieetwensen, Tak, Telefoonnummer, Is_Actief, Lidmaatschap_Datum) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [Geboortedatum, Allergieën, Dieetwensen, Tak, Telefoonnummer, Is_Actief ? 1 : 0, Lidmaatschap_Datum],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ id: this.lastID, message: 'Lid created successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update lid
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Geboortedatum, Allergieën, Dieetwensen, Tak, Telefoonnummer, Is_Actief, Lidmaatschap_Datum } = req.body;
    const lidId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Lid SET Geboortedatum = ?, Allergieën = ?, Dieetwensen = ?, Tak = ?, Telefoonnummer = ?, Is_Actief = ?, Lidmaatschap_Datum = ? WHERE LidID = ?',
      [Geboortedatum, Allergieën, Dieetwensen, Tak, Telefoonnummer, Is_Actief ? 1 : 0, Lidmaatschap_Datum, lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Lid not found' });
        }
        
        res.json({ message: 'Lid updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete lid
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run('DELETE FROM Lid WHERE LidID = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Lid not found' });
      }
      
      res.json({ message: 'Lid deleted successfully' });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
