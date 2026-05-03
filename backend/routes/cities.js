const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/cities
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, name FROM cities ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
