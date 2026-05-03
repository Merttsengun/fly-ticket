const express = require('express');
const router = express.Router();
const db = require('../db/connection');
const { requireAdmin } = require('../middleware/auth');
const { optionalUser } = require('../middleware/userAuth');
const { sendTicketEmail } = require('../utils/mailer');

function generateRef() {
  return Math.random().toString(36).substring(2, 12).toUpperCase();
}

// POST /api/tickets  — book one or more tickets
router.post('/', optionalUser, async (req, res) => {
  const {
    flight_id,
    passenger_name,
    passenger_surname,
    passenger_email,
    quantity = 1,
    seat_numbers = []
  } = req.body;

  if (!flight_id || !passenger_name || !passenger_surname || !passenger_email) {
    return res.status(400).json({ error: 'Tüm yolcu alanları zorunludur' });
  }

  const qty = parseInt(quantity);
  if (!qty || qty < 1 || qty > 9) {
    return res.status(400).json({ error: 'Geçersiz bilet sayısı (1–9 arası olmalı)' });
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [flights] = await conn.query(
      'SELECT id, seats_available, seats_total FROM flights WHERE id = ? FOR UPDATE',
      [flight_id]
    );
    if (flights.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Uçuş bulunamadı' });
    }
    if (flights[0].seats_available < qty) {
      await conn.rollback();
      return res.status(409).json({
        error: `Yeterli koltuk yok. Müsait koltuk: ${flights[0].seats_available}`
      });
    }

    const totalSeats = flights[0].seats_total;

    // Get seats already taken for this flight (inside transaction, locks rows)
    const [takenRows] = await conn.query(
      'SELECT seat_number FROM tickets WHERE flight_id = ? FOR UPDATE',
      [flight_id]
    );
    const takenSet = new Set(takenRows.map(r => r.seat_number));

    let finalSeats;
    if (seat_numbers.length > 0) {
      if (seat_numbers.length !== qty) {
        await conn.rollback();
        return res.status(400).json({ error: 'Seçilen koltuk sayısı bilet sayısıyla eşleşmiyor' });
      }
      for (const s of seat_numbers) {
        if (s < 1 || s > totalSeats) {
          await conn.rollback();
          return res.status(400).json({ error: `Geçersiz koltuk numarası: ${s}` });
        }
        if (takenSet.has(s)) {
          await conn.rollback();
          return res.status(409).json({ error: `${s} numaralı koltuk zaten dolu` });
        }
      }
      finalSeats = seat_numbers;
    } else {
      // Auto-assign: first N available seats in order
      finalSeats = [];
      for (let i = 1; i <= totalSeats && finalSeats.length < qty; i++) {
        if (!takenSet.has(i)) finalSeats.push(i);
      }
    }

    const bookings = [];
    for (const seatNum of finalSeats) {
      const ref = generateRef();
      const [result] = await conn.query(
        `INSERT INTO tickets
           (flight_id, passenger_name, passenger_surname, passenger_email, booking_reference, seat_number, user_id)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [flight_id, passenger_name, passenger_surname, passenger_email, ref, seatNum, req.userId || null]
      );
      bookings.push({ id: result.insertId, booking_reference: ref, seat_number: seatNum });
    }

    await conn.query(
      'UPDATE flights SET seats_available = seats_available - ? WHERE id = ?',
      [qty, flight_id]
    );
    await conn.commit();

    // Fetch full flight details for the email (non-blocking)
    db.query(`
      SELECT f.flight_number, f.departure_time, f.arrival_time, f.price,
             dc.name AS departure_city, ac.name AS arrival_city,
             al.name AS airline_name, al.code AS airline_code
      FROM flights f
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id
      LEFT JOIN airlines al ON f.airline_id = al.id
      WHERE f.id = ?
    `, [flight_id]).then(([rows]) => {
      if (!rows.length) return;
      return sendTicketEmail({
        to:            passenger_email,
        passengerName: `${passenger_name} ${passenger_surname}`,
        bookings,
        flight:        rows[0]
      });
    }).catch(err => console.error('E-posta gönderilemedi:', err.message));

    res.status(201).json({ bookings, message: 'Rezervasyon onaylandı' });
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
             t.passenger_email, t.booked_at, t.seat_number,
             f.flight_number, dc.name AS departure_city, ac.name AS arrival_city,
             f.departure_time, f.arrival_time, f.price,
             al.name AS airline_name, al.code AS airline_code
      FROM tickets t
      JOIN flights f ON t.flight_id = f.id
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id
      LEFT JOIN airlines al ON f.airline_id = al.id
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
             t.passenger_email, t.booked_at, t.seat_number,
             f.flight_number, dc.name AS departure_city, ac.name AS arrival_city,
             f.departure_time, f.arrival_time, f.price,
             al.name AS airline_name, al.code AS airline_code
      FROM tickets t
      JOIN flights f ON t.flight_id = f.id
      JOIN cities dc ON f.departure_city_id = dc.id
      JOIN cities ac ON f.arrival_city_id = ac.id
      LEFT JOIN airlines al ON f.airline_id = al.id
      WHERE t.booking_reference = ?
    `, [req.params.ref]);

    if (rows.length === 0) return res.status(404).json({ error: 'Bilet bulunamadı' });
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
    if (tickets.length === 0) {
      await conn.rollback();
      return res.status(404).json({ error: 'Bilet bulunamadı' });
    }

    await conn.query('DELETE FROM tickets WHERE id = ?', [req.params.id]);
    await conn.query('UPDATE flights SET seats_available = seats_available + 1 WHERE id = ?', [tickets[0].flight_id]);
    await conn.commit();
    res.json({ message: 'Bilet iptal edildi' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: 'Database error' });
  } finally {
    conn.release();
  }
});

module.exports = router;
