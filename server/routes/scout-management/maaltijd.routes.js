const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all maaltijden (meals)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all('SELECT * FROM Maaltijden', [], (err, rows) => {
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

// Get maaltijd by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get('SELECT * FROM Maaltijden WHERE MaaltijdID = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Maaltijd not found' });
      }
      res.json(row);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get maaltijden by date range (useful for camps)
router.get('/between/:startDate/:endDate', authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.params;
    const db = database.instance;
    db.all(
      'SELECT * FROM Maaltijden WHERE Datum BETWEEN ? AND ? ORDER BY Datum, Soort_Maaltijd',
      [startDate, endDate],
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

// Create new maaltijd
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Datum, Soort_Maaltijd, Aantal_Eters = 0, Aantal_Porties_Gegeten = 0 } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Maaltijden (Datum, Soort_Maaltijd, Aantal_Eters, Aantal_Porties_Gegeten) VALUES (?, ?, ?, ?)',
      [Datum, Soort_Maaltijd, Aantal_Eters, Aantal_Porties_Gegeten],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ 
          id: this.lastID, 
          message: 'Maaltijd created successfully' 
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update maaltijd
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Datum, Soort_Maaltijd, Aantal_Eters, Aantal_Porties_Gegeten } = req.body;
    const maaltijdId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Maaltijden SET Datum = ?, Soort_Maaltijd = ?, Aantal_Eters = ?, Aantal_Porties_Gegeten = ? WHERE MaaltijdID = ?',
      [Datum, Soort_Maaltijd, Aantal_Eters, Aantal_Porties_Gegeten, maaltijdId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Maaltijd not found' });
        }
        
        res.json({ message: 'Maaltijd updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete maaltijd
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run('DELETE FROM Maaltijden WHERE MaaltijdID = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Maaltijd not found' });
      }
      
      res.json({ message: 'Maaltijd deleted successfully' });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get participants of a meal
router.get('/:id/deelnemers', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT l.*, md.Aanwezig, md.Speciale_Wensen  
       FROM Lid l
       JOIN Maaltijd_Deelnemers md ON l.LidID = md.LidID
       WHERE md.MaaltijdID = ?`,
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

// Add participant to meal
router.post('/:id/deelnemers/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Aanwezig = true, Speciale_Wensen = '' } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Maaltijd_Deelnemers (MaaltijdID, LidID, Aanwezig, Speciale_Wensen) VALUES (?, ?, ?, ?)',
      [req.params.id, req.params.lidId, Aanwezig ? 1 : 0, Speciale_Wensen],
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

// Update participant's meal attendance or special wishes
router.put('/:id/deelnemers/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Aanwezig, Speciale_Wensen } = req.body;
    
    const db = database.instance;
    db.run(
      'UPDATE Maaltijd_Deelnemers SET Aanwezig = ?, Speciale_Wensen = ? WHERE MaaltijdID = ? AND LidID = ?',
      [Aanwezig ? 1 : 0, Speciale_Wensen, req.params.id, req.params.lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Maaltijd deelnemer not found' });
        }
        
        res.json({ message: 'Deelnemer updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove participant from meal
router.delete('/:id/deelnemers/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'DELETE FROM Maaltijd_Deelnemers WHERE MaaltijdID = ? AND LidID = ?',
      [req.params.id, req.params.lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Relation not found' });
        }
        
        res.json({ message: 'Deelnemer removed successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get preparation team for a meal
router.get('/:id/bereidingsteam', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT l.* 
       FROM Lid l
       JOIN Bereidingsteam b ON l.LidID = b.LidID
       WHERE b.MaaltijdID = ?`,
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

// Add member to preparation team
router.post('/:id/bereidingsteam/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'INSERT INTO Bereidingsteam (MaaltijdID, LidID) VALUES (?, ?)',
      [req.params.id, req.params.lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ message: 'Member added to bereidingsteam successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from preparation team
router.delete('/:id/bereidingsteam/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'DELETE FROM Bereidingsteam WHERE MaaltijdID = ? AND LidID = ?',
      [req.params.id, req.params.lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Relation not found' });
        }
        
        res.json({ message: 'Member removed from bereidingsteam successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
