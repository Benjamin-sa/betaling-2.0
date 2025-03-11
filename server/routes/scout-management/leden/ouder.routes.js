const express = require('express');
const router = express.Router();
const DbService = require('../../../db/services/db.service');
const { authenticate, authorizeAdmin } = require('../../../middleware/auth');

// Get all ouders (parents)
router.get('/', authenticate, async (req, res) => {
  try {
    const ouders = await DbService.query(
      `SELECT o.*, u.email 
       FROM Ouder o 
       JOIN users u ON o.firebase_uid = u.firebase_uid`
    );
    res.json(ouders);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get ouder by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const ouder = await DbService.queryOne(
      `SELECT o.*, u.email 
       FROM Ouder o 
       JOIN users u ON o.firebase_uid = u.firebase_uid 
       WHERE o.OuderID = ?`,
      [req.params.id]
    );
    
    if (!ouder) {
      return res.status(404).json({ error: 'Ouder not found' });
    }
    
    res.json(ouder);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get children of a parent
router.get('/:id/kinderen', authenticate, async (req, res) => {
  try {
    const kinderen = await DbService.query(
      `SELECT l.* 
       FROM Lid l
       JOIN Lid_Ouder lo ON l.LidID = lo.LidID
       WHERE lo.OuderID = ?`,
      [req.params.id]
    );
    
    res.json(kinderen);
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create new ouder
router.post('/', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const { firebase_uid } = req.body;
    
    const result = await DbService.create('Ouder', { firebase_uid });
    
    res.status(201).json({ 
      id: result.id, 
      message: 'Ouder created successfully' 
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Link child to parent
router.post('/:id/kind/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await DbService.create('Lid_Ouder', {
      OuderID: req.params.id,
      LidID: req.params.lidId
    });
    
    res.status(201).json({ message: 'Kind linked to ouder successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Remove link between child and parent
router.delete('/:id/kind/:lidId', authenticate, authorizeAdmin, async (req, res) => {
  try {
    const result = await DbService.query(
      'DELETE FROM Lid_Ouder WHERE OuderID = ? AND LidID = ?',
      [req.params.id, req.params.lidId]
    );
    
    if (result.changes === 0) {
      return res.status(404).json({ error: 'Relation not found' });
    }
    
    res.json({ message: 'Relation removed successfully' });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
