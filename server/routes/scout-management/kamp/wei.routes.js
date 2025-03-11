const express = require('express');
const router = express.Router();
const DbService = require('../../../db/services/db.service');
const { authenticate, authorizeAdmin } = require('../../../middleware/auth');

// Get all weien (fields/meadows)
router.get('/', authenticate, async (req, res) => {
  try {
    const fields = await DbService.getAll('Weien');
    res.json(fields);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get wei by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const field = await DbService.getById('Weien', 'WeiID', req.params.id);
    
    if (!field) {
      return res.status(404).json({ error: 'Wei not found' });
    }
    
    res.json(field);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new wei
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Telefoonnummer, Email, Aantal_Hectare, Contactpersoon, Coordinaten } = req.body;
    
    const result = await DbService.create('Weien', {
      Naam,
      Telefoonnummer,
      Email,
      Aantal_Hectare,
      Contactpersoon,
      Coordinaten
    });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Wei created successfully' 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update wei
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Telefoonnummer, Email, Aantal_Hectare, Contactpersoon, Coordinaten } = req.body;
    const weiId = req.params.id;
    
    const result = await DbService.update('Weien', 'WeiID', weiId, {
      Naam,
      Telefoonnummer,
      Email,
      Aantal_Hectare,
      Contactpersoon,
      Coordinaten
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Wei not found' });
    }
    
    res.json({ message: 'Wei updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete wei
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const weiId = req.params.id;
    
    // First check if the wei is linked to any camps
    const result = await DbService.queryOne(
      'SELECT COUNT(*) as count FROM Kamp_Wei WHERE WeiID = ?', 
      [weiId]
    );
    
    // If wei is being used in camps, don't allow deletion
    if (result && result.count > 0) {
      return res.status(400).json({ 
        error: 'Wei kan niet worden verwijderd omdat deze in gebruik is bij één of meerdere kampen' 
      });
    }
    
    // Delete the wei if not in use
    const deleteResult = await DbService.delete('Weien', 'WeiID', weiId);
    
    if (deleteResult.notFound) {
      return res.status(404).json({ error: 'Wei not found' });
    }
    
    res.json({ message: 'Wei successfully deleted' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Link wei to camp with additional data
router.post('/:id/kamp/:kampId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Voorgaande_Prijs, Ervaring, Opmerkingen } = req.body;
    
    await DbService.create('Kamp_Wei', {
      WeiID: req.params.id,
      KampID: req.params.kampId,
      Voorgaande_Prijs,
      Ervaring,
      Opmerkingen
    });
    
    res.status(201).json({ message: 'Wei linked to kamp successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
