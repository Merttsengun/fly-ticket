require('dotenv').config();
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

(async () => {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'flyticket',
    charset: 'utf8mb4'
  });

  const [rows] = await conn.query('SELECT id, username FROM admins');
  console.log('Mevcut admin sayisi:', rows.length, rows);

  const hash = await bcrypt.hash('admin123', 12);
  await conn.query('DELETE FROM admins');
  await conn.query(
    'INSERT INTO admins (username, password_hash) VALUES (?, ?)',
    ['admin', hash]
  );
  console.log('Admin sifirlandi: username=admin, password=admin123');

  await conn.end();
})().catch(e => console.error('Hata:', e.message));
