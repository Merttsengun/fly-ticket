const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');

function generateRef() {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

// POST /api/tickets  — book a ticket
router.post('/', async (req, res) => {
  const { flight_id, passenger_name, passenger_surname, passenger_email } = req.body;

  if (!flight_id || !passenger_name || !passenger_surname || !passenger_email) {
    return res.status(400).json({ error: 'All passenger fields are required' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [flights] = await conn.query(
      'SELECT id, seats_available FROM flights WHERE id = ? FOR UPDATE',
      [flight_id]
    );
    if (flights.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Flight not found' }); }
    if (flights[0].seats_available <= 0) { await conn.rollback(); return res.status(409).json({ error: 'No seats available' }); }

    const ref = generateRef();
    const [result] = await conn.query(
      'INSERT INTO tickets (flight_id, passenger_name, passenger_surname, passenger_email, booking_reference) VALUES (?, ?, ?, ?, ?)',
      [flight_id, passenger_name, passenger_surname, passenger_email, ref]
    );

    await conn.query('UPDATE flights SET seats_available = seats_available - 1 WHERE id = ?', [flight_id]);
    await conn.commit();

    res.status(201).json({ id: result.insertId, booking_reference: ref, message: 'Booking confirmed' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

// GET /api/tickets  (admin only)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.id, t.booking_reference, t.passenger_name, t.passenger_surname,
             t.passenger_email, t.booked_at,
             f.flight_number, dc.name AS departure_city, ac.name AS arrival_city,
             f.departure_time, f.arrival_time, f.price
      FROM tickets t
      JOIN flights f ON t.flight_id = f.id
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id
      ORDER BY t.booked_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/tickets/:ref  — lookup by booking reference
router.get('/:ref', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.booking_reference, t.passenger_name, t.passenger_surname,
             t.passenger_email, t.booked_at,
             f.flight_number, dc.name AS departure_city, ac.name AS arrival_city,
             f.departure_time, f.arrival_time, f.price
      FROM tickets t
      JOIN flights f ON t.flight_id = f.id
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id
      WHERE t.booking_reference = ?
    `, [req.params.ref]);

    if (rows.length === 0) return res.status(404).json({ error: 'Ticket not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// DELETE /api/tickets/:id  (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [tickets] = await conn.query('SELECT flight_id FROM tickets WHERE id = ?', [req.params.id]);
    if (tickets.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Ticket not found' }); }

    await conn.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    await conn.query('UPDATE flights SET seats_available = seats_available + 1 WHERE id = ?', [tickets[0].flight_id]);
    await conn.commit();
    res.json({ message: 'Ticket cancelled' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
