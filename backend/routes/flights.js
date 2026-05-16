const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');

// Returns true if cityId has any activity (departure or arrival) within 60 min of activityTime
async function hasConflict(conn, cityId, activityTime, excludeId = null) {
  let sql = `
    SELECT id FROM flights
    WHERE (
      (departure_city_id = ? AND ABS(TIMESTAMPDIFF(MINUTE, departure_time, ?)) <= 60)
      OR
      (arrival_city_id   = ? AND ABS(TIMESTAMPDIFF(MINUTE, arrival_time,   ?)) <= 60)
    )
  `;
  const params = [cityId, activityTime, cityId, activityTime];

  if (excludeId) {
    sql += ' AND id != ?';
    params.push(excludeId);
  }

  const [rows] = await conn.query(sql, params);
  return rows.length > 0;
}

// GET /api/flights?from=&to=&date=&airline=
router.get('/', async (req, res) => {
  try {
    const { from, to, date, airline } = req.query;
    const showAll = req.query.all === 'true';
    let sql = `
      SELECT f.id, f.flight_number, f.departure_time, f.arrival_time,
             f.price, f.seats_available, f.seats_total,
             dc.name AS departure_city, ac.name AS arrival_city,
             al.id AS airline_id, al.name AS airline_name, al.code AS airline_code
      FROM flights f
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id
      LEFT JOIN airlines al ON f.airline_id = al.id
      WHERE 1=1
    `;
    const params = [];

    if (!showAll) { sql += ' AND f.departure_time >= NOW()'; }
    if (from)    { sql += ' AND f.departure_city_id = ?'; params.push(from); }
    if (to)      { sql += ' AND f.arrival_city_id = ?';   params.push(to); }
    if (date)    { sql += ' AND DATE(f.departure_time) = ?'; params.push(date); }
    if (airline) { sql += ' AND f.airline_id = ?'; params.push(airline); }

    sql += ' ORDER BY f.departure_time';
    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/flights/:id
router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT f.id, f.flight_number, f.departure_time, f.arrival_time,
             f.price, f.seats_available, f.seats_total,
             dc.name AS departure_city, ac.name AS arrival_city,
             al.id AS airline_id, al.name AS airline_name, al.code AS airline_code
      FROM flights f
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id
      LEFT JOIN airlines al ON f.airline_id = al.id
      WHERE f.id = ?
    `, [req.params.id]);

    if (rows.length === 0) return res.status(404).json({ error: 'Flight not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// GET /api/flights/:id/taken-seats — returns array of taken seat numbers for a flight
router.get('/:id/taken-seats', async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT seat_number FROM tickets WHERE flight_id = ?',
      [req.params.id]
    );
    res.json(rows.map(r => r.seat_number));
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

// POST /api/flights  (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const { flight_number, departure_city_id, arrival_city_id, departure_time, arrival_time, price, seats_total, airline_id } = req.body;

  if (!flight_number || !departure_city_id || !arrival_city_id || !departure_time || !arrival_time || !price) {
    return res.status(400).json({ error: 'Tüm alanlar zorunludur' });
  }
  if (departure_city_id === arrival_city_id) {
    return res.status(400).json({ error: 'Kalkış ve varış şehri aynı olamaz' });
  }
  if (new Date(arrival_time) <= new Date(departure_time)) {
    return res.status(400).json({ error: 'Varış zamanı kalkış zamanından sonra olmalıdır' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (await hasConflict(conn, departure_city_id, departure_time)) {
      await conn.rollback();
      return res.status(409).json({
        error: 'Kalkış şehrinde bu saate yakın (±60 dk) başka bir uçuş aktivitesi mevcut'
      });
    }

    if (await hasConflict(conn, arrival_city_id, arrival_time)) {
      await conn.rollback();
      return res.status(409).json({
        error: 'Varış şehrinde bu saate yakın (±60 dk) başka bir uçuş aktivitesi mevcut'
      });
    }

    const seats = seats_total || 100;
    const [result] = await conn.query(`
      INSERT INTO flights
        (flight_number, departure_city_id, arrival_city_id, departure_time, arrival_time, price, seats_total, seats_available, airline_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [flight_number, departure_city_id, arrival_city_id, departure_time, arrival_time, price, seats, seats, airline_id || null]);

    await conn.commit();
    res.status(201).json({ id: result.insertId, message: 'Flight created' });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Bu uçuş numarası zaten mevcut' });
    }
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

// PUT /api/flights/:id  (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const { flight_number, departure_city_id, arrival_city_id, departure_time, arrival_time, price, seats_total, airline_id } = req.body;
  const id = parseInt(req.params.id);

  if (departure_city_id === arrival_city_id) {
    return res.status(400).json({ error: 'Kalkış ve varış şehri aynı olamaz' });
  }
  if (new Date(arrival_time) <= new Date(departure_time)) {
    return res.status(400).json({ error: 'Varış zamanı kalkış zamanından sonra olmalıdır' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    if (await hasConflict(conn, departure_city_id, departure_time, id)) {
      await conn.rollback();
      return res.status(409).json({
        error: 'Kalkış şehrinde bu saate yakın (±60 dk) başka bir uçuş aktivitesi mevcut'
      });
    }

    if (await hasConflict(conn, arrival_city_id, arrival_time, id)) {
      await conn.rollback();
      return res.status(409).json({
        error: 'Varış şehrinde bu saate yakın (±60 dk) başka bir uçuş aktivitesi mevcut'
      });
    }

    const [result] = await conn.query(`
      UPDATE flights
      SET flight_number = ?, departure_city_id = ?, arrival_city_id = ?,
          departure_time = ?, arrival_time = ?, price = ?, seats_total = ?, airline_id = ?
      WHERE id = ?
    `, [flight_number, departure_city_id, arrival_city_id, departure_time, arrival_time, price, seats_total, airline_id || null, id]);

    await conn.commit();
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Flight not found' });
    res.json({ message: 'Flight updated' });
  } catch (err) {
    await conn.rollback();
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ error: 'Bu uçuş numarası zaten mevcut' });
    }
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

// DELETE /api/flights/:id  (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM flights WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Flight not found' });
    res.json({ message: 'Flight deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
});

module.exports = router;
