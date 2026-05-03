# FlyTicket – Proje Kılavuzu

## Genel Bakış
Türkiye'nin 81 ili arasında uçuş bileti satışı yapan full-stack web uygulaması.  
**Stack:** Vanilla JS (frontend) · Node.js + Express (backend) · MySQL (veritabanı)  
**Port:** `http://localhost:3000` — Express hem API'yi hem frontend static dosyalarını serve eder.

---

## Klasör Yapısı

```
dynamic web final/
├── backend/
│   ├── server.js               # Express app, CORS, migrations, route kayıtları
│   ├── .env                    # DB + SMTP credentials (git'e commit etme)
│   ├── db/
│   │   ├── connection.js       # mysql2/promise pool
│   │   ├── schema.sql          # Tüm tablo tanımları (fresh kurulum için)
│   │   └── setup.js            # DB oluştur + 81 şehir seed + admin oluştur
│   ├── routes/
│   │   ├── cities.js           # GET /api/cities
│   │   ├── airlines.js         # CRUD /api/airlines
│   │   ├── flights.js          # CRUD /api/flights
│   │   ├── tickets.js          # CRUD /api/tickets
│   │   ├── admin.js            # POST /api/admin/login|logout, GET /api/admin/me
│   │   └── auth.js             # POST /api/auth/register|login|logout, GET /api/auth/me|my-tickets
│   ├── middleware/
│   │   ├── auth.js             # Admin token store + requireAdmin middleware
│   │   └── userAuth.js         # User token store + requireUser + optionalUser middleware
│   └── utils/
│       └── mailer.js           # Nodemailer + Gmail SMTP, HTML e-bilet gönderimi
└── frontend/
    ├── index.html              # Uçuş arama + sonuçlar
    ├── booking.html            # 2 adımlı: yolcu bilgileri → ödeme simülasyonu
    ├── success.html            # Rezervasyon onay sayfası
    ├── login.html              # Kullanıcı girişi
    ├── register.html           # Kullanıcı kaydı
    ├── my-tickets.html         # Kullanıcının bilet geçmişi
    ├── admin-login.html        # Admin girişi
    ├── admin-panel.html        # Admin: Uçuşlar / Biletler / Firmalar sekmeleri
    └── css/
        └── style.css           # Tüm stiller (CSS variables, responsive)
```

---

## Veritabanı Şeması

```sql
cities       (id, name)
airlines     (id, name, code, created_at)
flights      (id, flight_number, departure_city_id, arrival_city_id,
              departure_time, arrival_time, price, seats_total, seats_available,
              airline_id, departure_hour_slot*, arrival_hour_slot*, created_at)
users        (id, name, surname, email, password_hash, created_at)
tickets      (id, flight_id, passenger_name, passenger_surname, passenger_email,
              booking_reference, seat_number, user_id, booked_at)
admins       (id, username, password_hash, created_at)
```

`*` = STORED generated columns (DATE_FORMAT ile saat-bazlı unique slot)  
`tickets(flight_id, seat_number)` → UNIQUE KEY (aynı koltuk iki kez satılamaz)  
`tickets.flight_id` → ON DELETE CASCADE  
`flights.airline_id` → ON DELETE SET NULL

---

## API Endpoints

| Method | Endpoint | Auth | Açıklama |
|--------|----------|------|----------|
| GET | /api/cities | — | 81 il listesi |
| GET | /api/airlines | — | Tüm havayolları |
| POST/PUT/DELETE | /api/airlines/:id | Admin | Firma CRUD |
| GET | /api/flights | — | Uçuş ara (`from`, `to`, `date`, `airline`, `all` params) |
| GET | /api/flights/:id | — | Tek uçuş detayı |
| GET | /api/flights/:id/taken-seats | — | Dolu koltuk numaraları |
| POST/PUT/DELETE | /api/flights/:id | Admin | Uçuş CRUD |
| POST | /api/tickets | optionalUser | Bilet al (`quantity`, `seat_numbers[]` destekler) |
| GET | /api/tickets | Admin | Tüm biletler |
| GET | /api/tickets/:ref | — | Rezervasyon kodu ile sorgula |
| DELETE | /api/tickets/:id | Admin | Bilet iptal |
| POST | /api/admin/login | — | Admin girişi → Bearer token |
| POST | /api/admin/logout | Admin | Admin çıkışı |
| GET | /api/admin/me | Admin | Admin bilgisi |
| POST | /api/auth/register | — | Kullanıcı kaydı |
| POST | /api/auth/login | — | Kullanıcı girişi → Bearer token |
| POST | /api/auth/logout | User | Kullanıcı çıkışı |
| GET | /api/auth/me | User | Kullanıcı bilgisi |
| GET | /api/auth/my-tickets | User | Kullanıcının biletleri |

