require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const db = require('./db/connection');

const app = express();
const PORT = process.env.PORT || 3000;

// Auto-migrations on startup
async function runMigrations() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS airlines (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL UNIQUE,
      code VARCHAR(10) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      surname VARCHAR(100) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const migrations = [
    'ALTER TABLE tickets ADD COLUMN seat_number INT NOT NULL DEFAULT 0',
    'ALTER TABLE flights ADD COLUMN airline_id INT DEFAULT NULL',
    'ALTER TABLE tickets ADD COLUMN user_id INT DEFAULT NULL',
    'ALTER TABLE tickets ADD UNIQUE KEY uq_flight_seat (flight_id, seat_number)',
  ];
  for (const sql of migrations) {
    await db.query(sql).catch(e => {
      if (e.code !== 'ER_DUP_FIELDNAME' && e.code !== 'ER_DUP_KEYNAME') throw e;
    });
  }
  console.log('Migrations OK.');
}
runMigrations().catch(e => console.error('Migration error:', e.message));

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || 'flyticket-dev-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8, sameSite: 'none', secure: false }
}));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API routes
app.use('/api/cities',   require('./routes/cities'));
app.use('/api/airlines', require('./routes/airlines'));
app.use('/api/flights',  require('./routes/flights'));
app.use('/api/tickets',  require('./routes/tickets'));
app.use('/api/admin',    require('./routes/admin'));
app.use('/api/auth',     require('./routes/auth'));

// SPA fallback for unknown routes
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`FlyTicket server running on http://localhost:${PORT}`);
});
