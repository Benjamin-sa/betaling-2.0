const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate, authorizeAdmin } = require('../../middleware/auth');

// Get all leden (members) with optional filtering
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    
    // Extract query parameters for filtering
    const { tak, isActief, search } = req.query;
    
    let query = `SELECT l.*, CASE WHEN lei.LidID IS NOT NULL THEN 1 ELSE 0 END AS IsLeiding 
                 FROM Lid l
                 LEFT JOIN Leiding lei ON l.LidID = lei.LidID`;
    
    // Build WHERE clause based on filters
    const whereConditions = [];
    const params = [];
    
    if (tak) {
      whereConditions.push('l.Tak = ?');
      params.push(tak);
    }
    
    if (isActief !== undefined) {
      whereConditions.push('l.Is_Actief = ?');
      params.push(isActief === 'true' ? 1 : 0);
    }
    
    if (search) {
      whereConditions.push('(l.Voornaam LIKE ? OR l.Achternaam LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    
    // Add WHERE clause if conditions exist
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    // Order by name
    query += ' ORDER BY l.Achternaam, l.Voornaam';
    
    db.all(query, params, (err, rows) => {
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

// Get lid (member) by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.get(
      `SELECT l.*, CASE WHEN lei.LidID IS NOT NULL THEN 1 ELSE 0 END AS IsLeiding 
       FROM Lid l
       LEFT JOIN Leiding lei ON l.LidID = lei.LidID
       WHERE l.LidID = ?`,
      [req.params.id],
      (err, row) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        if (!row) {
          return res.status(404).json({ error: 'Lid not found' });
        }
        res.json(row);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detailed information about a member including relationships
router.get('/:id/details', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    const lidId = req.params.id;
    
    // Get basic member info
    const member = await new Promise((resolve, reject) => {
      db.get(
        `SELECT l.*, CASE WHEN lei.LidID IS NOT NULL THEN 1 ELSE 0 END AS IsLeiding,
         lei.Is_Groepsleiding, lei.Is_Hopman
         FROM Lid l
         LEFT JOIN Leiding lei ON l.LidID = lei.LidID
         WHERE l.LidID = ?`,
        [lidId],
        (err, row) => err ? reject(err) : resolve(row)
      );
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    // Get parents
    const parents = await new Promise((resolve, reject) => {
      db.all(
        `SELECT o.*, u.email 
         FROM Ouder o
         JOIN Lid_Ouder lo ON o.OuderID = lo.OuderID
         JOIN users u ON o.firebase_uid = u.firebase_uid
         WHERE lo.LidID = ?`,
        [lidId],
        (err, rows) => err ? reject(err) : resolve(rows || [])
      );
    });
    
    // Get camp participation
    const camps = await new Promise((resolve, reject) => {
      db.all(
        `SELECT k.*, d.Heeft_Betaald
         FROM Kampen k
         JOIN Deelname d ON k.KampID = d.KampID
         WHERE d.LidID = ?
         ORDER BY k.Startdatum DESC`,
        [lidId],
        (err, rows) => err ? reject(err) : resolve(rows || [])
      );
    });
    
    res.json({
      ...member,
      parents,
      camps
    });
    
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new lid (member)
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      Voornaam, 
      Achternaam, 
      Geboortedatum, 
      Allergieën, 
      Dieetwensen, 
      Tak, 
      Telefoonnummer, 
      Is_Actief, 
      Lidmaatschap_Datum 
    } = req.body;
    
    const db = database.instance;
    db.run(
      `INSERT INTO Lid (
        Voornaam, Achternaam, Geboortedatum, Allergieën, Dieetwensen,
        Tak, Telefoonnummer, Is_Actief, Lidmaatschap_Datum
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        Voornaam, 
        Achternaam, 
        Geboortedatum, 
        Allergieën, 
        Dieetwensen, 
        Tak, 
        Telefoonnummer, 
        Is_Actief ? 1 : 0, 
        Lidmaatschap_Datum
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        const lidId = this.lastID;
        
        res.status(201).json({ 
          id: lidId, 
          message: 'Lid successfully created'
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update lid (member)
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { 
      Voornaam, 
      Achternaam, 
      Geboortedatum, 
      Allergieën, 
      Dieetwensen, 
      Tak, 
      Telefoonnummer, 
      Is_Actief, 
      Lidmaatschap_Datum 
    } = req.body;
    
    const lidId = req.params.id;
    
    const db = database.instance;
    db.run(
      `UPDATE Lid SET
        Voornaam = ?, Achternaam = ?, Geboortedatum = ?,
        Allergieën = ?, Dieetwensen = ?, Tak = ?,
        Telefoonnummer = ?, Is_Actief = ?, Lidmaatschap_Datum = ?
       WHERE LidID = ?`,
      [
        Voornaam, 
        Achternaam, 
        Geboortedatum, 
        Allergieën, 
        Dieetwensen, 
        Tak, 
        Telefoonnummer, 
        Is_Actief ? 1 : 0, 
        Lidmaatschap_Datum,
        lidId
      ],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Lid not found' });
        }
        
        res.json({ 
          message: 'Lid updated successfully'
        });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update member allergies
router.put('/:id/allergies', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { allergies } = req.body;
    const lidId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Lid SET Allergieën = ? WHERE LidID = ?',
      [allergies, lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Lid not found' });
        }
        
        res.json({ message: 'Allergies updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update member dietary preferences
router.put('/:id/dietary', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { dietary } = req.body;
    const lidId = req.params.id;
    
    const db = database.instance;
    db.run(
      'UPDATE Lid SET Dieetwensen = ? WHERE LidID = ?',
      [dietary, lidId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Lid not found' });
        }
        
        res.json({ message: 'Dietary preferences updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete lid (member)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    const db = database.instance;
    
    // Begin transaction
    db.run('BEGIN TRANSACTION', (err) => {
      if (err) {
        console.error('Failed to begin transaction:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      // Remove from Leiding if exists
      db.run('DELETE FROM Leiding WHERE LidID = ?', [lidId], (err) => {
        if (err) {
          db.run('ROLLBACK');
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        // Remove from Lid_Ouder relationships
        db.run('DELETE FROM Lid_Ouder WHERE LidID = ?', [lidId], (err) => {
          if (err) {
            db.run('ROLLBACK');
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          // Remove from Deelname (camp participation)
          db.run('DELETE FROM Deelname WHERE LidID = ?', [lidId], (err) => {
            if (err) {
              db.run('ROLLBACK');
              console.error('Database error:', err);
              return res.status(500).json({ error: 'Database error' });
            }
            
            // Remove from Maaltijd_Deelnemers
            db.run('DELETE FROM Maaltijd_Deelnemers WHERE LidID = ?', [lidId], (err) => {
              if (err) {
                db.run('ROLLBACK');
                console.error('Database error:', err);
                return res.status(500).json({ error: 'Database error' });
              }
              
              // Remove from Bereidingsteam
              db.run('DELETE FROM Bereidingsteam WHERE LidID = ?', [lidId], (err) => {
                if (err) {
                  db.run('ROLLBACK');
                  console.error('Database error:', err);
                  return res.status(500).json({ error: 'Database error' });
                }
                
                // Finally delete the Lid
                db.run('DELETE FROM Lid WHERE LidID = ?', [lidId], function(err) {
                  if (err) {
                    db.run('ROLLBACK');
                    console.error('Database error:', err);
                    return res.status(500).json({ error: 'Database error' });
                  }
                  
                  if (this.changes === 0) {
                    db.run('ROLLBACK');
                    return res.status(404).json({ error: 'Lid not found' });
                  }
                  
                  // Commit the transaction
                  db.run('COMMIT', (err) => {
                    if (err) {
                      db.run('ROLLBACK');
                      console.error('Error committing transaction:', err);
                      return res.status(500).json({ error: 'Database error' });
                    }
                    
                    res.json({ message: 'Lid deleted successfully' });
                  });
                });
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

// Promote member to leader
router.post('/:id/promote-to-leiding', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    const { Is_Groepsleiding, Is_Hopman } = req.body;
    
    const db = database.instance;
    
    // First check if the member exists
    const member = await new Promise((resolve, reject) => {
      db.get('SELECT 1 FROM Lid WHERE LidID = ?', [lidId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    
    if (!member) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    // Check if already a leader
    const isLeader = await new Promise((resolve, reject) => {
      db.get('SELECT 1 FROM Leiding WHERE LidID = ?', [lidId], (err, row) => {
        if (err) reject(err);
        else resolve(row ? true : false);
      });
    });
    
    if (isLeader) {
      // Update existing leader record
      db.run(
        'UPDATE Leiding SET Is_Groepsleiding = ?, Is_Hopman = ? WHERE LidID = ?',
        [Is_Groepsleiding ? 1 : 0, Is_Hopman ? 1 : 0, lidId],
        (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.json({ message: 'Leader status updated successfully' });
        }
      );
    } else {
      // Create new leader record
      db.run(
        'INSERT INTO Leiding (LidID, Is_Groepsleiding, Is_Hopman) VALUES (?, ?, ?)',
        [lidId, Is_Groepsleiding ? 1 : 0, Is_Hopman ? 1 : 0],
        (err) => {
          if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ error: 'Database error' });
          }
          
          res.status(201).json({ message: 'Member promoted to leader successfully' });
        }
      );
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Demote from leader
router.delete('/:id/demote-from-leiding', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    
    const db = database.instance;
    db.run('DELETE FROM Leiding WHERE LidID = ?', [lidId], function(err) {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Person is not a leader' });
      }
      
      res.json({ message: 'Leader demoted successfully' });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get parents of a member
router.get('/:id/ouders', authenticate, async (req, res) => {
  try {
    const lidId = req.params.id;
    
    const db = database.instance;
    db.all(
      `SELECT o.*, u.email 
       FROM Ouder o
       JOIN Lid_Ouder lo ON o.OuderID = lo.OuderID
       JOIN users u ON o.firebase_uid = u.firebase_uid
       WHERE lo.LidID = ?`,
      [lidId],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Link parent to member
router.post('/:id/ouders', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    const { ouderId } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Lid_Ouder (LidID, OuderID) VALUES (?, ?)',
      [lidId, ouderId],
      function(err) {
        if (err) {
          // Check for unique constraint violation (already linked)
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Parent already linked to this member' });
          }
          
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ message: 'Parent linked to member successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Unlink parent from member
router.delete('/:id/ouders/:ouderId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    const ouderId = req.params.ouderId;
    
    const db = database.instance;
    db.run(
      'DELETE FROM Lid_Ouder WHERE LidID = ? AND OuderID = ?',
      [lidId, ouderId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Relationship not found' });
        }
        
        res.json({ message: 'Parent unlinked from member successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get camps for a member
router.get('/:id/kampen', authenticate, async (req, res) => {
  try {
    const lidId = req.params.id;
    
    const db = database.instance;
    db.all(
      `SELECT k.*, d.Heeft_Betaald
       FROM Kampen k
       JOIN Deelname d ON k.KampID = d.KampID
       WHERE d.LidID = ?
       ORDER BY k.Startdatum DESC`,
      [lidId],
      (err, rows) => {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        res.json(rows || []);
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to camp
router.post('/:id/kampen/:kampId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    const kampId = req.params.kampId;
    const { Heeft_Betaald } = req.body;
    
    const db = database.instance;
    db.run(
      'INSERT INTO Deelname (LidID, KampID, Heeft_Betaald) VALUES (?, ?, ?)',
      [lidId, kampId, Heeft_Betaald ? 1 : 0],
      function(err) {
        if (err) {
          // Check for unique constraint violation (already participating)
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(409).json({ error: 'Member already added to this camp' });
          }
          
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        res.status(201).json({ message: 'Member added to camp successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update member's camp participation
router.put('/:id/kampen/:kampId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    const kampId = req.params.kampId;
    const { Heeft_Betaald } = req.body;
    
    const db = database.instance;
    db.run(
      'UPDATE Deelname SET Heeft_Betaald = ? WHERE LidID = ? AND KampID = ?',
      [Heeft_Betaald ? 1 : 0, lidId, kampId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Participation not found' });
        }
        
        res.json({ message: 'Participation updated successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from camp
router.delete('/:id/kampen/:kampId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    const kampId = req.params.kampId;
    
    const db = database.instance;
    db.run(
      'DELETE FROM Deelname WHERE LidID = ? AND KampID = ?',
      [lidId, kampId],
      function(err) {
        if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Database error' });
        }
        
        if (this.changes === 0) {
          return res.status(404).json({ error: 'Participation not found' });
        }
        
        res.json({ message: 'Member removed from camp successfully' });
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
