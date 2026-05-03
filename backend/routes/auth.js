const express = require('express');
const router  = express.Router();
const bcrypt  = require('bcryptjs');
const db      = require('../db/connection');
const { generateUserToken, storeUserToken, deleteUserToken, requireUser } = require('../middleware/userAuth');

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { name, surname, email, password } = req.body;

  if (!name || !surname || !email || !password) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Şifre en az 6 karakter olmalıdır' });
  }

  try {
    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, surname, email, password_hash) VALUES (?, ?, ?, ?)',
      [name.trim(), surname.trim(), email.trim().toLowerCase(), hash]
    );
    res.status(201).json({ id: result.insertId, message: 'Kayıt başarılı' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Bu e-posta adresi zaten kayıtlı' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-posta ve şifre gerekli' });
  }

  try {
    const [rows] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email.trim().toLowerCase()]
    );
    if (!rows.length) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const user = rows[0];
    const ok   = await bcrypt.compare(password, user.password_hash);
    if (!ok) {
      return res.status(401).json({ error: 'E-posta veya şifre hatalı' });
    }

    const token = generateUserToken();
    storeUserToken(token, user.id);

    res.json({
      token,
      user: { id: user.id, name: user.name, surname: user.surname, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/auth/logout
router.post('/logout', requireUser, (req, res) => {
  deleteUserToken(req.userToken);
  res.json({ message: 'Çıkış yapıldı' });
});

// GET /api/auth/me
router.get('/me', requireUser, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT id, name, surname, email, created_at FROM users WHERE id = ?',
      [req.userId]
    );
    if (!rows.length) return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/auth/my-tickets
router.get('/my-tickets', requireUser, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, t.booking_reference, t.passenger_name, t.passenger_surname,
             t.passenger_email, t.booked_at, t.seat_number,
             f.flight_number, dc.name AS departure_city, ac.name AS arrival_city,
             f.departure_time, f.arrival_time, f.price,
             al.name AS airline_name, al.code AS airline_code
      FROM tickets t
      JOIN flights f  ON t.flight_id = f.id
      JOIN cities dc  ON f.departure_city_id = dc.id
      JOIN cities ac  ON f.arrival_city_id   = ac.id
      LEFT JOIN airlines al ON f.airline_id  = al.id
      WHERE t.user_id = ?
      ORDER BY t.booked_at DESC
    `, [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
