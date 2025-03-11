const express = require('express');
const router = express.Router();
const DbService = require('../../../db/services/db.service');
const { authenticate, authorizeAdmin } = require('../../../middleware/auth');

// Get all leden (members) with optional filtering
router.get('/', authenticate, async (req, res) => {
  try {
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
    
    const members = await DbService.query(query, params);
    res.json(members);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get lid (member) by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const member = await DbService.queryOne(
      `SELECT l.*, CASE WHEN lei.LidID IS NOT NULL THEN 1 ELSE 0 END AS IsLeiding 
       FROM Lid l
       LEFT JOIN Leiding lei ON l.LidID = lei.LidID
       WHERE l.LidID = ?`,
      [req.params.id]
    );
    
    if (!member) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    res.json(member);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get detailed information about a member including relationships
router.get('/:id/details', authenticate, async (req, res) => {
  try {
    const lidId = req.params.id;
    
    // Get basic member info
    const member = await DbService.queryOne(
      `SELECT l.*, CASE WHEN lei.LidID IS NOT NULL THEN 1 ELSE 0 END AS IsLeiding,
       lei.Is_Groepsleiding, lei.Is_Hopman
       FROM Lid l
       LEFT JOIN Leiding lei ON l.LidID = lei.LidID
       WHERE l.LidID = ?`,
      [lidId]
    );
    
    if (!member) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    // Get parents
    const parents = await DbService.query(
      `SELECT o.*, u.email 
       FROM Ouder o
       JOIN Lid_Ouder lo ON o.OuderID = lo.OuderID
       JOIN users u ON o.firebase_uid = u.firebase_uid
       WHERE lo.LidID = ?`,
      [lidId]
    );
    
    // Get camp participation
    const camps = await DbService.query(
      `SELECT k.*, d.Heeft_Betaald
       FROM Kampen k
       JOIN Deelname d ON k.KampID = d.KampID
       WHERE d.LidID = ?
       ORDER BY k.Startdatum DESC`,
      [lidId]
    );
    
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
    
    const result = await DbService.create('Lid', {
      Voornaam,
      Achternaam,
      Geboortedatum,
      Allergieën,
      Dieetwensen,
      Tak,
      Telefoonnummer,
      Is_Actief: Is_Actief ? 1 : 0,
      Lidmaatschap_Datum
    });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Lid successfully created'
    });
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
    
    const result = await DbService.update('Lid', 'LidID', lidId, {
      Voornaam,
      Achternaam,
      Geboortedatum,
      Allergieën,
      Dieetwensen,
      Tak,
      Telefoonnummer,
      Is_Actief: Is_Actief ? 1 : 0,
      Lidmaatschap_Datum
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    res.json({ message: 'Lid updated successfully' });
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
    
    const result = await DbService.update('Lid', 'LidID', lidId, {
      Allergieën: allergies
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    res.json({ message: 'Allergies updated successfully' });
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
    
    const result = await DbService.update('Lid', 'LidID', lidId, {
      Dieetwensen: dietary
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    res.json({ message: 'Dietary preferences updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete lid (member)
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const lidId = req.params.id;
    
    try {
      await DbService.beginTransaction();
      
      // Remove from Leiding if exists
      await DbService.delete('Leiding', 'LidID', lidId);
      
      // Remove from Lid_Ouder relationships
      await DbService.delete('Lid_Ouder', 'LidID', lidId);
      
      // Remove from Deelname (camp participation)
      await DbService.delete('Deelname', 'LidID', lidId);
      
      // Remove from Maaltijd_Deelnemers
      await DbService.delete('Maaltijd_Deelnemers', 'LidID', lidId);
      
      // Remove from Bereidingsteam
      await DbService.delete('Bereidingsteam', 'LidID', lidId);
      
      // Finally delete the Lid
      const result = await DbService.delete('Lid', 'LidID', lidId);
      
      if (result.notFound) {
        await DbService.rollback();
        return res.status(404).json({ error: 'Lid not found' });
      }
      
      await DbService.commit();
      res.json({ message: 'Lid deleted successfully' });
      
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
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
    
    // First check if the member exists
    const member = await DbService.getById('Lid', 'LidID', lidId);
    
    if (!member) {
      return res.status(404).json({ error: 'Lid not found' });
    }
    
    // Check if already a leader
    const isLeader = await DbService.queryOne(
      'SELECT 1 FROM Leiding WHERE LidID = ?', 
      [lidId]
    );
    
    if (isLeader) {
      // Update existing leader record
      await DbService.update('Leiding', 'LidID', lidId, {
        Is_Groepsleiding: Is_Groepsleiding ? 1 : 0,
        Is_Hopman: Is_Hopman ? 1 : 0
      });
      
      res.json({ message: 'Leader status updated successfully' });
    } else {
      // Create new leader record
      await DbService.create('Leiding', {
        LidID: lidId,
        Is_Groepsleiding: Is_Groepsleiding ? 1 : 0,
        Is_Hopman: Is_Hopman ? 1 : 0
      });
      
      res.status(201).json({ message: 'Member promoted to leader successfully' });
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
    
    const result = await DbService.delete('Leiding', 'LidID', lidId);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Person is not a leader' });
    }
    
    res.json({ message: 'Leader demoted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get parents of a member
router.get('/:id/ouders', authenticate, async (req, res) => {
  try {
    const lidId = req.params.id;
    
    const parents = await DbService.query(
      `SELECT o.*, u.email 
       FROM Ouder o
       JOIN Lid_Ouder lo ON o.OuderID = lo.OuderID
       JOIN users u ON o.firebase_uid = u.firebase_uid
       WHERE lo.LidID = ?`,
      [lidId]
    );
    
    res.json(parents || []);
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
    
    try {
      await DbService.create('Lid_Ouder', {
        LidID: lidId,
        OuderID: ouderId
      });
      
      res.status(201).json({ message: 'Parent linked to member successfully' });
    } catch (err) {
      // Check for unique constraint violation (already linked)
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Parent already linked to this member' });
      }
      throw err;
    }
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
    
    const result = await DbService.query(
      'DELETE FROM Lid_Ouder WHERE LidID = ? AND OuderID = ?',
      [lidId, ouderId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Relationship not found' });
    }
    
    res.json({ message: 'Parent unlinked from member successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get camps for a member
router.get('/:id/kampen', authenticate, async (req, res) => {
  try {
    const lidId = req.params.id;
    
    const camps = await DbService.query(
      `SELECT k.*, d.Heeft_Betaald
       FROM Kampen k
       JOIN Deelname d ON k.KampID = d.KampID
       WHERE d.LidID = ?
       ORDER BY k.Startdatum DESC`,
      [lidId]
    );
    
    res.json(camps || []);
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
    
    try {
      await DbService.create('Deelname', {
        LidID: lidId,
        KampID: kampId,
        Heeft_Betaald: Heeft_Betaald ? 1 : 0
      });
      
      res.status(201).json({ message: 'Member added to camp successfully' });
    } catch (err) {
      // Check for unique constraint violation
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(409).json({ error: 'Member already added to this camp' });
      }
      throw err;
    }
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
    
    const result = await DbService.query(
      'UPDATE Deelname SET Heeft_Betaald = ? WHERE LidID = ? AND KampID = ?',
      [Heeft_Betaald ? 1 : 0, lidId, kampId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Participation not found' });
    }
    
    res.json({ message: 'Participation updated successfully' });
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
    
    const result = await DbService.query(
      'DELETE FROM Deelname WHERE LidID = ? AND KampID = ?',
      [lidId, kampId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Participation not found' });
    }
    
    res.json({ message: 'Member removed from camp successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all leiding (leaders)
router.get('/leiding', authenticate, async (req, res) => {
  try {
    const leaders = await DbService.query(
      `SELECT l.*, lei.Is_Groepsleiding, lei.Is_Hopman
       FROM Lid l
       JOIN Leiding lei ON l.LidID = lei.LidID
       ORDER BY l.Achternaam, l.Voornaam`
    );
    
    res.json(leaders);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Bulk create members (new endpoint)
router.post('/bulk', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { leden, skipExisting } = req.body;
    
    if (!Array.isArray(leden) || leden.length === 0) {
      return res.status(400).json({ error: 'Geen geldige ledengegevens ontvangen' });
    }
    
    const result = {
      created: 0,
      skipped: 0,
      failed: 0
    };
    
    // Start transaction
    try {
      await DbService.beginTransaction();
      
      for (const lid of leden) {
        try {
          // Check if member already exists if skipExisting is enabled
          if (skipExisting) {
            const existingMember = await DbService.queryOne(
              'SELECT 1 FROM Lid WHERE Voornaam = ? AND Achternaam = ?',
              [lid.Voornaam, lid.Achternaam]
            );
            
            if (existingMember) {
              result.skipped++;
              continue;
            }
          }
          
          // Insert the member
          const newLid = await DbService.create('Lid', {
            Voornaam: lid.Voornaam,
            Achternaam: lid.Achternaam,
            Geboortedatum: lid.Geboortedatum || null,
            Allergieën: lid.Allergieën || null,
            Dieetwensen: lid.Dieetwensen || null,
            Tak: lid.Tak || null,
            Telefoonnummer: lid.Telefoonnummer || null,
            Is_Actief: lid.Is_Actief ? 1 : 0,
            Lidmaatschap_Datum: lid.Lidmaatschap_Datum || new Date().toISOString().split('T')[0]
          });
          
          result.created++;
        } catch (error) {
          console.error('Error inserting member:', error);
          result.failed++;
        }
      }
      
      // Commit the transaction
      await DbService.commit();
      
      res.status(201).json(result);
    } catch (error) {
      // Rollback in case of error
      await DbService.rollback();
      throw error;
    }
  } catch (error) {
    console.error('Server error in bulk import:', error);
    res.status(500).json({ error: 'Server error during bulk import' });
  }
});

module.exports = router;
