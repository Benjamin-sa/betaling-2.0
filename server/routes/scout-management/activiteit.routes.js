const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all activiteiten (activities)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all('SELECT * FROM Activiteiten', [], (err, rows) => {
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

// Get activiteit by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get('SELECT * FROM Activiteiten WHERE ActiviteitenID = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Activiteit not found' });
      }
      res.json(row);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get participants of an activity
router.get('/:id/deelnemers', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT l.* 
       FROM Lid l
       JOIN Activiteit_Lid al ON l.LidID = al.LidID
       WHERE al.ActiviteitenID = ?`,
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

// Get materials used for an activity
router.get('/:id/materialen', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT m.* 
       FROM Materialen m
       JOIN Activiteit_Materiaal am ON m.MateriaalID = am.MateriaalID
       WHERE am.ActiviteitenID = ?`,
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

// Create new activity
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Datum, Locatie } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Activiteiten (Datum, Locatie) VALUES (?, ?)',
      [Datum, Locatie],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ id: this.lastID, message: 'Activiteit created successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update activity
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Datum, Locatie } = req.body;
    const activiteitId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Activiteiten SET Datum = ?, Locatie = ? WHERE ActiviteitenID = ?',
      [Datum, Locatie, activiteitId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Activiteit not found' });
        }
        
        res.json({ message: 'Activiteit updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add participant to activity
router.post('/:id/deelnemer/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'INSERT INTO Activiteit_Lid (ActiviteitenID, LidID) VALUES (?, ?)',
      [req.params.id, req.params.lidId],
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

// Remove participant from activity
router.delete('/:id/deelnemer/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'DELETE FROM Activiteit_Lid WHERE ActiviteitenID = ? AND LidID = ?',
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

// Add material to activity
router.post('/:id/materiaal/:materiaalId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'INSERT INTO Activiteit_Materiaal (ActiviteitenID, MateriaalID) VALUES (?, ?)',
      [req.params.id, req.params.materiaalId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ message: 'Materiaal added successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove material from activity
router.delete('/:id/materiaal/:materiaalId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'DELETE FROM Activiteit_Materiaal WHERE ActiviteitenID = ? AND MateriaalID = ?',
      [req.params.id, req.params.materiaalId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Relation not found' });
        }
        
        res.json({ message: 'Materiaal removed successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
