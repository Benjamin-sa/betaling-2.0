const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all weien (fields/meadows)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all('SELECT * FROM Weien', [], (err, rows) => {
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

// Get wei by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get('SELECT * FROM Weien WHERE WeiID = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Wei not found' });
      }
      res.json(row);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new wei
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Telefoonnummer, Email, Aantal_Hectare, Contactpersoon } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Weien (Naam, Telefoonnummer, Email, Aantal_Hectare, Contactpersoon) VALUES (?, ?, ?, ?, ?)',
      [Naam, Telefoonnummer, Email, Aantal_Hectare, Contactpersoon],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ id: this.lastID, message: 'Wei created successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update wei
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Telefoonnummer, Email, Aantal_Hectare, Contactpersoon } = req.body;
    const weiId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Weien SET Naam = ?, Telefoonnummer = ?, Email = ?, Aantal_Hectare = ?, Contactpersoon = ? WHERE WeiID = ?',
      [Naam, Telefoonnummer, Email, Aantal_Hectare, Contactpersoon, weiId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Wei not found' });
        }
        
        res.json({ message: 'Wei updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Link wei to camp with additional data
router.post('/:id/kamp/:kampId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Voorgaande_Prijs, Ervaring, Opmerkingen } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Kamp_Wei (WeiID, KampID, Voorgaande_Prijs, Ervaring, Opmerkingen) VALUES (?, ?, ?, ?, ?)',
      [req.params.id, req.params.kampId, Voorgaande_Prijs, Ervaring, Opmerkingen],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ message: 'Wei linked to kamp successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
