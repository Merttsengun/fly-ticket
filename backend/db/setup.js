require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const CITIES = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya',
  'Ankara', 'Antalya', 'Artvin', 'Aydın', 'Balıkesir',
  'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur',
  'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli',
  'Diyarbakır', 'Edirne', 'Elazığ', 'Erzincan', 'Erzurum',
  'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Isparta', 'Mersin', 'İstanbul', 'İzmir',
  'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir',
  'Kocaeli', 'Konya', 'Kütahya', 'Malatya', 'Manisa',
  'Kahramanmaraş', 'Mardin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun',
  'Siirt', 'Sinop', 'Sivas', 'Tekirdağ', 'Tokat',
  'Trabzon', 'Tunceli', 'Şanlıurfa', 'Uşak', 'Van',
  'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan',
  'Iğdır', 'Yalova', 'Karabük', 'Kilis', 'Osmaniye', 'Düzce'
];

async function setup() {
  // Connect without a database first to create it
  const rootConn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    charset: 'utf8mb4',
    multipleStatements: true
  });

  console.log('Connected to MySQL.');

  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await rootConn.query(schema);
  console.log('Schema applied.');

  await rootConn.end();

  // Reconnect to the flyticket database
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: 'flyticket',
    charset: 'utf8mb4'
  });

  // Seed cities
  const [existing] = await conn.query('SELECT COUNT(*) AS cnt FROM cities');
  if (existing[0].cnt === 0) {
    const values = CITIES.map(name => [name]);
    await conn.query('INSERT INTO cities (name) VALUES ?', [values]);
    console.log(`Seeded ${CITIES.length} cities.`);
  } else {
    console.log('Cities already seeded, skipping.');
  }

  // Seed default admin (admin / admin123)
  const [admins] = await conn.query('SELECT COUNT(*) AS cnt FROM admins');
  if (admins[0].cnt === 0) {
    const hash = await bcrypt.hash('admin123', 12);
    await conn.query('INSERT INTO admins (username, password_hash) VALUES (?, ?)', ['admin', hash]);
    console.log('Default admin created: username=admin, password=admin123');
  } else {
    console.log('Admin already exists, skipping.');
  }

  await conn.end();
  console.log('Setup complete.');
}

setup().catch(err => {
  console.error('Setup failed:', err.message);
  process.exit(1);
});
