const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all leiding (leaders)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT l.*, ld.* 
       FROM Leiding l
       JOIN Lid ld ON l.LidID = ld.LidID`,
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

// Get leiding by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get(
      `SELECT l.*, ld.* 
       FROM Leiding l
       JOIN Lid ld ON l.LidID = ld.LidID
       WHERE l.LidID = ?`,
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
          return res.status(404).json({ error: 'Leiding not found' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new leiding (assuming lid already exists)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { LidID, Is_Groepsleiding, Is_Hopman } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Leiding (LidID, Is_Groepsleiding, Is_Hopman) VALUES (?, ?, ?)',
      [LidID, Is_Groepsleiding ? 1 : 0, Is_Hopman ? 1 : 0],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ id: LidID, message: 'Leiding created successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update leiding
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Is_Groepsleiding, Is_Hopman } = req.body;
    const lidId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Leiding SET Is_Groepsleiding = ?, Is_Hopman = ? WHERE LidID = ?',
      [Is_Groepsleiding ? 1 : 0, Is_Hopman ? 1 : 0, lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Leiding not found' });
        }
        
        res.json({ message: 'Leiding updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete leiding
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run('DELETE FROM Leiding WHERE LidID = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Leiding not found' });
      }
      
      res.json({ message: 'Leiding deleted successfully' });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
