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
    const { Startdatum, Eindatum, Naam, Thema } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Kampen (Startdatum, Eindatum, Naam, Thema) VALUES (?, ?, ?, ?)',
      [Startdatum, Eindatum, Naam, Thema],
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
    const { Startdatum, Eindatum, Naam, Thema } = req.body;
    const kampId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Kampen SET Startdatum = ?, Eindatum = ?, Naam = ?, Thema = ? WHERE KampID = ?',
      [Startdatum, Eindatum, Naam, Thema, kampId],
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

// Get all meals for a camp
router.get('/:id/maaltijden', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT m.* 
       FROM Maaltijden m
       JOIN Maaltijd_Kamp mk ON m.MaaltijdID = mk.MaaltijdID
       WHERE mk.KampID = ?
       ORDER BY m.Datum, m.Soort_Maaltijd`,
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

// Link meal to camp
router.post('/:id/maaltijden/:maaltijdId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    
    // First check if relation already exists
    db.get(
      'SELECT 1 FROM Maaltijd_Kamp WHERE KampID = ? AND MaaltijdID = ?',
      [req.params.id, req.params.maaltijdId],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (row) {
          return res.status(409).json({ error: 'Deze maaltijd is al gekoppeld aan dit kamp' });
        }
        
        // If not exists, create the relation
        db.run(
          'INSERT INTO Maaltijd_Kamp (KampID, MaaltijdID) VALUES (?, ?)',
          [req.params.id, req.params.maaltijdId],
          function(err) {
            if (err) {
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            res.status(201).json({ message: 'Maaltijd linked to kamp successfully' });
          }
        );
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove meal from camp
router.delete('/:id/maaltijden/:maaltijdId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const db = database.instance;
    db.run(
      'DELETE FROM Maaltijd_Kamp WHERE KampID = ? AND MaaltijdID = ?',
      [req.params.id, req.params.maaltijdId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Relation not found' });
        }
        
        res.json({ message: 'Maaltijd removed from kamp successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create multiple meals for a camp at once (for convenience)
router.post('/:id/maaltijden/bulk', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { meals } = req.body;
    const kampId = req.params.id;
    const db = database.instance;
    
    // Start transaction
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', err => err ? reject(err) : resolve());
    });

    try {
      // Get camp dates to validate meal dates
      const camp = await new Promise((resolve, reject) => {
        db.get(
          'SELECT Startdatum, Eindatum FROM Kampen WHERE KampID = ?',
          [kampId],
          (err, row) => {
            if (err) reject(err);
            else if (!row) reject(new Error('Camp not found'));
            else resolve(row);
          }
        );
      });

      const startDate = new Date(camp.Startdatum);
      const endDate = new Date(camp.Eindatum);
      
      // Create meals and link them to the camp
      const createdMeals = [];
      
      for (const meal of meals) {
        const mealDate = new Date(meal.Datum);
        
        // Validate that meal date is within camp dates
        if (mealDate < startDate || mealDate > endDate) {
          throw new Error(`Meal date ${meal.Datum} is outside of camp dates`);
        }
        
        // Insert meal
        const mealId = await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO Maaltijden (Datum, Soort_Maaltijd, Aantal_Eters, Aantal_Porties_Gegeten) VALUES (?, ?, ?, ?)',
            [meal.Datum, meal.Soort_Maaltijd, meal.Aantal_Eters || 0, meal.Aantal_Porties_Gegeten || 0],
            function(err) {
              if (err) reject(err);
              else resolve(this.lastID);
            }
          );
        });
        
        // Link meal to camp
        await new Promise((resolve, reject) => {
          db.run(
            'INSERT INTO Maaltijd_Kamp (KampID, MaaltijdID) VALUES (?, ?)',
            [kampId, mealId],
            err => err ? reject(err) : resolve()
          );
        });
        
        createdMeals.push({ id: mealId, ...meal });
      }
      
      // Commit transaction
      await new Promise((resolve, reject) => {
        db.run('COMMIT', err => err ? reject(err) : resolve());
      });
      
      res.status(201).json({ 
        message: `${createdMeals.length} meals created and linked to camp successfully`,
        meals: createdMeals
      });
      
    } catch (error) {
      // Rollback transaction on error
      await new Promise(resolve => {
        db.run('ROLLBACK', () => resolve());
      });
      throw error;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get wei (field) associated with a camp
router.get('/:id/wei', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get(
      `SELECT w.*, kw.Voorgaande_Prijs, kw.Ervaring, kw.Opmerkingen
       FROM Weien w
       JOIN Kamp_Wei kw ON w.WeiID = kw.WeiID
       WHERE kw.KampID = ?`,
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
          return res.status(404).json({ error: 'No wei associated with this camp' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete kamp
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const kampId = req.params.id;
    const db = database.instance;
    
    // Begin transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Failed to begin transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // First remove all Maaltijd_Kamp relationships
      db.run('DELETE FROM Maaltijd_Kamp WHERE KampID = ?', [kampId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Remove all Deelname records (participants)
        db.run('DELETE FROM Deelname WHERE KampID = ?', [kampId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Remove Kamp_Wei relationships
          db.run('DELETE FROM Kamp_Wei WHERE KampID = ?', [kampId], (err) => {
            if (err) {
              db.run('ROLLBACK');
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Finally, delete the camp itself
            db.run('DELETE FROM Kampen WHERE KampID = ?', [kampId], function(err) {
              if (err) {
                db.run('ROLLBACK');
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              if (this.changes === 0) {
                db.run('ROLLBACK');
                return res.status(404).json({ error: 'Kamp not found' });
              }
              
              // Commit the transaction
              db.run('COMMIT', (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  console.error('Error committing transaction:', err);
                  return res.status(500).json({ error: 'Database error' });
                }
                
                res.json({ message: 'Kamp successfully deleted' });
              });
            });
          });
        });
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
