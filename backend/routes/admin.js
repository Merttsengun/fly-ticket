const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const db = require('../db/connection');
const { requireAdmin, generateToken, deleteToken } = require('../middleware/auth');

// POST /api/admin/login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  try {
    const [rows] = await db.query('SELECT * FROM admins WHERE username = ?', [username]);
    if (rows.length === 0) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(rows[0].id, rows[0].username);
    res.json({ token, username: rows[0].username });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  const auth = req.headers['authorization'];
  if (auth && auth.startsWith('Bearer ')) {
    deleteToken(auth.slice(7));
  }
  res.json({ message: 'Logged out' });
});

// GET /api/admin/me
router.get('/me', requireAdmin, (req, res) => {
  res.json({ username: req.adminUsername });
});

module.exports = router;
