const express = require('express');
const router = express.Router();
const DbService = require('../../../db/services/db.service');
const { authenticate, authorizeAdmin } = require('../../../middleware/auth');

// Get all kampen (camps)
router.get('/', authenticate, async (req, res) => {
  try {
    const camps = await DbService.getAll('Kampen');
    res.json(camps);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get kamp by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const camp = await DbService.getById('Kampen', 'KampID', req.params.id);
    
    if (!camp) {
      return res.status(404).json({ error: 'Kamp not found' });
    }
    
    res.json(camp);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get participants of a camp
router.get('/:id/deelnemers', authenticate, async (req, res) => {
  try {
    const participants = await DbService.query(
      `SELECT l.*, d.Heeft_Betaald 
       FROM Lid l
       JOIN Deelname d ON l.LidID = d.LidID
       WHERE d.KampID = ?`,
      [req.params.id]
    );
    
    res.json(participants);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new kamp
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Startdatum, Eindatum, Naam, Thema } = req.body;
    
    const result = await DbService.create('Kampen', {
      Startdatum,
      Eindatum,
      Naam,
      Thema
    });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Kamp created successfully' 
    });
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
    
    const result = await DbService.update('Kampen', 'KampID', kampId, {
      Startdatum,
      Eindatum,
      Naam,
      Thema
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Kamp not found' });
    }
    
    res.json({ message: 'Kamp updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add participant to camp
router.post('/:id/deelnemer/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Heeft_Betaald } = req.body;
    
    try {
      await DbService.create('Deelname', {
        KampID: req.params.id,
        LidID: req.params.lidId,
        Heeft_Betaald: Heeft_Betaald ? 1 : 0
      });
      
      res.status(201).json({ message: 'Deelnemer added successfully' });
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

// Update payment status of participant
router.put('/:id/deelnemer/:lidId/betaling', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Heeft_Betaald } = req.body;
    
    const result = await DbService.query(
      'UPDATE Deelname SET Heeft_Betaald = ? WHERE KampID = ? AND LidID = ?',
      [Heeft_Betaald ? 1 : 0, req.params.id, req.params.lidId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Deelnemer not found' });
    }
    
    res.json({ message: 'Payment status updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all meals for a camp
router.get('/:id/maaltijden', authenticate, async (req, res) => {
  try {
    const meals = await DbService.query(
      `SELECT m.* 
       FROM Maaltijden m
       JOIN Maaltijd_Kamp mk ON m.MaaltijdID = mk.MaaltijdID
       WHERE mk.KampID = ?
       ORDER BY m.Datum, m.Soort_Maaltijd`,
      [req.params.id]
    );
    
    res.json(meals);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Link meal to camp
router.post('/:id/maaltijden/:maaltijdId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    // First check if relation already exists
    const existingRelation = await DbService.queryOne(
      'SELECT 1 FROM Maaltijd_Kamp WHERE KampID = ? AND MaaltijdID = ?',
      [req.params.id, req.params.maaltijdId]
    );
    
    if (existingRelation) {
      return res.status(409).json({ error: 'Deze maaltijd is al gekoppeld aan dit kamp' });
    }
    
    // If not exists, create the relation
    await DbService.create('Maaltijd_Kamp', {
      KampID: req.params.id,
      MaaltijdID: req.params.maaltijdId
    });
    
    res.status(201).json({ message: 'Maaltijd linked to kamp successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove meal from camp
router.delete('/:id/maaltijden/:maaltijdId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await DbService.query(
      'DELETE FROM Maaltijd_Kamp WHERE KampID = ? AND MaaltijdID = ?',
      [req.params.id, req.params.maaltijdId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Relation not found' });
    }
    
    res.json({ message: 'Maaltijd removed from kamp successfully' });
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
    
    try {
      await DbService.beginTransaction();
      
      // Get camp dates to validate meal dates
      const camp = await DbService.getById('Kampen', 'KampID', kampId);
      
      if (!camp) {
        await DbService.rollback();
        return res.status(404).json({ error: 'Camp not found' });
      }
      
      const startDate = new Date(camp.Startdatum);
      const endDate = new Date(camp.Eindatum);
      
      // Create meals and link them to the camp
      const createdMeals = [];
      
      for (const meal of meals) {
        const mealDate = new Date(meal.Datum);
        
        // Validate that meal date is within camp dates
        if (mealDate < startDate || mealDate > endDate) {
          await DbService.rollback();
          throw new Error(`Meal date ${meal.Datum} is outside of camp dates`);
        }
        
        // Insert meal
        const mealResult = await DbService.create('Maaltijden', {
          Datum: meal.Datum,
          Soort_Maaltijd: meal.Soort_Maaltijd,
          Aantal_Eters: meal.Aantal_Eters || 0,
          Aantal_Porties_Gegeten: meal.Aantal_Porties_Gegeten || 0
        });
        
        const mealId = mealResult.id;
        
        // Link meal to camp
        await DbService.create('Maaltijd_Kamp', {
          KampID: kampId,
          MaaltijdID: mealId
        });
        
        createdMeals.push({ id: mealId, ...meal });
      }
      
      await DbService.commit();
      
      res.status(201).json({ 
        message: `${createdMeals.length} meals created and linked to camp successfully`,
        meals: createdMeals
      });
      
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: error.message || 'Server error' });
  }
});

// Get wei (field) associated with a camp
router.get('/:id/wei', authenticate, async (req, res) => {
  try {
    const wei = await DbService.queryOne(
      `SELECT w.*, kw.Voorgaande_Prijs, kw.Ervaring, kw.Opmerkingen
       FROM Weien w
       JOIN Kamp_Wei kw ON w.WeiID = kw.WeiID
       WHERE kw.KampID = ?`,
      [req.params.id]
    );
    
    if (!wei) {
      return res.status(404).json({ error: 'No wei associated with this camp' });
    }
    
    res.json(wei);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete kamp
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const kampId = req.params.id;
    
    try {
      await DbService.beginTransaction();
      
      // First remove all Maaltijd_Kamp relationships
      await DbService.delete('Maaltijd_Kamp', 'KampID', kampId);
      
      // Remove all Deelname records (participants)
      await DbService.delete('Deelname', 'KampID', kampId);
      
      // Remove Kamp_Wei relationships
      await DbService.delete('Kamp_Wei', 'KampID', kampId);
      
      // Finally, delete the camp itself
      const result = await DbService.delete('Kampen', 'KampID', kampId);
      
      if (result.notFound) {
        await DbService.rollback();
        return res.status(404).json({ error: 'Kamp not found' });
      }
      
      await DbService.commit();
      res.json({ message: 'Kamp successfully deleted' });
      
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
