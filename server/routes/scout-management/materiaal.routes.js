const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all material types
router.get('/types', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all('SELECT * FROM MaterialTypes ORDER BY Naam', [], (err, rows) => {
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

// Get all materialen (materials)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(`
      SELECT m.*, mt.Naam as TypeNaam 
      FROM Materialen m
      LEFT JOIN MaterialTypes mt ON m.TypeID = mt.TypeID
    `, [], (err, rows) => {
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

// Get tent materials specifically
router.get('/tenten', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT m.*, t.Tentpalen_In_Orde 
       FROM Materialen m
       JOIN Tenten t ON m.MateriaalID = t.MateriaalID`,
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

// Get material by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get('SELECT * FROM Materialen WHERE MateriaalID = ?', [req.params.id], (err, row) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(404).json({ error: 'Materiaal not found' });
      }
      res.json(row);
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get tent details if material is a tent
router.get('/:id/tent', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get(
      `SELECT m.*, t.Tentpalen_In_Orde 
       FROM Materialen m
       JOIN Tenten t ON m.MateriaalID = t.MateriaalID
       WHERE m.MateriaalID = ?`, 
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
          return res.status(404).json({ error: 'Tent not found' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new material
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Type, TypeID, Aantal, Aanschafdatum, Status } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Materialen (Naam, Type, TypeID, Aantal, Aanschafdatum, Status) VALUES (?, ?, ?, ?, ?, ?)',
      [Naam, Type, TypeID, Aantal, Aanschafdatum, Status],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ id: this.lastID, message: 'Materiaal created successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new tent (with tent-specific properties)
router.post('/tent', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Type, Aantal, Aanschafdatum, Status, Tentpalen_In_Orde } = req.body;
    
    const db = database.instance;
    
    // Begin transaction to insert both material and tent records
    db.serialize(() => {
      db.run('BEGIN TRANSACTION');
      
      db.run(
        'INSERT INTO Materialen (Naam, Type, Aantal, Aanschafdatum, Status) VALUES (?, ?, ?, ?, ?)',
        [Naam, Type || 'Tent', Aantal, Aanschafdatum, Status],
        function(err) {
          if (err) {
            db.run('ROLLBACK');
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          const materiaalId = this.lastID;
          
          db.run(
            'INSERT INTO Tenten (MateriaalID, Tentpalen_In_Orde) VALUES (?, ?)',
            [materiaalId, Tentpalen_In_Orde ? 1 : 0],
            function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Database error' });
                }
                
                res.status(201).json({ id: materiaalId, message: 'Tent created successfully' });
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update material
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Type, Aantal, Aanschafdatum, Status } = req.body;
    const materiaalId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Materialen SET Naam = ?, Type = ?, Aantal = ?, Aanschafdatum = ?, Status = ? WHERE MateriaalID = ?',
      [Naam, Type, Aantal, Aanschafdatum, Status, materiaalId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Materiaal not found' });
        }
        
        res.json({ message: 'Materiaal updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update tent poles status
router.put('/:id/tentpalen', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Tentpalen_In_Orde } = req.body;
    const materiaalId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Tenten SET Tentpalen_In_Orde = ? WHERE MateriaalID = ?',
      [Tentpalen_In_Orde ? 1 : 0, materiaalId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Tent not found' });
        }
        
        res.json({ message: 'Tentpalen status updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete material
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run('DELETE FROM Materialen WHERE MateriaalID = ?', [req.params.id], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Materiaal not found' });
      }
      
      res.json({ message: 'Materiaal deleted successfully' });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
