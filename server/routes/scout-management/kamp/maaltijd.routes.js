const express = require('express');
const router = express.Router();
const DbService = require('../../../db/services/db.service');
const { authenticate, authorizeAdmin } = require('../../../middleware/auth');

// Get all maaltijden (meals)
router.get('/', authenticate, async (req, res) => {
  try {
    const meals = await DbService.getAll('Maaltijden');
    res.json(meals);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get maaltijd by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const meal = await DbService.getById('Maaltijden', 'MaaltijdID', req.params.id);
    
    if (!meal) {
      return res.status(404).json({ error: 'Maaltijd not found' });
    }
    
    res.json(meal);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new maaltijd
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Datum, Soort_Maaltijd, Aantal_Eters = 0, Aantal_Porties_Gegeten = 0 } = req.body;
    
    const result = await DbService.create('Maaltijden', {
      Datum,
      Soort_Maaltijd,
      Aantal_Eters,
      Aantal_Porties_Gegeten
    });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Maaltijd created successfully' 
    });
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
    
    const result = await DbService.update('Maaltijden', 'MaaltijdID', maaltijdId, {
      Datum,
      Soort_Maaltijd,
      Aantal_Eters,
      Aantal_Porties_Gegeten
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Maaltijd not found' });
    }
    
    res.json({ message: 'Maaltijd updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete maaltijd
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await DbService.delete('Maaltijden', 'MaaltijdID', req.params.id);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Maaltijd not found' });
    }
    
    res.json({ message: 'Maaltijd deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get participants of a meal
router.get('/:id/deelnemers', authenticate, async (req, res) => {
  try {
    const participants = await DbService.query(
      `SELECT l.*, md.Aanwezig, md.Speciale_Wensen  
       FROM Lid l
       JOIN Maaltijd_Deelnemers md ON l.LidID = md.LidID
       WHERE md.MaaltijdID = ?`,
      [req.params.id]
    );
    
    res.json(participants);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add participant to meal
router.post('/:id/deelnemers/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Aanwezig = true, Speciale_Wensen = '' } = req.body;
    
    await DbService.create('Maaltijd_Deelnemers', {
      MaaltijdID: req.params.id,
      LidID: req.params.lidId,
      Aanwezig: Aanwezig ? 1 : 0,
      Speciale_Wensen
    });
    
    res.status(201).json({ message: 'Deelnemer added successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update participant's meal attendance or special wishes
router.put('/:id/deelnemers/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Aanwezig, Speciale_Wensen } = req.body;
    
    const result = await DbService.query(
      'UPDATE Maaltijd_Deelnemers SET Aanwezig = ?, Speciale_Wensen = ? WHERE MaaltijdID = ? AND LidID = ?',
      [Aanwezig ? 1 : 0, Speciale_Wensen, req.params.id, req.params.lidId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Maaltijd deelnemer not found' });
    }
    
    res.json({ message: 'Deelnemer updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove participant from meal
router.delete('/:id/deelnemers/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await DbService.query(
      'DELETE FROM Maaltijd_Deelnemers WHERE MaaltijdID = ? AND LidID = ?',
      [req.params.id, req.params.lidId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Relation not found' });
    }
    
    res.json({ message: 'Deelnemer removed successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get preparation team for a meal
router.get('/:id/bereidingsteam', authenticate, async (req, res) => {
  try {
    const team = await DbService.query(
      `SELECT l.* 
       FROM Lid l
       JOIN Bereidingsteam b ON l.LidID = b.LidID
       WHERE b.MaaltijdID = ?`,
      [req.params.id]
    );
    
    res.json(team);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add member to preparation team
router.post('/:id/bereidingsteam/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    await DbService.create('Bereidingsteam', {
      MaaltijdID: req.params.id,
      LidID: req.params.lidId
    });
    
    res.status(201).json({ message: 'Member added to bereidingsteam successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove member from preparation team
router.delete('/:id/bereidingsteam/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await DbService.query(
      'DELETE FROM Bereidingsteam WHERE MaaltijdID = ? AND LidID = ?',
      [req.params.id, req.params.lidId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Relation not found' });
    }
    
    res.json({ message: 'Member removed from bereidingsteam successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
