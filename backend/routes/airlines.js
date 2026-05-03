const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');

// GET /api/airlines  — public
router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM airlines ORDER BY name');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/airlines  (admin)
router.post('/', requireAdmin, async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Firma adı ve kodu zorunludur' });
  try {
    const [result] = await db.query(
      'INSERT INTO airlines (name, code) VALUES (?, ?)',
      [name.trim(), code.trim().toUpperCase()]
    );
    res.status(201).json({ id: result.insertId, message: 'Havayolu eklendi' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Bu firma adı veya kodu zaten mevcut' });
    res.status(500).json({ error: 'Database error' });
  }
});

// PUT /api/airlines/:id  (admin)
router.put('/:id', requireAdmin, async (req, res) => {
  const { name, code } = req.body;
  if (!name || !code) return res.status(400).json({ error: 'Firma adı ve kodu zorunludur' });
  try {
    const [result] = await db.query(
      'UPDATE airlines SET name=?, code=? WHERE id=?',
      [name.trim(), code.trim().toUpperCase(), req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Havayolu bulunamadı' });
    res.json({ message: 'Güncellendi' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Bu firma adı veya kodu zaten mevcut' });
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/airlines/:id  (admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [[{ cnt }]] = await db.query(
      'SELECT COUNT(*) AS cnt FROM flights WHERE airline_id = ?',
      [req.params.id]
    );
    if (cnt > 0) return res.status(409).json({ error: `Bu firmaya ait ${cnt} uçuş var. Önce uçuşları silin.` });

    const [result] = await db.query('DELETE FROM airlines WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Havayolu bulunamadı' });
    res.json({ message: 'Silindi' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