---

## Kimlik Doğrulama

**Admin:** `backend/middleware/auth.js` — in-memory Map, Bearer token  
**User:** `backend/middleware/userAuth.js` — ayrı in-memory Map, Bearer token  
**Frontend localStorage keys:**
- `flyticket_token` → admin token
- `flyticket_user_token` → kullanıcı token
- `flyticket_user_name` → "Ad Soyad"
- `flyticket_user_email` → email

---

## Önemli İş Kuralları

1. **Tek Pist Kuralı:** Aynı şehirde kalkış veya iniş aktivitesi ±60 dakika içinde olamaz.  
   → `flights.js` `hasConflict()` fonksiyonu, POST ve PUT'ta kontrol eder.

2. **Koltuk Seçimi:** `POST /api/tickets` `seat_numbers[]` alır. Boşsa backend otomatik atar.  
   Koltuk çakışması: transaction içinde `FOR UPDATE` + DB'de UNIQUE KEY ile korunur.

3. **Çoklu Bilet:** Tek istekte `quantity` (1-9) bilet alınabilir, her biri ayrı `booking_reference` alır.

4. **Koltuk Numaralandırma:** 1-N arası integer. Display formatı: `seatLabel(n)` → satır + kolon (ör. `2C`)  
   `COLS = ['A','B','C','D','E','F']`, `SEATS_PER_ROW = 6`

5. **E-posta:** Başarılı booking sonrası `mailer.js` HTML e-bilet gönderir. SMTP hatası booking'i etkilemez.

---

## Konfigürasyon (.env)

```
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=...
DB_NAME=flyticket
SESSION_SECRET=...
PORT=3000
SMTP_USER=...@gmail.com
SMTP_PASS=xxxx xxxx xxxx xxxx   # Gmail Uygulama Şifresi
```

---

## Auto-Migrations

`server.js` başlangıçta şunları otomatik çalıştırır:
- `airlines` tablosunu oluşturur (IF NOT EXISTS)
- `users` tablosunu oluşturur (IF NOT EXISTS)
- `tickets.seat_number`, `flights.airline_id`, `tickets.user_id` kolonlarını ekler
- `tickets(flight_id, seat_number)` UNIQUE KEY'i ekler

---

## Frontend Notları

- **API URL:** Tüm sayfalarda `const API = 'http://localhost:3000'` — canlıya çıkarken `window.location.origin` yapılacak.
- **Navbar:** Her sayfada `setupNav()` fonksiyonu localStorage'dan user token okuyarak dinamik render eder.
- **Booking akışı:** Adım 1 (yolcu + koltuk) → Adım 2 (ödeme simülasyonu, sadece format doğrulama) → success.html
- **Koltuk haritası:** 6 koltuk/sıra, uçak düzeni (ABC | DEF), toggle ile açılır, isteğe bağlı.
- **Ödeme:** Simülasyon — gerçek kart doğrulaması yok, format kontrolü (16 hane, geçerli tarih, 3 CVV).

---

## Kurulum

```bash
# 1. Bağımlılıklar
cd backend && npm install

# 2. .env dosyasını düzenle (DB ve SMTP bilgileri)

# 3. Veritabanı kurulumu (ilk seferinde)
node backend/db/setup.js

# 4. Sunucuyu başlat
node backend/server.js

# 5. Tarayıcıda aç
# http://localhost:3000
# Admin: http://localhost:3000/admin-login.html  (admin / admin123)
```
