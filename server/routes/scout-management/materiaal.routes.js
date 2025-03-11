const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../../middleware/auth');
const DbService = require('../../db/services/db.service');

// Get all material types
router.get('/types', authenticate, async (req, res) => {
  try {
    const types = await DbService.getAll('MaterialTypes', 'Naam');
    res.json(types);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get all materialen (materials)
router.get('/', authenticate, async (req, res) => {
  try {
    const materials = await DbService.query(`
      SELECT m.*, mt.Naam as TypeNaam 
      FROM Materialen m
      LEFT JOIN MaterialTypes mt ON m.TypeID = mt.TypeID
    `);
    res.json(materials);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get tent materials specifically
router.get('/tenten', authenticate, async (req, res) => {
  try {
    const tents = await DbService.query(`
      SELECT m.*, t.Tentpalen_In_Orde 
      FROM Materialen m
      JOIN Tenten t ON m.MateriaalID = t.MateriaalID
    `);
    res.json(tents);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get material by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const material = await DbService.getById('Materialen', 'MateriaalID', req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'Materiaal not found' });
    }
    res.json(material);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get tent details if material is a tent
router.get('/:id/tent', authenticate, async (req, res) => {
  try {
    const tent = await DbService.queryOne(`
      SELECT m.*, t.Tentpalen_In_Orde 
      FROM Materialen m
      JOIN Tenten t ON m.MateriaalID = t.MateriaalID
      WHERE m.MateriaalID = ?
    `, [req.params.id]);
    
    if (!tent) {
      return res.status(404).json({ error: 'Tent not found' });
    }
    res.json(tent);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new material
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Type, TypeID, Aantal, Aanschafdatum, Status } = req.body;
    
    const result = await DbService.create('Materialen', {
      Naam, Type, TypeID, Aantal, Aanschafdatum, Status
    });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Materiaal created successfully' 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new tent (with tent-specific properties)
router.post('/tent', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Type, Aantal, Aanschafdatum, Status, Tentpalen_In_Orde } = req.body;
    
    try {
      await DbService.beginTransaction();
      
      // Insert main material record
      const materialResult = await DbService.create('Materialen', {
        Naam, 
        Type: Type || 'Tent', 
        Aantal, 
        Aanschafdatum, 
        Status
      });
      
      // Insert tent specific record
      await DbService.create('Tenten', {
        MateriaalID: materialResult.id,
        Tentpalen_In_Orde: Tentpalen_In_Orde ? 1 : 0
      });
      
      await DbService.commit();
      
      res.status(201).json({ 
        id: materialResult.id, 
        message: 'Tent created successfully' 
      });
    } catch (err) {
      await DbService.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update material
router.put('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Naam, Type, Aantal, Aanschafdatum, Status } = req.body;
    const materiaalId = req.params.id;
    
    const result = await DbService.update('Materialen', 'MateriaalID', materiaalId, {
      Naam, Type, Aantal, Aanschafdatum, Status
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Materiaal not found' });
    }
    
    res.json({ message: 'Materiaal updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Update tent poles status
router.put('/:id/tentpalen', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { Tentpalen_In_Orde } = req.body;
    const materiaalId = req.params.id;
    
    const result = await DbService.update('Tenten', 'MateriaalID', materiaalId, {
      Tentpalen_In_Orde: Tentpalen_In_Orde ? 1 : 0
    });
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Tent not found' });
    }
    
    res.json({ message: 'Tentpalen status updated successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete material
router.delete('/:id', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await DbService.delete('Materialen', 'MateriaalID', req.params.id);
    
    if (result.notFound) {
      return res.status(404).json({ error: 'Materiaal not found' });
    }
    
    res.json({ message: 'Materiaal deleted successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
