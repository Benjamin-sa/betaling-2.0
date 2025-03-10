const express = require('express');
const router = express.Router();
const database = require('../../db');
const { authenticate } = require('../../middleware/auth');

// Get all leiding (leaders)
router.get('/', authenticate, async (req, res) => {
  try {
    const db = database.instance;
    db.all(
      `SELECT l.*, lei.Is_Groepsleiding, lei.Is_Hopman
       FROM Lid l
       JOIN Leiding lei ON l.LidID = lei.LidID
       ORDER BY l.Achternaam, l.Voornaam`,
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

module.exports = router;
